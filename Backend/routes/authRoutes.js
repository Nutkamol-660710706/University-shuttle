import { Router } from "express";
import { authHandlers } from "../controllers/auth/handlers.js";

const router = Router();

router.post("/auth/register/start", authHandlers.startRegistration);
router.post("/auth/register/verify", authHandlers.verifyRegistration);
router.post("/auth/login", authHandlers.login);
router.get("/auth/me", authHandlers.currentUser);
router.post("/auth/logout", authHandlers.logout);
router.post("/auth/password-reset/start", authHandlers.startPasswordReset);
router.post("/auth/password-reset/verify", authHandlers.verifyPasswordReset);

export default router;
