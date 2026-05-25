import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';
import { Pagination } from '../components/ui/Pagination';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Input } from '../components/ui/Input';
import { ImageCropper } from '../components/ui/ImageCropper';
import { getProducts, deleteProduct, updateProduct } from '../services/product.api';
import { getCategories } from '../services/category.api';
import { getStatusColor } from '../utils/helpers';
import { Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSearch } from '../components/layout/DashboardLayout';

export const Products = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  const queryClient = useQueryClient();
  const { searchQuery } = useSearch();
  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);
  
  const { data: products, isLoading } = useQuery(
    ['products', currentPage, searchQuery, selectedCategory],
    () => getProducts({ page: currentPage, limit: 10, search: searchQuery, category: selectedCategory }),
    {
      keepPreviousData: true
    }
  );
  
  const { data: categories } = useQuery('categories', getCategories);

  const deleteMutation = useMutation(deleteProduct, {
    onSuccess: () => {
      queryClient.invalidateQueries(['products', currentPage, searchQuery, selectedCategory]);
      setConfirmModalOpen(false);
      setDeletingProductId(null);
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
        queryClient.invalidateQueries(['products', currentPage, searchQuery, selectedCategory]);
        setEditModalOpen(false);
        setEditImageFile(null);
        toast.success('Product updated successfully');
      },
      onError: () => {
        toast.error('Failed to update product');
      },
    }
  );

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditImageFile(null);
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', editingProduct.name);
    formData.append('category', editingProduct.category);
    formData.append('stockQuantity', editingProduct.stockQuantity);
    formData.append('supplier', editingProduct.supplier || '');
    
    if (editImageFile) {
      formData.append('image', editImageFile);
    } else if (editingProduct.image === '') {
      formData.append('image', '');
    }
    
    updateMutation.mutate({ id: editingProduct._id, data: formData });
  };
  
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempImage(URL.createObjectURL(file));
      setShowCropper(true);
    }
  };
  
  const handleEditCropComplete = (croppedFile) => {
    setEditImageFile(croppedFile);
    setShowCropper(false);
    setTempImage(null);
  };

  const handleDelete = (id) => {
    setDeletingProductId(id);
    setConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingProductId) {
      deleteMutation.mutate(deletingProductId);
    }
  };

  if (isLoading && !products) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card className="p-4 md:p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 md:gap-4">
                <Skeleton className="w-12 h-12 rounded-lg hidden sm:block" />
                <Skeleton className="h-4 w-28 sm:w-32" />
                <Skeleton className="h-4 w-24 hidden md:block" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12 hidden sm:block" />
                <Skeleton className="h-6 w-20 rounded-full hidden md:block" />
                <div className="flex gap-1 sm:gap-2">
                  <Skeleton className="w-8 h-8 rounded-md" />
                  <Skeleton className="w-8 h-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/add-product" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>
      
      {categories?.data?.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button
            variant={selectedCategory === '' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSearchParams({})}
          >
            All
          </Button>
          {categories?.data?.map((category) => (
            <Button
              key={category._id}
              variant={selectedCategory === category.name ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSearchParams({ category: category.name })}
            >
              {category.name}
            </Button>
          ))}
        </div>
      )}
      
      <Card className="p-4 md:p-6 relative overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block transition-all duration-300">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Image</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Stock</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
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
                        loading="lazy"
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
                  <TableCell className="font-medium max-w-[220px] truncate">{product.name}</TableCell>
                  <TableCell className="max-w-[180px] truncate">{product.category}</TableCell>
                  <TableCell>{product.stockQuantity}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4 transition-all duration-300">
          {products?.data?.data?.map((product) => (
            <Card key={product._id} className="p-4 space-y-3">
              <div className="flex gap-3 items-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
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

                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold break-words">{product.name}</h2>
                  <p className="text-sm text-gray-500 break-words">{product.category}</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Stock</span>
                  <span className="font-medium text-gray-900">{product.stockQuantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Status</span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                <Button variant="secondary" size="sm" onClick={() => handleEdit(product)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(product._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {products?.data?.pagination?.pages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={products.data.pagination.pages}
            onPageChange={setCurrentPage}
            isLoading={isLoading}
          />
        )}
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
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories?.data?.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Product Image</label>
              {editImageFile || editingProduct.image ? (
                <div className="flex items-center gap-4">
                  <img
                    src={editImageFile ? URL.createObjectURL(editImageFile) : editingProduct.image}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditImageFile(null);
                      setEditingProduct({ ...editingProduct, image: '' });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <div className="text-center">
                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleEditImageChange}
                  />
                </label>
              )}
            </div>
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

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setDeletingProductId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
        confirmText={deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
        confirmVariant="danger"
        isLoading={deleteMutation.isLoading}
      />
      
      {showCropper && tempImage && (
        <ImageCropper
          image={tempImage}
          onCancel={() => {
            setShowCropper(false);
            setTempImage(null);
          }}
          onCropComplete={handleEditCropComplete}
          aspect={1}
        />
      )}
    </div>
  );
};
