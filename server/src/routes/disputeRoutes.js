import { Router } from "express";
import { raiseDispute, myDisputes, allDisputes, resolveDispute } from "../controllers/disputeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();
router.post("/", protect, authorize("parent"), raiseDispute);
router.get("/mine", protect, authorize("parent"), myDisputes);
router.get("/all", protect, authorize("admin"), allDisputes);
router.put("/:id/resolve", protect, authorize("admin"), resolveDispute);

export default router;
