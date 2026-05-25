import React, { useState, createContext, useContext } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { getNotifications } from '../../services/notification.api';

const SearchContext = createContext();
const NotificationContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a DashboardLayout');
  }
  return context;
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a DashboardLayout');
  }
  return context;
};

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notificationsData } = useQuery(
    'notifications',
    () => getNotifications({ limit: 20 }),
    {
      refetchInterval: 30000,
    }
  );

  const unreadCount = notificationsData?.data?.unreadCount || 0;

  const refreshNotifications = () => {
    queryClient.invalidateQueries('notifications');
  };

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <NotificationContext.Provider value={{ notificationsData, unreadCount, notificationsOpen, setNotificationsOpen, refreshNotifications }}>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="min-w-0 flex-1 flex flex-col">
            <Navbar 
              onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <main className="min-w-0 flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
          </div>
        </div>
      </NotificationContext.Provider>
    </SearchContext.Provider>
  );
};
