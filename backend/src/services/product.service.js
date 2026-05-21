import Product from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";

export const getAllProducts = async (query = {}, skip = 0, limit = 10) => {
  const queryBuilder = Product.find(query).sort({ createdAt: -1 });
  
  if (skip > 0) queryBuilder.skip(skip);
  if (limit > 0) queryBuilder.limit(limit);
  
  return await queryBuilder;
};

export const countProducts = async (query = {}) => {
  return await Product.countDocuments(query);
};

export const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  return product;
};

export const createProduct = async (productData) => {
  return await Product.create(productData);
};

export const updateProduct = async (id, productData) => {
  let product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  product = await Product.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true,
  });
  return product;
};

export const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }
  await Product.findByIdAndDelete(id);
};
