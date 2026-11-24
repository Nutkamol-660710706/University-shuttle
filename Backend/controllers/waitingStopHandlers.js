import { createAuthHandler } from "./auth/authHandler.js";
import {
  getMyWaitingStop,
  removeMyWaitingStop,
  updateMyWaitingStop,
} from "./waitingStopController.js";

export const waitingStopHandlers = {
  get: createAuthHandler("GET", getMyWaitingStop),
  update: createAuthHandler("PUT", updateMyWaitingStop),
  remove: createAuthHandler("DELETE", removeMyWaitingStop),
};
