import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as productService from "../services/product.service.js";
import * as stockService from "../services/stock.service.js";
import cloudinary from "../config/cloudinary.js";

export const getProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts();
  res.status(200).json(new ApiResponse(200, products, "Products retrieved successfully"));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json(new ApiResponse(200, product, "Product retrieved successfully"));
});

export const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body };
  if (req.file) {
    productData.image = req.file.path;
  }
  const product = await productService.createProduct(productData);
  res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body };
  if (req.file) {
    // Get old product to delete old image
    const oldProduct = await productService.getProductById(req.params.id);
    if (oldProduct && oldProduct.image) {
      const publicId = oldProduct.image.split("/").pop().split(".")[0];
      const folder = "inventory-products";
      await cloudinary.uploader.destroy(`${folder}/${publicId}`);
    }
    productData.image = req.file.path;
  }
  const product = await productService.updateProduct(req.params.id, productData);
  res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  if (product && product.image) {
    // Extract public ID from Cloudinary URL
    const publicId = product.image.split("/").pop().split(".")[0];
    const folder = "inventory-products";
    await cloudinary.uploader.destroy(`${folder}/${publicId}`);
  }
  await productService.deleteProduct(req.params.id);
  res.status(200).json(new ApiResponse(200, null, "Product deleted successfully"));
});

export const createSale = asyncHandler(async (req, res) => {
  const transaction = await stockService.createSale(req.body, req.user);
  res.status(201).json(new ApiResponse(201, transaction, "Sale recorded successfully"));
});

export const createPurchase = asyncHandler(async (req, res) => {
  const transaction = await stockService.createPurchase(req.body, req.user);
  res.status(201).json(new ApiResponse(201, transaction, "Purchase recorded successfully"));
});

export const getStockStats = asyncHandler(async (req, res) => {
  const stats = await stockService.getStockStats();
  res.status(200).json(new ApiResponse(200, stats, "Stock stats retrieved successfully"));
});
