/**
 * @file feed.service.js — Personalized Feed Business Logic
 *
 * SINGLE RESPONSIBILITY:
 *   All feed-related business logic. No req/res objects — pure logic.
 *
 * PERSONALIZATION STRATEGY (DB-driven, no ML):
 *   1. Fetch user profile once via users.service.js (public interface)
 *   2. Build a MongoDB aggregation pipeline with:
 *      - Early $match for content safety + base filters (uses indexes)
 *      - $addFields for additive relevance scoring (DB-computed)
 *      - $sort by relevanceScore DESC, createdAt DESC
 *      - $skip/$limit for pagination
 *      - Minimal $lookup for author population
 *   3. Separate count query for pagination metadata
 *
 * SCORING APPROACH:
 *   Additive integer-range weights (1–3) injected into the aggregation
 *   pipeline as constants. User profile values are passed as pipeline
 *   variables — no profile data is stored on the Post document.
 *
 * CROSS-MODULE READS (read-only, no coupling):
 *   - User profile via users.service.js (public interface)
 *   - Event, Opportunity, TeamProject, StudyGroup, MarketplaceItem
 *     models for recommendations (read-only, try/catch guarded)
 */

const Post = require('./post.model');
const Like = require('./like.model');
const Comment = require('./comment.model');
const AppError = require('../../shared/utils/AppError');
const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');

// Cross-module read-only import for user profile lookup
const usersService = require('../users/users.service');

// ══════════════════════════════════════════
// CENTRALIZED SCORING WEIGHTS
// ══════════════════════════════════════════
// Additive integer weights. Tunable without changing logic.
// Sum of max possible ≈ 15–20 for a perfectly matching post.

const SCORE_WEIGHTS = {
  DEPARTMENT_MATCH: 3,    // targetDepartment == user.department
  YEAR_MATCH:       1,    // targetYearOfStudy == user.yearOfStudy
  TECHSTACK_MATCH:  2,    // per tag ∩ user.techStack
  SKILL_MATCH:      2,    // per tag ∩ user.skills
  INTEREST_MATCH:   1,    // per tag ∩ user.interests
  TRENDING_BOOST:   1,    // likesCount + commentsCount >= threshold
};

// Trending threshold: posts with this many interactions get a boost
const TRENDING_THRESHOLD = 5;

// Time window for the personalized feed (days)
const FEED_TIME_WINDOW_DAYS = 30;

// Time window for trending calculation (hours)
const TRENDING_TIME_WINDOW_HOURS = 72;

// ══════════════════════════════════════════
// HELPER: Load user profile context
// ══════════════════════════════════════════

/**
 * Fetches the user's profile via users.service.js and extracts
 * personalization signals. Returns a lightweight context object.
 *
 * @param {string} userId — MongoDB _id
 * @returns {Promise<Object>} Personalization context
 */
const _loadUserContext = async (userId) => {
  const user = await usersService.findById(userId);
  if (!user) {
    return {
      department: '',
      interests: [],
      skills: [],
      techStack: [],
      yearOfStudy: null,
      hasProfile: false,
    };
  }

  return {
    department: (user.department || '').toLowerCase().trim(),
    interests: (user.interests || []).map(s => s.toLowerCase()),
    skills: (user.skills || []).map(s => s.toLowerCase()),
    techStack: (user.techStack || []).map(s => s.toLowerCase()),
    yearOfStudy: user.yearOfStudy || null,
    hasProfile: !!(
      user.department || (user.interests && user.interests.length) ||
      (user.skills && user.skills.length) || (user.techStack && user.techStack.length) ||
      user.yearOfStudy
    ),
  };
};

// ══════════════════════════════════════════
// CORE: Create Post
// ══════════════════════════════════════════

const createPost = async (data, userId) => {
  // Load author context for content-targeting defaults
  const ctx = await _loadUserContext(userId);

  const postData = {
    ...data,
    authorId: userId,
    // Content-targeting defaults from author profile.
    // These describe "who is this post relevant to" — the author
    // can override via request body if they want broader/narrower targeting.
    targetDepartment: data.targetDepartment || ctx.department,
    targetYearOfStudy: data.targetYearOfStudy || ctx.yearOfStudy,
  };

  // Normalize tags to lowercase for consistent matching
  if (postData.tags && Array.isArray(postData.tags)) {
    postData.tags = postData.tags.map(t => t.trim().toLowerCase());
  }

  const post = await Post.create(postData);
  return await post.populate('authorId', 'fullName avatar role department badges');
};

// ══════════════════════════════════════════
// CORE: Personalized Feed (aggregation pipeline)
// ══════════════════════════════════════════

/**
 * Returns a personalized, paginated feed using a MongoDB aggregation pipeline.
 *
 * Pipeline strategy:
 *   1. $match — content safety + base filters (index-backed)
 *   2. $addFields — compute relevanceScore from user signals
 *   3. $sort — relevanceScore DESC, createdAt DESC
 *   4. $facet — parallel count + paginated results
 *   5. $lookup — minimal author population
 *
 * Fallback: if user has no profile data, scoring produces 0 for all posts,
 * and sort degrades to createdAt DESC (chronological). New users still get
 * a useful, non-empty feed.
 *
 * @param {Object} filters — Query params (type, page, limit)
 * @param {string} userId  — Current user's MongoDB _id
 * @returns {Promise<Object>} { items, pagination }
 */
const getFeed = async (filters = {}, userId) => {
  const { page, limit, skip } = parsePagination(filters);

  // ── Step 1: Load user context (single DB call) ──
  const ctx = await _loadUserContext(userId);

  // ── Step 2: Build base match query ──
  // Content safety: only active posts
  const matchQuery = { isActive: { $ne: false } };

  // Optional type filter
  if (filters.type && filters.type !== 'All') {
    matchQuery.type = filters.type;
  }

  // Time window for personalized feed (keeps candidate pool bounded)
  const useTimeWindow = ctx.hasProfile;
  if (useTimeWindow) {
    const timeWindowStart = new Date();
    timeWindowStart.setDate(timeWindowStart.getDate() - FEED_TIME_WINDOW_DAYS);
    matchQuery.createdAt = { $gte: timeWindowStart };
  }

  // ── Step 3: Build and run aggregation pipeline ──
  const runFeedPipeline = async (query) => {
    const pipeline = [];

    // Stage 1: $match — early filtering, uses indexes
    pipeline.push({ $match: query });

    // Stage 2: $addFields — compute relevance score
    // User profile values are injected as constants (not stored on Post).
    // If user has no profile, all scores = 0 → sort falls back to createdAt.
    pipeline.push({
      $addFields: {
        _relevanceScore: {
          $add: [
            // Department match: +3 if targetDepartment matches user's department
            ctx.department ? {
              $cond: {
                if: { $eq: [{ $toLower: '$targetDepartment' }, ctx.department] },
                then: SCORE_WEIGHTS.DEPARTMENT_MATCH,
                else: 0
              }
            } : 0,

            // Year match: +1 if targetYearOfStudy matches user's year
            ctx.yearOfStudy ? {
              $cond: {
                if: { $eq: ['$targetYearOfStudy', ctx.yearOfStudy] },
                then: SCORE_WEIGHTS.YEAR_MATCH,
                else: 0
              }
            } : 0,

            // TechStack match: +2 per tag intersecting user.techStack
            ctx.techStack.length > 0 ? {
              $multiply: [
                { $size: { $ifNull: [{ $setIntersection: ['$tags', ctx.techStack] }, []] } },
                SCORE_WEIGHTS.TECHSTACK_MATCH
              ]
            } : 0,

            // Skill match: +2 per tag intersecting user.skills
            ctx.skills.length > 0 ? {
              $multiply: [
                { $size: { $ifNull: [{ $setIntersection: ['$tags', ctx.skills] }, []] } },
                SCORE_WEIGHTS.SKILL_MATCH
              ]
            } : 0,

            // Interest match: +1 per tag intersecting user.interests
            ctx.interests.length > 0 ? {
              $multiply: [
                { $size: { $ifNull: [{ $setIntersection: ['$tags', ctx.interests] }, []] } },
                SCORE_WEIGHTS.INTEREST_MATCH
              ]
            } : 0,

            // Trending boost: +1 if total interactions >= threshold
            {
              $cond: {
                if: {
                  $gte: [
                    { $add: [{ $ifNull: ['$likesCount', 0] }, { $ifNull: ['$commentsCount', 0] }] },
                    TRENDING_THRESHOLD
                  ]
                },
                then: SCORE_WEIGHTS.TRENDING_BOOST,
                else: 0
              }
            },
          ]
        }
      }
    });

    // Stage 3: $sort — depends on sort mode
    if (filters.sort === 'trending') {
      // Trending: sort by total interactions (likes + comments) DESC
      pipeline.push({
        $addFields: {
          _trendingScore: { $add: [{ $ifNull: ['$likesCount', 0] }, { $ifNull: ['$commentsCount', 0] }] }
        }
      });
      pipeline.push({ $sort: { _trendingScore: -1, createdAt: -1 } });
    } else {
      // Default: relevance first, recency as tiebreaker
      pipeline.push({ $sort: { _relevanceScore: -1, createdAt: -1 } });
    }

    // Stage 4: Pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    // Stage 5: $lookup — minimal author population
    // Only fetches _id, fullName, avatar, department, role, badges
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'authorId',
        foreignField: '_id',
        pipeline: [
          { $project: { fullName: 1, avatar: 1, department: 1, role: 1, badges: 1 } }
        ],
        as: 'authorId'
      }
    });

    // Unwind author (1-to-1 relationship)
    pipeline.push({
      $unwind: { path: '$authorId', preserveNullAndEmptyArrays: true }
    });

    // Stage 6: Remove internal scoring fields from response
    pipeline.push({ $project: { _relevanceScore: 0, _trendingScore: 0 } });

    // Execute pipeline + count in parallel
    const [items, totalCount] = await Promise.all([
      Post.aggregate(pipeline),
      Post.countDocuments(query),
    ]);

    return { items, totalCount };
  };

  // ── Step 4: Execute primary feed ──
  let { items, totalCount } = await runFeedPipeline(matchQuery);

  // ── Step 5: FALLBACK — if time-windowed query returned empty, widen to global ──
  // This prevents blank feeds on new deployments or when no recent content exists.
  if (items.length === 0 && useTimeWindow && page === 1) {
    const fallbackQuery = { ...matchQuery };
    delete fallbackQuery.createdAt;
    const fallback = await runFeedPipeline(fallbackQuery);
    items = fallback.items;
    totalCount = fallback.totalCount;
  }

  // ── Step 6: Attach like status (single batch query) ──
  const postsWithLikes = await _attachLikeStatus(items, userId);

  return {
    items: postsWithLikes,
    pagination: buildPaginationResult(page, limit, totalCount),
  };
};

// ══════════════════════════════════════════
// CORE: Cross-Module Recommendations
// ══════════════════════════════════════════

/**
 * Returns personalized recommendations from across modules.
 * All queries run in parallel. Each section is try/catch guarded
 * for graceful degradation if a module is unavailable.
 *
 * @param {string} userId — Current user's MongoDB _id
 * @returns {Promise<Object>} Sections of recommendations
 */
const getRecommendations = async (userId) => {
  const ctx = await _loadUserContext(userId);

  const [
    trendingPosts,
    upcomingEvents,
    opportunities,
    teammateProjects,
    studyGroups,
    marketplaceListings,
  ] = await Promise.all([
    _getTrendingPosts(ctx),
    _getRecommendedEvents(ctx),
    _getRecommendedOpportunities(ctx),
    _getRecommendedTeammateProjects(ctx),
    _getRecommendedStudyGroups(ctx),
    _getRecommendedMarketplaceItems(ctx),
  ]);

  return {
    trendingPosts,
    upcomingEvents,
    opportunities,
    teammateProjects,
    studyGroups,
    marketplaceListings,
  };
};

// ══════════════════════════════════════════
// RECOMMENDATION HELPERS (read-only, guarded)
// ══════════════════════════════════════════

/**
 * Trending posts: highest engagement in the last 72 hours.
 * Department-matching posts are boosted to the top.
 */
const _getTrendingPosts = async (ctx) => {
  const since = new Date();
  since.setHours(since.getHours() - TRENDING_TIME_WINDOW_HOURS);

  const posts = await Post.find({
    isActive: { $ne: false },
    createdAt: { $gte: since },
  })
    .sort({ likesCount: -1, commentsCount: -1, createdAt: -1 })
    .limit(10)
    .populate('authorId', 'fullName avatar department')
    .lean();

  // In-memory boost for department-matching posts
  if (ctx.department) {
    posts.sort((a, b) => {
      const aDept = (a.targetDepartment || '').toLowerCase();
      const bDept = (b.targetDepartment || '').toLowerCase();
      const aMatch = aDept === ctx.department ? 1 : 0;
      const bMatch = bDept === ctx.department ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount);
    });
  }

  return posts.slice(0, 5);
};

/**
 * Recommended events: upcoming events matching user's department/interests.
 */
const _getRecommendedEvents = async (ctx) => {
  try {
    const Event = require('../events/events.model');
    const now = new Date();

    const query = {
      startDate: { $gte: now },
      status: { $in: ['upcoming', 'ongoing'] },
    };

    if (ctx.department) {
      query.$or = [
        { department: { $size: 0 } },
        { department: { $exists: false } },
        { department: new RegExp(ctx.department, 'i') },
      ];
    }

    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .limit(5)
      .populate('organizerId', 'fullName avatar')
      .lean();

    // Light in-memory scoring by tag overlap
    if (ctx.interests.length > 0 || ctx.techStack.length > 0) {
      const allTags = [...new Set([...ctx.interests, ...ctx.techStack])];
      events.forEach(e => {
        const eventTags = (e.tags || []).map(t => t.toLowerCase());
        e._relevance = eventTags.filter(t => allTags.includes(t)).length;
      });
      events.sort((a, b) => (b._relevance || 0) - (a._relevance || 0));
    }

    return events;
  } catch {
    return [];
  }
};

/**
 * Recommended opportunities: active, open-deadline opportunities
 * matching user's department and year eligibility.
 */
const _getRecommendedOpportunities = async (ctx) => {
  try {
    const Opportunity = require('../opportunities/opportunities.model');
    const now = new Date();

    const conditions = [
      { status: 'active' },
      { $or: [{ deadline: { $gte: now } }, { deadline: null }, { deadline: { $exists: false } }] },
    ];

    // Department filter: open to all or matching user's department
    if (ctx.department) {
      conditions.push({
        $or: [
          { departments: { $size: 0 } },
          { departments: { $exists: false } },
          { departments: new RegExp(ctx.department, 'i') },
        ]
      });
    }

    // Year filter
    if (ctx.yearOfStudy) {
      conditions.push({
        $or: [
          { yearsEligible: { $size: 0 } },
          { yearsEligible: { $exists: false } },
          { yearsEligible: String(ctx.yearOfStudy) },
        ]
      });
    }

    const opps = await Opportunity.find({ $and: conditions })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('postedBy', 'fullName avatar')
      .lean();

    // Score by tag overlap with user skills/techStack
    if (ctx.skills.length > 0 || ctx.techStack.length > 0) {
      const allSkills = [...new Set([...ctx.skills, ...ctx.techStack])];
      opps.forEach(o => {
        const oppTags = (o.tags || []).map(t => t.toLowerCase());
        o._relevance = oppTags.filter(t => allSkills.includes(t)).length;
      });
      opps.sort((a, b) => (b._relevance || 0) - (a._relevance || 0));
    }

    return opps;
  } catch {
    return [];
  }
};

/**
 * Recommended teammate projects: open projects matching user's tech stack/skills.
 */
const _getRecommendedTeammateProjects = async (ctx) => {
  try {
    const TeamProject = require('../teammates/teammates.model');

    const projects = await TeamProject.find({ status: 'open' })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate('creatorId', 'fullName avatar department')
      .lean();

    const scored = projects.map(p => {
      let relevance = 0;
      const projTech = (p.techStack || []).map(t => t.toLowerCase());
      const projSkills = (p.requiredSkills || []).map(s => s.toLowerCase());

      if (ctx.techStack.length > 0) {
        relevance += projTech.filter(t => ctx.techStack.includes(t)).length * SCORE_WEIGHTS.TECHSTACK_MATCH;
      }
      if (ctx.skills.length > 0) {
        relevance += projSkills.filter(s => ctx.skills.includes(s)).length * SCORE_WEIGHTS.SKILL_MATCH;
      }
      if (ctx.department && p.creatorId && p.creatorId.department) {
        if (p.creatorId.department.toLowerCase() === ctx.department) {
          relevance += SCORE_WEIGHTS.DEPARTMENT_MATCH;
        }
      }

      return { ...p, _relevance: relevance };
    });

    scored.sort((a, b) => b._relevance - a._relevance);
    return scored.slice(0, 5);
  } catch {
    return [];
  }
};

/**
 * Recommended study groups: groups matching user's interests/department.
 */
const _getRecommendedStudyGroups = async (ctx) => {
  try {
    const { StudyGroup } = require('../studyGroups/studyGroups.model');

    const groups = await StudyGroup.find({})
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    const scored = groups.map(g => {
      let relevance = 0;
      const category = (g.category || '').toLowerCase();
      const name = (g.name || '').toLowerCase();

      if (ctx.interests.length > 0) {
        ctx.interests.forEach(tag => {
          if (category.includes(tag) || name.includes(tag)) relevance += 2;
        });
      }
      if (ctx.department) {
        if (category.includes(ctx.department) || name.includes(ctx.department)) {
          relevance += SCORE_WEIGHTS.DEPARTMENT_MATCH;
        }
      }

      return { ...g, _relevance: relevance };
    });

    scored.sort((a, b) => b._relevance - a._relevance);
    return scored.slice(0, 5);
  } catch {
    return [];
  }
};

/**
 * Recommended marketplace items: recent unsold items, department-relevant.
 */
const _getRecommendedMarketplaceItems = async (ctx) => {
  try {
    const MarketplaceItem = require('../marketplace/marketplace.model');

    const query = { isSold: false, isDeleted: { $ne: true } };
    if (ctx.department) {
      query.$or = [
        { department: new RegExp(ctx.department, 'i') },
        { department: { $exists: false } },
        { department: '' },
      ];
    }

    const items = await MarketplaceItem.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('sellerId', 'fullName avatar department')
      .lean();

    const scored = items.map(item => {
      let relevance = 0;
      const itemTags = (item.tags || []).map(t => t.toLowerCase());
      const allTags = [...new Set([...ctx.interests, ...ctx.skills, ...ctx.techStack])];

      if (allTags.length > 0) {
        relevance += itemTags.filter(t => allTags.includes(t)).length * 2;
      }

      // Academic categories are more relevant to students
      const academicCategories = ['Books', 'Study Materials', 'Lab Equipment', 'Stationery', 'Calculators'];
      if (academicCategories.includes(item.category)) relevance += 1;

      return { ...item, _relevance: relevance };
    });

    scored.sort((a, b) => b._relevance - a._relevance);
    return scored.slice(0, 5);
  } catch {
    return [];
  }
};

// ══════════════════════════════════════════
// HELPER: Attach like status (batch query)
// ══════════════════════════════════════════

/**
 * Single batch query to check which posts the user has liked.
 * Avoids N+1 pattern.
 */
const _attachLikeStatus = async (posts, userId) => {
  if (!userId || posts.length === 0) return posts;

  const postIds = posts.map(p => p._id);
  const likes = await Like.find({ userId, postId: { $in: postIds } }).lean();
  const likedPostIds = new Set(likes.map(l => l.postId.toString()));

  return posts.map(p => ({
    ...p,
    hasLiked: likedPostIds.has(p._id.toString()),
  }));
};

// ══════════════════════════════════════════
// EXISTING ENDPOINTS (preserved, minimal changes)
// ══════════════════════════════════════════

const getPost = async (id, userId) => {
  const post = await Post.findById(id)
    .populate('authorId', 'fullName avatar role department badges');
  if (!post) throw new AppError('Post not found', 404);

  // Increment view count (fire-and-forget, non-blocking)
  Post.updateOne({ _id: id }, { $inc: { viewsCount: 1 } }).catch(() => {});

  const postObj = post.toObject();
  if (userId) {
    const like = await Like.findOne({ userId, postId: id });
    postObj.hasLiked = !!like;
  }
  return postObj;
};

const likePost = async (id, userId) => {
  const post = await Post.findById(id);
  if (!post) throw new AppError('Post not found', 404);
  
  const existingLike = await Like.findOne({ postId: id, userId });
  if (existingLike) {
    await existingLike.deleteOne();
    post.likesCount = Math.max(0, post.likesCount - 1);
    await post.save();
    return { liked: false, likesCount: post.likesCount };
  } else {
    await Like.create({ postId: id, userId });
    post.likesCount += 1;
    await post.save();
    return { liked: true, likesCount: post.likesCount };
  }
};

const addComment = async (id, userId, content) => {
  const post = await Post.findById(id);
  if (!post) throw new AppError('Post not found', 404);
  
  const comment = await Comment.create({ postId: id, authorId: userId, content });
  post.commentsCount += 1;
  await post.save();
  
  return await comment.populate('authorId', 'fullName avatar role badges');
};

const getComments = async (id, filters = {}) => {
  const { page, limit, skip } = parsePagination(filters);
  const [items, totalCount] = await Promise.all([
    Comment.find({ postId: id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'fullName avatar role badges'),
    Comment.countDocuments({ postId: id })
  ]);
  
  return { items, pagination: buildPaginationResult(page, limit, totalCount) };
};

module.exports = {
  createPost,
  getFeed,
  getPost,
  likePost,
  addComment,
  getComments,
  getRecommendations,
};
