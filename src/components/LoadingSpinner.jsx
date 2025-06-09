import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = '載入中...' }) => {
  const sizeClasses = {
    small: { width: '1rem', height: '1rem' },
    medium: { width: '2rem', height: '2rem' },
    large: { width: '3rem', height: '3rem' }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div 
        className="loading-spinner"
        style={sizeClasses[size]}
      />
      {text && <p className="text-gray-600">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;