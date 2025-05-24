import React from 'react';

const Leaderboard = ({ scores }) => {
  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <ul>
        {scores.map((score, index) => (
          <li key={index}>
            {score.playerName}: {score.points} points
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;