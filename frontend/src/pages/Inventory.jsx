import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Card } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import { getProducts } from '../services/product.api';
import { getStatusColor } from '../utils/helpers';
import { useSearch } from '../components/layout/DashboardLayout';

export const Inventory = () => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { searchQuery } = useSearch();
  
  const { data: products, isLoading } = useQuery(
    ['inventory', currentPage, searchQuery],
    () => getProducts({ page: currentPage, limit: 10, search: searchQuery }),
    {
      keepPreviousData: true,
      onSuccess: () => setCurrentPage(1)
    }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <Card className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
      
      <Card className="p-4 md:p-6">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Image</TableHeader>
                <TableHeader>Product</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Stock</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Last Updated</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {products?.data?.data?.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedImage(product.image);
                          setImageModalOpen(true);
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No img</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stockQuantity}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(product.updatedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {products?.data?.data?.map((product) => (
            <Card key={product._id} className="p-4 space-y-3">
              <div className="flex gap-3 items-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover cursor-pointer"
                    onClick={() => {
                      setSelectedImage(product.image);
                      setImageModalOpen(true);
                    }}
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No img</span>
                  </div>
                )}

                <div>
                  <h2 className="font-semibold">{product.name}</h2>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Stock</span>
                  <span className="font-medium text-gray-900">{product.stockQuantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium text-gray-900">{new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {products?.data?.pagination?.pages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={products.data.pagination.pages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

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
