const express = require('express');
const Quiz = require('../models/Quiz');
const { auth, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/quiz
// @desc    Create a new quiz
// @access  Private
router.post('/', auth, validate(schemas.quiz), async (req, res) => {
  try {
    const quizData = {
      ...req.body,
      creator: req.user._id
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    const populatedQuiz = await Quiz.findById(quiz._id)
      .populate('creator', 'username email')
      .lean();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: populatedQuiz
    });
  } catch (error) {
    console.error('Quiz creation error:', error);
    res.status(500).json({ message: 'Server error during quiz creation' });
  }
});

// @route   GET /api/quiz
// @desc    Get all public quizzes or user's quizzes
// @access  Public/Private
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      myQuizzes = false
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    if (myQuizzes === 'true' && req.user) {
      query.creator = req.user._id;
    } else {
      query.isPublic = true;
    }

    if (category) {
      query.category = category;
    }

    if (difficulty && difficulty !== 'mixed') {
      query.difficulty = difficulty;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [quizzes, total] = await Promise.all([
      Quiz.find(query)
        .populate('creator', 'username')
        .select('-questions.options.isCorrect') // Hide correct answers
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Quiz.countDocuments(query)
    ]);

    res.json({
      quizzes,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalQuizzes: total,
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Server error while fetching quizzes' });  }
});

// @route   GET /api/quiz/my-quizzes  
// @desc    Get user's own quizzes
// @access  Private
router.get('/my-quizzes', auth, async (req, res) => {
  try {
    console.log('Accessing my-quizzes route for user:', req.user._id);
    
    const {
      page = 1,
      limit = 12,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query for user's quizzes
    let query = { creator: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [quizzes, total] = await Promise.all([
      Quiz.find(query)
        .populate('creator', 'username')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Quiz.countDocuments(query)
    ]);

    // Add play count and other stats
    const enrichedQuizzes = quizzes.map(quiz => ({
      ...quiz,
      playCount: quiz.playCount || 0,
      questionCount: quiz.questions ? quiz.questions.length : 0
    }));

    console.log(`Found ${enrichedQuizzes.length} quizzes for user ${req.user._id}`);

    res.json({
      success: true,
      data: {
        quizzes: enrichedQuizzes,
        totalQuizzes: total,
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get my quizzes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching your quizzes' 
    });
  }
});

// @route   GET /api/quiz/meta/categories
// @desc    Get all quiz categories with counts  
// @access  Public
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Quiz.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// @route   GET /api/quiz/:id
// @desc    Get a single quiz by ID
// @access  Public/Private
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('creator', 'username email')
      .lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user can view this quiz
    if (!quiz.isPublic && (!req.user || quiz.creator._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied to private quiz' });
    }

    // Hide correct answers if user is not the creator
    if (!req.user || quiz.creator._id.toString() !== req.user._id.toString()) {
      quiz.questions = quiz.questions.map(question => ({
        ...question,
        options: question.options.map(option => ({
          text: option.text
        }))
      }));
    }

    res.json({ quiz });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error while fetching quiz' });
  }
});

// @route   PUT /api/quiz/:id
// @desc    Update a quiz
// @access  Private (Owner only)
router.put('/:id', auth, validate(schemas.quiz), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check ownership
    if (quiz.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this quiz' });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('creator', 'username email');

    res.json({
      message: 'Quiz updated successfully',
      quiz: updatedQuiz
    });
  } catch (error) {
    console.error('Quiz update error:', error);
    res.status(500).json({ message: 'Server error during quiz update' });
  }
});

// @route   DELETE /api/quiz/:id
// @desc    Delete a quiz
// @access  Private (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check ownership
    if (quiz.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Quiz deletion error:', error);
    res.status(500).json({ message: 'Server error during quiz deletion' });
  }
});

// @route   GET /api/quiz/:id/host
// @desc    Get quiz for hosting (with correct answers)
// @access  Private (Owner only)
router.get('/:id/host', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('creator', 'username email')
      .lean();

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check ownership
    if (quiz.creator._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to host this quiz' });
    }

    res.json({ quiz });
  } catch (error) {
    console.error('Get quiz for hosting error:', error);
    res.status(500).json({ message: 'Server error while fetching quiz for hosting' });
  }
});

module.exports = router;
