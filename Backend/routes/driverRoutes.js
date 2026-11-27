import { Router } from "express";
import { driverHandlers } from "../controllers/driverHandlers.js";

const router = Router();

router.post("/driver/login", driverHandlers.login);
router.get("/driver/me", driverHandlers.currentDriver);
router.post("/driver/logout", driverHandlers.logout);
router.get("/driver/trip", driverHandlers.currentTrip);
router.post("/driver/trip/start", driverHandlers.startTrip);
router.post("/driver/trip/end", driverHandlers.endTrip);

export default router;
