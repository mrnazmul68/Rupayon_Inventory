import React from 'react';
import { Card } from '../components/ui/Card';
import { SalesChart } from '../components/charts/SalesChart';
import { ProductChart } from '../components/charts/ProductChart';

export const Reports = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Analytics</h3>
          <SalesChart />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Distribution</h3>
          <ProductChart />
        </Card>
      </div>
    </div>
  );
};
