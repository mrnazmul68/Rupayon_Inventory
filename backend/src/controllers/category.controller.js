import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Category from "../models/category.model.js";
import cloudinary from "../config/cloudinary.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  const categoryData = { name };
  
  if (req.file) {
    categoryData.image = req.file.path;
  }
  
  const category = await Category.create(categoryData);
  
  res.status(201).json(new ApiResponse(201, category, "Category created successfully"));
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  
  res.status(200).json(new ApiResponse(200, categories, "Categories retrieved successfully"));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const updateData = { name };
  
  if (req.file) {
    const oldCategory = await Category.findById(req.params.id);
    if (oldCategory && oldCategory.image) {
      const publicId = oldCategory.image.split("/").pop().split(".")[0];
      const folder = "inventory-products";
      await cloudinary.uploader.destroy(`${folder}/${publicId}`);
    }
    updateData.image = req.file.path;
  }
  
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );
  
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  
  res.status(200).json(new ApiResponse(200, category, "Category updated successfully"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  
  if (!category) {
    throw new ApiError(404, "Category not found");
  }
  
  if (category.image) {
    const publicId = category.image.split("/").pop().split(".")[0];
    const folder = "inventory-products";
    await cloudinary.uploader.destroy(`${folder}/${publicId}`);
  }
  
  res.status(200).json(new ApiResponse(200, null, "Category deleted successfully"));
});
