# Thinkaton Backend

A real-time quiz application backend built with Node.js, Express, Socket.io, and MongoDB. This is a complete Thinkaton-style quiz platform that supports real-time multiplayer quizzes with live leaderboards.

## 🚀 Features

### Core Functionality
- **Real-time Multiplayer Quizzes** - Multiple players can join and compete simultaneously
- **Live Leaderboards** - Real-time score tracking and rankings
- **Quiz Management** - Create, edit, and manage quizzes with multiple question types
- **Game Hosting** - Host games with customizable settings
- **Player Statistics** - Track individual and game statistics

### Authentication & Users
- User registration and login with JWT authentication
- Role-based access control (Admin/User)
- User profiles with stats and game history
- Password change and profile management

### Quiz Features
- Multiple choice and true/false questions
- Customizable time limits and point values
- Question categories and difficulty levels
- Public/private quiz settings
- Quiz search and filtering

### Game Features
- 6-digit game pins for easy joining
- Customizable game settings (max players, late join, etc.)
- Real-time answer submission and scoring
- Question timeout handling
- Final results and statistics

### Real-time Features (Socket.io)
- Live player joining/leaving notifications
- Real-time answer submissions
- Live leaderboard updates
- Game state synchronization
- Host controls (start, pause, next question, end)

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, bcryptjs
- **Development**: Nodemon, Jest

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd thinkaton-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/thinkaton
   JWT_SECRET=your-super-secret-jwt-key
   FRONTEND_URL=http://localhost:3001
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 📋 API Documentation

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current user info
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password

### Quiz Routes (`/api/quiz`)
- `GET /` - Get all quizzes (with filtering)
- `POST /` - Create new quiz
- `GET /:id` - Get quiz by ID
- `PUT /:id` - Update quiz
- `DELETE /:id` - Delete quiz
- `GET /:id/host` - Get quiz for hosting
- `GET /meta/categories` - Get quiz categories

### Game Routes (`/api/game`)
- `POST /create` - Create new game
- `GET /:gamePin` - Get game info
- `POST /:gamePin/join` - Join game
- `GET /:gamePin/host` - Get game details for host
- `PUT /:gamePin/settings` - Update game settings
- `DELETE /:gamePin` - End game
- `GET /:gamePin/results` - Get game results

### User Routes (`/api/user`)
- `GET /profile` - Get user profile
- `GET /dashboard` - Get dashboard data
- `GET /game-history` - Get game history
- `GET /leaderboard` - Get global leaderboard
- `PUT /settings` - Update user settings

## 🎮 Socket.io Events

### Client to Server Events
- `join-game` - Join game as player
- `join-as-host` - Join game as host
- `start-game` - Start the game
- `submit-answer` - Submit answer to question
- `next-question` - Move to next question
- `show-results` - Show question results
- `pause-game` - Pause the game
- `resume-game` - Resume the game
- `end-game` - End the game

### Server to Client Events
- `player-joined` - New player joined
- `player-left` - Player left the game
- `joined-successfully` - Successfully joined game
- `host-joined` - Host connected
- `game-started` - Game has started
- `next-question` - New question available
- `question-timeout` - Question time expired
- `answer-submitted` - Answer was submitted
- `player-answered` - Player submitted answer (to host)
- `question-results` - Question results and stats
- `game-paused` - Game was paused
- `game-resumed` - Game was resumed
- `game-ended` - Game finished with final results
- `error` - Error occurred

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: String (user/admin),
  avatar: String,
  stats: {
    gamesPlayed: Number,
    gamesWon: Number,
    totalScore: Number,
    averageScore: Number
  },
  isActive: Boolean
}
```

### Quiz Model
```javascript
{
  title: String,
  description: String,
  creator: ObjectId (User),
  questions: [{
    question: String,
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    timeLimit: Number,
    points: Number,
    difficulty: String,
    questionType: String
  }],
  category: String,
  difficulty: String,
  isPublic: Boolean,
  tags: [String],
  stats: {
    timesPlayed: Number,
    averageScore: Number,
    totalParticipants: Number
  },
  settings: {
    shuffleQuestions: Boolean,
    shuffleAnswers: Boolean,
    showCorrectAnswers: Boolean,
    allowReplay: Boolean
  }
}
```

### Game Model
```javascript
{
  gamePin: String (6 digits),
  quiz: ObjectId (Quiz),
  host: ObjectId (User),
  players: [{
    socketId: String,
    userId: ObjectId (User),
    nickname: String,
    score: Number,
    answers: [{
      questionIndex: Number,
      selectedOption: Number,
      isCorrect: Boolean,
      timeToAnswer: Number,
      pointsEarned: Number
    }],
    isConnected: Boolean,
    position: Number
  }],
  status: String (waiting/active/paused/finished),
  currentQuestion: Number,
  questionStartTime: Date,
  settings: {
    maxPlayers: Number,
    isPrivate: Boolean,
    allowLateJoin: Boolean,
    showLeaderboard: Boolean,
    randomizePlayerOrder: Boolean
  },
  results: {
    totalQuestions: Number,
    averageScore: Number,
    highestScore: Number,
    completionRate: Number,
    questionStats: [...]
  }
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs for secure password storage
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Configurable cross-origin requests
- **Helmet** - Security headers
- **Input Validation** - Joi schema validation
- **Role-based Access** - Admin and user roles

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📊 Game Flow

1. **Host creates a game** - Select quiz and configure settings
2. **Players join** - Use 6-digit game pin and choose nickname
3. **Game starts** - Host initiates the first question
4. **Real-time gameplay** - Players submit answers within time limit
5. **Results shown** - Display correct answer and current leaderboard
6. **Next question** - Continue until all questions completed
7. **Final results** - Show final rankings and statistics

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure CORS for production frontend URL

### Production Considerations
- Use process manager (PM2)
- Set up proper logging
- Configure reverse proxy (Nginx)
- Enable SSL/TLS
- Set up database backups
- Monitor server performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please create an issue in the repository or contact the development team.

---

**Happy Quizzing! 🎯**
