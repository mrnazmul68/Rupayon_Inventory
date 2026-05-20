import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Card } from '../components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { getUsers, updateUser, deleteUser, approveUser, rejectUser } from '../services/users.api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Edit, Trash2, Check, X } from 'lucide-react';

export const Users = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users, isLoading } = useQuery('users', getUsers);

  const updateMutation = useMutation(
    ({ id, data }) => updateUser(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setEditModalOpen(false);
        toast.success('User updated successfully');
      },
      onError: () => {
        toast.error('Failed to update user');
      },
    }
  );

  const deleteMutation = useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      toast.success('User deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  const approveMutation = useMutation(approveUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      toast.success('User approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve user');
    },
  });

  const rejectMutation = useMutation(rejectUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      toast.success('User rejected successfully');
    },
    onError: () => {
      toast.error('Failed to reject user');
    },
  });

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditModalOpen(true);
  };

  const handleRoleChange = (newRole) => {
    setEditingUser({ ...editingUser, role: newRole });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate({ id: editingUser._id, data: { role: editingUser.role } });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleApprove = (id) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id) => {
    rejectMutation.mutate(id);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <Card className="p-6 mt-6">
          <p className="text-gray-500">You don't have permission to view this page.</p>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      
      <Card className="p-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.data?.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.role === 'manager' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status || 'approved')}`}>
                    {user.status || 'approved'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.status === 'pending' && (
                      <>
                        <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handleApprove(user._id)}
                          disabled={approveMutation.isLoading}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleReject(user._id)}
                          disabled={rejectMutation.isLoading}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleEdit(user)}
                      disabled={user._id === currentUser?._id}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(user._id)}
                      disabled={user._id === currentUser?._id}
                    >
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
        title="Edit User"
      >
        {editingUser && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="text-gray-900">{editingUser.name}</p>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{editingUser.email}</p>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select
                value={editingUser.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
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
    </div>
  );
};
