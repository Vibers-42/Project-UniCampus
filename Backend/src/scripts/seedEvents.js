require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../modules/events/events.model');
const User = require('../modules/users/users.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unicampus';

const seedEvents = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Need an organizer ID
    let organizer = await User.findOne({});
    if (!organizer) {
      organizer = await User.create({
        fullName: 'Admin User',
        email: 'admin@unicampus.test',
        password: 'password123',
        role: 'admin',
        rollNumber: 'ADMIN001'
      });
    }

    await Event.deleteMany({});
    console.log('Cleared existing events.');

    const now = new Date();
    
    const eventsToSeed = [
      {
        title: 'Tech Horizons Hackathon 2026',
        description: 'Join us for a 48-hour coding marathon building the future of campus technology. Food and drinks provided!',
        venue: 'Main Library Hub',
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
        category: 'hackathon',
        status: 'upcoming',
        tags: ['technology', 'coding', 'innovation'],
        organizerId: organizer._id,
        bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
      },
      {
        title: 'AI in Healthcare Seminar',
        description: 'A deep dive into how Artificial Intelligence is transforming modern medicine. Guest speakers from top research labs.',
        venue: 'Science Block Auditorium',
        startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        category: 'seminar',
        status: 'upcoming',
        tags: ['ai', 'healthcare', 'research'],
        organizerId: organizer._id,
        bannerUrl: 'https://images.unsplash.com/photo-1576091160550-2173ff9e5ee5?w=800&q=80',
      },
      {
        title: 'Spring Campus Cultural Fest',
        description: 'Celebrate diversity with music, dance, and food from around the world. A week-long celebration.',
        venue: 'Campus Open Grounds',
        startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        category: 'cultural',
        status: 'upcoming',
        tags: ['music', 'food', 'diversity'],
        organizerId: organizer._id,
        bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
      },
      {
        title: 'Introduction to Cloud Computing',
        description: 'Learn the basics of AWS and Azure in this hands-on workshop designed for beginners.',
        venue: 'Computer Lab 3',
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        category: 'workshop',
        status: 'completed',
        tags: ['cloud', 'aws', 'learning'],
        organizerId: organizer._id,
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
      },
      {
        title: 'Inter-Department Basketball Finals',
        description: 'Come support your department as they battle it out for the annual championship trophy.',
        venue: 'Indoor Sports Arena',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        category: 'sports',
        status: 'upcoming',
        tags: ['basketball', 'sports', 'competition'],
        organizerId: organizer._id,
        bannerUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
      }
    ];

    await Event.insertMany(eventsToSeed);
    console.log(`Successfully seeded ${eventsToSeed.length} events!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
