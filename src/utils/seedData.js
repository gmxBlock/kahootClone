const mongoose = require('mongoose');
const User = require('../models/User');
const Quiz = require('../models/Quiz');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kahoot-clone');
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Quiz.deleteMany({})
    ]);
    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@kahoot.local',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('👑 Created admin user');

    // Create sample users
    const sampleUsers = [
      {
        username: 'teacher1',
        email: 'teacher@school.edu',
        password: 'teacher123',
        role: 'user'
      },
      {
        username: 'student1',
        email: 'student1@school.edu',
        password: 'student123',
        role: 'user'
      },
      {
        username: 'student2',
        email: 'student2@school.edu',
        password: 'student123',
        role: 'user'
      }
    ];

    const users = await User.insertMany(sampleUsers);
    console.log(`👥 Created ${users.length} sample users`);

    // Create sample quizzes
    const sampleQuizzes = [
      {
        title: 'General Knowledge Quiz',
        description: 'Test your general knowledge with these fun questions!',
        creator: users[0]._id,
        category: 'general',
        difficulty: 'medium',
        questions: [
          {
            question: 'What is the capital of France?',
            options: [
              { text: 'London', isCorrect: false },
              { text: 'Berlin', isCorrect: false },
              { text: 'Paris', isCorrect: true },
              { text: 'Madrid', isCorrect: false }
            ],
            timeLimit: 30,
            points: 1000,
            difficulty: 'easy'
          },
          {
            question: 'Which planet is known as the Red Planet?',
            options: [
              { text: 'Venus', isCorrect: false },
              { text: 'Mars', isCorrect: true },
              { text: 'Jupiter', isCorrect: false },
              { text: 'Saturn', isCorrect: false }
            ],
            timeLimit: 25,
            points: 1200,
            difficulty: 'easy'
          },
          {
            question: 'What is the largest ocean on Earth?',
            options: [
              { text: 'Atlantic Ocean', isCorrect: false },
              { text: 'Indian Ocean', isCorrect: false },
              { text: 'Arctic Ocean', isCorrect: false },
              { text: 'Pacific Ocean', isCorrect: true }
            ],
            timeLimit: 30,
            points: 1000,
            difficulty: 'medium'
          }
        ],
        tags: ['geography', 'science', 'general'],
        isPublic: true
      },
      {
        title: 'Science Fundamentals',
        description: 'Basic science questions for students',
        creator: users[0]._id,
        category: 'science',
        difficulty: 'medium',
        questions: [
          {
            question: 'What is the chemical symbol for water?',
            options: [
              { text: 'H2O', isCorrect: true },
              { text: 'CO2', isCorrect: false },
              { text: 'O2', isCorrect: false },
              { text: 'H2', isCorrect: false }
            ],
            timeLimit: 20,
            points: 800,
            difficulty: 'easy'
          },
          {
            question: 'How many bones are in the adult human body?',
            options: [
              { text: '206', isCorrect: true },
              { text: '205', isCorrect: false },
              { text: '207', isCorrect: false },
              { text: '204', isCorrect: false }
            ],
            timeLimit: 35,
            points: 1500,
            difficulty: 'hard'
          },
          {
            question: 'What gas do plants absorb from the atmosphere during photosynthesis?',
            options: [
              { text: 'Oxygen', isCorrect: false },
              { text: 'Nitrogen', isCorrect: false },
              { text: 'Carbon Dioxide', isCorrect: true },
              { text: 'Hydrogen', isCorrect: false }
            ],
            timeLimit: 30,
            points: 1000,
            difficulty: 'medium'
          }
        ],
        tags: ['biology', 'chemistry', 'education'],
        isPublic: true
      },
      {
        title: 'World History',
        description: 'Journey through important historical events',
        creator: adminUser._id,
        category: 'history',
        difficulty: 'hard',
        questions: [
          {
            question: 'In which year did World War II end?',
            options: [
              { text: '1944', isCorrect: false },
              { text: '1945', isCorrect: true },
              { text: '1946', isCorrect: false },
              { text: '1947', isCorrect: false }
            ],
            timeLimit: 30,
            points: 1000,
            difficulty: 'medium'
          },
          {
            question: 'Who was the first person to walk on the moon?',
            options: [
              { text: 'Buzz Aldrin', isCorrect: false },
              { text: 'Neil Armstrong', isCorrect: true },
              { text: 'Michael Collins', isCorrect: false },
              { text: 'John Glenn', isCorrect: false }
            ],
            timeLimit: 25,
            points: 1200,
            difficulty: 'easy'
          },
          {
            question: 'The Berlin Wall fell in which year?',
            options: [
              { text: '1987', isCorrect: false },
              { text: '1988', isCorrect: false },
              { text: '1989', isCorrect: true },
              { text: '1990', isCorrect: false }
            ],
            timeLimit: 30,
            points: 1300,
            difficulty: 'medium'
          }
        ],
        tags: ['world-war', 'modern-history'],
        isPublic: true
      },
      {
        title: 'Technology Quiz',
        description: 'Test your knowledge about modern technology',
        creator: users[0]._id,
        category: 'technology',
        difficulty: 'medium',
        questions: [
          {
            question: 'What does "HTTP" stand for?',
            options: [
              { text: 'HyperText Transfer Protocol', isCorrect: true },
              { text: 'High Tech Transfer Protocol', isCorrect: false },
              { text: 'HyperText Transport Protocol', isCorrect: false },
              { text: 'High Transfer Text Protocol', isCorrect: false }
            ],
            timeLimit: 30,
            points: 1000,
            difficulty: 'medium'
          },
          {
            question: 'Which company developed the JavaScript programming language?',
            options: [
              { text: 'Microsoft', isCorrect: false },
              { text: 'Google', isCorrect: false },
              { text: 'Netscape', isCorrect: true },
              { text: 'Apple', isCorrect: false }
            ],
            timeLimit: 35,
            points: 1400,
            difficulty: 'hard'
          }
        ],
        tags: ['programming', 'web', 'computers'],
        isPublic: true
      }
    ];

    const quizzes = await Quiz.insertMany(sampleQuizzes);
    console.log(`📝 Created ${quizzes.length} sample quizzes`);

    // Update some quiz stats to simulate usage
    await Quiz.findByIdAndUpdate(quizzes[0]._id, {
      'stats.timesPlayed': 15,
      'stats.averageScore': 2100,
      'stats.totalParticipants': 45
    });

    await Quiz.findByIdAndUpdate(quizzes[1]._id, {
      'stats.timesPlayed': 8,
      'stats.averageScore': 1850,
      'stats.totalParticipants': 24
    });

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Sample accounts created:');
    console.log('Admin: admin@kahoot.local / admin123');
    console.log('Teacher: teacher@school.edu / teacher123');
    console.log('Student 1: student1@school.edu / student123');
    console.log('Student 2: student2@school.edu / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if called directly
if (require.main === module) {
  require('dotenv').config();
  seedData();
}

module.exports = seedData;
