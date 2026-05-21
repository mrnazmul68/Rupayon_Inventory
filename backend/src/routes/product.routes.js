import express from "express";
import {
  getAllProducts,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createSale,
  createPurchase,
  getStockStats,
} from "../controllers/product.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.get("/all", protect, getAllProducts);
router.get("/", protect, getProducts);
router.get("/stats", protect, getStockStats);
router.get("/:id", protect, getProduct);
router.post("/", protect, authorize("admin", "manager"), upload.single("image"), createProduct);
router.put("/:id", protect, authorize("admin", "manager"), upload.single("image"), updateProduct);
router.delete("/:id", protect, authorize("admin", "manager"), deleteProduct);
router.post("/sales", protect, createSale);
router.post("/purchases", protect, authorize("admin", "manager"), createPurchase);

export default router;
