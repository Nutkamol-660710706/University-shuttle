import { Router } from "express";
import { userLocationHandlers } from "../controllers/userLocationHandlers.js";

const router = Router();

router.get("/me/location", userLocationHandlers.get);
router.put("/me/location", userLocationHandlers.update);
router.delete("/me/location", userLocationHandlers.remove);

export default router;
