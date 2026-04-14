import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-9xl font-extrabold text-green-600 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Page not found</h2>
      <p className="text-gray-600 mb-8 max-w-md text-center">
        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors shadow-sm"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;
