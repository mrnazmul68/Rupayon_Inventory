import React from 'react';
import { useQuery } from 'react-query';
import { Card } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';
import { SalesChart } from '../components/charts/SalesChart';
import { ProductChart } from '../components/charts/ProductChart';
import { getDailyStats } from '../services/transaction.api';
import { getStockStats, getAllProducts } from '../services/product.api';
import { getAllTransactions } from '../services/transaction.api';
import { formatCurrency } from '../utils/helpers';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

export const Reports = () => {
  const { data: dailyStats, isLoading: dailyStatsLoading } = useQuery('dailyStats', getDailyStats);
  const { data: products, isLoading: productsLoading } = useQuery('allProducts', getAllProducts);
  const { data: transactions, isLoading: transactionsLoading } = useQuery('allTransactions', getAllTransactions);
  
  const isLoading = dailyStatsLoading || productsLoading || transactionsLoading;

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
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Analytics</h3>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <SalesChart data={dailySalesData} />
          )}
        </Card>
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Distribution</h3>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ProductChart data={categoryData} />
          )}
        </Card>
      </div>

      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales, Purchases & Revenue</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32 hidden md:block" />
                <Skeleton className="h-4 w-32 hidden md:block" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : dailyStats?.data?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No daily data available yet
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Date</TableHeader>
                    <TableHeader>Total Sales</TableHeader>
                    <TableHeader>Total Purchases</TableHeader>
                    <TableHeader>Total Revenue</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dailyStats?.data?.map((stat) => (
                    <TableRow key={stat.date}>
                      <TableCell className="font-medium">{formatDate(stat.date)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(stat.totalSales)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(stat.totalPurchases)}</TableCell>
                      <TableCell className="text-purple-600 font-semibold">{formatCurrency(stat.totalRevenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {dailyStats?.data?.map((stat) => (
                <Card key={stat.date} className="p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">{formatDate(stat.date)}</h4>
                  <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-gray-100 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs">Total Sales</span>
                      <span className="font-medium text-red-600">{formatCurrency(stat.totalSales)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Total Purchases</span>
                      <span className="font-medium text-green-600">{formatCurrency(stat.totalPurchases)}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 block text-xs">Total Revenue</span>
                      <span className="font-semibold text-purple-600">{formatCurrency(stat.totalRevenue)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
