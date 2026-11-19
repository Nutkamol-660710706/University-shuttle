import { Router } from "express";
import { getRoutes, getStops } from "../controllers/tramController.js";

const router = Router();

router.get("/stops", getStops);
router.get("/routes", getRoutes);

export default router;
