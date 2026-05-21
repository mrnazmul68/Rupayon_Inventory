import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { createNotification } from "./notification.controller.js";

export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const skip = (page - 1) * limit;
  
  const query = search 
    ? { 
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      } 
    : {};
  
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await User.countDocuments(query);
  
  res.status(200).json(new ApiResponse(200, {
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }, "Users retrieved successfully"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  
  await createNotification(
    'user_updated',
    `${req.user.name} updated user: ${user.name}`,
    { userId: user._id, userName: user.name }
  );
  
  res.status(200).json(new ApiResponse(200, user, "User updated successfully"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  await User.findByIdAndDelete(req.params.id);
  
  await createNotification(
    'user_deleted',
    `${req.user.name} deleted user: ${user.name}`,
    { userId: user._id, userName: user.name }
  );
  
  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

export const approveUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: "approved" }, {
    new: true,
    runValidators: true,
  });
  
  await createNotification(
    'user_approved',
    `${req.user.name} approved user: ${user.name}`,
    { userId: user._id, userName: user.name }
  );
  
  res.status(200).json(new ApiResponse(200, user, "User approved successfully"));
});

export const rejectUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: "rejected" }, {
    new: true,
    runValidators: true,
  });
  
  await createNotification(
    'user_rejected',
    `${req.user.name} rejected user: ${user.name}`,
    { userId: user._id, userName: user.name }
  );
  
  res.status(200).json(new ApiResponse(200, user, "User rejected successfully"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }
  }

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  await createNotification(
    'user_updated',
    `${user.name} updated their profile`,
    { userId: user._id, userName: user.name }
  );

  res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'New passwords do not match');
  }

  user.password = newPassword;
  await user.save();

  await createNotification(
    'user_updated',
    `${user.name} changed their password`,
    { userId: user._id, userName: user.name }
  );

  res.status(200).json(new ApiResponse(200, null, "Password changed successfully"));
});
