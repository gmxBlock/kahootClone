import React from 'react';
import './LoadingSpinner.css'; // Assuming you have a CSS file for styling the spinner

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;