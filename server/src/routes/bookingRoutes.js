import { Router } from "express";
import {
  createBooking,
  myBookings,
  providerBookings,
  updateBookingStatus,
  addFeedback,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, authorize("parent"), createBooking);
router.get("/mine", protect, authorize("parent"), myBookings);
router.post("/:id/feedback", protect, authorize("parent"), addFeedback);

router.get("/provider", protect, authorize("provider", "admin"), providerBookings);
router.put("/:id/status", protect, authorize("provider", "admin"), updateBookingStatus);

export default router;
