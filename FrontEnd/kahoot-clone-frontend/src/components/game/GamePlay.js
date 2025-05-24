import React, { useEffect, useState } from 'react';
import useGame from '../../hooks/useGame';
import Question from './Question';
import Leaderboard from './Leaderboard';
import Results from './Results';
import './GamePlay.css';

const GamePlay = () => {
  const { currentQuestion, nextQuestion, gameOver, score } = useGame();
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (gameOver) {
      setShowResults(true);
    }
  }, [gameOver]);

  const handleNextQuestion = () => {
    nextQuestion();
  };

  return (
    <div className="game-play">
      {showResults ? (
        <Results score={score} />
      ) : (
        <>
          {currentQuestion ? (
            <Question question={currentQuestion} onNext={handleNextQuestion} />
          ) : (
            <div>Loading...</div>
          )}
          <Leaderboard />
        </>
      )}
    </div>
  );
};

export default GamePlay;