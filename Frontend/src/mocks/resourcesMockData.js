/**
 * src/mocks/resourcesMockData.js
 * Mock data for testing Academic Resources module without a populated backend.
 */

/* ── GLOBAL MOCK FLAG ── */
export const USE_MOCK_DATA = true;

export const mockResources = [
  {
    _id: "res_001",
    title: "Complete Data Structures & Algorithms Notes",
    description: "Comprehensive notes covering arrays, linked lists, trees, graphs, sorting and searching algorithms with solved examples and time complexity analysis.",
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1",
    fileType: "pdf",
    publicId: "mock/res_001",
    subject: "Data Structures & Algorithms",
    department: "Computer Science Engineering", // Changed to match filter options
    year: 2,
    semester: 3,
    category: "notes",
    uploadedBy: {
      _id: "user_001",
      fullName: "Aryan Patel",
      avatar: null,
      department: "Computer Science Engineering",
      year: 3
    },
    tags: ["unit-1", "unit-2", "important", "exam-ready"],
    upvotes: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10",
              "u11","u12","u13","u14","u15","u16","u17","u18"],
    qualityRating: 4.7,
    ratingCount: 24,
    downloadCount: 342,
    isExamPeriod: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    _id: "res_002",
    title: "Machine Learning Previous Year Questions 2022-2024",
    description: "Compiled PYQ papers for ML subject from 2022 to 2024 with answer keys and marking scheme.",
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1",
    fileType: "pdf",
    publicId: "mock/res_002",
    subject: "Machine Learning",
    department: "Computer Science Engineering", // Changed to match filter options
    year: 3,
    semester: 5,
    category: "pyq",
    uploadedBy: {
      _id: "user_002",
      fullName: "Sneha Reddy",
      avatar: null,
      department: "Computer Science Engineering",
      year: 4
    },
    tags: ["pyq", "2024", "solved"],
    upvotes: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10",
              "u11","u12","u13","u14","u15","u16","u17","u18",
              "u19","u20","u21","u22","u23","u24","u25","u26"],
    qualityRating: 4.9,
    ratingCount: 41,
    downloadCount: 587,
    isExamPeriod: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  },
  {
    _id: "res_003",
    title: "DBMS Lab Manual — All 12 Experiments",
    description: "Complete lab manual for Database Management Systems with SQL queries, ER diagrams, normalization exercises and expected output screenshots.",
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1",
    fileType: "pdf",
    publicId: "mock/res_003",
    subject: "Database Management Systems",
    department: "Computer Science Engineering",
    year: 2,
    semester: 4,
    category: "lab-manual",
    uploadedBy: {
      _id: "user_003",
      fullName: "Vikram Kumar",
      avatar: null,
      department: "Computer Science Engineering",
      year: 2
    },
    tags: ["lab", "sql", "experiments", "dbms"],
    upvotes: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10",
              "u11","u12"],
    qualityRating: 4.3,
    ratingCount: 18,
    downloadCount: 215,
    isExamPeriod: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    _id: "res_004",
    title: "Operating Systems Assignment Solutions — Unit 3 & 4",
    description: "Solved assignment questions for OS covering process scheduling, memory management, deadlock detection and file system concepts.",
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1",
    fileType: "pdf",
    publicId: "mock/res_004",
    subject: "Operating Systems",
    department: "Computer Science Engineering",
    year: 3,
    semester: 5,
    category: "assignment",
    uploadedBy: {
      _id: "user_004",
      fullName: "Priya Mehta",
      avatar: null,
      department: "Computer Science Engineering",
      year: 3
    },
    tags: ["unit-3", "unit-4", "assignment", "solved"],
    upvotes: ["u1","u2","u3","u4","u5","u6","u7"],
    qualityRating: 4.1,
    ratingCount: 9,
    downloadCount: 98,
    isExamPeriod: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: "res_005",
    title: "Deep Learning Reference — Stanford CS231n Summary",
    description: "Condensed notes from Stanford CS231n course covering CNNs, RNNs, LSTMs, attention mechanisms and transformer architecture with diagrams.",
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1",
    fileType: "pdf",
    publicId: "mock/res_005",
    subject: "Deep Learning",
    department: "Information Technology", // Changed to match filter options
    year: 4,
    semester: 7,
    category: "reference",
    uploadedBy: {
      _id: "user_001",
      fullName: "Aryan Patel",
      avatar: null,
      department: "Information Technology",
      year: 3
    },
    tags: ["deep-learning", "cnn", "transformer", "reference"],
    upvotes: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10",
              "u11","u12","u13","u14","u15","u16","u17","u18",
              "u19","u20","u21","u22"],
    qualityRating: 4.8,
    ratingCount: 33,
    downloadCount: 421,
    isExamPeriod: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    _id: "res_006",
    title: "Computer Networks PYQ 2021-2024 with Solutions",
    description: "Previous year question papers for Computer Networks from 2021 to 2024. Includes detailed solutions for TCP/IP, OSI model, routing protocols.",
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1",
    fileType: "pdf",
    publicId: "mock/res_006",
    subject: "Computer Networks",
    department: "Computer Science Engineering",
    year: 3,
    semester: 6,
    category: "pyq",
    uploadedBy: {
      _id: "user_005",
      fullName: "Rahul Sharma",
      avatar: null,
      department: "Computer Science Engineering",
      year: 3
    },
    tags: ["networks", "pyq", "solved", "important"],
    upvotes: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10",
              "u11","u12","u13","u14","u15","u16","u17","u18",
              "u19","u20"],
    qualityRating: 4.6,
    ratingCount: 27,
    downloadCount: 303,
    isExamPeriod: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    _id: "res_007",
    title: "Engineering Mathematics Unit 1 — Matrices & Calculus",
    description: "Detailed notes for Engineering Maths Unit 1 with solved examples, important formulas, and practice problems. Suitable for semester exam preparation.",
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1",
    fileType: "pdf",
    publicId: "mock/res_007",
    subject: "Engineering Mathematics",
    department: "Electronics & Communication Engineering",
    year: 1,
    semester: 1,
    category: "notes",
    uploadedBy: {
      _id: "user_006",
      fullName: "Divya Nair",
      avatar: null,
      department: "Electronics & Communication Engineering",
      year: 2
    },
    tags: ["maths", "unit-1", "matrices", "calculus"],
    upvotes: ["u1","u2","u3","u4","u5","u6","u7","u8","u9"],
    qualityRating: 4.2,
    ratingCount: 14,
    downloadCount: 176,
    isExamPeriod: false,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    _id: "res_008",
    title: "Python Programming Lab Manual — 15 Programs",
    description: "Complete Python lab manual with 15 programs covering basics to OOP, file handling, and exception handling. Each program has code, output and explanation.",
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1",
    fileType: "pdf",
    publicId: "mock/res_008",
    subject: "Python Programming",
    department: "Information Technology", // Changed to match filter options
    year: 1,
    semester: 2,
    category: "lab-manual",
    uploadedBy: {
      _id: "user_002",
      fullName: "Sneha Reddy",
      avatar: null,
      department: "Information Technology",
      year: 4
    },
    tags: ["python", "lab", "programs", "oop"],
    upvotes: ["u1","u2","u3","u4","u5","u6","u7","u8","u9","u10",
              "u11","u12","u13","u14"],
    qualityRating: 4.5,
    ratingCount: 20,
    downloadCount: 264,
    isExamPeriod: false,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
];

export const mockTopContributors = [
  { _id: "user_001", fullName: "Aryan Patel", department: "IT", uploadCount: 12 },
  { _id: "user_002", fullName: "Sneha Reddy", department: "IT", uploadCount: 9 },
  { _id: "user_005", fullName: "Rahul Sharma", department: "CSE", uploadCount: 7 }
];

export const mockActivity = {
  uploads: 3,
  downloads: 142
};
