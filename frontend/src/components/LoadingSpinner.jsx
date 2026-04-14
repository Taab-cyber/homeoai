import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      {text && <p className="text-green-700 font-medium text-lg animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
