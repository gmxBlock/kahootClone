import React, { useState } from 'react';
import './QuizCreator.css';

const QuizCreator = () => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], answer: '' }]);

  const handleTitleChange = (e) => {
    setQuizTitle(e.target.value);
  };

  const handleQuestionChange = (index, e) => {
    const newQuestions = [...questions];
    newQuestions[index].question = e.target.value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, e) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = e.target.value;
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (index, e) => {
    const newQuestions = [...questions];
    newQuestions[index].answer = e.target.value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], answer: '' }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit quiz data to the backend
    console.log({ title: quizTitle, questions });
  };

  return (
    <div>
      <h2>Create a New Quiz</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Quiz Title:</label>
          <input type="text" value={quizTitle} onChange={handleTitleChange} required />
        </div>
        {questions.map((q, index) => (
          <div key={index}>
            <h3>Question {index + 1}</h3>
            <input
              type="text"
              placeholder="Question"
              value={q.question}
              onChange={(e) => handleQuestionChange(index, e)}
              required
            />
            {q.options.map((option, i) => (
              <div key={i}>
                <input
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, i, e)}
                  required
                />
              </div>
            ))}
            <div>
              <label>Correct Answer:</label>
              <input
                type="text"
                value={q.answer}
                onChange={(e) => handleAnswerChange(index, e)}
                required
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={addQuestion}>Add Question</button>
        <button type="submit">Submit Quiz</button>
      </form>
    </div>
  );
};

export default QuizCreator;