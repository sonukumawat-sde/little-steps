import { Router } from "express";
import {
  searchCenters,
  getCenter,
  createCenter,
  updateCenter,
  myCenters,
} from "../controllers/centerController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

// Public
router.get("/", searchCenters);

// Provider-owned (must come before /:id)
router.get("/mine/list", protect, authorize("provider", "admin"), myCenters);
router.post("/", protect, authorize("provider", "admin"), createCenter);
router.put("/:id", protect, authorize("provider", "admin"), updateCenter);

router.get("/:id", getCenter);

export default router;
