import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { ImageCropper } from '../components/ui/ImageCropper';
import { Plus, Edit, Trash2, Upload, Loader2 } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/category.api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export const Categories = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', image: '' });
  const [editCategory, setEditCategory] = useState({ name: '', image: '' });
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showNewCropper, setShowNewCropper] = useState(false);
  const [showEditCropper, setShowEditCropper] = useState(false);
  const [tempNewImage, setTempNewImage] = useState(null);
  const [tempEditImage, setTempEditImage] = useState(null);
  
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    getCategories
  );
  
  const createMutation = useMutation(createCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
      setCreateModalOpen(false);
      setNewCategory({ name: '', image: '' });
      toast.success('Category created successfully!');
    },
    onError: () => {
      toast.error('Failed to create category');
    },
  });
  
  const updateMutation = useMutation(
    (data) => {
      const { id, formData } = data;
      return updateCategory(id, formData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('categories');
        setEditModalOpen(false);
        setEditCategory({ name: '', image: '' });
        toast.success('Category updated successfully!');
      },
      onError: () => {
        toast.error('Failed to update category');
      },
    }
  );
  
  const deleteMutation = useMutation(deleteCategory, {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
      setConfirmModalOpen(false);
      setDeletingCategoryId(null);
      toast.success('Category deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete category');
    },
  });
  
  const handleNewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempNewImage(URL.createObjectURL(file));
      setShowNewCropper(true);
    }
  };
  
  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempEditImage(URL.createObjectURL(file));
      setShowEditCropper(true);
    }
  };
  
  const handleNewCropComplete = (croppedFile) => {
    setNewImageFile(croppedFile);
    setNewImagePreview(URL.createObjectURL(croppedFile));
    setShowNewCropper(false);
    setTempNewImage(null);
  };
  
  const handleEditCropComplete = (croppedFile) => {
    setEditImageFile(croppedFile);
    setEditImagePreview(URL.createObjectURL(croppedFile));
    setShowEditCropper(false);
    setTempEditImage(null);
  };
  
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', newCategory.name);
    if (newImageFile) {
      formDataToSend.append('image', newImageFile);
    }
    
    try {
      await createMutation.mutateAsync(formDataToSend);
      setNewCategory({ name: '', image: '' });
      setNewImageFile(null);
      setNewImagePreview('');
    } finally {
      setUploading(false);
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', editCategory.name);
    if (editImageFile) {
      formDataToSend.append('image', editImageFile);
    }
    
    try {
      await updateMutation.mutateAsync({ id: editCategory._id, formData: formDataToSend });
      setEditCategory({ name: '', image: '' });
      setEditImageFile(null);
      setEditImagePreview('');
    } finally {
      setUploading(false);
    }
  };
  
  const handleEdit = (category) => {
    setEditCategory(category);
    setEditImagePreview('');
    setEditImageFile(null);
    setEditModalOpen(true);
  };
  
  const handleDelete = (id) => {
    setDeletingCategoryId(id);
    setConfirmModalOpen(true);
  };
  
  const confirmDelete = () => {
    if (deletingCategoryId) {
      deleteMutation.mutate(deletingCategoryId);
    }
  };
  
  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category.name);
    navigate(`/products?category=${encodeURIComponent(category.name)}`);
  };
  
  if (categoriesLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-32 mb-2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        {user?.role === 'admin' && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.data?.map((category) => (
          <Card
            key={category._id}
            className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="relative">
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
                className="w-full h-56 object-cover"
              />
              {user?.role === 'admin' && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(category);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(category._id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 capitalize">{category.name}</h3>
            </div>
          </Card>
        ))}
      </div>
      
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Category"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category Image</label>
            {newImagePreview ? (
              <div className="flex items-center gap-4">
                <img
                  src={newImagePreview}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setNewImageFile(null);
                    setNewImagePreview('');
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleNewImageChange}
                />
              </label>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isLoading || uploading}>
              {(createMutation.isLoading || uploading) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </form>
      </Modal>
      
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Category"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={editCategory.name}
            onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category Image</label>
            {editImagePreview || editCategory.image ? (
              <div className="flex items-center gap-4">
                <img
                  src={editImagePreview || editCategory.image}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Remove button clicked');
                    setEditImageFile(null);
                    setEditImagePreview('');
                    setEditCategory({ ...editCategory, image: '' });
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isLoading || uploading}>
              {(updateMutation.isLoading || uploading) ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </div>
        </form>
      </Modal>
      
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false);
          setDeletingCategoryId(null);
        }}
        title="Delete Category"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to delete this category?</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setConfirmModalOpen(false);
                setDeletingCategoryId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
      
      {showNewCropper && tempNewImage && (
        <ImageCropper
          image={tempNewImage}
          onCancel={() => {
            setShowNewCropper(false);
            setTempNewImage(null);
          }}
          onCropComplete={handleNewCropComplete}
          aspect={4/3}
        />
      )}
      
      {showEditCropper && tempEditImage && (
        <ImageCropper
          image={tempEditImage}
          onCancel={() => {
            setShowEditCropper(false);
            setTempEditImage(null);
          }}
          onCropComplete={handleEditCropComplete}
          aspect={4/3}
        />
      )}
    </div>
  );
};
