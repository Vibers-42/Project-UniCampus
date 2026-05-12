/**
 * @file seed.js — Database Seeder for UniCampus
 * 
 * Seeds realistic campus data across all modules so the platform
 * feels alive from day one. Run with: node scripts/seed.js
 * 
 * SAFE: Checks for existing data before inserting. Will not duplicate.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/modules/users/users.model');
const Resource = require('../src/modules/resources/resources.model');
const MarketplaceItem = require('../src/modules/marketplace/marketplace.model');
const TeamProject = require('../src/modules/teammates/teammates.model');
const Opportunity = require('../src/modules/opportunities/opportunities.model');
const Event = require('../src/modules/events/events.model');
const Post = require('../src/modules/feed/post.model');
const Group = require('../src/models/StudyGroup');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

// Stable placeholder PDF URL (publicly accessible)
const PLACEHOLDER_PDF = 'https://res.cloudinary.com/demo/image/upload/sample.pdf';
const PLACEHOLDER_IMG = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';

const SEED_MARKER = 'seed-user-'; // firebaseUid prefix for seeded users

const USERS = [
  { firebaseUid: `${SEED_MARKER}cse-01`, email: 'ananya.cse@adityauniversity.in', fullName: 'Ananya Sharma', department: 'CSE', yearOfStudy: 3, skills: ['React', 'Node.js', 'Python'], interests: ['Web Development', 'AI/ML'], techStack: ['MERN'], bio: 'Full-stack developer passionate about building campus tools.', rollNumber: 'CSE2301' },
  { firebaseUid: `${SEED_MARKER}cse-02`, email: 'rahul.cse@adityauniversity.in', fullName: 'Rahul Verma', department: 'CSE', yearOfStudy: 2, skills: ['Java', 'DSA', 'Spring Boot'], interests: ['Competitive Programming', 'Backend'], techStack: ['Java', 'Spring'], bio: 'CP enthusiast | 3-star CodeChef', rollNumber: 'CSE2202' },
  { firebaseUid: `${SEED_MARKER}aiml-01`, email: 'priya.aiml@adityauniversity.in', fullName: 'Priya Reddy', department: 'AIML', yearOfStudy: 3, skills: ['Python', 'TensorFlow', 'NLP'], interests: ['Machine Learning', 'Research'], techStack: ['Python', 'PyTorch'], bio: 'ML researcher working on NLP projects.', rollNumber: 'AIML2301' },
  { firebaseUid: `${SEED_MARKER}ece-01`, email: 'karthik.ece@adityauniversity.in', fullName: 'Karthik Naidu', department: 'ECE', yearOfStudy: 4, skills: ['Embedded C', 'Arduino', 'IoT'], interests: ['IoT', 'Robotics'], techStack: ['Arduino', 'Raspberry Pi'], bio: 'Hardware hacker and IoT builder.', rollNumber: 'ECE2101' },
  { firebaseUid: `${SEED_MARKER}mech-01`, email: 'sneha.mech@adityauniversity.in', fullName: 'Sneha Patel', department: 'MECH', yearOfStudy: 2, skills: ['AutoCAD', 'SolidWorks', 'MATLAB'], interests: ['Design', '3D Printing'], techStack: ['MATLAB', 'Simulink'], bio: 'Mechanical engineer exploring CAD/CAM.', rollNumber: 'MECH2201' },
  { firebaseUid: `${SEED_MARKER}cse-03`, email: 'arjun.cse@adityauniversity.in', fullName: 'Arjun Kumar', department: 'CSE', yearOfStudy: 4, skills: ['Flutter', 'Firebase', 'Dart'], interests: ['Mobile Development', 'UI/UX'], techStack: ['Flutter', 'Firebase'], bio: 'Mobile app developer | Open source contributor', rollNumber: 'CSE2103', role: 'clubAdmin' },
];

async function seedUsers() {
  const created = [];
  for (const u of USERS) {
    const existing = await User.findOne({ firebaseUid: u.firebaseUid });
    if (existing) { created.push(existing); continue; }
    const user = await User.create({ ...u, isVerified: true, onboardingCompleted: true, profileCompletionPercent: 85 });
    created.push(user);
  }
  console.log(`✅ Users: ${created.length} ready`);
  return created;
}

async function seedResources(users) {
  const count = await Resource.countDocuments();
  if (count >= 6) { console.log(`✅ Resources: ${count} already exist`); return; }

  const resources = [
    { title: 'Data Structures & Algorithms — Complete Notes', description: 'Comprehensive notes covering arrays, trees, graphs, DP, and greedy algorithms with examples.', subject: 'Data Structures', department: 'CSE', year: 2, semester: 3, category: 'notes', tags: ['dsa', 'algorithms', 'placement'], downloadCount: 47 },
    { title: 'Machine Learning PYQ — 2025 Mid Sem', description: 'Previous year question paper for ML mid-semester exam with solutions.', subject: 'Machine Learning', department: 'AIML', year: 3, semester: 5, category: 'pyq', tags: ['ml', 'exam', 'pyq'], downloadCount: 112 },
    { title: 'Digital Electronics Lab Manual', description: 'Complete lab manual with circuit diagrams and viva questions for DE lab.', subject: 'Digital Electronics', department: 'ECE', year: 2, semester: 3, category: 'lab-manual', tags: ['electronics', 'lab'], downloadCount: 33 },
    { title: 'Operating Systems — Unit 1-3 Notes', description: 'Detailed notes on process management, memory management, and file systems.', subject: 'Operating Systems', department: 'CSE', year: 3, semester: 5, category: 'notes', tags: ['os', 'processes', 'memory'], downloadCount: 68 },
    { title: 'DBMS Assignment Solutions — Semester 4', description: 'Solved assignments covering normalization, SQL queries, and ER diagrams.', subject: 'Database Systems', department: 'CSE', year: 2, semester: 4, category: 'assignment', tags: ['dbms', 'sql', 'normalization'], downloadCount: 55 },
    { title: 'Engineering Mathematics III Reference PDF', description: 'Comprehensive reference material for complex analysis and transforms.', subject: 'Mathematics', department: 'CSE', year: 2, semester: 3, category: 'reference', tags: ['math', 'transforms', 'complex-analysis'], downloadCount: 29 },
    { title: 'Computer Networks PYQ — End Sem 2024', description: 'Previous year questions for CN end semester with model answers.', subject: 'Computer Networks', department: 'CSE', year: 3, semester: 5, category: 'pyq', tags: ['networks', 'tcp', 'osi'], downloadCount: 91 },
    { title: 'Thermodynamics Lab Manual', description: 'Complete lab manual for thermodynamics experiments with observations.', subject: 'Thermodynamics', department: 'MECH', year: 2, semester: 4, category: 'lab-manual', tags: ['thermo', 'lab', 'experiments'], downloadCount: 18 },
  ];

  for (let i = 0; i < resources.length; i++) {
    const r = resources[i];
    const uploader = users[i % users.length];
    await Resource.create({ ...r, uploadedBy: uploader._id, fileUrl: PLACEHOLDER_PDF, fileType: 'pdf', publicId: `seed/resource_${i}`, qualityRating: 3.5 + Math.random() * 1.5, ratingCount: Math.floor(Math.random() * 20) + 5 });
  }
  console.log(`✅ Resources: ${resources.length} seeded`);
}

async function seedMarketplace(users) {
  const count = await MarketplaceItem.countDocuments();
  if (count >= 5) { console.log(`✅ Marketplace: ${count} already exist`); return; }

  const items = [
    { title: 'Casio FX-991EX Scientific Calculator', description: 'Used for 1 semester, perfect condition. Great for engineering math.', price: 800, category: 'Calculators', condition: 'Like New', tags: ['calculator', 'engineering', 'math'] },
    { title: 'Engineering Drawing Kit — Complete Set', description: 'Includes compass, divider, set squares, mini drafter. Barely used.', price: 350, category: 'Stationery', condition: 'Good', tags: ['drawing', 'instruments', 'first-year'] },
    { title: 'Cormen CLRS — Introduction to Algorithms', description: '3rd edition, clean pages, no highlights. The bible of DSA.', price: 450, category: 'Books', condition: 'Good', tags: ['algorithms', 'dsa', 'textbook'] },
    { title: 'Arduino Mega 2560 Starter Kit', description: 'Complete kit with sensors, breadboard, jumper wires, and manual.', price: 1200, category: 'Electronics', condition: 'Like New', tags: ['arduino', 'iot', 'electronics'] },
    { title: 'Table Fan — Hostel Room', description: 'Small portable fan, works perfectly. Moving out of hostel.', price: 300, category: 'Hostel Essentials', condition: 'Good', tags: ['hostel', 'fan', 'essential'] },
    { title: 'HP Laptop Bag — 15.6 inch', description: 'Padded laptop bag with multiple compartments.', price: 200, category: 'Gadgets', condition: 'Good', tags: ['laptop', 'bag', 'accessories'] },
  ];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const seller = users[i % users.length];
    await MarketplaceItem.create({
      ...item,
      sellerId: seller._id,
      image: PLACEHOLDER_IMG,
      imagePublicId: `seed/marketplace_${i}`,
      contactInfo: seller.email,
    });
  }
  console.log(`✅ Marketplace: ${items.length} seeded`);
}

async function seedTeammates(users) {
  const count = await TeamProject.countDocuments();
  if (count >= 4) { console.log(`✅ Teammates: ${count} already exist`); return; }

  const projects = [
    { title: 'Smart Campus IoT Dashboard', shortDescription: 'Building a real-time IoT dashboard for campus energy monitoring.', detailedDescription: 'We want to deploy sensors across campus to monitor energy usage, water levels, and air quality, then visualize it on a web dashboard.', problemStatement: 'Campus lacks visibility into resource consumption patterns.', category: 'project', techStack: ['React', 'Node.js', 'Arduino', 'MQTT'], requiredRoles: ['Frontend Developer', 'IoT Engineer'], requiredSkills: ['React', 'Arduino', 'MQTT'], requiredTeamSize: 4, contactInfo: 'karthik.ece@adityauniversity.in', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    { title: 'UniHack 2026 — Team Formation', shortDescription: 'Looking for teammates for the upcoming university hackathon.', detailedDescription: 'Need a balanced team with frontend, backend, and ML skills for the 36-hour hackathon. Theme: Education Technology.', problemStatement: 'Need to form a competitive team for UniHack 2026.', category: 'hackathon', techStack: ['Python', 'React', 'FastAPI'], requiredRoles: ['ML Engineer', 'Backend Developer', 'UI Designer'], requiredSkills: ['Python', 'TensorFlow', 'React'], requiredTeamSize: 4, contactInfo: 'priya.aiml@adityauniversity.in', deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    { title: 'Open Source Contribution — React Component Library', shortDescription: 'Building an open-source UI component library for campus projects.', detailedDescription: 'Creating a reusable set of React components styled for campus applications. Contributions to npm package.', problemStatement: 'Every campus project rebuilds the same UI components from scratch.', category: 'open source', techStack: ['React', 'TypeScript', 'Storybook'], requiredRoles: ['Frontend Developer', 'Technical Writer'], requiredSkills: ['React', 'TypeScript', 'CSS'], requiredTeamSize: 5, contactInfo: 'ananya.cse@adityauniversity.in', deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
    { title: 'Campus Food Delivery Research Study', shortDescription: 'Research project on optimizing campus food delivery routes.', detailedDescription: 'Applying graph algorithms and operations research techniques to optimize food delivery within campus.', problemStatement: 'Food delivery on campus is slow and unorganized.', category: 'research', techStack: ['Python', 'NetworkX', 'Jupyter'], requiredRoles: ['Data Analyst', 'Research Assistant'], requiredSkills: ['Python', 'Graph Algorithms', 'Data Analysis'], requiredTeamSize: 3, contactInfo: 'rahul.cse@adityauniversity.in', deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
  ];

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const creator = users[(i + 3) % users.length]; // Different creators
    await TeamProject.create({ ...p, creatorId: creator._id, status: 'open' });
  }
  console.log(`✅ Teammates: ${projects.length} seeded`);
}

async function seedOpportunities(users) {
  const count = await Opportunity.countDocuments();
  if (count >= 4) { console.log(`✅ Opportunities: ${count} already exist`); return; }

  const adminUser = users.find(u => u.role === 'clubAdmin') || users[0];
  const opps = [
    { title: 'TCS NQT — Campus Placement Drive', type: 'Placement Drive', organization: 'TCS', description: 'TCS National Qualifier Test for 2026 batch. Eligible branches: CSE, IT, ECE, EEE.', departments: ['CSE', 'IT', 'ECE', 'EEE'], yearsEligible: ['4th Year'], mode: 'Offline', deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), tags: ['placement', 'tcs', 'nqt'] },
    { title: 'Google Summer of Code 2026 — Info Session', type: 'Workshops', organization: 'Google', description: 'Learn about GSoC program, how to apply, and tips from past participants.', departments: ['CSE', 'AIML', 'IT'], yearsEligible: ['2nd Year', '3rd Year'], mode: 'Hybrid', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), tags: ['gsoc', 'open-source', 'google'] },
    { title: 'Internship — AI Research Lab (IIT Hyderabad)', type: 'Research Opportunities', organization: 'IIT Hyderabad', description: 'Summer research internship at IIT Hyderabad AI Lab. Stipend: ₹15,000/month.', departments: ['AIML', 'CSE'], yearsEligible: ['3rd Year'], mode: 'Offline', stipend: '₹15,000/month', deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), tags: ['research', 'ai', 'iit'] },
    { title: 'Coding Club — Campus Ambassador Program', type: 'Campus Ambassador', organization: 'UniCampus Coding Club', description: 'Become a campus ambassador for the Coding Club. Organize workshops and coding contests.', departments: ['CSE', 'AIML', 'IT', 'ECE'], yearsEligible: ['2nd Year', '3rd Year'], mode: 'Offline', deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), tags: ['coding', 'ambassador', 'club'] },
    { title: 'AWS Certified Cloud Practitioner Workshop', type: 'Certifications', organization: 'AWS Academy', description: 'Free certification preparation workshop for AWS Cloud Practitioner exam.', departments: ['CSE', 'IT', 'AIML'], yearsEligible: ['2nd Year', '3rd Year', '4th Year'], mode: 'Online', deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), tags: ['aws', 'cloud', 'certification'] },
  ];

  for (const o of opps) {
    await Opportunity.create({ ...o, postedBy: adminUser._id, status: 'active' });
  }
  console.log(`✅ Opportunities: ${opps.length} seeded`);
}

async function seedEvents(users) {
  const count = await Event.countDocuments();
  if (count >= 3) { console.log(`✅ Events: ${count} already exist`); return; }

  const organizer = users.find(u => u.role === 'clubAdmin') || users[0];
  const events = [
    { title: 'CodeSprint 2026 — 24-Hour Hackathon', description: 'Annual 24-hour hackathon organized by the Coding Club. Build innovative solutions for real-world campus problems.', venue: 'Main Auditorium, Block A', category: 'hackathon', startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), tags: ['hackathon', 'coding', 'innovation'], bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=400&fit=crop' },
    { title: 'Workshop: Introduction to Docker & Kubernetes', description: 'Hands-on workshop on containerization and orchestration. Bring your laptops!', venue: 'CS Lab 3, Block B', category: 'workshop', startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), tags: ['docker', 'kubernetes', 'devops'], bannerUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=400&fit=crop' },
    { title: 'TEDx Aditya University', description: 'Ideas worth spreading. Join us for an evening of inspiring talks from industry leaders and student innovators.', venue: 'Open Air Theater', category: 'seminar', startDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), tags: ['tedx', 'talks', 'inspiration'], bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop' },
    { title: 'Inter-Department Cricket Tournament', description: 'Annual cricket tournament between all departments. Register your team now!', venue: 'University Ground', category: 'sports', startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), tags: ['cricket', 'sports', 'tournament'], bannerUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&h=400&fit=crop' },
  ];

  for (const e of events) {
    await Event.create({ ...e, organizerId: organizer._id, status: 'upcoming', maxCapacity: 100 });
  }
  console.log(`✅ Events: ${events.length} seeded`);
}

async function seedStudyGroups(users) {
  const count = await Group.countDocuments();
  if (count >= 3) { console.log(`✅ Study Groups: ${count} already exist`); return; }

  const groups = [
    { name: 'DSA Daily Practice', subject: 'Data Structures & Algorithms', department: 'CSE', semester: 4, year: 2, category: 'study', tags: ['dsa', 'leetcode', 'placement'], description: 'Daily problem solving for placement preparation.' },
    { name: 'ML Paper Reading Club', subject: 'Machine Learning', department: 'AIML', semester: 5, year: 3, category: 'research', tags: ['machine-learning', 'research', 'papers'], description: 'Weekly ML paper discussions and implementations.' },
    { name: 'Web Dev Bootcamp — MERN', subject: 'Web Development', department: 'CSE', semester: 3, year: 2, category: 'project', tags: ['react', 'node', 'mongodb', 'mern'], description: 'Learn MERN stack together through mini projects.' },
    { name: 'Hackathon Prep Squad', subject: 'Competitive Programming', department: 'CSE', semester: 6, year: 3, category: 'hackathon', tags: ['hackathon', 'coding', 'teamwork'], description: 'Prepare for upcoming hackathons as a team.' },
  ];

  for (let i = 0; i < groups.length; i++) {
    const admin = users[i % users.length];
    const members = [admin._id, users[(i + 1) % users.length]._id, users[(i + 2) % users.length]._id];
    await Group.create({ ...groups[i], admin: admin._id, members });
  }
  console.log(`✅ Study Groups: ${groups.length} seeded`);
}

async function seedFeedPosts(users) {
  const count = await Post.countDocuments();
  if (count >= 4) { console.log(`✅ Feed Posts: ${count} already exist`); return; }

  const posts = [
    { content: '🚀 Just completed my first full-stack project using MERN stack! Built a campus resource sharing platform. Check it out on my GitHub! #webdev #mern #project', type: 'General', tags: ['webdev', 'project', 'mern'] },
    { content: '📢 TCS NQT registration is now open! Last date to apply is in 20 days. Don\'t miss this opportunity if you\'re in your final year. #placement #tcs', type: 'General', tags: ['placement', 'tcs', 'career'] },
    { content: '💡 Who else is preparing for CodeSprint 2026? Looking for ideas — thinking of building something around campus sustainability. Let\'s discuss! #hackathon', type: 'Discussion', tags: ['hackathon', 'codesprint', 'ideas'] },
    { content: '📚 Uploaded OS notes for Unit 1-3 in the Resources section. Covers process scheduling, memory management, and deadlocks. Hope it helps! #resources #os', type: 'Resource', tags: ['resources', 'os', 'notes'] },
    { content: '🎉 Our team won 2nd place at the state-level robotics competition! Shoutout to the ECE department for the amazing lab support. #robotics #ece #achievement', type: 'General', tags: ['robotics', 'achievement', 'ece'] },
  ];

  for (let i = 0; i < posts.length; i++) {
    const author = users[i % users.length];
    await Post.create({ ...posts[i], authorId: author._id, likesCount: Math.floor(Math.random() * 30) + 5 });
  }
  console.log(`✅ Feed Posts: ${posts.length} seeded`);
}

async function main() {
  console.log('\n🌱 UniCampus Database Seeder\n');
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!\n');

  const users = await seedUsers();
  await seedResources(users);
  await seedMarketplace(users);
  await seedTeammates(users);
  await seedOpportunities(users);
  await seedEvents(users);
  await seedStudyGroups(users);
  await seedFeedPosts(users);

  console.log('\n✅ Seeding complete! All modules populated.\n');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
