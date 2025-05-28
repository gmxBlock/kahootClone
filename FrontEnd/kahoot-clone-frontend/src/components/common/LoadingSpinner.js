import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  message = "Loading...", 
  size = "medium", 
  overlay = false,
  color = "primary",
  className = ""
}) => {
  const spinnerClass = `spinner ${size} ${color}`;
  const containerClass = overlay ? 'loading-overlay' : 'loading-container';
  const fullClassName = className ? `${containerClass} ${className}` : containerClass;

  return (
    <div className={fullClassName}>
      <div className="loading-content">
        <div className={spinnerClass}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;