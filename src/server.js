const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const socketHandler = require('./socket/socketHandler');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const gameRoutes = require('./routes/game');
const userRoutes = require('./routes/user');
const legalRoutes = require('./routes/legal');
const debugRoutes = require('./routes/debug');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3001",
      "http://127.0.0.1:3001", 
      "http://165.22.18.156:3001", // Your frontend IP
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
  pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000
});

// Connect to MongoDB
connectDB();

// Trust proxy setting for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Enhanced CORS configuration with debugging
app.use((req, res, next) => {
  console.log('🌐 Incoming request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://165.22.18.156:3001', // Your frontend IP
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    console.log('🔍 CORS check:', { origin, allowedOrigins });
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ CORS allowed for origin:', origin);
      return callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Rate limiting with environment-specific settings
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' 
    ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100  // Production: 100 requests per 15 min
    : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Development: 1000 requests per 15 min
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000 / 60) + ' minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks and Socket.IO endpoints
    return req.path === '/health' || 
           req.path === '/api/health' || 
           req.path.startsWith('/socket.io/');
  }
});
app.use('/api/', limiter);

// Middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    socketConnections: io.engine.clientsCount || 0,
    message: 'Server is running and ready to accept connections'
  });
});

// API Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    api: 'ready',
    timestamp: new Date().toISOString(),
    message: 'API endpoints are accessible'
  });
});

// Rate limit reset endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/reset-rate-limit', (req, res) => {
    // This is a simple way to help during development
    // In a real scenario, you'd need to access the rate limiter's store
    res.status(200).json({ 
      message: 'Rate limit reset requested',
      note: 'Server restart may be needed for full reset',
      timestamp: new Date().toISOString()
    });
  });
}

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  console.log('🔄 Preflight request for:', req.url);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/user', userRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/debug', debugRoutes);

// Socket.io handler
socketHandler(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🎮 Socket.io server ready for connections`);
});

module.exports = { app, server, io };
