import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit, FiSettings } from 'react-icons/fi';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-[#1D7603] rounded-full flex items-center justify-center">
                <FiUser className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600 mt-1">{user.email}</p>
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Verified Account
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiUser className="w-5 h-5 mr-2 text-[#1D7603]" />
                Personal Information
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{user.firstName}</span>
                  <button className="text-[#1D7603] hover:text-[#155502]">
                    <FiEdit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-gray-900">{user.lastName}</span>
                  <button className="text-[#1D7603] hover:text-[#155502]">
                    <FiEdit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 flex items-center">
                    <FiPhone className="w-4 h-4 mr-2" />
                    {user.phone || 'Not provided'}
                  </span>
                  <button className="text-[#1D7603] hover:text-[#155502]">
                    <FiEdit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiMail className="w-5 h-5 mr-2 text-[#1D7603]" />
                Contact Information
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 flex items-center">
                    <FiMail className="w-4 h-4 mr-2" />
                    {user.email}
                  </span>
                  <span className="text-green-600 text-sm">✓ Verified</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 flex items-center">
                    <FiMapPin className="w-4 h-4 mr-2" />
                    {user.address || 'Not provided'}
                  </span>
                  <button className="text-[#1D7603] hover:text-[#155502]">
                    <FiEdit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiSettings className="w-5 h-5 mr-2 text-[#1D7603]" />
              Account Settings
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <FiSettings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-600">Update your password</p>
                  </div>
                </div>
                <FiEdit className="w-5 h-5 text-gray-400" />
              </button>
              
              <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <FiMail className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Email Preferences</h3>
                    <p className="text-sm text-gray-600">Manage notifications</p>
                  </div>
                </div>
                <FiEdit className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Account Activity</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#1D7603]">0</div>
                <div className="text-sm text-gray-600">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#1D7603]">0</div>
                <div className="text-sm text-gray-600">Wishlist Items</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-[#1D7603]">
                  {new Date(user.createdAt).toLocaleDateString() || 'Recently'}
                </div>
                <div className="text-sm text-gray-600">Member Since</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
