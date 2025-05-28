import React, { useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';
import GameLobby from '../components/game/GameLobby';
import GamePlay from '../components/game/GamePlay';
import './GameRoom.css';

const GameRoom = () => {
  console.log('🏠 GameRoom component loaded');
  
  const { gameId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { gameState, initializeGame } = useContext(GameContext);

  // Extract game data from location state
  const { isHost, gameData, totalQuestions, playerNickname, gamePin } = location.state || {};

  console.log('🔍 GameRoom props:', {
    gameId,
    isHost,
    gamePin,
    locationState: location.state
  });

  useEffect(() => {
    console.log('🔄 GameRoom useEffect triggered');
    
    // If no location state, redirect to dashboard
    if (!location.state) {
      console.log('❌ No location state, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }

    // Use gamePin from location state if gameId from params is not available
    const gameIdentifier = gameId || gamePin;
    
    if (gameIdentifier && typeof isHost !== 'undefined') {
      console.log('✅ Initializing game with identifier:', gameIdentifier);
      initializeGame(gameIdentifier, isHost, playerNickname);
    } else {
      console.log('❌ Missing game identifier or host status');
    }
  }, [gameId, gamePin, isHost, playerNickname, location.state, navigate, initializeGame]);

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
            gameId={gameId || gamePin} 
            totalQuestions={totalQuestions}
            gameData={gameData}
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