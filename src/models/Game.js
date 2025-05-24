const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  socketId: { type: String, required: true },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },
  nickname: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 20
  },
  score: { type: Number, default: 0 },
  answers: [{
    questionIndex: Number,
    selectedOption: Number,
    isCorrect: Boolean,
    timeToAnswer: Number, // milliseconds
    pointsEarned: Number
  }],
  isConnected: { type: Boolean, default: true },
  position: { type: Number, default: 0 }, // Final ranking
  joinedAt: { type: Date, default: Date.now }
});

const gameSchema = new mongoose.Schema({
  gamePin: {
    type: String,
    required: true,
    unique: true,
    length: 6
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [playerSchema],
  status: {
    type: String,
    enum: ['waiting', 'active', 'paused', 'finished'],
    default: 'waiting'
  },
  currentQuestion: {
    type: Number,
    default: -1 // -1 means game hasn't started
  },
  questionStartTime: {
    type: Date,
    default: null
  },
  settings: {
    maxPlayers: { type: Number, default: 50, max: 200 },
    isPrivate: { type: Boolean, default: false },
    allowLateJoin: { type: Boolean, default: true },
    showLeaderboard: { type: Boolean, default: true },
    randomizePlayerOrder: { type: Boolean, default: false }
  },
  results: {
    totalQuestions: Number,
    averageScore: Number,
    highestScore: Number,
    completionRate: Number,
    questionStats: [{
      questionIndex: Number,
      correctAnswers: Number,
      incorrectAnswers: Number,
      averageTime: Number
    }]
  }
}, {
  timestamps: true
});

// Generate unique game pin
gameSchema.statics.generateGamePin = async function() {
  let pin;
  let existingGame;
  
  do {
    pin = Math.floor(100000 + Math.random() * 900000).toString();
    existingGame = await this.findOne({ gamePin: pin, status: { $in: ['waiting', 'active', 'paused'] } });
  } while (existingGame);
  
  return pin;
};

// Add player to game
gameSchema.methods.addPlayer = function(socketId, nickname, userId = null) {
  // Check if player already exists
  const existingPlayer = this.players.find(p => p.socketId === socketId);
  if (existingPlayer) {
    existingPlayer.isConnected = true;
    return this.save();
  }
  
  // Check max players
  if (this.players.length >= this.settings.maxPlayers) {
    throw new Error('Game is full');
  }
  
  // Check if game allows late join
  if (this.status === 'active' && !this.settings.allowLateJoin) {
    throw new Error('Late join is not allowed');
  }
  
  this.players.push({
    socketId,
    userId,
    nickname: nickname.substring(0, 20), // Limit nickname length
    score: 0,
    answers: [],
    isConnected: true,
    joinedAt: new Date()
  });
  
  return this.save();
};

// Remove player from game
gameSchema.methods.removePlayer = function(socketId) {
  const playerIndex = this.players.findIndex(p => p.socketId === socketId);
  if (playerIndex > -1) {
    this.players[playerIndex].isConnected = false;
  }
  return this.save();
};

// Submit answer for a player
gameSchema.methods.submitAnswer = function(socketId, questionIndex, selectedOption, timeToAnswer) {
  const player = this.players.find(p => p.socketId === socketId);
  if (!player) throw new Error('Player not found');
  
  // Check if already answered this question
  if (player.answers.find(a => a.questionIndex === questionIndex)) {
    throw new Error('Already answered this question');
  }
  
  // Get the quiz question to check correctness and calculate points
  return this.populate('quiz').then(game => {
    const question = game.quiz.questions[questionIndex];
    if (!question) throw new Error('Question not found');
    
    const isCorrect = question.options[selectedOption]?.isCorrect || false;
    let pointsEarned = 0;
    
    if (isCorrect) {
      // Points based on time (faster = more points)
      const timeBonus = Math.max(0, (question.timeLimit * 1000 - timeToAnswer) / (question.timeLimit * 1000));
      pointsEarned = Math.round(question.points * (0.5 + 0.5 * timeBonus));
    }
    
    player.answers.push({
      questionIndex,
      selectedOption,
      isCorrect,
      timeToAnswer,
      pointsEarned
    });
    
    player.score += pointsEarned;
    
    return this.save();
  });
};

// Calculate final results
gameSchema.methods.calculateResults = function() {
  const activePlayers = this.players.filter(p => p.answers.length > 0);
  
  // Sort players by score
  activePlayers.sort((a, b) => b.score - a.score);
  
  // Assign positions
  activePlayers.forEach((player, index) => {
    player.position = index + 1;
  });
  
  // Calculate game statistics
  const totalQuestions = this.quiz ? this.quiz.questions.length : 0;
  const scores = activePlayers.map(p => p.score);
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const completionRate = activePlayers.length / Math.max(this.players.length, 1);
  
  // Question statistics
  const questionStats = [];
  for (let i = 0; i < totalQuestions; i++) {
    const questionAnswers = activePlayers.flatMap(p => p.answers.filter(a => a.questionIndex === i));
    const correctAnswers = questionAnswers.filter(a => a.isCorrect).length;
    const incorrectAnswers = questionAnswers.length - correctAnswers;
    const averageTime = questionAnswers.length > 0 
      ? questionAnswers.reduce((sum, a) => sum + a.timeToAnswer, 0) / questionAnswers.length 
      : 0;
    
    questionStats.push({
      questionIndex: i,
      correctAnswers,
      incorrectAnswers,
      averageTime
    });
  }
  
  this.results = {
    totalQuestions,
    averageScore,
    highestScore,
    completionRate,
    questionStats
  };
  
  return this.save();
};

module.exports = mongoose.model('Game', gameSchema);
