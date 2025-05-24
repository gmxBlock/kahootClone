const Game = require('../models/Game');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// Store active games in memory for faster access
const activeGames = new Map();
const playerSockets = new Map(); // socketId -> gamePin

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

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

        // Send game info to new player
        socket.emit('joined-successfully', {
          gamePin,
          quizTitle: updatedGame.quiz.title,
          playerCount: connectedPlayers.length,
          status: game.status
        });

        console.log(`👤 Player ${nickname} joined game ${gamePin}`);
      } catch (error) {
        console.error('Join game error:', error);
        socket.emit('error', { message: error.message || 'Failed to join game' });
      }
    });

    // Join game as host
    socket.on('join-as-host', async (data) => {
      try {
        const { gamePin, userId } = data;

        const game = await Game.findOne({ gamePin }).populate('quiz');
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Verify host
        if (game.host.toString() !== userId) {
          socket.emit('error', { message: 'Not authorized to host this game' });
          return;
        }

        socket.join(`${gamePin}-host`);
        socket.join(gamePin);

        // Send game state to host
        socket.emit('host-joined', {
          game: {
            gamePin: game.gamePin,
            status: game.status,
            currentQuestion: game.currentQuestion,
            quiz: game.quiz,
            players: game.players.filter(p => p.isConnected),
            settings: game.settings
          }
        });

        console.log(`👑 Host joined game ${gamePin}`);
      } catch (error) {
        console.error('Join as host error:', error);
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
          socket.emit('error', { message: 'Game cannot be started' });
          return;
        }

        // Update game status
        game.status = 'active';
        game.currentQuestion = 0;
        game.questionStartTime = new Date();
        await game.save();

        // Update cache
        activeGames.set(gamePin, {
          status: 'active',
          currentQuestion: 0,
          questionStartTime: game.questionStartTime
        });

        const firstQuestion = game.quiz.questions[0];
        const questionData = {
          questionIndex: 0,
          question: firstQuestion.question,
          options: firstQuestion.options.map(opt => ({ text: opt.text })), // Hide correct answers
          timeLimit: firstQuestion.timeLimit,
          points: firstQuestion.points
        };

        // Notify all participants
        io.to(gamePin).emit('game-started', {
          questionData,
          totalQuestions: game.quiz.questions.length
        });

        // Start question timer
        setTimeout(() => {
          handleQuestionTimeout(gamePin);
        }, firstQuestion.timeLimit * 1000);

        console.log(`🎮 Game ${gamePin} started`);
      } catch (error) {
        console.error('Start game error:', error);
        socket.emit('error', { message: 'Failed to start game' });
      }
    });

    // Submit answer
    socket.on('submit-answer', async (data) => {
      try {
        const { gamePin, questionIndex, selectedOption, timeToAnswer } = data;

        const game = await Game.findOne({ gamePin });
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        await game.submitAnswer(socket.id, questionIndex, selectedOption, timeToAnswer);

        // Get updated player data
        const updatedGame = await Game.findOne({ gamePin }).populate('quiz');
        const player = updatedGame.players.find(p => p.socketId === socket.id);
        const answer = player.answers.find(a => a.questionIndex === questionIndex);

        socket.emit('answer-submitted', {
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
          currentScore: player.score
        });

        // Notify host about answer submission
        io.to(`${gamePin}-host`).emit('player-answered', {
          playerNickname: player.nickname,
          answeredCount: updatedGame.players.filter(p => 
            p.answers.some(a => a.questionIndex === questionIndex)
          ).length,
          totalPlayers: updatedGame.players.filter(p => p.isConnected).length
        });

        console.log(`✅ Answer submitted by ${player.nickname} in game ${gamePin}`);
      } catch (error) {
        console.error('Submit answer error:', error);
        socket.emit('error', { message: error.message || 'Failed to submit answer' });
      }
    });

    // Next question
    socket.on('next-question', async (data) => {
      try {
        const { gamePin } = data;

        const game = await Game.findOne({ gamePin }).populate('quiz');
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const nextQuestionIndex = game.currentQuestion + 1;

        if (nextQuestionIndex >= game.quiz.questions.length) {
          // Game finished
          await endGame(gamePin);
          return;
        }

        // Update game
        game.currentQuestion = nextQuestionIndex;
        game.questionStartTime = new Date();
        await game.save();

        // Update cache
        activeGames.set(gamePin, {
          status: 'active',
          currentQuestion: nextQuestionIndex,
          questionStartTime: game.questionStartTime
        });

        const question = game.quiz.questions[nextQuestionIndex];
        const questionData = {
          questionIndex: nextQuestionIndex,
          question: question.question,
          options: question.options.map(opt => ({ text: opt.text })),
          timeLimit: question.timeLimit,
          points: question.points
        };

        io.to(gamePin).emit('next-question', {
          questionData,
          currentQuestion: nextQuestionIndex + 1,
          totalQuestions: game.quiz.questions.length
        });

        // Start question timer
        setTimeout(() => {
          handleQuestionTimeout(gamePin);
        }, question.timeLimit * 1000);

        console.log(`➡️ Next question in game ${gamePin}: ${nextQuestionIndex}`);
      } catch (error) {
        console.error('Next question error:', error);
        socket.emit('error', { message: 'Failed to advance to next question' });
      }
    });

    // Show question results
    socket.on('show-results', async (data) => {
      try {
        const { gamePin, questionIndex } = data;

        const game = await Game.findOne({ gamePin }).populate('quiz');
        if (!game) return;

        const question = game.quiz.questions[questionIndex];
        const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);

        // Calculate question statistics
        const questionAnswers = game.players.flatMap(p => 
          p.answers.filter(a => a.questionIndex === questionIndex)
        );

        const optionStats = question.options.map((option, index) => ({
          text: option.text,
          count: questionAnswers.filter(a => a.selectedOption === index).length,
          isCorrect: option.isCorrect
        }));

        const correctAnswers = questionAnswers.filter(a => a.isCorrect).length;

        // Calculate current leaderboard
        const leaderboard = game.players
          .filter(p => p.isConnected && p.answers.length > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
          .map((player, index) => ({
            position: index + 1,
            nickname: player.nickname,
            score: player.score
          }));

        io.to(gamePin).emit('question-results', {
          questionIndex,
          correctOptionIndex,
          optionStats,
          correctAnswers,
          totalAnswers: questionAnswers.length,
          leaderboard
        });

        console.log(`📊 Results shown for question ${questionIndex} in game ${gamePin}`);
      } catch (error) {
        console.error('Show results error:', error);
      }
    });

    // Pause/Resume game
    socket.on('pause-game', async (data) => {
      try {
        const { gamePin } = data;
        await updateGameStatus(gamePin, 'paused');
        io.to(gamePin).emit('game-paused');
      } catch (error) {
        console.error('Pause game error:', error);
      }
    });

    socket.on('resume-game', async (data) => {
      try {
        const { gamePin } = data;
        await updateGameStatus(gamePin, 'active');
        io.to(gamePin).emit('game-resumed');
      } catch (error) {
        console.error('Resume game error:', error);
      }
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

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const gamePin = playerSockets.get(socket.id);
        if (gamePin) {
          const game = await Game.findOne({ gamePin });
          if (game) {
            await game.removePlayer(socket.id);
            
            const connectedPlayers = game.players.filter(p => p.isConnected);
            io.to(gamePin).emit('player-left', {
              socketId: socket.id,
              playerCount: connectedPlayers.length
            });
          }
          playerSockets.delete(socket.id);
        }
        console.log(`🔌 Disconnected: ${socket.id}`);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });

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
