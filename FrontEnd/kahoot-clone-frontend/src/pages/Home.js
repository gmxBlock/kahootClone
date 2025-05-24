import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <main className="home-container">
      <div className="hero-section">
        <h1>Welcome to Kahoot Clone!</h1>
        <p>Join quizzes, play games, and have fun with friends!</p>
        <div className="cta-buttons">
          <button className="btn-primary">Start Playing</button>
          <button className="btn-secondary">Create Quiz</button>
        </div>
      </div>
      
      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>🎮 Real-time Gaming</h3>
            <p>Play live quizzes with friends and compete for the top spot!</p>
          </div>
          <div className="feature-card">
            <h3>📚 Create Quizzes</h3>
            <p>Build your own custom quizzes with multiple question types.</p>
          </div>
          <div className="feature-card">
            <h3>🏆 Leaderboards</h3>
            <p>Track your progress and see how you rank against others.</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;