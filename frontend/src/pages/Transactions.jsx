import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Button } from '../components/ui/Button';
import { getTransactions, deleteTransaction } from '../services/transaction.api';
import { formatCurrency, getTransactionTypeColor } from '../utils/helpers';
import { formatDate } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Trash2 } from 'lucide-react';
import { useSearch } from '../components/layout/DashboardLayout';

export const Transactions = () => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { searchQuery } = useSearch();
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  const { data: transactions, isLoading, isFetching } = useQuery(
    ['transactions', currentPage, searchQuery],
    () => getTransactions({ page: currentPage, limit: 10, search: searchQuery }),
    {
      keepPreviousData: true
    }
  );

  const deleteMutation = useMutation(deleteTransaction, {
    onSuccess: () => {
      queryClient.invalidateQueries(['transactions', currentPage, searchQuery]);
      setConfirmModalOpen(false);
      setDeletingTransactionId(null);
      toast.success('Transaction deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete transaction');
    },
  });

  const handleDelete = (id) => {
    setDeletingTransactionId(id);
    setConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTransactionId) {
      deleteMutation.mutate(deletingTransactionId);
    }
  };

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    if (!transactions?.data?.data) {
      return {};
    }

    const grouped = {};

    transactions.data.data.forEach((transaction) => {
      const dateKey = new Date(transaction.createdAt).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });

    return grouped;
  }, [transactions?.data?.data]);
  
  const totals = transactions?.data?.totals || { totalSales: 0, totalPurchases: 0, totalRevenue: 0 };

  if (isLoading && !transactions) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        
        {/* Totals Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 md:p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))}
        </div>
        
        {/* Transactions Skeleton */}
        <Card className="p-4 md:p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 md:gap-4">
                <Skeleton className="w-12 h-12 rounded-lg hidden sm:block" />
                <Skeleton className="h-4 w-28 sm:w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-4 w-12 hidden sm:block" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24 hidden md:block" />
                <Skeleton className="h-4 w-20 hidden sm:block" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-4 md:p-6">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-xl md:text-2xl font-bold text-red-600 break-words">{formatCurrency(totals.totalSales)}</p>
        </Card>
        <Card className="p-4 md:p-6">
          <p className="text-sm text-gray-500">Total Purchases</p>
          <p className="text-xl md:text-2xl font-bold text-green-600 break-words">{formatCurrency(totals.totalPurchases)}</p>
        </Card>
        <Card className="p-4 md:p-6 sm:col-span-2 xl:col-span-1">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-xl md:text-2xl font-bold text-purple-600 break-words">{formatCurrency(totals.totalRevenue)}</p>
        </Card>
      </div>

      {/* Grouped Transactions */}
      <div className="relative">
        <div className="space-y-4 transition-all duration-300">
          {Object.entries(groupedTransactions).map(([dateKey, dateTransactions]) => (
            <Card key={dateKey} className="p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Image</TableHeader>
                      <TableHeader>Product</TableHeader>
                      <TableHeader>Category</TableHeader>
                      <TableHeader>Type</TableHeader>
                      <TableHeader>Quantity</TableHeader>
                      <TableHeader>Total</TableHeader>
                      <TableHeader>User</TableHeader>
                      <TableHeader>Date</TableHeader>
                      {currentUser?.role === 'admin' && <TableHeader>Actions</TableHeader>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dateTransactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>
                          {transaction.productId?.image ? (
                            <img
                            src={transaction.productId.image}
                            alt={transaction.productName}
                            loading="lazy"
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
                        <TableCell className="font-medium max-w-[180px] truncate">{transaction.productName}</TableCell>
                        <TableCell>
                          {transaction.category ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {transaction.category}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                            {transaction.type}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell>{formatCurrency(transaction.totalPrice)}</TableCell>
                        <TableCell className="max-w-[160px] truncate">{transaction.performedByName}</TableCell>
                        <TableCell>{formatDate(transaction.createdAt)}</TableCell>
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
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {dateTransactions.map((transaction) => (
                  <Card key={transaction._id} className="p-4 space-y-3">
                    <div className="flex gap-3 items-center">
                      {transaction.productId?.image ? (
                        <img
                        src={transaction.productId.image}
                        alt={transaction.productName}
                        loading="lazy"
                        className="w-14 h-14 rounded-lg object-cover cursor-pointer"
                        onClick={() => {
                          setSelectedImage(transaction.productId.image);
                          setImageModalOpen(true);
                        }}
                      />
                      ) : (
                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold break-words">{transaction.productName}</h2>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                            {transaction.type}
                          </span>
                          {transaction.category && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {transaction.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {currentUser?.role === 'admin' && (
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDelete(transaction._id)}
                          disabled={deleteMutation.isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 pt-2 border-t border-gray-100 text-sm">
                      <div>
                        <span className="text-gray-500 block text-xs">Quantity</span>
                        <span className="font-medium text-gray-900">{transaction.quantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Total</span>
                        <span className="font-bold text-gray-900">{formatCurrency(transaction.totalPrice)}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-gray-500 block text-xs">User</span>
                        <span className="font-medium text-gray-900 break-words">{transaction.performedByName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-xs">Date</span>
                        <span className="font-medium text-gray-900">{formatDate(transaction.createdAt)}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {transactions?.data?.pagination?.pages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={transactions.data.pagination.pages}
          onPageChange={setCurrentPage}
          isLoading={isFetching}
        />
      )}

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

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setDeletingTransactionId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction?"
        confirmText={deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
        confirmVariant="danger"
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};
