import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { AddProduct } from './pages/AddProduct';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { Purchases } from './pages/Purchases';
import { Transactions } from './pages/Transactions';
import { Users } from './pages/Users';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <Navigate to="/" /> : children;
};

const AppRoutes = () => {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/add-product" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AddProduct />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/inventory" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Inventory />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/sales" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Sales />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/purchases" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Purchases />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Transactions />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </Router>
  );
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
};
