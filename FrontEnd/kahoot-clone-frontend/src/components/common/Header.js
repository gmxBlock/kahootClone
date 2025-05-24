import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-title">
          <h1>Thinkaton</h1>
        </Link>
        <nav className="header-nav">
          {user ? (
            // Authenticated user navigation
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/quizzes" className="nav-link">My Quizzes</Link>
              <Link to="/quiz-creator" className="nav-link">Create Quiz</Link>
              <Link to="/profile" className="nav-link">Profile</Link>
              <div className="user-menu">
                <span className="user-greeting">Hi, {user.username}!</span>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </div>
            </>
          ) : (
            // Guest navigation
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/game-room" className="nav-link">Join Game</Link>
              <Link to="/login" className="nav-link login-link">Login</Link>
              <Link to="/register" className="nav-link register-link">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;