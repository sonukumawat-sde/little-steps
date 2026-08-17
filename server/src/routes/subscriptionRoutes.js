import { Router } from "express";
import {
  createSubscription,
  mySubscriptions,
  cancelSubscription,
} from "../controllers/subscriptionController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();
router.post("/", protect, authorize("parent"), createSubscription);
router.get("/mine", protect, authorize("parent"), mySubscriptions);
router.put("/:id/cancel", protect, authorize("parent"), cancelSubscription);

export default router;
