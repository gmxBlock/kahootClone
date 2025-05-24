const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [500, 'Question cannot exceed 500 characters']
  },
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
      maxlength: [200, 'Option text cannot exceed 200 characters']
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false
    }
  }],
  timeLimit: {
    type: Number,
    required: true,
    min: [5, 'Time limit must be at least 5 seconds'],
    max: [120, 'Time limit cannot exceed 120 seconds'],
    default: 30
  },
  points: {
    type: Number,
    required: true,
    min: [100, 'Points must be at least 100'],
    max: [2000, 'Points cannot exceed 2000'],
    default: 1000
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false'],
    default: 'multiple-choice'
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  category: {
    type: String,
    required: true,
    enum: ['general', 'science', 'history', 'sports', 'entertainment', 'technology', 'art', 'geography']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  thumbnail: {
    type: String,
    default: null
  },
  stats: {
    timesPlayed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalParticipants: { type: Number, default: 0 }
  },
  settings: {
    shuffleQuestions: { type: Boolean, default: false },
    shuffleAnswers: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true },
    allowReplay: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Validation for questions array
quizSchema.pre('save', function(next) {
  if (this.questions.length < 1) {
    return next(new Error('Quiz must have at least 1 question'));
  }
  if (this.questions.length > 50) {
    return next(new Error('Quiz cannot have more than 50 questions'));
  }
  
  // Validate each question has at least 2 options and exactly one correct answer
  for (let question of this.questions) {
    if (question.options.length < 2) {
      return next(new Error('Each question must have at least 2 options'));
    }
    if (question.options.length > 6) {
      return next(new Error('Each question cannot have more than 6 options'));
    }
    
    const correctAnswers = question.options.filter(option => option.isCorrect);
    if (correctAnswers.length !== 1) {
      return next(new Error('Each question must have exactly one correct answer'));
    }
  }
  
  next();
});

// Update quiz stats
quizSchema.methods.updateStats = function(averageScore, participantCount) {
  this.stats.timesPlayed += 1;
  this.stats.totalParticipants += participantCount;
  
  // Calculate new average score
  const totalGames = this.stats.timesPlayed;
  const currentTotal = this.stats.averageScore * (totalGames - 1);
  this.stats.averageScore = (currentTotal + averageScore) / totalGames;
  
  return this.save();
};

module.exports = mongoose.model('Quiz', quizSchema);
