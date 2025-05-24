const Joi = require('joi');

// Validation schemas
const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  quiz: Joi.object({
    title: Joi.string().max(100).required(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().valid('general', 'science', 'history', 'sports', 'entertainment', 'technology', 'art', 'geography').required(),
    difficulty: Joi.string().valid('easy', 'medium', 'hard', 'mixed').default('mixed'),
    isPublic: Joi.boolean().default(true),
    tags: Joi.array().items(Joi.string().max(20)).max(10).optional(),
    questions: Joi.array().items(
      Joi.object({
        question: Joi.string().max(500).required(),
        options: Joi.array().items(
          Joi.object({
            text: Joi.string().max(200).required(),
            isCorrect: Joi.boolean().required()
          })
        ).min(2).max(6).required(),
        timeLimit: Joi.number().min(5).max(120).default(30),
        points: Joi.number().min(100).max(2000).default(1000),
        difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
        questionType: Joi.string().valid('multiple-choice', 'true-false').default('multiple-choice')
      })
    ).min(1).max(50).required(),
    settings: Joi.object({
      shuffleQuestions: Joi.boolean().default(false),
      shuffleAnswers: Joi.boolean().default(false),
      showCorrectAnswers: Joi.boolean().default(true),
      allowReplay: Joi.boolean().default(true)
    }).optional()
  }),

  gameSettings: Joi.object({
    maxPlayers: Joi.number().min(1).max(200).default(50),
    isPrivate: Joi.boolean().default(false),
    allowLateJoin: Joi.boolean().default(true),
    showLeaderboard: Joi.boolean().default(true),
    randomizePlayerOrder: Joi.boolean().default(false)
  }),

  joinGame: Joi.object({
    gamePin: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
    nickname: Joi.string().min(1).max(20).required()
  }),

  submitAnswer: Joi.object({
    questionIndex: Joi.number().min(0).required(),
    selectedOption: Joi.number().min(0).max(5).required(),
    timeToAnswer: Joi.number().min(0).required()
  })
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  schemas
};
