import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, "User already exists");
  }

  const userCount = await User.countDocuments();
  const isFirstUser = userCount === 0;

  const user = await User.create({
    name,
    email,
    password,
    role: isFirstUser ? "admin" : (role || "employee"),
    status: isFirstUser ? "approved" : "pending",
  });

  return user;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  return user;
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return user;
};
