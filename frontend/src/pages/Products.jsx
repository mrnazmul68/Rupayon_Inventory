import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { getProducts, deleteProduct, updateProduct } from '../services/product.api';
import { getStatusColor, formatCurrency } from '../utils/helpers';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

export const Products = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: products, isLoading } = useQuery('products', getProducts);

  const deleteMutation = useMutation(deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      toast.success('Product deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => updateProduct(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        setEditModalOpen(false);
        toast.success('Product updated successfully');
      },
      onError: () => {
        toast.error('Failed to update product');
      },
    }
  );

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({ id: editingProduct._id, data: editingProduct });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/add-product">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>
      
      <Card className="p-4 md:p-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader className="hidden sm:table-cell">Image</TableHeader>
              <TableHeader>Name</TableHeader>
              <TableHeader className="hidden md:table-cell">Category</TableHeader>
              <TableHeader>Price</TableHeader>
              <TableHeader className="hidden sm:table-cell">Stock</TableHeader>
              <TableHeader className="hidden md:table-cell">Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.data?.map((product) => (
              <TableRow key={product._id}>
                <TableCell className="hidden sm:table-cell">
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
                <TableCell className="hidden md:table-cell">{product.category}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell className="hidden sm:table-cell">{product.stockQuantity}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 sm:gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(product)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(product._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Product"
      >
        {editingProduct && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Name"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              required
            />
            <Input
              label="Category"
              value={editingProduct.category}
              onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
              required
            />
            <Input
              label="Price"
              type="number"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
              required
            />
            <Input
              label="Stock Quantity"
              type="number"
              value={editingProduct.stockQuantity}
              onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
              required
            />
            <Input
              label="Supplier"
              value={editingProduct.supplier || ''}
              onChange={(e) => setEditingProduct({ ...editingProduct, supplier: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isLoading}>
                Save
              </Button>
            </div>
          </form>
        )}
      </Modal>

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
