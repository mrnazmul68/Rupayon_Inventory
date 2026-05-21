import asyncHandler from "../middlewares/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import * as authService from "../services/auth.service.js";
import User from "../models/user.model.js";
import { createNotification } from "./notification.controller.js";

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  
  await createNotification(
    'user_created',
    `${user.name} registered for an account`,
    { userId: user._id, userName: user.name, userEmail: user.email }
  );
  
  const responseData = {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  };
  
  if (user.status === 'approved') {
    responseData.token = user.getSignedJwtToken();
  }

  res.status(201).json(
    new ApiResponse(201, responseData, user.status === 'approved' ? 'Account created successfully!' : 'Account created successfully. Please wait for admin approval.')
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUser(email, password);
  
  // Admins can always login
  if (user.role !== "admin") {
    // If user has no status (created before approval system), treat as approved
    if (user.status === "pending") {
      throw new ApiError(403, "Your account is pending admin approval");
    }
    
    if (user.status === "rejected") {
      throw new ApiError(403, "Your account has been rejected");
    }
  }
  
  const token = user.getSignedJwtToken();

  res.status(200).json(
    new ApiResponse(200, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || "approved",
      },
      token,
    }, "Login successful")
  );
});

export const getMe = asyncHandler(async (req, res) => {
  let user = await authService.getMe(req.user._id);
  // If user has no status, set it to approved
  if (!user.status) {
    user = await User.findByIdAndUpdate(user._id, { status: 'approved' }, { new: true });
  }
  res.status(200).json(new ApiResponse(200, user, "User retrieved successfully"));
});
