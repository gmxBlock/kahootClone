import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile, updateUserProfile, getUserStats } from '../services/api';
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
    bio: '',
    skills: []
  });
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!user || !localStorage.getItem('token')) {
          // Show demo data if not authenticated
          setProfileData({
            username: 'Demo User',
            email: 'demo@example.com',
            bio: 'This is a demo profile. Please log in to see your real profile.',
            avatar: 'https://via.placeholder.com/150/667eea/ffffff?text=DU',
            stats: {
              gamesPlayed: 0,
              gamesWon: 0,
              totalScore: 0,
              averageScore: 0,
              quizzesCreated: 0,
              gamesHosted: 0
            },
            skills: ['React', 'JavaScript', 'Node.js'],
            achievements: [
              { name: 'Welcome!', description: 'Joined Thinkaton', earned: true },
              { name: 'Quiz Master', description: 'Create your first quiz', earned: false },
              { name: 'Game Host', description: 'Host your first game', earned: false }
            ],
            createdAt: new Date().toISOString()
          });
          setEditForm({
            username: 'Demo User',
            email: 'demo@example.com',
            bio: 'This is a demo profile. Please log in to see your real profile.',
            skills: ['React', 'JavaScript', 'Node.js']
          });
        } else {
          // Fetch real profile data
          const [profileResponse, statsResponse] = await Promise.all([
            getUserProfile(),
            getUserStats()
          ]);

          const profile = profileResponse.profile;
          const stats = statsResponse.stats;

          const combinedProfile = {
            ...profile,
            stats,
            skills: profile.skills || [],
            achievements: profile.achievements || [
              { name: 'Welcome!', description: 'Joined Thinkaton', earned: true },
              { name: 'Quiz Master', description: 'Create your first quiz', earned: stats.quizzesCreated > 0 },
              { name: 'Game Host', description: 'Host your first game', earned: stats.gamesHosted > 0 },
              { name: 'Winner', description: 'Win your first game', earned: stats.gamesWon > 0 },
              { name: 'High Scorer', description: 'Score 90% or higher', earned: stats.averageScore >= 90 }
            ]
          };

          setProfileData(combinedProfile);
          setEditForm({
            username: profile.username || '',
            email: profile.email || '',
            bio: profile.bio || '',
            skills: profile.skills || []
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        setError('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (!user || !localStorage.getItem('token')) {
        setError('Please log in to update your profile');
        return;
      }

      const updateData = {
        username: editForm.username,
        email: editForm.email,
        bio: editForm.bio,
        skills: editForm.skills
      };

      const response = await updateUserProfile(updateData);
      
      setProfileData(prev => ({
        ...prev,
        ...response.profile,
        skills: response.profile.skills || editForm.skills
      }));
      
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditForm({
      username: profileData?.username || '',
      email: profileData?.email || '',
      bio: profileData?.bio || '',
      skills: profileData?.skills || []
    });
    setIsEditing(false);
    setError(null);
  };

  const addSkill = () => {
    if (skillInput.trim() && !editForm.skills.includes(skillInput.trim())) {
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
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
            src={profileData?.avatar || 'https://via.placeholder.com/150/667eea/ffffff?text=U'} 
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
              <div className="skills-editor">
                <label>Skills:</label>
                <div className="skills-input-container">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={handleSkillKeyPress}
                    placeholder="Add a skill and press Enter"
                    className="skill-input"
                  />
                  <button type="button" onClick={addSkill} className="add-skill-btn">Add</button>
                </div>
                <div className="skills-list-edit">
                  {editForm.skills.map((skill, index) => (
                    <span key={index} className="skill-tag-edit">
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => removeSkill(skill)}
                        className="remove-skill-btn"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              {error && <div className="error-message">{error}</div>}
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
                <p>Welcome to Thinkaton!</p>
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