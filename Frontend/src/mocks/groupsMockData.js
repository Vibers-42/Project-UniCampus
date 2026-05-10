/**
 * src/mocks/groupsMockData.js
 * Mock data for Study Groups module.
 */

export const USE_MOCK_DATA = true;

export const mockGroups = [
  {
    _id: "grp_001",
    name: "DSA Mastery Squad",
    description: "Dedicated group for mastering Data Structures and Algorithms. Daily problems, weekly contests and exam prep sessions.",
    subject: "Data Structures & Algorithms",
    department: "AI & Machine Learning",
    semester: 3, year: 2,
    admin: { _id: "user_001", fullName: "Aryan Patel", avatar: null },
    members: [
      { _id: "user_001", fullName: "Aryan Patel", avatar: null },
      { _id: "user_002", fullName: "Sneha Reddy", avatar: null },
      { _id: "user_003", fullName: "Vikram Kumar", avatar: null },
      { _id: "user_004", fullName: "Priya Mehta", avatar: null },
      { _id: "user_005", fullName: "Rahul Sharma", avatar: null }
    ],
    maxMembers: 30,
    isPrivate: false,
    avatar: "🧠",
    tags: ["dsa", "algorithms", "competitive"],
    category: "study",
    pinnedResources: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    _id: "grp_002",
    name: "ML Research Collective",
    description: "Research-focused group exploring latest ML papers, implementing models and preparing for semester exams and hackathons.",
    subject: "Machine Learning",
    department: "AI & Machine Learning",
    semester: 5, year: 3,
    admin: { _id: "user_002", fullName: "Sneha Reddy", avatar: null },
    members: [
      { _id: "user_002", fullName: "Sneha Reddy", avatar: null },
      { _id: "user_001", fullName: "Aryan Patel", avatar: null },
      { _id: "user_006", fullName: "Divya Nair", avatar: null }
    ],
    maxMembers: 20,
    isPrivate: false,
    avatar: "🤖",
    tags: ["ml", "research", "papers"],
    category: "research",
    pinnedResources: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    _id: "grp_003",
    name: "Hackathon X Team Formation",
    description: "Building teams for the upcoming Hackathon X. Theme: AI for Social Good. Looking for designers, backend devs and ML engineers.",
    subject: "General",
    department: "AI & Machine Learning",
    semester: 5, year: 3,
    admin: { _id: "user_004", fullName: "Priya Mehta", avatar: null },
    members: [
      { _id: "user_004", fullName: "Priya Mehta", avatar: null },
      { _id: "user_005", fullName: "Rahul Sharma", avatar: null }
    ],
    maxMembers: 50,
    isPrivate: false,
    avatar: "🚀",
    tags: ["hackathon", "team", "ai-social-good"],
    category: "hackathon",
    pinnedResources: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: "grp_004",
    name: "DBMS Exam Prep — CSE Sem 4",
    description: "Focused group for DBMS semester exam preparation. Sharing notes, PYQs and solving queries together.",
    subject: "Database Management Systems",
    department: "Computer Science Engineering",
    semester: 4, year: 2,
    admin: { _id: "user_003", fullName: "Vikram Kumar", avatar: null },
    members: [
      { _id: "user_003", fullName: "Vikram Kumar", avatar: null },
      { _id: "user_007", fullName: "Aisha Khan", avatar: null },
      { _id: "user_008", fullName: "Karthik Rao", avatar: null },
      { _id: "user_009", fullName: "Meera Iyer", avatar: null }
    ],
    maxMembers: 25,
    isPrivate: true,
    joinCode: "DBM4SE",
    avatar: "📊",
    tags: ["dbms", "exam", "cse"],
    category: "study",
    pinnedResources: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    _id: "grp_005",
    name: "Full Stack Dev Project Group",
    description: "Working on a collaborative full-stack project using MERN stack. Open to all years. Learning by building.",
    subject: "Web Development",
    department: "Computer Science Engineering",
    semester: 6, year: 3,
    admin: { _id: "user_005", fullName: "Rahul Sharma", avatar: null },
    members: [
      { _id: "user_005", fullName: "Rahul Sharma", avatar: null },
      { _id: "user_006", fullName: "Divya Nair", avatar: null },
      { _id: "user_001", fullName: "Aryan Patel", avatar: null }
    ],
    maxMembers: 15,
    isPrivate: false,
    avatar: "💻",
    tags: ["mern", "fullstack", "project"],
    category: "project",
    pinnedResources: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    _id: "grp_006",
    name: "Deep Learning Paper Reading Club",
    description: "Weekly paper reading sessions. Currently going through Attention is All You Need and related transformer papers.",
    subject: "Deep Learning",
    department: "AI & Machine Learning",
    semester: 7, year: 4,
    admin: { _id: "user_006", fullName: "Divya Nair", avatar: null },
    members: [
      { _id: "user_006", fullName: "Divya Nair", avatar: null },
      { _id: "user_002", fullName: "Sneha Reddy", avatar: null },
      { _id: "user_001", fullName: "Aryan Patel", avatar: null },
      { _id: "user_004", fullName: "Priya Mehta", avatar: null },
      { _id: "user_010", fullName: "Siddharth Joshi", avatar: null }
    ],
    maxMembers: 20,
    isPrivate: false,
    avatar: "📖",
    tags: ["deep-learning", "papers", "transformers"],
    category: "research",
    pinnedResources: [],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  }
];

export const mockMessages = {
  "grp_001": [
    {
      _id: "msg_001", group: "grp_001", threadId: null,
      sender: { _id: "user_002", fullName: "Sneha Reddy", avatar: null },
      body: "Hey everyone! I just uploaded the complete DSA notes for Unit 2 — Binary Trees. Check the Resources tab!",
      attachmentUrl: null, isDeleted: false,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    },
    {
      _id: "msg_002", group: "grp_001", threadId: null,
      sender: { _id: "user_003", fullName: "Vikram Kumar", avatar: null },
      body: "Amazing! Can someone explain the difference between AVL trees and Red-Black trees? I keep getting confused in the rotations.",
      attachmentUrl: null, isDeleted: false,
      createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000)
    },
    {
      _id: "msg_003", group: "grp_001", threadId: null,
      sender: { _id: "user_001", fullName: "Aryan Patel", avatar: null },
      body: "AVL trees are strictly balanced (height diff max 1) while Red-Black trees are loosely balanced. RB trees are faster for insertion/deletion, AVL is faster for lookup. Use AVL when reads > writes.",
      attachmentUrl: null, isDeleted: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      _id: "msg_004", group: "grp_001", threadId: null,
      sender: { _id: "user_004", fullName: "Priya Mehta", avatar: null },
      body: "Exam is in 2 weeks. Should we start mock tests from next session?",
      attachmentUrl: null, isDeleted: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      _id: "msg_005", group: "grp_001", threadId: null,
      sender: { _id: "user_002", fullName: "Sneha Reddy", avatar: null },
      body: "Yes! I have last 3 years PYQs. Will share tomorrow.",
      attachmentUrl: null, isDeleted: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    }
  ]
};

export const mockThreads = {
  "grp_001": [
    {
      _id: "thr_001", group: "grp_001",
      createdBy: { _id: "user_001", fullName: "Aryan Patel" },
      title: "Graph Algorithms Discussion",
      topic: "BFS, DFS, Dijkstra, Floyd-Warshall",
      isPinned: true, messageCount: 23,
      lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      _id: "thr_002", group: "grp_001",
      createdBy: { _id: "user_002", fullName: "Sneha Reddy" },
      title: "Exam Doubt Clearing Session",
      topic: "Post all exam-related doubts here",
      isPinned: true, messageCount: 47,
      lastActivity: new Date(Date.now() - 30 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      _id: "thr_003", group: "grp_001",
      createdBy: { _id: "user_003", fullName: "Vikram Kumar" },
      title: "Competitive Programming Resources",
      topic: "LeetCode, Codeforces links and tips",
      isPinned: false, messageCount: 12,
      lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ]
};
