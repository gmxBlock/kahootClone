const express = require('express');
const User = require('../models/User');
const Game = require('../models/Game');
const Quiz = require('../models/Quiz');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile with stats
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').lean();
    
    // Get additional stats
    const [gamesHosted, quizzesCreated] = await Promise.all([
      Game.countDocuments({ host: req.user._id }),
      Quiz.countDocuments({ creator: req.user._id })
    ]);

    const profile = {
      ...user,
      additionalStats: {
        gamesHosted,
        quizzesCreated
      }
    };

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// @route   GET /api/user/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's quizzes
    const quizzes = await Quiz.find({ creator: userId })
      .select('title category stats createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Get user's recent games (as host)
    const recentGames = await Game.find({ host: userId })
      .populate('quiz', 'title')
      .select('gamePin quiz status players createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Calculate dashboard stats
    const totalQuizzes = await Quiz.countDocuments({ creator: userId });
    const totalGamesHosted = await Game.countDocuments({ host: userId });
    
    // Get games played as participant
    const gamesPlayed = await Game.find({
      'players.userId': userId,
      status: 'finished'
    }).lean();

    const dashboardData = {
      stats: {
        totalQuizzes,
        totalGamesHosted,
        gamesPlayed: gamesPlayed.length,
        ...req.user.stats
      },
      recentQuizzes: quizzes,
      recentGames: recentGames.map(game => ({
        gamePin: game.gamePin,
        quizTitle: game.quiz.title,
        status: game.status,
        playerCount: game.players.filter(p => p.isConnected).length,
        createdAt: game.createdAt
      }))
    };

    res.json({ dashboard: dashboardData });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard' });
  }
});

// @route   GET /api/user/game-history
// @desc    Get user's game history
// @access  Private
router.get('/game-history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role = 'all' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    
    if (role === 'host') {
      query.host = req.user._id;
    } else if (role === 'player') {
      query['players.userId'] = req.user._id;
    } else {
      // All games (both hosted and played)
      query.$or = [
        { host: req.user._id },
        { 'players.userId': req.user._id }
      ];
    }

    const [games, total] = await Promise.all([
      Game.find(query)
        .populate('quiz', 'title category')
        .populate('host', 'username')
        .select('gamePin quiz host status players createdAt results')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Game.countDocuments(query)
    ]);

    const gameHistory = games.map(game => {
      const isHost = game.host._id.toString() === req.user._id.toString();
      const playerData = game.players.find(p => p.userId?.toString() === req.user._id.toString());

      return {
        gamePin: game.gamePin,
        quiz: game.quiz,
        host: game.host.username,
        status: game.status,
        role: isHost ? 'host' : 'player',
        playerCount: game.players.filter(p => p.answers.length > 0).length,
        createdAt: game.createdAt,
        ...(playerData && {
          playerStats: {
            score: playerData.score,
            position: playerData.position,
            correctAnswers: playerData.answers.filter(a => a.isCorrect).length,
            totalAnswers: playerData.answers.length
          }
        }),
        ...(game.results && {
          gameStats: {
            averageScore: game.results.averageScore,
            highestScore: game.results.highestScore,
            completionRate: game.results.completionRate
          }
        })
      };
    });

    res.json({
      gameHistory,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalGames: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get game history error:', error);
    res.status(500).json({ message: 'Server error while fetching game history' });
  }
});

// @route   GET /api/user/leaderboard
// @desc    Get global leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { type = 'score', limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    let sortField;
    switch (type) {
      case 'wins':
        sortField = { 'stats.gamesWon': -1 };
        break;
      case 'games':
        sortField = { 'stats.gamesPlayed': -1 };
        break;
      case 'average':
        sortField = { 'stats.averageScore': -1 };
        break;
      default:
        sortField = { 'stats.totalScore': -1 };
    }

    const users = await User.find({ isActive: true })
      .select('username stats')
      .sort(sortField)
      .limit(limitNum)
      .lean();

    const leaderboard = users.map((user, index) => ({
      position: index + 1,
      username: user.username,
      stats: user.stats
    }));

    res.json({ leaderboard, type });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error while fetching leaderboard' });
  }
});

// @route   PUT /api/user/settings
// @desc    Update user settings/preferences
// @access  Private
router.put('/settings', auth, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const updates = {};

    // Validate and update username
    if (username !== undefined) {
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
      }
      
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user._id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      updates.username = username;
    }

    // Update avatar
    if (avatar !== undefined) {
      updates.avatar = avatar;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid updates provided' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Settings updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Server error during settings update' });
  }
});

// Admin only routes
// @route   GET /api/user/admin/users
// @desc    Get all users (admin only)
// @access  Private (Admin)
router.get('/admin/users', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalUsers: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   PUT /api/user/admin/users/:userId/status
// @desc    Update user status (admin only)
// @access  Private (Admin)
router.put('/admin/users/:userId/status', auth, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error during user status update' });
  }
});

module.exports = router;
