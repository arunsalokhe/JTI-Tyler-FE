import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const JTIHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center justify-between">
          {/* Dashboard Button - Always Visible */}
          <button
            onClick={() => handleNavigation('/dashboard')}
            className={`text-sm font-medium transition ${
              isActive('/dashboard')
                ? 'text-indigo-600'
                : 'text-gray-900 hover:text-indigo-600'
            }`}
          >
            Dashboard
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={() => handleNavigation('/services/jti-filing/home-page')}
              className={`text-sm font-medium transition ${
                isActive('/services/jti-filing/home-page')
                  ? 'text-indigo-600'
                  : 'text-gray-900 hover:text-indigo-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/services/jti-filing/new-case')}
              className={`text-sm font-medium transition ${
                isActive('/services/jti-filing/new-case')
                  ? 'text-indigo-600'
                  : 'text-gray-900 hover:text-indigo-600'
              }`}
            >
              File a New Case
            </button>
            <button
              onClick={() => handleNavigation('/services/jti-filing/subsequent-filing')}
              className={`text-sm font-medium transition ${
                isActive('/services/jti-filing/subsequent-filing')
                  ? 'text-indigo-600'
                  : 'text-gray-900 hover:text-indigo-600'
              }`}
            >
              Subsequent Filing
            </button>
            <button
              onClick={() => handleNavigation('/services/jti-filing/my-previous-filings')}
              className={`text-sm font-medium transition ${
                isActive('/services/jti-filing/my-previous-filings')
                  ? 'text-indigo-600'
                  : 'text-gray-900 hover:text-indigo-600'
              }`}
            >
              My Previous Filings
            </button>
            {/* <button
              onClick={() => handleNavigation('/my-organization')}
              className={`text-sm font-medium transition ${
                isActive('/my-organization')
                  ? 'text-indigo-600'
                  : 'text-gray-900 hover:text-indigo-600'
              }`}
            >
              My Organization
            </button> */}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleNavigation('/services/jti-filing/home-page')}
                className={`text-sm font-medium transition text-left px-2 py-2 rounded-md ${
                  isActive('/services/jti-filing/home-page')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-900 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('/services/jti-filing/new-case')}
                className={`text-sm font-medium transition text-left px-2 py-2 rounded-md ${
                  isActive('/services/jti-filing/new-case')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-900 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                File a New Case
              </button>
              <button
                onClick={() => handleNavigation('/services/jti-filing/subsequent-filing')}
                className={`text-sm font-medium transition text-left px-2 py-2 rounded-md ${
                  isActive('/services/jti-filing/subsequent-filing')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-900 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                Subsequent Filing
              </button>
              <button
                onClick={() => handleNavigation('/services/jti-filing/my-previous-filings')}
                className={`text-sm font-medium transition text-left px-2 py-2 rounded-md ${
                  isActive('/services/jti-filing/my-previous-filings')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-900 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                My Previous Filings
              </button>
              <button
                onClick={() => handleNavigation('/my-organization')}
                className={`text-sm font-medium transition text-left px-2 py-2 rounded-md ${
                  isActive('/my-organization')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-900 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                My Organization
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default JTIHeader;