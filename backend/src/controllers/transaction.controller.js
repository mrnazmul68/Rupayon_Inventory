import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Transaction from "../models/transaction.model.js";
import { createNotification } from "./notification.controller.js";

export const getAllTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .populate("productId", "name image")
    .populate("performedBy", "name email");
  
  res.status(200).json(new ApiResponse(200, transactions, "Transactions retrieved successfully"));
});

export const getTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;
  
  const query = search 
    ? { productName: { $regex: search, $options: 'i' } } 
    : {};
  
  const transactions = await Transaction.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("productId", "name image")
    .populate("performedBy", "name email");
  
  const total = await Transaction.countDocuments(query);
  
  const allTransactions = await Transaction.find(query);
  let totalSales = 0;
  let totalPurchases = 0;
  let totalRevenue = 0;
  
  allTransactions.forEach(transaction => {
    if (transaction.type === 'sale') {
      totalSales += transaction.totalPrice;
      totalRevenue += transaction.totalPrice;
    } else if (transaction.type === 'purchase') {
      totalPurchases += transaction.totalPrice;
    }
  });
  
  res.status(200).json(new ApiResponse(200, {
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    totals: {
      totalSales,
      totalPurchases,
      totalRevenue
    }
  }, "Transactions retrieved successfully"));
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  await Transaction.findByIdAndDelete(req.params.id);
  
  await createNotification(
    'transaction_deleted',
    `${req.user.name} deleted transaction for ${transaction.productName}`,
    { transactionId: transaction._id, productName: transaction.productName, type: transaction.type }
  );
  
  res.status(200).json(new ApiResponse(200, null, "Transaction deleted successfully"));
});

export const getDailyStats = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find().sort({ createdAt: 1 });
  
  const dailyStats = {};
  
  transactions.forEach(transaction => {
    const dateKey = new Date(transaction.createdAt).toISOString().split('T')[0];
    
    if (!dailyStats[dateKey]) {
      dailyStats[dateKey] = {
        date: dateKey,
        totalSales: 0,
        totalPurchases: 0,
        totalRevenue: 0
      };
    }
    
    if (transaction.type === 'sale') {
      dailyStats[dateKey].totalSales += transaction.totalPrice;
      dailyStats[dateKey].totalRevenue += transaction.totalPrice;
    } else if (transaction.type === 'purchase') {
      dailyStats[dateKey].totalPurchases += transaction.totalPrice;
    }
  });
  
  const statsArray = Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date));
  
  res.status(200).json(new ApiResponse(200, statsArray, "Daily stats retrieved successfully"));
});
