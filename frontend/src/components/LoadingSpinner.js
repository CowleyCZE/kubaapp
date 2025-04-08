import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="text-center my-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Načítání...</span>
      </div>
      <p className="mt-3">Gemini AI analyzuje váš text...</p>
    </div>
  );
};

export default LoadingSpinner;
