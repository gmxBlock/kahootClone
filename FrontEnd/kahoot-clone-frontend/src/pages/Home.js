import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [gamePin, setGamePin] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleStartPlaying = () => {
    if (user) {
      // If user is logged in, show join game modal
      setShowJoinModal(true);
    } else {
      // If not logged in, redirect to login
      navigate('/login');
    }
  };

  const handleCreateQuiz = () => {
    if (user) {
      // If user is logged in, redirect to quiz creator
      navigate('/quiz-creator');
    } else {
      // If not logged in, redirect to login
      navigate('/login');
    }
  };

  const handleJoinGame = () => {
    if (gamePin.trim()) {
      // Navigate to game room with the pin
      navigate(`/game/${gamePin.trim()}`);
    }
  };

  const handleQuickPlay = () => {
    // Navigate to available quizzes for quick play
    navigate('/quizzes');
  };

  return (
    <main className="home-container">
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Thinkaton!</h1>
          <p className="hero-subtitle">Join quizzes, play games, and have fun with friends!</p>
          <div className="hero-actions">
            <button className="hero-button primary" onClick={handleStartPlaying}>
              Start Playing
            </button>
            <button className="hero-button secondary" onClick={handleCreateQuiz}>
              Create Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Join Game Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Join a Game</h2>
            <div className="join-options">
              <div className="join-option">
                <h3>Enter Game PIN</h3>
                <div className="pin-input-container">
                  <input
                    type="text"
                    placeholder="Enter 6-digit PIN"
                    value={gamePin}
                    onChange={(e) => setGamePin(e.target.value)}
                    maxLength="6"
                    className="pin-input"
                  />
                  <button 
                    onClick={handleJoinGame}
                    disabled={!gamePin.trim()}
                    className="join-btn"
                  >
                    Join Game
                  </button>
                </div>
              </div>
              <div className="join-divider">OR</div>
              <div className="join-option">
                <h3>Quick Play</h3>
                <p>Browse available public quizzes</p>
                <button onClick={handleQuickPlay} className="quick-play-btn">
                  Browse Quizzes
                </button>
              </div>
            </div>
            <button 
              className="close-modal"
              onClick={() => setShowJoinModal(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="features-section">
        <div className="features-container">
          <h2 className="features-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎮</div>
              <h3 className="feature-title">Real-time Gaming</h3>
              <p className="feature-description">Play live quizzes with friends and compete for the top spot!</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3 className="feature-title">Create Quizzes</h3>
              <p className="feature-description">Build your own custom quizzes with multiple question types.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3 className="feature-title">Leaderboards</h3>
              <p className="feature-description">Track your progress and see how you rank against others.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-container">
          <h2 className="stats-title">Join the Fun!</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">10K+</span>
              <span className="stat-label">Active Players</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">5K+</span>
              <span className="stat-label">Quizzes Created</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">50K+</span>
              <span className="stat-label">Games Played</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">99%</span>
              <span className="stat-label">Fun Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <div className="how-it-works-container">
          <h2 className="how-it-works-title">How It Works</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Create or Join</h3>
              <p className="step-description">Create your own quiz or join an existing game with a PIN</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Play Live</h3>
              <p className="step-description">Answer questions in real-time and compete with other players</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">See Results</h3>
              <p className="step-description">Check the leaderboard and celebrate your achievements</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Start?</h2>
          <p className="cta-description">
            Join thousands of players already having fun with our interactive quiz platform!
          </p>
          <div className="cta-actions">
            <button className="hero-button primary" onClick={handleStartPlaying}>
              Start Playing Now
            </button>
            <button className="hero-button secondary" onClick={handleCreateQuiz}>
              Create Your First Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="floating-element"></div>
      <div className="floating-element"></div>
      <div className="floating-element"></div>
    </main>
  );
};

export default Home;