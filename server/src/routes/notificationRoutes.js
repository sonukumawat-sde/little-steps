import { Router } from "express";
import { getMyNotifications, markRead, unreadCount } from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", getMyNotifications);
router.get("/unread-count", unreadCount);
router.put("/mark-read", markRead);

export default router;
