import express from "express";
import { getAllTransactions, getTransactions, deleteTransaction, getDailyStats } from "../controllers/transaction.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/all", protect, getAllTransactions);
router.get("/daily-stats", protect, getDailyStats);
router.get("/", protect, getTransactions);
router.delete("/:id", protect, authorize("admin"), deleteTransaction);

export default router;
