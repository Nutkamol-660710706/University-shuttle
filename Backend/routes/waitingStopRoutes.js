import { Router } from "express";
import { getWaitingStopCounts } from "../controllers/waitingStopController.js";
import { waitingStopHandlers } from "../controllers/waitingStopHandlers.js";

const router = Router();

router.get("/waiting", getWaitingStopCounts);
router.get("/me/waiting", waitingStopHandlers.get);
router.put("/me/waiting", waitingStopHandlers.update);
router.delete("/me/waiting", waitingStopHandlers.remove);

export default router;
