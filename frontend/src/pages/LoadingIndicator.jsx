import React from 'react';
import './LoadingIndicator.css'; 

const LoadingIndicator = () => {
  return (
    <div className="loadingContainer">
      <div className="loadingSpinner">
        <div className="spinner">
          <div className="spinnerWrapper">
            <div className="spinnerLeft">
              <div className="spinnerCircle"></div>
            </div>
            <div className="spinnerRight">
              <div className="spinnerCircle"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
