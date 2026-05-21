import api from './api';

export const getProducts = async ({ page = 1, limit = 10, search = '' } = {}) => {
  const response = await api.get('/products', {
    params: { page, limit, search }
  });
  return response.data;
};

export const getAllProducts = async () => {
  const response = await api.get('/products/all');
  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const createSale = async (saleData) => {
  const response = await api.post('/products/sales', saleData);
  return response.data;
};

export const createPurchase = async (purchaseData) => {
  const response = await api.post('/products/purchases', purchaseData);
  return response.data;
};

export const getStockStats = async () => {
  const response = await api.get('/products/stats');
  return response.data;
};
