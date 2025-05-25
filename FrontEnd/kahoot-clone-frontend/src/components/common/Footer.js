import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Thinkaton</h3>
          <p>Create engaging quizzes and compete in real-time with players around the world.</p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/quizzes">Quizzes</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Support</h3>
          <ul>
            <li><a href="mailto:jakob@masfelder.de">Contact Support</a></li>
            <li><a href="mailto:jakob@masfelder.de">Send Feedback</a></li>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Jakob Masfelder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;