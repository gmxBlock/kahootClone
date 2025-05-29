const Game = require('../models/Game');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Store active games in memory for faster access
const activeGames = new Map();
const playerSockets = new Map(); // socketId -> gamePin
const authenticatedSockets = new Map(); // socketId -> userId

// JWT Authentication middleware for Socket.IO
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log(`🔓 Socket ${socket.id} connecting without authentication token`);
      // Allow unauthenticated connections for guest players
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      console.log(`❌ Socket ${socket.id} authentication failed - user not found`);
      return next(new Error('Authentication failed - user not found'));
    }
    
    socket.userId = user._id;
    socket.user = user;
    authenticatedSockets.set(socket.id, user._id);
    
    console.log(`🔐 Socket ${socket.id} authenticated as user: ${user.username || user.email}`);
    next();
  } catch (error) {
    console.log(`❌ Socket ${socket.id} authentication error:`, error.message);
    // For JWT errors, still allow connection but without authentication
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      console.log(`🔓 Allowing unauthenticated connection for socket ${socket.id}`);
      return next();
    }
    next(error);
  }
};

const socketHandler = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);
  
  // Enhanced connection logging
  io.on('connection', (socket) => {
    const userInfo = socket.user ? `${socket.user.username || socket.user.email}` : 'guest';
    console.log(`🔌 New connection: ${socket.id} (${userInfo})`);
    
    // Send connection confirmation with authentication status
    socket.emit('connection-confirmed', {
      socketId: socket.id,
      authenticated: !!socket.user,
      user: socket.user ? {
        id: socket.user._id,
        username: socket.user.username,
        email: socket.user.email
      } : null,
      timestamp: new Date().toISOString()
    });

    // Join game as player
    socket.on('join-game', async (data) => {
      try {
        const { gamePin, nickname, userId } = data;

        const game = await Game.findOne({ gamePin });
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Add player to game
        await game.addPlayer(socket.id, nickname, userId);
        
        // Join socket room
        socket.join(gamePin);
        playerSockets.set(socket.id, gamePin);

        // Update active games cache
        if (!activeGames.has(gamePin)) {
          activeGames.set(gamePin, {
            status: game.status,
            currentQuestion: game.currentQuestion,
            questionStartTime: game.questionStartTime
          });
        }

        // Notify all players about new player
        const updatedGame = await Game.findOne({ gamePin }).populate('quiz', 'title');
        const connectedPlayers = updatedGame.players.filter(p => p.isConnected);

        io.to(gamePin).emit('player-joined', {
          player: {
            nickname,
            socketId: socket.id
          },
          playerCount: connectedPlayers.length
        });

        socket.emit('joined-game', {
          game: {
            gamePin: updatedGame.gamePin,
            status: updatedGame.status,
            quiz: updatedGame.quiz,
            currentQuestion: updatedGame.currentQuestion
          },
          playerCount: connectedPlayers.length
        });

        console.log(`👤 Player ${nickname} joined game ${gamePin}`);
      } catch (error) {
        console.error('Join game error:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Join as host
    socket.on('join-as-host', async (data) => {
      try {
        const { gamePin, userId } = data;

        const game = await Game.findOne({ gamePin }).populate('quiz');
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Verify host permission
        if (game.hostId.toString() !== userId) {
          socket.emit('error', { message: 'Unauthorized to host this game' });
          return;
        }

        // Set host socket
        game.hostSocketId = socket.id;
        await game.save();

        // Join socket room
        socket.join(gamePin);

        // Update active games cache
        if (!activeGames.has(gamePin)) {
          activeGames.set(gamePin, {
            status: game.status,
            currentQuestion: game.currentQuestion,
            questionStartTime: game.questionStartTime
          });
        }

        const connectedPlayers = game.players.filter(p => p.isConnected);

        socket.emit('host-joined', {
          game: {
            gamePin: game.gamePin,
            status: game.status,
            quiz: game.quiz,
            currentQuestion: game.currentQuestion,
            players: connectedPlayers
          },
          playerCount: connectedPlayers.length
        });

        console.log(`👑 Host joined game ${gamePin}`);
      } catch (error) {
        console.error('Host join error:', error);
        socket.emit('error', { message: 'Failed to join as host' });
      }
    });

    // Start game
    socket.on('start-game', async (data) => {
      try {
        const { gamePin } = data;
        const game = await Game.findOne({ gamePin }).populate('quiz');
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        if (game.status !== 'waiting') {
          socket.emit('error', { message: 'Game is not in waiting state' });
          return;
        }

        // Update game status
        game.status = 'active';
        game.currentQuestion = 0;
        game.questionStartTime = new Date();
        await game.save();

        // Update cache
        const gameCache = activeGames.get(gamePin);
        if (gameCache) {
          gameCache.status = 'active';
          gameCache.currentQuestion = 0;
          gameCache.questionStartTime = game.questionStartTime;
        }

        const firstQuestion = game.quiz.questions[0];
        const questionData = {
          questionIndex: 0,
          question: firstQuestion.question,
          options: firstQuestion.options.map(opt => opt.text),
          timeLimit: firstQuestion.timeLimit || 30,
          timestamp: new Date().toISOString()
        };

        // Send to all players and host
        io.to(gamePin).emit('game-started', questionData);

        // Set timeout for this question
        setTimeout(() => {
          handleQuestionTimeout(gamePin);
        }, (firstQuestion.timeLimit || 30) * 1000);

        console.log(`🚀 Game ${gamePin} started`);
      } catch (error) {
        console.error('Start game error:', error);
        socket.emit('error', { message: 'Failed to start game' });
      }
    });

    // Submit answer
    socket.on('submit-answer', async (data) => {
      try {
        const { gamePin, questionIndex, selectedOption, timeToAnswer } = data;
        
        const game = await Game.findOne({ gamePin }).populate('quiz');
        if (!game) return;

        await game.submitAnswer(socket.id, questionIndex, selectedOption, timeToAnswer);
        
        socket.emit('answer-submitted', {
          questionIndex,
          selectedOption,
          timestamp: new Date().toISOString()
        });

        console.log(`📝 Answer submitted for question ${questionIndex} in game ${gamePin}`);
      } catch (error) {
        console.error('Submit answer error:', error);
      }
    });

    // Next question
    socket.on('next-question', async (data) => {
      try {
        const { gamePin } = data;
        const game = await Game.findOne({ gamePin }).populate('quiz');
        
        if (!game) return;

        game.currentQuestion += 1;
        
        if (game.currentQuestion >= game.quiz.questions.length) {
          // Game finished
          await endGame(gamePin);
          return;
        }

        game.questionStartTime = new Date();
        await game.save();

        // Update cache
        const gameCache = activeGames.get(gamePin);
        if (gameCache) {
          gameCache.currentQuestion = game.currentQuestion;
          gameCache.questionStartTime = game.questionStartTime;
        }

        const currentQuestion = game.quiz.questions[game.currentQuestion];
        const questionData = {
          questionIndex: game.currentQuestion,
          question: currentQuestion.question,
          options: currentQuestion.options.map(opt => opt.text),
          timeLimit: currentQuestion.timeLimit || 30,
          timestamp: new Date().toISOString()
        };

        io.to(gamePin).emit('next-question', questionData);

        // Set timeout for this question
        setTimeout(() => {
          handleQuestionTimeout(gamePin);
        }, (currentQuestion.timeLimit || 30) * 1000);

        console.log(`➡️ Next question ${game.currentQuestion} in game ${gamePin}`);
      } catch (error) {
        console.error('Next question error:', error);
      }
    });

    // Show results
    socket.on('show-results', async (data) => {
      try {
        const { gamePin } = data;
        const game = await Game.findOne({ gamePin }).populate('quiz');
        
        if (!game) return;

        const currentQuestion = game.quiz.questions[game.currentQuestion];
        const correctOptionIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);

        // Calculate current scores
        const currentResults = game.players.map(player => {
          const answer = player.answers.find(a => a.questionIndex === game.currentQuestion);
          return {
            nickname: player.nickname,
            score: player.score,
            isCorrect: answer ? answer.isCorrect : false,
            selectedOption: answer ? answer.selectedOption : null
          };
        }).sort((a, b) => b.score - a.score);

        io.to(gamePin).emit('question-results', {
          correctOptionIndex,
          results: currentResults,
          questionIndex: game.currentQuestion
        });

        console.log(`📊 Results shown for question ${game.currentQuestion} in game ${gamePin}`);
      } catch (error) {
        console.error('Show results error:', error);
      }
    });

    // Pause game
    socket.on('pause-game', async (data) => {
      const { gamePin } = data;
      await updateGameStatus(gamePin, 'paused');
      io.to(gamePin).emit('game-paused');
    });

    // Resume game
    socket.on('resume-game', async (data) => {
      const { gamePin } = data;
      await updateGameStatus(gamePin, 'active');
      io.to(gamePin).emit('game-resumed');
    });

    // End game
    socket.on('end-game', async (data) => {
      try {
        const { gamePin } = data;
        await endGame(gamePin);
      } catch (error) {
        console.error('End game error:', error);
      }
    });

    // Enhanced disconnect handling with reconnection support
    socket.on('disconnect', async (reason) => {
      const userInfo = socket.user ? `${socket.user.username || socket.user.email}` : 'guest';
      console.log(`❌ Socket disconnected: ${socket.id} (${userInfo}) - Reason: ${reason}`);
      
      try {
        // Clean up authentication tracking
        if (authenticatedSockets.has(socket.id)) {
          authenticatedSockets.delete(socket.id);
        }
        
        // Handle game disconnection
        const gamePin = playerSockets.get(socket.id);
        if (gamePin) {
          const game = await Game.findOne({ gamePin });
          if (game) {
            // Mark player as disconnected but keep in game for potential reconnection
            const player = game.players.find(p => p.socketId === socket.id);
            if (player) {
              player.isConnected = false;
              player.disconnectedAt = new Date();
              await game.save();
              
              // Notify other players
              const connectedPlayers = game.players.filter(p => p.isConnected);
              socket.to(gamePin).emit('player-disconnected', {
                player: {
                  nickname: player.nickname,
                  socketId: socket.id
                },
                playerCount: connectedPlayers.length
              });
              
              console.log(`👤 Player ${player.nickname} disconnected from game ${gamePin}`);
            }
          }
          
          playerSockets.delete(socket.id);
        }
      } catch (error) {
        console.error('Disconnect cleanup error:', error);
      }
    });

    // Handle socket errors
    socket.on('error', (error) => {
      const userInfo = socket.user ? `${socket.user.username || socket.user.email}` : 'guest';
      console.error(`🚨 Socket error for ${socket.id} (${userInfo}):`, error);
    });

    // Handle reconnection attempts
    socket.on('reconnect-to-game', async (data) => {
      try {
        const { gamePin, nickname, previousSocketId } = data;
        
        console.log(`🔄 Reconnection attempt: ${socket.id} trying to rejoin game ${gamePin} as ${nickname}`);
        
        const game = await Game.findOne({ gamePin });
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        // Find player by nickname or previous socket ID
        const player = game.players.find(p => 
          p.nickname === nickname || p.socketId === previousSocketId
        );
        
        if (player) {
          // Update player with new socket ID and mark as connected
          player.socketId = socket.id;
          player.isConnected = true;
          player.disconnectedAt = null;
          await game.save();
          
          // Join socket room
          socket.join(gamePin);
          playerSockets.set(socket.id, gamePin);
          
          // Send current game state
          const gameState = {
            status: game.status,
            currentQuestion: game.currentQuestion,
            players: game.players.filter(p => p.isConnected),
            quiz: await Quiz.findById(game.quiz).select('title questions')
          };
          
          socket.emit('reconnection-successful', gameState);
          
          // Notify other players
          const connectedPlayers = game.players.filter(p => p.isConnected);
          socket.to(gamePin).emit('player-reconnected', {
            player: {
              nickname: player.nickname,
              socketId: socket.id
            },
            playerCount: connectedPlayers.length
          });
          
          console.log(`✅ Player ${nickname} successfully reconnected to game ${gamePin}`);
        } else {
          socket.emit('error', { message: 'Player not found in game' });
        }
      } catch (error) {
        console.error('Reconnection error:', error);
        socket.emit('error', { message: 'Reconnection failed' });
      }
    });

    // Heartbeat/ping handling for connection health monitoring
    socket.on('ping', (data) => {
      socket.emit('pong', {
        ...data,
        serverTime: Date.now()
      });
    });

  }); // End of socket connection handler

  // Helper functions
  async function handleQuestionTimeout(gamePin) {
    try {
      const game = await Game.findOne({ gamePin }).populate('quiz');
      if (!game || game.status !== 'active') return;

      const currentQuestion = game.quiz.questions[game.currentQuestion];
      const correctOptionIndex = currentQuestion.options.findIndex(opt => opt.isCorrect);

      io.to(gamePin).emit('question-timeout', {
        correctOptionIndex,
        message: 'Time\'s up!'
      });

      console.log(`⏰ Question timeout in game ${gamePin}`);
    } catch (error) {
      console.error('Question timeout error:', error);
    }
  }

  async function updateGameStatus(gamePin, status) {
    const game = await Game.findOne({ gamePin });
    if (game) {
      game.status = status;
      await game.save();
      
      const gameCache = activeGames.get(gamePin);
      if (gameCache) {
        gameCache.status = status;
      }
    }
  }

  async function endGame(gamePin) {
    try {
      const game = await Game.findOne({ gamePin }).populate('quiz');
      if (!game) return;

      // Calculate final results
      await game.calculateResults();

      // Update game status
      game.status = 'finished';
      await game.save();

      // Update quiz stats
      if (game.quiz) {
        const participantCount = game.players.filter(p => p.answers.length > 0).length;
        if (participantCount > 0) {
          await game.quiz.updateStats(game.results.averageScore, participantCount);
        }
      }

      // Update player stats
      for (const player of game.players) {
        if (player.userId && player.answers.length > 0) {
          const user = await User.findById(player.userId);
          if (user) {
            const won = player.position === 1;
            await user.updateStats(player.score, won);
          }
        }
      }

      // Send final results
      const finalResults = {
        leaderboard: game.players
          .filter(p => p.answers.length > 0)
          .sort((a, b) => b.score - a.score)
          .map((player, index) => ({
            position: index + 1,
            nickname: player.nickname,
            score: player.score,
            correctAnswers: player.answers.filter(a => a.isCorrect).length,
            totalAnswers: player.answers.length
          })),
        gameStats: game.results
      };

      io.to(gamePin).emit('game-ended', finalResults);

      // Clean up
      activeGames.delete(gamePin);
      console.log(`🏁 Game ${gamePin} ended`);
    } catch (error) {
      console.error('End game error:', error);
    }
  }
};

module.exports = socketHandler;
