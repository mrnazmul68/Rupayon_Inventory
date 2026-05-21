import api from './api';

export const getUsers = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const response = await api.get('/users', {
    params: { page, limit, search }
  });
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const approveUser = async (id) => {
  const response = await api.put(`/users/${id}/approve`);
  return response.data;
};

export const rejectUser = async (id) => {
  const response = await api.put(`/users/${id}/reject`);
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put('/users/change-password', passwordData);
  return response.data;
};
