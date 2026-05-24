import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/", protect, authorize("admin"), upload.single("image"), createCategory);
router.get("/", getAllCategories);
router.put("/:id", protect, authorize("admin"), upload.single("image"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

export default router;
