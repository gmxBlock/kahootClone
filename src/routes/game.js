const express = require('express');
const Game = require('../models/Game');
const Quiz = require('../models/Quiz');
const { auth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/game/create
// @desc    Create a new game
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const { quizId, settings = {} } = req.body;

    // Validate quiz exists and user has access
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user can host this quiz
    if (!quiz.isPublic && quiz.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to host this quiz' });
    }

    // Generate unique game pin
    const gamePin = await Game.generateGamePin();

    // Create game
    const game = new Game({
      gamePin,
      quiz: quizId,
      host: req.user._id,
      settings: {
        maxPlayers: settings.maxPlayers || 50,
        isPrivate: settings.isPrivate || false,
        allowLateJoin: settings.allowLateJoin !== false,
        showLeaderboard: settings.showLeaderboard !== false,
        randomizePlayerOrder: settings.randomizePlayerOrder || false
      }
    });

    await game.save();

    const populatedGame = await Game.findById(game._id)
      .populate('quiz', 'title description questions')
      .populate('host', 'username')
      .lean();

    res.status(201).json({
      message: 'Game created successfully',
      game: populatedGame
    });
  } catch (error) {
    console.error('Game creation error:', error);
    res.status(500).json({ message: 'Server error during game creation' });
  }
});

// @route   GET /api/game/:gamePin
// @desc    Get game by pin
// @access  Public
router.get('/:gamePin', async (req, res) => {
  try {
    const { gamePin } = req.params;

    const game = await Game.findOne({ gamePin })
      .populate('quiz', 'title description category difficulty')
      .populate('host', 'username')
      .lean();

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Return basic game info (no sensitive data)
    const gameInfo = {
      gamePin: game.gamePin,
      quiz: {
        title: game.quiz.title,
        description: game.quiz.description,
        category: game.quiz.category,
        difficulty: game.quiz.difficulty,
        questionCount: game.quiz.questions?.length || 0
      },
      host: game.host.username,
      status: game.status,
      playerCount: game.players.filter(p => p.isConnected).length,
      maxPlayers: game.settings.maxPlayers,
      allowLateJoin: game.settings.allowLateJoin,
      isPrivate: game.settings.isPrivate
    };

    res.json({ game: gameInfo });
  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({ message: 'Server error while fetching game' });
  }
});

// @route   POST /api/game/:gamePin/join
// @desc    Join a game
// @access  Public
router.post('/:gamePin/join', validate(schemas.joinGame), async (req, res) => {
  try {
    const { gamePin } = req.params;
    const { nickname } = req.body;

    const game = await Game.findOne({ gamePin });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check game status
    if (game.status === 'finished') {
      return res.status(400).json({ message: 'Game has already finished' });
    }

    if (game.status === 'active' && !game.settings.allowLateJoin) {
      return res.status(400).json({ message: 'Game has started and late join is disabled' });
    }

    // Check if nickname is already taken
    const existingPlayer = game.players.find(
      p => p.nickname.toLowerCase() === nickname.toLowerCase() && p.isConnected
    );
    if (existingPlayer) {
      return res.status(400).json({ message: 'Nickname already taken' });
    }

    // Check player limit
    const connectedPlayers = game.players.filter(p => p.isConnected).length;
    if (connectedPlayers >= game.settings.maxPlayers) {
      return res.status(400).json({ message: 'Game is full' });
    }

    res.json({
      message: 'Ready to join game',
      gamePin,
      nickname,
      quiz: {
        title: await Quiz.findById(game.quiz).select('title').then(q => q.title)
      }
    });
  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({ message: 'Server error while joining game' });
  }
});

// @route   GET /api/game/:gamePin/host
// @desc    Get game details for host
// @access  Private (Host only)
router.get('/:gamePin/host', auth, async (req, res) => {
  try {
    const { gamePin } = req.params;

    const game = await Game.findOne({ gamePin })
      .populate('quiz')
      .populate('host', 'username')
      .lean();

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if user is the host
    if (game.host._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this game' });
    }

    res.json({ game });
  } catch (error) {
    console.error('Get game for host error:', error);
    res.status(500).json({ message: 'Server error while fetching game details' });
  }
});

// @route   PUT /api/game/:gamePin/settings
// @desc    Update game settings
// @access  Private (Host only)
router.put('/:gamePin/settings', auth, validate(schemas.gameSettings), async (req, res) => {
  try {
    const { gamePin } = req.params;

    const game = await Game.findOne({ gamePin });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if user is the host
    if (game.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this game' });
    }

    // Can only update settings if game hasn't started
    if (game.status !== 'waiting') {
      return res.status(400).json({ message: 'Cannot update settings after game has started' });
    }

    game.settings = { ...game.settings, ...req.body };
    await game.save();

    res.json({
      message: 'Game settings updated successfully',
      settings: game.settings
    });
  } catch (error) {
    console.error('Update game settings error:', error);
    res.status(500).json({ message: 'Server error during settings update' });
  }
});

// @route   DELETE /api/game/:gamePin
// @desc    Delete/End a game
// @access  Private (Host only)
router.delete('/:gamePin', auth, async (req, res) => {
  try {
    const { gamePin } = req.params;

    const game = await Game.findOne({ gamePin });
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if user is the host
    if (game.host.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this game' });
    }

    // Update status to finished instead of deleting
    game.status = 'finished';
    await game.save();

    res.json({ message: 'Game ended successfully' });
  } catch (error) {
    console.error('Delete game error:', error);
    res.status(500).json({ message: 'Server error during game deletion' });
  }
});

// @route   GET /api/game/:gamePin/results
// @desc    Get game results
// @access  Public (after game ends)
router.get('/:gamePin/results', async (req, res) => {
  try {
    const { gamePin } = req.params;

    const game = await Game.findOne({ gamePin })
      .populate('quiz', 'title description')
      .populate('host', 'username')
      .lean();

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.status !== 'finished') {
      return res.status(400).json({ message: 'Game has not finished yet' });
    }

    // Return game results
    const results = {
      game: {
        gamePin: game.gamePin,
        quiz: game.quiz,
        host: game.host.username,
        finishedAt: game.updatedAt
      },
      players: game.players
        .filter(p => p.answers.length > 0)
        .sort((a, b) => b.score - a.score)
        .map((player, index) => ({
          position: index + 1,
          nickname: player.nickname,
          score: player.score,
          correctAnswers: player.answers.filter(a => a.isCorrect).length,
          totalAnswers: player.answers.length
        })),
      stats: game.results
    };

    res.json({ results });
  } catch (error) {
    console.error('Get game results error:', error);
    res.status(500).json({ message: 'Server error while fetching results' });
  }
});

module.exports = router;
