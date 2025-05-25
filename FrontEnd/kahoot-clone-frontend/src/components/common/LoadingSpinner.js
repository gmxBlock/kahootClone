import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{message}</p>
      <div className="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default LoadingSpinner;