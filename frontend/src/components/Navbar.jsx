import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold flex items-center gap-2">
              <span>🌿</span> HomeoAI
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/consult" className="hover:text-green-200 transition-colors">New Consultation</Link>
                <Link to="/history" className="hover:text-green-200 transition-colors">History</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="hover:text-green-200 transition-colors flex items-center gap-1">
                    <span className="text-xs">🛡️</span> Admin
                  </Link>
                )}
                <div className="flex items-center gap-4 ml-4">
                  <span className="text-green-100 italic">Welcome, {user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-green-800 hover:bg-green-900 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link 
                to="/auth"
                className="bg-white text-green-700 hover:bg-gray-100 px-5 py-2 rounded-md font-medium transition-colors"
              >
                Login
              </Link>
            )}
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-green-200 focus:outline-none focus:text-green-200 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-green-800 pb-3 pt-2">
          {user ? (
            <div className="flex flex-col space-y-2 px-4">
              <span className="text-green-200 py-1 border-b border-green-700">Hi, {user.name}</span>
              <Link to="/consult" className="hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>New Consultation</Link>
              <Link to="/history" className="hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>History</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-white py-2 flex items-center gap-1" onClick={() => setIsMenuOpen(false)}>
                  <span className="text-xs">🛡️</span> Admin Dashboard
                </Link>
              )}
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-red-300 hover:text-red-200 py-2">
                Logout
              </button>
            </div>
          ) : (
            <div className="px-4 pt-2">
              <Link to="/auth" className="block w-full text-center bg-white text-green-700 py-2 rounded-md font-medium" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
