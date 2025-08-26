import React from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiSettings, FiLogOut, FiShield, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ProfileDropdown = ({ isOpen, onClose, isMobile = false }) => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`${isMobile ? 'fixed' : 'md:hidden fixed'} inset-0 bg-black bg-opacity-25 z-40`}
        onClick={handleBackdropClick}
      ></div>
      
      {/* Dropdown Menu */}
      <div className={`${
        isMobile 
          ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-h-[80vh] overflow-y-auto' 
          : 'absolute right-0 top-full mt-2'
        } w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden`}>
        
        {/* If user is authenticated */}
        {isAuthenticated && user ? (
          <>
            {/* User Info Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Welcome back!</h3>
              <p className="text-sm text-gray-600">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            
            {/* Authenticated Menu Items */}
            <div className="py-2">
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-[#1D7603] hover:text-white transition-colors duration-200"
              >
                <FiUser className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">My Profile</div>
                  <div className="text-sm text-gray-500 hover:text-gray-200">View and edit profile</div>
                </div>
              </Link>
              
              <Link
                to="/orders"
                onClick={onClose}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-[#1D7603] hover:text-white transition-colors duration-200"
              >
                <FiShoppingBag className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">My Orders</div>
                  <div className="text-sm text-gray-500 hover:text-gray-200">Track your orders</div>
                </div>
              </Link>

              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-[#1D7603] hover:text-white transition-colors duration-200"
              >
                <FiHeart className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Wishlist</div>
                  <div className="text-sm text-gray-500 hover:text-gray-200">Your saved items</div>
                </div>
              </Link>
              
              {/* Admin access for admin users */}
              {user.role === 'admin' && (
                <Link
                  to="/admin-panel"
                  onClick={onClose}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-[#1D7603] hover:text-white transition-colors duration-200"
                >
                  <FiShield className="w-5 h-5 mr-3" />
                  <div>
                    <div className="font-medium">Admin Panel</div>
                    <div className="text-sm text-gray-500 hover:text-gray-200">Manage the platform</div>
                  </div>
                </Link>
              )}
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-200"></div>
            
            {/* Logout */}
            <div className="py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              >
                <FiLogOut className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Sign Out</div>
                  <div className="text-sm text-gray-500">Logout from your account</div>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Guest user - Sign in options */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Sign In Options</h3>
            </div>
            
            {/* Menu Items */}
            <div className="py-2">
              {/* User Sign In */}
              <Link
                to="/login"
                onClick={onClose}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-[#1D7603] hover:text-white transition-colors duration-200"
              >
                <FiUser className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Sign in as User</div>
                  <div className="text-sm text-gray-500 hover:text-gray-200">Access your account and orders</div>
                </div>
              </Link>
              
              {/* Admin Sign In */}
              <Link
                to="/admin-login"
                onClick={onClose}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-600 hover:text-white transition-colors duration-200"
              >
                <FiShield className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Sign in as Admin</div>
                  <div className="text-sm text-gray-500 hover:text-gray-200">Manage products and orders</div>
                </div>
              </Link>
            </div>
            
            {/* Divider */}
            <div className="border-t border-gray-200"></div>
            
            {/* Additional Options */}
            <div className="py-2">
              <Link
                to="/registration"
                onClick={onClose}
                className="flex items-center px-4 py-3 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200"
              >
                <FiSettings className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Create Account</div>
                  <div className="text-sm text-gray-500">New to AgriBasket? Sign up</div>
                </div>
              </Link>
            </div>
          </>
        )}
        
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Secure login powered by AgriBasket
          </p>
        </div>
      </div>
    </>
  );
};

export default ProfileDropdown;
