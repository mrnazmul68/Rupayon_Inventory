import express from "express";
import { getTransactions, deleteTransaction } from "../controllers/transaction.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", protect, getTransactions);
router.delete("/:id", protect, authorize("admin"), deleteTransaction);

export default router;
