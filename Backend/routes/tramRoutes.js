import { Router } from "express";
import {
  getActiveTramTrips,
  getRoutes,
  getStops,
} from "../controllers/tramController.js";

const router = Router();

router.get("/stops", getStops);
router.get("/routes", getRoutes);
router.get("/trams/active-trips", getActiveTramTrips);

export default router;
