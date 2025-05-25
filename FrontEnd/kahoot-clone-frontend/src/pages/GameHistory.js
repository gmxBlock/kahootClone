import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserGameHistory } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './GameHistory.css';

const GameHistory = () => {
  const { user } = useContext(AuthContext);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all', 'host', 'player'

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        if (!user || !localStorage.getItem('token')) {
          setGameHistory([]);
          setLoading(false);
          return;
        }

        const response = await getUserGameHistory(currentPage, 10, filter);
        setGameHistory(response.games || []);
        setCurrentPage(response.currentPage || 1);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch game history:', err);
        setError('Failed to load game history');
      } finally {
        setLoading(false);
      }
    };

    fetchGameHistory();
  }, [user, currentPage, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'status-completed',
      active: 'status-active',
      waiting: 'status-waiting',
      cancelled: 'status-cancelled'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-default'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="game-history-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-history-container">
      <div className="game-history-header">
        <h1>Game History</h1>
        <p>Your complete gaming history and statistics</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          All Games
        </button>
        <button 
          className={`filter-tab ${filter === 'host' ? 'active' : ''}`}
          onClick={() => handleFilterChange('host')}
        >
          Hosted Games
        </button>
        <button 
          className={`filter-tab ${filter === 'player' ? 'active' : ''}`}
          onClick={() => handleFilterChange('player')}
        >
          Played Games
        </button>
      </div>

      {/* Game History List */}
      {gameHistory.length > 0 ? (
        <div className="game-history-list">
          {gameHistory.map((game, index) => (
            <div key={index} className="game-history-item">
              <div className="game-basic-info">
                <div className="game-title">
                  <h3>{game.quiz?.title || 'Unknown Quiz'}</h3>
                  <span className="game-category">{game.quiz?.category || 'General'}</span>
                </div>
                <div className="game-meta">
                  <span className="game-pin">PIN: {game.gamePin}</span>
                  <span className="game-date">{formatDate(game.createdAt)}</span>
                  {getStatusBadge(game.status)}
                </div>
              </div>

              <div className="game-stats">
                <div className="stat-group">
                  <span className="stat-label">Role:</span>
                  <span className="stat-value role-badge role-{game.role}">
                    {game.role === 'host' ? '🎯 Host' : '🎮 Player'}
                  </span>
                </div>
                
                <div className="stat-group">
                  <span className="stat-label">Players:</span>
                  <span className="stat-value">{game.playerCount}</span>
                </div>

                {game.playerStats && (
                  <>
                    <div className="stat-group">
                      <span className="stat-label">Score:</span>
                      <span className="stat-value">{game.playerStats.score}</span>
                    </div>
                    <div className="stat-group">
                      <span className="stat-label">Position:</span>
                      <span className="stat-value position-{game.playerStats.position}">
                        #{game.playerStats.position}
                      </span>
                    </div>
                    <div className="stat-group">
                      <span className="stat-label">Accuracy:</span>
                      <span className="stat-value">
                        {Math.round((game.playerStats.correctAnswers / game.playerStats.totalAnswers) * 100)}%
                      </span>
                    </div>
                  </>
                )}

                {game.gameStats && (
                  <div className="stat-group">
                    <span className="stat-label">Avg Score:</span>
                    <span className="stat-value">{Math.round(game.gameStats.averageScore)}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🎮</div>
          <h3>No games found</h3>
          <p>
            {filter === 'all' 
              ? "You haven't played or hosted any games yet. Start by creating a quiz or joining a game!"
              : filter === 'host'
              ? "You haven't hosted any games yet. Create a quiz and start hosting!"
              : "You haven't played any games yet. Join a game using a PIN!"
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-number ${page === currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GameHistory;
