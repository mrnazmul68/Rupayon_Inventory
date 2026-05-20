import express from "express";
import { getUsers, updateUser, deleteUser, approveUser, rejectUser } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getUsers);
router.put("/:id", protect, authorize("admin"), updateUser);
router.delete("/:id", protect, authorize("admin"), deleteUser);
router.put("/:id/approve", protect, authorize("admin"), approveUser);
router.put("/:id/reject", protect, authorize("admin"), rejectUser);

export default router;
