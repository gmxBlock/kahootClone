import React, { useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';
import GameLobby from '../components/game/GameLobby';
import GamePlay from '../components/game/GamePlay';
import './GameRoom.css';

const GameRoom = () => {
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { gameState, initializeGame } = useContext(GameContext);

  // Extract game data from location state
  const { isHost, gameData, totalQuestions, playerNickname } = location.state || {};

  useEffect(() => {
    // If no location state, redirect to dashboard
    if (!location.state) {
      navigate('/dashboard');
      return;
    }

    // Initialize game context
    if (gameId && typeof isHost !== 'undefined') {
      initializeGame(gameId, isHost, playerNickname);
    }
  }, [gameId, isHost, playerNickname, location.state, navigate, initializeGame]);

  // Show loading if game state not initialized
  if (!gameState.gamePin) {
    return (
      <div className="game-room loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  // Render appropriate component based on game status
  const renderGameComponent = () => {
    switch (gameState.status) {
      case 'waiting':
        return (
          <GameLobby 
            gameId={gameId} 
            totalQuestions={totalQuestions}
          />
        );
      case 'active':
      case 'paused':
        return (
          <GamePlay 
            gameId={gameId} 
          />
        );
      case 'finished':
        return (
          <GamePlay 
            gameId={gameId} 
          />
        );
      default:
        return (
          <div className="game-error">
            <h2>Unknown game state</h2>
            <p>Status: {gameState.status}</p>
            <button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="game-room">
      {renderGameComponent()}
    </div>
  );
};

export default GameRoom;