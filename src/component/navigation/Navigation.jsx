import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoMdCart } from 'react-icons/io';
import { RiMenuLine, RiCloseLine } from 'react-icons/ri';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import ProfileDropdown from '../dropdown/ProfileDropdown';

// Navigation items configuration
const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/cards', label: 'Products' },
  { to: '/contact', label: 'Contact' }
];

// Authentication-specific navigation items
const AUTH_ITEMS = {
  unauthenticated: [
    { to: '/login', label: 'Log In' },
    { to: '/registration', label: 'Sign Up' }
  ]
};

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();
  const profileRef = useRef(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleCartClick = useCallback(() => {
    // TODO: Implement cart functionality
    console.log('Cart clicked');
  }, []);

  return (
    <nav className="bg-white shadow-md" role="navigation" aria-label="Main navigation">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link 
          to="/" 
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-[#1D7603] focus:ring-offset-2 rounded"
          aria-label="AgriBasket - Go to homepage"
        >
          <img 
            className="w-10 h-10" 
            src="/src/assets/icon3.png" 
            alt="AgriBasket logo" 
            loading="lazy"
          />
          <span className="text-3xl font-semibold brand-font text-[#1D7603]">
            AgriBasket
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center space-x-6" role="menubar">
          {NAV_ITEMS.map(({ to, label }) => (
            <li key={to} role="none">
              <Link 
                to={to} 
                className="px-3 py-2 text-gray-700 hover:text-[#1D7603] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1D7603] focus:ring-offset-2 rounded"
                role="menuitem"
              >
                {label}
              </Link>
            </li>
          ))}
          
          {/* Authentication-specific items */}
          {!isAuthenticated && !loading && AUTH_ITEMS.unauthenticated.map(({ to, label }) => (
            <li key={to} role="none">
              <Link 
                to={to} 
                className="px-3 py-2 text-gray-700 hover:text-[#1D7603] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1D7603] focus:ring-offset-2 rounded"
                role="menuitem"
              >
                {label}
              </Link>
            </li>
          ))}

          {/* Welcome message for authenticated users */}
          {isAuthenticated && user && (
            <li className="text-gray-600 text-sm">
              Welcome, {user.firstName}!
            </li>
          )}

          <li role="none">
            <button
              onClick={handleCartClick}
              className="p-2 text-2xl text-gray-700 hover:text-[#1D7603] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1D7603] focus:ring-offset-2 rounded"
              aria-label="Shopping cart"
              role="menuitem"
            >
              <IoMdCart />
            </button>
          </li>

          {/* Profile/Sign In Button */}
          <li className="relative" ref={profileRef} role="none">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`p-2 text-2xl hover:text-[#1D7603] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1D7603] focus:ring-offset-2 rounded flex items-center space-x-2 ${
                isAuthenticated ? 'bg-[#1D7603] text-white rounded-full' : 'text-gray-700'
              }`}
              disabled={loading}
              aria-label={isAuthenticated ? 'Profile menu' : 'Sign in options'}
              role="menuitem"
            >
              <FiUser />
              {!loading && isAuthenticated && user && (
                <span className="hidden lg:block text-sm font-medium">
                  {user.firstName}
                </span>
              )}
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
              )}
            </button>
            <ProfileDropdown 
              isOpen={profileDropdownOpen} 
              onClose={() => setProfileDropdownOpen(false)} 
            />
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-3xl text-gray-700 hover:text-[#1D7603] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1D7603] focus:ring-offset-2 rounded"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <RiCloseLine /> : <RiMenuLine />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
          
          {/* Menu Content */}
          <div 
            id="mobile-menu"
            className="md:hidden bg-white shadow-lg border-t relative z-50"
            role="menu"
            aria-labelledby="mobile-menu-button"
          >
            <ul className="flex flex-col items-center space-y-4 py-6">
              {/* Welcome message for authenticated users */}
              {isAuthenticated && user && (
                <li className="text-[#1D7603] font-semibold border-b border-gray-200 pb-2">
                  Welcome, {user.firstName}!
                </li>
              )}

              {NAV_ITEMS.map(({ to, label }) => (
                <li key={to} role="none">
                  <Link 
                    to={to} 
                    onClick={closeMenu}
                    className="block px-4 py-2 text-lg text-gray-700 hover:text-[#1D7603] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1D7603] focus:ring-offset-2 rounded"
                    role="menuitem"
                  >
                    {label}
                  </Link>
                </li>
              ))}

              {/* Authentication-specific items for mobile */}
              {!isAuthenticated && !loading && AUTH_ITEMS.unauthenticated.map(({ to, label }) => (
                <li key={to} role="none">
                  <Link 
                    to={to} 
                    onClick={closeMenu}
                    className="block px-4 py-2 text-lg text-gray-700 hover:text-[#1D7603] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1D7603] focus:ring-offset-2 rounded"
                    role="menuitem"
                  >
                    {label}
                  </Link>
                </li>
              ))}

              <li role="none">
                <button
                  onClick={() => {
                    handleCartClick();
                    closeMenu();
                  }}
                  className="p-3 text-3xl text-gray-700 hover:text-[#1D7603] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1D7603] focus:ring-offset-2 rounded"
                  aria-label="Shopping cart"
                  role="menuitem"
                >
                  <IoMdCart />
                </button>
              </li>

              {/* Profile/Sign In Button for Mobile */}
              <li className="relative" role="none">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                  }}
                  className={`text-2xl focus:outline-none flex items-center space-x-2 p-2 rounded transition-colors duration-200 ${
                    isAuthenticated ? 'bg-[#1D7603] text-white rounded-full' : 'text-gray-700 hover:text-[#1D7603]'
                  }`}
                  role="menuitem"
                >
                  <FiUser />
                  {isAuthenticated && user && (
                    <span className="text-sm font-medium">
                      {user.firstName}
                    </span>
                  )}
                  {!isAuthenticated && (
                    <span className="text-sm font-medium">
                      Sign In
                    </span>
                  )}
                </button>
                {/* Mobile Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="fixed inset-0 z-50">
                    <ProfileDropdown 
                      isOpen={profileDropdownOpen} 
                      onClose={() => {
                        setProfileDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                      isMobile={true}
                    />
                  </div>
                )}
              </li>
            </ul>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navigation;
