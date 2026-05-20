import React from 'react';
import { useQuery } from 'react-query';
import { Card } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';
import { SalesChart } from '../components/charts/SalesChart';
import { ProductChart } from '../components/charts/ProductChart';
import { getStockStats, getProducts } from '../services/product.api';
import { getTransactions } from '../services/transaction.api';
import { formatCurrency } from '../utils/helpers';
import { formatDate } from '../utils/formatDate';
import { Package, TrendingUp, AlertTriangle } from 'lucide-react';

export const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery('stockStats', getStockStats);
  const { data: products, isLoading: productsLoading } = useQuery('products', getProducts);
  const { data: transactions, isLoading: transactionsLoading } = useQuery('transactions', getTransactions);
  
  const isLoading = statsLoading || productsLoading || transactionsLoading;

  // Calculate total revenue for current month (only sales count as revenue)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const totalRevenue = transactions?.data?.reduce((sum, t) => {
    if (t.type === 'sale') {
      const transactionDate = new Date(t.createdAt);
      if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
        return sum + (t.totalPrice || 0);
      }
    }
    return sum;
  }, 0) || 0;

  // Prepare daily sales data for SalesChart
  const getDailySalesData = () => {
    if (!transactions?.data) return [];
    const dailyData = {};
    transactions.data.forEach((t) => {
      if (t.type === 'sale') {
        const date = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dailyData[date] = (dailyData[date] || 0) + (t.totalPrice || 0);
      }
    });
    return Object.entries(dailyData).map(([name, value]) => ({ name, value }));
  };

  // Prepare product category data for ProductChart
  const getCategoryData = () => {
    if (!products?.data) return [];
    const categoryData = {};
    products.data.forEach((p) => {
      const category = p.category || 'Other';
      categoryData[category] = (categoryData[category] || 0) + 1;
    });
    return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  };

  const dailySalesData = getDailySalesData();
  const categoryData = getCategoryData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats?.data?.totalProducts || 0}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Stock</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats?.data?.totalStock || 0}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{stats?.data?.lowStock || 0}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl md:text-2xl font-bold text-purple-600">৳</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <SalesChart data={dailySalesData} />
          )}
        </Card>
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ProductChart data={categoryData} />
          )}
        </Card>
      </div>

      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-12 hidden sm:block" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24 hidden md:block" />
                <Skeleton className="h-4 w-20 hidden sm:block" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Product</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader className="hidden sm:table-cell">Quantity</TableHeader>
                <TableHeader>Total</TableHeader>
                <TableHeader className="hidden md:table-cell">User</TableHeader>
                <TableHeader className="hidden sm:table-cell">Date</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions?.data?.slice(0, 5).map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell>{transaction.productName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'sale' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{transaction.quantity}</TableCell>
                  <TableCell>{formatCurrency(transaction.totalPrice)}</TableCell>
                  <TableCell className="hidden md:table-cell">{transaction.performedByName}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(transaction.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};
