import React from 'react';
import './Leaderboard.css';

const Leaderboard = ({ players = [] }) => {
  if (!players || players.length === 0) {
    return (
      <div className="leaderboard">
        <h3>Leaderboard</h3>
        <div className="no-players">
          <p>No players yet...</p>
        </div>
      </div>
    );
  }

  const getMedalEmoji = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  return (
    <div className="leaderboard">
      <h3>🏆 Leaderboard</h3>
      <div className="leaderboard-list">
        {players.map((player, index) => (
          <div 
            key={index} 
            className={`leaderboard-item ${index < 3 ? 'top-three' : ''}`}
          >
            <div className="player-rank">
              <span className="medal">{getMedalEmoji(player.position || index + 1)}</span>
              <span className="position">#{player.position || index + 1}</span>
            </div>
            <div className="player-info">
              <span className="player-name">{player.nickname}</span>
              <span className="player-score">{player.score} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;