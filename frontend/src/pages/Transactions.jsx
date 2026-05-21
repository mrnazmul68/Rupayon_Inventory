import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { getTransactions, deleteTransaction } from '../services/transaction.api';
import { formatCurrency, getTransactionTypeColor } from '../utils/helpers';
import { formatDate } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';

export const Transactions = () => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: transactions, isLoading } = useQuery('transactions', getTransactions);

  const deleteMutation = useMutation(deleteTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries('transactions');
      toast.success('Transaction deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete transaction');
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id);
    }
  };

  // Group transactions by date and calculate totals
  const { groupedTransactions, totals } = useMemo(() => {
    if (!transactions?.data) {
      return { groupedTransactions: {}, totals: { totalSales: 0, totalPurchases: 0, totalRevenue: 0 } };
    }

    const grouped = {};
    let totalSales = 0;
    let totalPurchases = 0;
    let totalRevenue = 0;

    transactions.data.forEach((transaction) => {
      const dateKey = new Date(transaction.createdAt).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);

      if (transaction.type === 'sale') {
        totalSales += transaction.totalPrice;
        totalRevenue += transaction.totalPrice;
      } else {
        totalPurchases += transaction.totalPrice;
      }
    });

    return { groupedTransactions: grouped, totals: { totalSales, totalPurchases, totalRevenue } };
  }, [transactions?.data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        
        {/* Totals Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
        
        {/* Transactions Skeleton */}
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                {currentUser?.role === 'admin' && <Skeleton className="w-8 h-8 rounded-md" />}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
      
      {/* Totals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.totalSales)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-500">Total Purchases</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalPurchases)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(totals.totalRevenue)}</p>
        </Card>
      </div>

      {/* Grouped Transactions */}
      {Object.entries(groupedTransactions).map(([dateKey, dateTransactions]) => (
        <Card key={dateKey} className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="hidden sm:table-cell">Image</TableHeader>
                <TableHeader>Product</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader className="hidden md:table-cell">Quantity</TableHeader>
                <TableHeader>Total</TableHeader>
                <TableHeader className="hidden lg:table-cell">User</TableHeader>
                <TableHeader className="hidden sm:table-cell">Date</TableHeader>
                {currentUser?.role === 'admin' && <TableHeader>Actions</TableHeader>}
              </TableRow>
            </TableHead>
            <TableBody>
              {dateTransactions.map((transaction) => (
                <TableRow key={transaction._id}>
                  <TableCell className="hidden sm:table-cell">
                    {transaction.productId?.image ? (
                      <img
                        src={transaction.productId.image}
                        alt={transaction.productName}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedImage(transaction.productId.image);
                          setImageModalOpen(true);
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No img</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{transaction.productName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{transaction.quantity}</TableCell>
                  <TableCell>{formatCurrency(transaction.totalPrice)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{transaction.performedByName}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(transaction.createdAt)}</TableCell>
                  {currentUser?.role === 'admin' && (
                    <TableCell>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(transaction._id)}
                        disabled={deleteMutation.isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ))}

      <Modal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        title="Product Image"
      >
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Product"
            className="w-full h-auto rounded-lg"
          />
        )}
      </Modal>
    </div>
  );
};
