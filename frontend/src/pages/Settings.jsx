import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/users.api';
import { toast } from 'react-toastify';

export const Settings = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const updateProfileMutation = useMutation(updateProfile, {
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      setUser(data.data);
      queryClient.invalidateQueries('notifications');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const changePasswordMutation = useMutation(changePassword, {
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, email });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword, confirmPassword });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      
      <div className="max-w-2xl space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input 
              label="Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name" 
            />
            <Input 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com" 
            />
            <Button type="submit" disabled={updateProfileMutation.isLoading}>
              {updateProfileMutation.isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input 
              label="Current Password" 
              type="password" 
              placeholder="••••••••" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input 
              label="New Password" 
              type="password" 
              placeholder="••••••••" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input 
              label="Confirm New Password" 
              type="password" 
              placeholder="••••••••" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" disabled={changePasswordMutation.isLoading}>
              {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
