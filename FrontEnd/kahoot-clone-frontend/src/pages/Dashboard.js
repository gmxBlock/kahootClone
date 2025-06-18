import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserDashboard, getUserStats, fetchQuizzes } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Dashboard: Checking authentication...');
        console.log('User:', user);
        console.log('Token:', localStorage.getItem('token'));
        
        if (!user || !localStorage.getItem('token')) {
          console.log('No user or token found, showing demo data');
          // Show demo data for non-authenticated users
          setDashboardData({
            recentGames: [],
            popularQuizzes: []
          });
          setUserStats({
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            averageScore: 0,
            quizzesCreated: 0,
            gamesHosted: 0
          });
          setRecentQuizzes([]);
        } else {
          console.log('User authenticated, fetching real data...');
          // Fetch real data for authenticated users
          const [dashboardResponse, statsResponse, quizzesResponse] = await Promise.all([
            getUserDashboard(),
            getUserStats(),
            fetchQuizzes()
          ]);

          console.log('Dashboard data received:', dashboardResponse);
          setDashboardData(dashboardResponse);
          setUserStats(statsResponse.stats);
          setRecentQuizzes(quizzesResponse.quizzes || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.username || 'User'}!</h1>
        <p className="dashboard-subtitle">Ready to create or join a quiz?</p>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="dashboard-content">
        <div className="dashboard-stats">
          <h2>Your Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{userStats?.quizzesCreated || 0}</span>
              <span className="stat-label">Quizzes Created</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userStats?.gamesPlayed || 0}</span>
              <span className="stat-label">Games Played</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userStats?.gamesWon || 0}</span>
              <span className="stat-label">Games Won</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userStats?.averageScore || 0}%</span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userStats?.gamesHosted || 0}</span>
              <span className="stat-label">Games Hosted</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userStats?.totalScore || 0}</span>
              <span className="stat-label">Total Score<br/></span>
            </div>
          </div>
        </div>
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
            <p>View and manage all your created quizzes<br /></p>
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

        {/* Recent Activity Section */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          {dashboardData?.recentGames?.length > 0 ? (
            <div className="games-list">
              {dashboardData.recentGames.map((game, index) => (
                <div key={index} className="game-card">
                  <div className="game-info">
                    <h4>{game.quiz?.title || 'Unknown Quiz'}</h4>
                    <p>Game PIN: {game.gamePin}</p>
                    <p>Status: {game.status}</p>
                  </div>
                  <div className="game-stats">
                    <span className="players">{game.playerCount} players</span>
                    <span className="date">{new Date(game.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent games. Why not create a quiz and host your first game?</p>
              <Link to="/quiz-creator" className="btn-primary">Create Your First Quiz</Link>
            </div>
          )}
        </div>

        {/* Available Quizzes Section */}
        {recentQuizzes.length > 0 && (
          <div className="available-quizzes">
            <h2>Available Quizzes</h2>
            <div className="quiz-grid">
              {recentQuizzes.slice(0, 4).map((quiz) => (
                <div key={quiz._id} className="quiz-card-dashboard">
                  <div className="quiz-header">
                    <h4>{quiz.title}</h4>
                    <span className="quiz-category">{quiz.category}</span>
                  </div>
                  <div className="quiz-info">
                    <p>{quiz.questions?.length || 0} questions</p>
                    <p>By: {quiz.creator?.username || 'Anonymous'}</p>
                  </div>
                  <div className="quiz-actions">
                    <Link to={`/quiz/${quiz._id}/host`} className="btn-host">Host Game</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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