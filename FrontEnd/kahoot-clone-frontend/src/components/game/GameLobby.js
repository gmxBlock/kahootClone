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

const GameLobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [gameData, setGameData] = useState(null);
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

  // Get game data from location state
  const { gamePin, isHost, quiz } = location.state || {};

  const initializeGame = useCallback(async () => {
    try {
      setLoading(true);
      
      // Connect to socket
      await connectSocket();
      setSocketConnected(true);
      
      // Setup socket event listeners
      setupSocketListeners();
      
      // Get game details from server
      const response = await getGameForHost(gamePin);
      if (response.game) {
        setGameData(response.game);
        setGameSettings(response.game.settings);
        setPlayers(response.game.players || []);
        setGameStatus(response.game.status);
      }
      
      // Join as host
      joinAsHost(gamePin, user.id);
      
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setError('Failed to initialize game. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [gamePin, user]);

  useEffect(() => {
    if (!gamePin || !isHost || !user) {
      setError('Invalid game session. Please try hosting again.');
      setLoading(false);
      return;
    }

    initializeGame();
    
    return () => {
      cleanup();
    };
  }, [gamePin, isHost, user, initializeGame]);

  const setupSocketListeners = () => {
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
      console.log('Game started:', data);
      setGameStatus('active');
      // Navigate to game play view
      navigate(`/game/${gamePin}`, { 
        state: { 
          isHost: true, 
          gameData,
          totalQuestions: data.totalQuestions
        } 
      });
    });

    // Error handling
    onEvent('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message || 'An error occurred');
      setIsStarting(false);
    });
  };

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
    if (players.length < 1) {
      setError('At least 1 player is required to start the game');
      return;
    }

    try {
      setIsStarting(true);
      setError(null);
      
      // Emit start game event
      const success = startGame(gamePin);
      if (!success) {
        throw new Error('Failed to communicate with server');
      }
      
    } catch (err) {
      console.error('Failed to start game:', err);
      setError('Failed to start game. Please try again.');
      setIsStarting(false);
    }
  };

  const handleEndGame = async () => {
    try {
      await endGame(gamePin);
      navigate('/my-quizzes');
    } catch (err) {
      console.error('Failed to end game:', err);
      setError('Failed to end game. Please try again.');
    }
  };

  const handleSettingsChange = async (newSettings) => {
    try {
      const updatedSettings = { ...gameSettings, ...newSettings };
      await updateGameSettings(gamePin, updatedSettings);
      setGameSettings(updatedSettings);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setError('Failed to update settings. Please try again.');
    }
  };

  const copyGamePin = () => {
    navigator.clipboard.writeText(gamePin).then(() => {
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
        <div className="game-pin-display">{gamePin}</div>
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