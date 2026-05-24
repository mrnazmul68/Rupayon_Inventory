import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Warehouse,
  ShoppingCart,
  Truck,
  Repeat,
  Users,
  BarChart3,
  Settings,
  X,
  User,
  Layers,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Layers, label: 'Categories', path: '/categories' },
  { icon: Package, label: 'Products', path: '/products' },
  { icon: PlusCircle, label: 'Add Product', path: '/add-product' },
  { icon: Warehouse, label: 'Inventory', path: '/inventory' },
  { icon: ShoppingCart, label: 'Sales', path: '/sales' },
  { icon: Truck, label: 'Purchases', path: '/purchases' },
  { icon: Repeat, label: 'Transactions', path: '/transactions' },
  { icon: Users, label: 'Users', path: '/users' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${
          isOpen ? 'block' : 'hidden'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed md:sticky top-0 left-0 z-50 w-56 bg-white border-r border-gray-200 h-screen transform transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[tomato]">RUPAYON</h1>
            <p className="text-sm text-gray-500">Inventory Management</p>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="px-4 flex-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={logout} className="w-full">
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};
