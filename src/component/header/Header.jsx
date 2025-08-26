import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoMdCart } from "react-icons/io";
import { RiMenuLine, RiCloseLine } from "react-icons/ri";
import { FiSearch, FiUser } from "react-icons/fi";
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ProfileDropdown from '../dropdown/ProfileDropdown';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, user, loading } = useAuth();
  const profileRef = useRef(null);

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

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality here
    console.log('Search query:', searchQuery);
    // You can implement search logic or navigate to search results page
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <img className="w-10 h-10" src="./src/assets/icon3.png" alt="icon" />
          <div className="text-3xl font-semibold brand-font text-[#1D7603]">AgriBasket</div>
        </div>
        
        {/* Search Bar - Desktop */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for fresh produce, farms, products..."
                className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1D7603] focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <FiSearch className="w-5 h-5 text-gray-400" />
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#1D7603] hover:text-[#155502]"
              >
                <FiSearch className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-6">
          <li><Link to="/" className="hover:text-[#1D7603]">Home</Link></li>
          <li><Link to="/cards" className="hover:text-[#1D7603]">Products</Link></li>
          <li><Link to="/contact" className="hover:text-[#1D7603]">Contact</Link></li>
          {/* Show welcome message for authenticated users */}
          {isAuthenticated && user && (
            <li className="text-gray-600 text-sm">
              Welcome, {user.firstName}!
            </li>
          )}
          <li>
           <Link to="/cart" className="cursor-pointer text-2xl hover:text-[#1D7603] transition-colors duration-300 relative inline-block">
             <IoMdCart />
             {totalItems > 0 && (
               <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                 {totalItems}
               </span>
             )}
           </Link>
          </li>
          <li className="relative" ref={profileRef}>
           <button
             onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
             className={`cursor-pointer text-2xl hover:text-[#1D7603] transition-colors duration-300 focus:outline-none flex items-center space-x-2 ${isAuthenticated ? 'bg-[#1D7603] text-white rounded-full p-2' : ''}`}
             disabled={loading}
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
          className="md:hidden text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <RiCloseLine /> : <RiMenuLine />}
        </button>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow">
          {/* Mobile Search Bar */}
          <div className="px-4 py-3 border-b">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1D7603] focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiSearch className="w-5 h-5 text-gray-400" />
                </div>
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#1D7603] hover:text-[#155502]"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
          
          {/* Mobile Navigation Links */}
          <ul className="flex flex-col items-center space-y-4 pb-4">
            {/* Show welcome message for authenticated users */}
            {isAuthenticated && user && (
              <li className="text-[#1D7603] font-semibold border-b border-gray-200 pb-2">
                Welcome, {user.firstName}!
              </li>
            )}
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/cards" onClick={() => setMenuOpen(false)}>Products</Link></li>
            <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
            <li>
              <Link to="/cart" onClick={() => setMenuOpen(false)} className="relative inline-block">
                <IoMdCart style={{ fontSize: '2em' }} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </li>
            <li className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                className={`text-2xl focus:outline-none flex items-center space-x-2 ${isAuthenticated ? 'bg-[#1D7603] text-white rounded-full p-2' : ''}`}
              >
                <FiUser />
                {isAuthenticated && user && (
                  <span className="text-sm font-medium">
                    {user.firstName}
                  </span>
                )}
              </button>
              {/* Mobile Profile Dropdown - Use the same component as desktop */}
              {profileDropdownOpen && (
                <div className="fixed inset-0 z-50 md:relative md:inset-auto">
                  <ProfileDropdown 
                    isOpen={profileDropdownOpen} 
                    onClose={() => {
                      setProfileDropdownOpen(false);
                      setMenuOpen(false);
                    }}
                    isMobile={true}
                  />
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Header;