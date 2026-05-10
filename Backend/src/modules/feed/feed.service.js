const Post = require('./post.model');
const Like = require('./like.model');
const Comment = require('./comment.model');
const AppError = require('../../shared/utils/AppError');
const { parsePagination, buildPaginationResult } = require('../../shared/utils/pagination');

const createPost = async (data, userId) => {
  const post = await Post.create({ ...data, authorId: userId });
  return await post.populate('authorId', 'fullName avatar role department badges');
};

const getFeed = async (filters = {}, userId) => {
  const query = {};
  if (filters.type && filters.type !== 'All') {
    query.type = filters.type;
  }
  
  const { page, limit, skip } = parsePagination(filters);
  const [items, totalCount] = await Promise.all([
    Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'fullName avatar role department badges'),
    Post.countDocuments(query)
  ]);
  
  // check user likes if needed
  let postsWithLikes = items.map(p => p.toObject());
  if (userId && items.length > 0) {
    const postIds = items.map(p => p._id);
    const likes = await Like.find({ userId, postId: { $in: postIds } });
    const likedPostIds = new Set(likes.map(l => l.postId.toString()));
    postsWithLikes = postsWithLikes.map(p => ({
      ...p,
      hasLiked: likedPostIds.has(p._id.toString())
    }));
  }

  return { items: postsWithLikes, pagination: buildPaginationResult(page, limit, totalCount) };
};

const getPost = async (id, userId) => {
  const post = await Post.findById(id).populate('authorId', 'fullName avatar role department badges');
  if (!post) throw new AppError('Post not found', 404);
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
  getComments
};
