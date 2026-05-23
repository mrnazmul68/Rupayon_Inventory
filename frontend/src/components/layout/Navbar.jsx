import React, { useEffect, useRef } from 'react';
import { Bell, Search, Menu, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from './DashboardLayout';
import { markAsRead, markAllAsRead } from '../../services/notification.api';
import { useMutation, useQueryClient } from 'react-query';
import { formatDate } from '../../utils/formatDate';

export const Navbar = ({ onMenuClick, searchQuery, onSearchChange }) => {
  const { user } = useAuth();
  const { 
    notificationsData, 
    unreadCount, 
    notificationsOpen, 
    setNotificationsOpen, 
    refreshNotifications 
  } = useNotification();
  const queryClient = useQueryClient();
  const dropdownRef = useRef(null);

  const markAsReadMutation = useMutation(markAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
    },
  });

  const markAllAsReadMutation = useMutation(markAllAsRead, {
    onSuccess: () => {
      queryClient.invalidateQueries('notifications');
    },
  });

  const handleNotificationClick = (notification) => {
    if (!notification.readBy.includes(user._id)) {
      markAsReadMutation.mutate(notification._id);
    }
    setNotificationsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setNotificationsOpen]);

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
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
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            className="relative p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    disabled={markAllAsReadMutation.isLoading}
                  >
                    {markAllAsReadMutation.isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Mark all as read'
                    )}
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notificationsData?.data?.data?.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No notifications yet
                  </div>
                ) : (
                  notificationsData?.data?.data?.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        !notification.readBy.includes(user._id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        {!notification.readBy.includes(user._id) && markAsReadMutation.isLoading && markAsReadMutation.variables === notification._id && (
                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
