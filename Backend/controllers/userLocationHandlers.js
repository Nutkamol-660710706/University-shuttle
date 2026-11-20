import { createAuthHandler } from "./auth/authHandler.js";
import {
  getMyLocation,
  removeMyLocation,
  updateMyLocation,
} from "./userLocationController.js";

export const userLocationHandlers = {
  get: createAuthHandler("GET", getMyLocation),
  update: createAuthHandler("PUT", updateMyLocation),
  remove: createAuthHandler("DELETE", removeMyLocation),
};
