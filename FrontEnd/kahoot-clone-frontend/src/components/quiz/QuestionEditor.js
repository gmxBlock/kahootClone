import React, { useState } from 'react';

const QuestionEditor = ({ question, onSave }) => {
  const [text, setText] = useState(question.text || '');
  const [options, setOptions] = useState(question.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer || '');

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    const updatedQuestion = {
      text,
      options,
      correctAnswer,
    };
    onSave(updatedQuestion);
  };

  return (
    <div className="question-editor">
      <h2>Edit Question</h2>
      <div>
        <label>Question Text:</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div>
        <label>Options:</label>
        {options.map((option, index) => (
          <div key={index}>
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div>
        <label>Correct Answer:</label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
        />
      </div>
      <button onClick={handleSave}>Save Question</button>
    </div>
  );
};

export default QuestionEditor;