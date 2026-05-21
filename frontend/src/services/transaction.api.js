import api from './api';

export const getTransactions = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const response = await api.get('/transactions', {
    params: { page, limit, search }
  });
  return response.data;
};

export const getAllTransactions = async () => {
  const response = await api.get('/transactions/all');
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};
