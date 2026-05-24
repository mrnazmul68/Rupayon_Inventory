import Product from "../models/product.model.js";
import Transaction from "../models/transaction.model.js";
import ApiError from "../utils/ApiError.js";

export const createSale = async (saleData, user) => {
  const { productId, quantity, totalPrice } = saleData;
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.stockQuantity < quantity) {
    throw new ApiError(400, "Insufficient stock");
  }

  product.stockQuantity -= quantity;
  await product.save();

  const transaction = await Transaction.create({
    productId,
    productName: product.name,
    category: product.category,
    type: "sale",
    quantity,
    totalPrice,
    performedBy: user._id,
    performedByName: user.name,
  });

  return transaction;
};

export const createPurchase = async (purchaseData, user) => {
  const { productId, quantity, supplier, totalPrice } = purchaseData;
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  product.stockQuantity += quantity;
  await product.save();

  const transaction = await Transaction.create({
    productId,
    productName: product.name,
    category: product.category,
    type: "purchase",
    quantity,
    totalPrice,
    performedBy: user._id,
    performedByName: user.name,
    supplier,
  });

  return transaction;
};

export const getStockStats = async () => {
  const products = await Product.find();
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const lowStock = products.filter((p) => p.status === "low-stock").length;
  const outOfStock = products.filter((p) => p.status === "out-of-stock").length;

  return {
    totalProducts,
    totalStock,
    lowStock,
    outOfStock,
  };
};
