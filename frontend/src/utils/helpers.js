export const getStatusColor = (status) => {
  switch (status) {
    case 'in-stock':
      return 'bg-green-100 text-green-800';
    case 'low-stock':
      return 'bg-yellow-100 text-yellow-800';
    case 'out-of-stock':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getTransactionTypeColor = (type) => {
  return type === 'sale' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
};

export const formatCurrency = (amount) => {
  return `Tk ${new Intl.NumberFormat('en-US').format(amount)}`;
};
