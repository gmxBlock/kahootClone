import React from 'react';

const Results = ({ results }) => {
  return (
    <div className="results">
      <h2>Game Results</h2>
      <ul>
        {results.map((result, index) => (
          <li key={index}>
            <strong>{result.playerName}</strong>: {result.score} points
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Results;