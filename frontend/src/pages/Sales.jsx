import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { getAllProducts, createSale } from '../services/product.api';
import { formatCurrency } from '../utils/helpers';
import { toast } from 'react-toastify';

export const Sales = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const queryClient = useQueryClient();

  const { data: products } = useQuery('allProducts', getAllProducts);

  const mutation = useMutation(createSale, {
    onSuccess: () => {
      queryClient.invalidateQueries('products');
      queryClient.invalidateQueries('transactions');
      toast.success('Sale recorded successfully');
      setSelectedProduct('');
      setQuantity('');
      setTotalPrice('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record sale');
    },
  });

  const product = products?.data?.find(p => p._id === selectedProduct);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantity || !totalPrice) return;
    mutation.mutate({ productId: selectedProduct, quantity: Number(quantity), totalPrice: Number(totalPrice) });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
      
      <Card className="p-6 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Select Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a product</option>
              {products?.data?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Stock: {p.stockQuantity})
                </option>
              ))}
            </select>
          </div>
          {product && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No img</span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">Stock: {product.stockQuantity}</p>
              </div>
            </div>
          )}
          <Input
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            required
          />
          <Input
            label="Total Amount"
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
            min="0"
            required
          />
          <Button type="submit" className="w-full" disabled={mutation.isLoading}>
            {mutation.isLoading ? 'Processing...' : 'Record Sale'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
