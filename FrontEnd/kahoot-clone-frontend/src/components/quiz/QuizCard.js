import React from 'react';
import './QuizCard.css'; // Assuming you have a CSS file for styling

const QuizCard = ({ quiz, onSelect }) => {
  return (
    <div className="quiz-card" onClick={() => onSelect(quiz.id)}>
      <h3 className="quiz-title">{quiz.title}</h3>
      <p className="quiz-description">{quiz.description}</p>
      <span className="quiz-difficulty">Difficulty: {quiz.difficulty}</span>
    </div>
  );
};

export default QuizCard;