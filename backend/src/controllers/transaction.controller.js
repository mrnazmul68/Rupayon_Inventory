import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Transaction from "../models/transaction.model.js";

export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find()
    .sort({ createdAt: -1 })
    .populate("productId", "name price image")
    .populate("performedBy", "name email");
  res.status(200).json(new ApiResponse(200, transactions, "Transactions retrieved successfully"));
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  await Transaction.findByIdAndDelete(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Transaction deleted successfully"));
});
