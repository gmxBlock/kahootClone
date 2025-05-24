const request = require('supertest');
const { app } = require('../src/server');
const User = require('../src/models/User');
const Quiz = require('../src/models/Quiz');
const mongoose = require('mongoose');

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/thinkaton-test');
  });

  beforeEach(async () => {
    // Clear test database
    await User.deleteMany({});
    await Quiz.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    test('Should register a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
    });

    test('Should not register user with duplicate email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.message).toBe('Email already registered');
    });

    test('Should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
          // Missing email and password
        })
        .expect(400);

      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('POST /api/auth/login', () => {
    test('Should login with valid credentials', async () => {
      // Create user first
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
    });

    test('Should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    test('Should get current user with valid token', async () => {
      // Register user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const token = registerResponse.body.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
    });

    test('Should not get user without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBe('No token provided, authorization denied');
    });
  });
});

describe('Quiz Routes', () => {
  let userToken;
  let userId;

  beforeEach(async () => {
    await User.deleteMany({});
    await Quiz.deleteMany({});

    // Create and login user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    userToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('POST /api/quiz', () => {
    test('Should create a new quiz', async () => {
      const quizData = {
        title: 'Test Quiz',
        description: 'A test quiz',
        category: 'general',
        questions: [
          {
            question: 'What is 2 + 2?',
            options: [
              { text: '3', isCorrect: false },
              { text: '4', isCorrect: true },
              { text: '5', isCorrect: false }
            ],
            timeLimit: 30,
            points: 1000
          }
        ]
      };

      const response = await request(app)
        .post('/api/quiz')
        .set('Authorization', `Bearer ${userToken}`)
        .send(quizData)
        .expect(201);

      expect(response.body.message).toBe('Quiz created successfully');
      expect(response.body.quiz.title).toBe(quizData.title);
      expect(response.body.quiz.questions).toHaveLength(1);
    });

    test('Should not create quiz without authentication', async () => {
      const quizData = {
        title: 'Test Quiz',
        category: 'general',
        questions: []
      };

      await request(app)
        .post('/api/quiz')
        .send(quizData)
        .expect(401);
    });
  });

  describe('GET /api/quiz', () => {
    test('Should get public quizzes', async () => {
      // Create a public quiz
      const quiz = new Quiz({
        title: 'Public Quiz',
        creator: userId,
        category: 'general',
        questions: [
          {
            question: 'Test question?',
            options: [
              { text: 'A', isCorrect: true },
              { text: 'B', isCorrect: false }
            ]
          }
        ],
        isPublic: true
      });
      await quiz.save();

      const response = await request(app)
        .get('/api/quiz')
        .expect(200);

      expect(response.body.quizzes).toHaveLength(1);
      expect(response.body.quizzes[0].title).toBe('Public Quiz');
    });
  });
});

describe('Health Check', () => {
  test('Should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
    expect(response.body.uptime).toBeDefined();
  });
});
