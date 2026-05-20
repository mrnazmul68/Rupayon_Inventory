import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Card } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { getProducts } from '../services/product.api';
import { getStatusColor } from '../utils/helpers';

export const Inventory = () => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { data: products, isLoading } = useQuery('products', getProducts);

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
      
      <Card className="p-6">
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
            {products?.data?.map((product) => (
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
