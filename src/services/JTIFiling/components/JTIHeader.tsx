import React from 'react';
import { useNavigate } from 'react-router-dom';

const JTIHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition"
          >
            Dashboard
          </button>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/services/jti-filing/home-page')}
              className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/services/jti-filing/new-case')}
              className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition"
            >
              File a New Case
            </button>
            <button
              onClick={() => navigate('/subsequent-filing')}
              className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition"
            >
              Subsequent Filing
            </button>
            <button
              onClick={() => navigate('/my-filings')}
              className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition"
            >
              My Previous Filings
            </button>
            <button
              onClick={() => navigate('/my-organization')}
              className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition"
            >
              My Organization
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default JTIHeader;