import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile } from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // For now, always show demo data since backend might not be running
        // In production, this would check if user exists and fetch real data
        setProfileData({
          username: 'Jakob Masfelder',
          email: 'jakob@masfelder.de',
          bio: 'Full-stack developer passionate about creating interactive web applications. Specializing in React, Node.js, and real-time applications.',
          avatar: '/api/placeholder/150/150',
          stats: {
            gamesPlayed: 0,
            gamesWon: 0,
            totalScore: 0,
            averageScore: 0,
            quizzesCreated: 0,
            gamesHosted: 0
          },
          createdAt: new Date().toISOString(),
          skills: ['React', 'Node.js', 'JavaScript', 'Socket.io', 'MongoDB', 'Express.js'],
          achievements: [
            { name: 'Quiz Master', description: 'Created your first quiz', earned: true },
            { name: 'Game Host', description: 'Hosted your first game', earned: false },
            { name: 'High Scorer', description: 'Scored 100% on a quiz', earned: false }
          ]
        });
        setEditForm({
          username: 'Jakob Masfelder',
          email: 'jakob@masfelder.de',
          bio: 'Full-stack developer passionate about creating interactive web applications. Specializing in React, Node.js, and real-time applications.'
        });
      } catch (err) {
        setError('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      // In a real app, this would make an API call to update the profile
      setProfileData(prev => ({
        ...prev,
        ...editForm
      }));
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditForm({
      username: profileData?.username || '',
      email: profileData?.email || '',
      bio: profileData?.bio || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <img 
            src={profileData?.avatar || '/api/placeholder/150/150'} 
            alt={profileData?.username || 'User Avatar'} 
          />
        </div>
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Username"
                className="edit-input"
              />
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="edit-input"
              />
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Bio"
                className="edit-textarea"
                rows="3"
              />
              <div className="edit-buttons">
                <button onClick={handleSave} className="btn-save">Save</button>
                <button onClick={handleCancel} className="btn-cancel">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <h1>{profileData?.username || 'User'}</h1>
              <p className="email">{profileData?.email}</p>
              <p className="bio">{profileData?.bio || 'No bio available'}</p>
              <p className="join-date">
                Member since {new Date(profileData?.createdAt).toLocaleDateString()}
              </p>
              <button onClick={handleEdit} className="btn-edit">Edit Profile</button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        {/* Stats Section */}
        <div className="stats-section">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{profileData?.stats?.gamesPlayed || 0}</div>
              <div className="stat-label">Games Played</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{profileData?.stats?.gamesWon || 0}</div>
              <div className="stat-label">Games Won</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{profileData?.stats?.totalScore || 0}</div>
              <div className="stat-label">Total Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{profileData?.stats?.averageScore || 0}%</div>
              <div className="stat-label">Average Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{profileData?.stats?.quizzesCreated || 0}</div>
              <div className="stat-label">Quizzes Created</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{profileData?.stats?.gamesHosted || 0}</div>
              <div className="stat-label">Games Hosted</div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        {profileData?.skills && (
          <div className="skills-section">
            <h2>Skills & Technologies</h2>
            <div className="skills-list">
              {profileData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {profileData?.achievements && (
          <div className="achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-grid">
              {profileData.achievements.map((achievement, index) => (
                <div key={index} className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
                  <div className="achievement-icon">
                    {achievement.earned ? '🏆' : '🔒'}
                  </div>
                  <div className="achievement-info">
                    <h3>{achievement.name}</h3>
                    <p>{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Section */}
        <div className="activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">🎮</div>
              <div className="activity-content">
                <p>Welcome to Kahoot Clone!</p>
                <span className="activity-time">Just now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;