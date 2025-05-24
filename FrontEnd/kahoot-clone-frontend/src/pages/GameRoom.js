import React from 'react';
import { useParams } from 'react-router-dom';
import GameLobby from '../components/game/GameLobby';
import GamePlay from '../components/game/GamePlay';
import './GameRoom.css';

const GameRoom = () => {
  const { gameId } = useParams();
  const [isGameStarted, setIsGameStarted] = React.useState(false);

  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  return (
    <div className="game-room">
      {isGameStarted ? (
        <GamePlay gameId={gameId} />
      ) : (
        <GameLobby gameId={gameId} onStartGame={handleStartGame} />
      )}
    </div>
  );
};

export default GameRoom;