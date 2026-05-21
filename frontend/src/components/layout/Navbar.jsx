import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between gap-4">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 text-gray-500 hover:text-gray-700"
      >
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <button className="relative p-2 text-gray-500 hover:text-gray-700">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );
};
