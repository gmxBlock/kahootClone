import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username || 'User'}!</h1>
        <p className="dashboard-subtitle">Ready to create or join a quiz?</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="card-icon">🎯</div>
            <h3>Create Quiz</h3>
            <p>Design your own interactive quiz and share it with others</p>
            <Link to="/quiz-creator" className="card-button">
              Start Creating
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🎮</div>
            <h3>Join Game</h3>
            <p>Enter a game PIN to participate in an exciting quiz</p>
            <Link to="/game-room" className="card-button">
              Join Now
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📚</div>
            <h3>My Quizzes</h3>
            <p>View and manage all your created quizzes</p>
            <Link to="/quizzes" className="card-button">
              View Quizzes
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">👤</div>
            <h3>Profile</h3>
            <p>Update your profile information and view statistics</p>
            <Link to="/profile" className="card-button">
              View Profile
            </Link>
          </div>
        </div>

        <div className="dashboard-stats">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Quizzes Created</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Games Played</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Best Score</span>
            </div>
          </div>
        </div>

        <div className="dashboard-actions">
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;