const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Game = require('../models/Game');

const router = express.Router();

// GET /api/debug/db-status - Database connection status
router.get('/db-status', async (req, res) => {
  try {
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const dbStatus = {
      connected: mongoose.connection.readyState === 1,
      connectionState: connectionStates[mongoose.connection.readyState],
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      timestamp: new Date().toISOString()
    };

    console.log('🔍 Database status checked:', dbStatus);

    // Try to count documents to test actual database access
    const userCount = await User.countDocuments();
    const quizCount = await Quiz.countDocuments();
    const gameCount = await Game.countDocuments();

    const stats = {
      users: userCount,
      quizzes: quizCount,
      games: gameCount
    };

    console.log('📊 Collection stats:', stats);

    res.json({
      status: dbStatus,
      collections: stats,
      message: 'Database connection is working!'
    });

  } catch (error) {
    console.error('❌ Database status check failed:', error);
    res.status(500).json({ 
      error: error.message,
      connected: false,
      message: 'Database connection failed'
    });
  }
});

// GET /api/debug/users - List all users (for testing)
router.get('/users', async (req, res) => {
  try {
    console.log('🔍 Fetching all users from database...');
    
    const users = await User.find({}, 'username email createdAt role')
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`✅ Found ${users.length} users in database`);

    res.json({
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }))
    });

  } catch (error) {
    console.error('❌ Failed to fetch users:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/debug/test-user - Create a test user
router.post('/test-user', async (req, res) => {
  try {
    const timestamp = Date.now();
    const testUser = new User({
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'testpassword123'
    });

    console.log('🧪 Creating test user...');
    const savedUser = await testUser.save();
    console.log('✅ Test user created successfully:', savedUser._id);

    // Verify the user was saved by querying it back
    const verifyUser = await User.findById(savedUser._id);
    console.log('✅ Test user verification:', verifyUser ? 'Found' : 'Not found');

    res.json({
      message: 'Test user created successfully',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        createdAt: savedUser.createdAt
      },
      verified: !!verifyUser
    });

  } catch (error) {
    console.error('❌ Failed to create test user:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/debug/test-users - Clean up test users
router.delete('/test-users', async (req, res) => {
  try {
    console.log('🧹 Cleaning up test users...');
    
    const result = await User.deleteMany({
      username: { $regex: /^testuser_\d+$/ }
    });

    console.log(`✅ Deleted ${result.deletedCount} test users`);

    res.json({
      message: `Deleted ${result.deletedCount} test users`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('❌ Failed to clean up test users:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/debug/test-query - Test basic database query
router.get('/test-query', async (req, res) => {
  try {
    console.log('🔍 Testing database query...');
    
    // Test a simple aggregation to verify database access
    const result = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          firstUser: { $min: "$createdAt" },
          lastUser: { $max: "$createdAt" }
        }
      }
    ]);

    console.log('✅ Database query test successful:', result);

    res.json({
      message: 'Database query test successful',
      result: result[0] || { totalUsers: 0, firstUser: null, lastUser: null },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database query test failed:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
