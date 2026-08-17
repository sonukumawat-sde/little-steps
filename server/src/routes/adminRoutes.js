import { Router } from "express";
import {
  listPendingUsers, listAllUsers, setUserStatus,
  listPendingCenters, listAllCenters, setCenterVerification,
  analytics, allBookings,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();
router.use(protect, authorize("admin"));

router.get("/users/pending", listPendingUsers);
router.get("/users/all", listAllUsers);
router.put("/users/:id/status", setUserStatus);
router.get("/centers/pending", listPendingCenters);
router.get("/centers/all", listAllCenters);
router.put("/centers/:id/verify", setCenterVerification);
router.get("/analytics", analytics);
router.get("/bookings", allBookings);

export default router;
