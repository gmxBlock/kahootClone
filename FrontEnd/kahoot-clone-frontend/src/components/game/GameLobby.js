import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getGameForHost, updateGameSettings } from '../../services/api';
import { 
  connectSocket, 
  disconnectSocket, 
  onEvent, 
  offEvent, 
  joinAsHost, 
  startGame,
  endGame
} from '../../services/socket';
import LoadingSpinner from '../common/LoadingSpinner';
import './GameLobby.css';

const GameLobby = ({ gameId, totalQuestions, gameData: propGameData }) => {
  console.log('🏠 GameLobby component loaded');
  console.log('🔍 GameLobby props:', { gameId, totalQuestions, propGameData });
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [gameData, setGameData] = useState(propGameData || null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameSettings, setGameSettings] = useState({
    maxPlayers: 50,
    allowLateJoin: true,
    showLeaderboard: true,
    randomizePlayerOrder: false
  });
  const [isStarting, setIsStarting] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [gameStatus, setGameStatus] = useState('waiting');

  // Get game data from location state or props
  const { gamePin, isHost, quiz } = location.state || {};
  const finalGamePin = gamePin || gameId;

  const setupSocketListeners = useCallback(() => {
    // Host joined confirmation
    onEvent('host-joined', (data) => {
      console.log('Host joined successfully:', data);
      if (data.game) {
        setGameData(data.game);
        setPlayers(data.game.players || []);
      }
    });

    // Player joined
    onEvent('player-joined', (data) => {
      console.log('Player joined:', data);
      setPlayers(prev => {
        // Check if player already exists
        const existingIndex = prev.findIndex(p => p.socketId === data.player.socketId);
        if (existingIndex >= 0) {
          // Update existing player
          const updated = [...prev];
          updated[existingIndex] = { ...updated[existingIndex], ...data.player };
          return updated;
        } else {
          // Add new player
          return [...prev, data.player];
        }
      });
    });

    // Player left
    onEvent('player-left', (data) => {
      console.log('Player left:', data);
      setPlayers(prev => prev.filter(p => p.socketId !== data.socketId));
    });

    // Game started confirmation
    onEvent('game-started', (data) => {
      console.log('🎉 Game started event received:', data);
      console.log('Event data details:', {
        totalQuestions: data.totalQuestions,
        questionData: data.questionData,
        timestamp: new Date().toISOString()
      });
      setGameStatus('active');
      setIsStarting(false);
      console.log('✅ Game status updated to active');
      // Update game context instead of navigating
      // The GameRoom component will handle the state change
    });

    // Error handling
    onEvent('error', (error) => {
      console.error('🚨 Socket error received:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        timestamp: new Date().toISOString()
      });
      setError(error.message || 'An error occurred');
      setIsStarting(false);
    });
  }, [gamePin, navigate, gameData]);

  const initializeGame = useCallback(async () => {
    console.log('🔧 Initializing game...');
    console.log('Initialization params:', {
      gamePin: finalGamePin,
      isHost,
      userId: user?.id,
      userName: user?.name
    });

    try {
      setLoading(true);
      
      console.log('📡 Connecting to socket...');
      // Connect to socket
      await connectSocket();
      setSocketConnected(true);
      console.log('✅ Socket connected successfully');
      
      // Setup socket event listeners
      console.log('🎧 Setting up socket event listeners...');
      setupSocketListeners();
      console.log('✅ Socket listeners setup complete');
      
      // Get game details from server
      console.log('📊 Fetching game details from server...');
      const response = await getGameForHost(finalGamePin);
      console.log('Server response:', response);
      
      if (response.game) {
        console.log('✅ Game data received:', {
          gamePin: response.game.gamePin,
          status: response.game.status,
          playersCount: response.game.players?.length || 0,
          settings: response.game.settings
        });
        setGameData(response.game);
        setGameSettings(response.game.settings);
        setPlayers(response.game.players || []);
        setGameStatus(response.game.status);
      } else {
        console.warn('⚠️ No game data in server response');
      }
      
      // Join as host
      console.log('👑 Joining as host...');
      const joinResult = joinAsHost(finalGamePin, user.id);
      console.log('Join as host result:', joinResult);
      
    } catch (err) {
      console.error('❌ Failed to initialize game:', err);
      console.error('Initialization error details:', {
        message: err.message,
        stack: err.stack,
        gamePin: finalGamePin,
        userId: user?.id
      });
      setError(`Failed to initialize game: ${err.message}`);
    } finally {
      setLoading(false);
      console.log('🏁 Game initialization complete');
    }
  }, [finalGamePin, user, setupSocketListeners]);

  useEffect(() => {
    console.log('🔄 GameLobby useEffect triggered');
    console.log('useEffect params:', {
      gamePin: finalGamePin,
      isHost,
      user: user ? { id: user.id, name: user.name } : null
    });
    
    if (!finalGamePin || !isHost || !user) {
      console.log('❌ Missing required params, redirecting to my-quizzes');
      console.log('Missing:', {
        gamePin: !finalGamePin,
        isHost: !isHost,
        user: !user
      });
      navigate('/my-quizzes');
      return;
    }

    console.log('✅ All params valid, calling initializeGame');
    initializeGame();

    return cleanup;
  }, [finalGamePin, isHost, user, navigate, initializeGame]);

  const cleanup = () => {
    // Remove socket listeners
    offEvent('host-joined');
    offEvent('player-joined');
    offEvent('player-left');
    offEvent('game-started');
    offEvent('error');
    
    // Disconnect socket
    disconnectSocket();
  };

  const handleStartGame = async () => {
    console.log('🎮 BUTTON CLICKED - Starting game process...');
    alert('Button clicked! Check console for logs.');
    console.log('Game PIN:', finalGamePin);
    console.log('Is Host:', isHost);
    console.log('User:', user);
    console.log('Players count:', players.length);
    console.log('Socket connected:', socketConnected);
    console.log('Game status:', gameStatus);
    console.log('Game data:', gameData);

    if (players.length < 1) {
      console.warn('❌ Not enough players to start game');
      setError('At least 1 player is required to start the game');
      return;
    }

    try {
      console.log('🚀 Attempting to start game...');
      setIsStarting(true);
      setError(null);
      
      // Check socket connection before attempting to start
      if (!socketConnected) {
        console.error('❌ Socket not connected, attempting to reconnect...');
        await connectSocket();
        setSocketConnected(true);
      }
      
      console.log('📡 Emitting start-game event with PIN:', finalGamePin);
      
      // Emit start game event
      const success = startGame(finalGamePin);
      console.log('Start game emission result:', success);
      
      if (!success) {
        console.error('❌ Failed to emit start game event - socket not connected');
        throw new Error('Failed to communicate with server - socket not connected');
      }
      
      console.log('✅ Start game event sent successfully, waiting for response...');
      
      // Set a timeout to detect if no response is received
      setTimeout(() => {
        if (gameStatus === 'waiting') {
          console.error('⏰ Timeout: No response received from server after 10 seconds');
          setError('Server not responding. Please try again.');
          setIsStarting(false);
        }
      }, 10000);
      
    } catch (err) {
      console.error('❌ Failed to start game:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        gamePin: finalGamePin,
        socketConnected,
        playersCount: players.length
      });
      setError(`Failed to start game: ${err.message}`);
      setIsStarting(false);
    }
  };

  const handleEndGame = async () => {
    try {
      await endGame(finalGamePin);
      navigate('/my-quizzes');
    } catch (err) {
      console.error('Failed to end game:', err);
      setError('Failed to end game. Please try again.');
    }
  };

  const handleSettingsChange = async (newSettings) => {
    try {
      const updatedSettings = { ...gameSettings, ...newSettings };
      await updateGameSettings(finalGamePin, updatedSettings);
      setGameSettings(updatedSettings);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to update settings. Please try again.');
    }
  };

  const copyGamePin = () => {
    navigator.clipboard.writeText(finalGamePin).then(() => {
      // You could add a toast notification here
      console.log('Game PIN copied to clipboard');
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !gameData) {
    return (
      <div className="game-lobby error-state">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Game Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/my-quizzes')} className="back-button">
            Back to My Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-lobby">
      <div className="lobby-header">
        <h1 className="lobby-title">Game Lobby</h1>
        <h2 className="quiz-title">{gameData?.quiz?.title || quiz?.title}</h2>
      </div>

      {/* Game PIN Section */}
      <div className="game-pin-section">
        <div className="game-pin-label">Game PIN</div>
        <div className="game-pin-display">{finalGamePin}</div>
        <button onClick={copyGamePin} className="pin-copy-button">
          📋 Copy PIN
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <div className="lobby-content">
        {/* Players Section */}
        <div className="players-section">
          <div className="players-header">
            <h3 className="players-title">Players</h3>
            <span className="players-count">{players.length} joined</span>
          </div>
          
          <div className="players-grid">
            {players.length > 0 ? (
              players.map((player, index) => (
                <div key={player.socketId || index} className="player-card">
                  <div className="player-avatar">
                    {player.nickname ? player.nickname.charAt(0).toUpperCase() : '?'}
                    <div className={`player-status ${player.isConnected ? 'status-online' : 'status-offline'}`}></div>
                  </div>
                  <div className="player-name">{player.nickname || 'Anonymous'}</div>
                  <div className="player-score">Ready to play</div>
                </div>
              ))
            ) : (
              <div className="no-players">
                <div className="waiting-icon">👥</div>
                <p>Waiting for players to join...</p>
                <p className="waiting-hint">Share the PIN: <strong>{gamePin}</strong></p>
              </div>
            )}
          </div>
        </div>

        {/* Game Controls */}
        <div className="lobby-controls">
          <h3 className="controls-title">Game Settings</h3>
          
          <div className="control-section">
            <label className="control-label">
              Max Players: {gameSettings.maxPlayers}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={gameSettings.maxPlayers}
              onChange={(e) => handleSettingsChange({ maxPlayers: parseInt(e.target.value) })}
              className="control-input"
            />
          </div>

          <div className="setting-toggle">
            <span className="toggle-label">Allow Late Join</span>
            <button
              className={`toggle-switch ${gameSettings.allowLateJoin ? 'active' : ''}`}
              onClick={() => handleSettingsChange({ allowLateJoin: !gameSettings.allowLateJoin })}
            >
              <div className="toggle-slider"></div>
            </button>
          </div>

          <div className="setting-toggle">
            <span className="toggle-label">Show Leaderboard</span>
            <button
              className={`toggle-switch ${gameSettings.showLeaderboard ? 'active' : ''}`}
              onClick={() => handleSettingsChange({ showLeaderboard: !gameSettings.showLeaderboard })}
            >
              <div className="toggle-slider"></div>
            </button>
          </div>

          <div className="setting-toggle">
            <span className="toggle-label">Randomize Order</span>
            <button
              className={`toggle-switch ${gameSettings.randomizePlayerOrder ? 'active' : ''}`}
              onClick={() => handleSettingsChange({ randomizePlayerOrder: !gameSettings.randomizePlayerOrder })}
            >
              <div className="toggle-slider"></div>
            </button>
          </div>

          {players.length < 1 && (
            <div className="minimum-players-warning">
              At least 1 player is required to start the game
            </div>
          )}

          <button
            onClick={handleStartGame}
            disabled={players.length < 1 || isStarting || gameStatus !== 'waiting'}
            className="start-game-button"
          >
            {isStarting ? (
              <>
                Starting Game
                <div className="waiting-animation"></div>
              </>
            ) : (
              `Start Game (${players.length} players)`
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="lobby-footer">
        <div className="lobby-info">
          {socketConnected ? '🟢 Connected' : '🔴 Disconnected'} • 
          Status: {gameStatus} • 
          Quiz: {gameData?.quiz?.title || quiz?.title}
        </div>
        <div className="lobby-actions">
          <button onClick={handleEndGame} className="secondary-button">
            End Game
          </button>
          <button onClick={() => navigate('/my-quizzes')} className="secondary-button">
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;