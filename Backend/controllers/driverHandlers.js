import { createAuthHandler } from "./auth/authHandler.js";
import {
  endCurrentDriverTrip,
  getCurrentDriver,
  getCurrentDriverTrip,
  loginDriver,
  logoutDriver,
  startCurrentDriverTrip,
} from "./driverController.js";

export const driverHandlers = {
  login: createAuthHandler("POST", loginDriver),
  currentDriver: createAuthHandler("GET", getCurrentDriver),
  logout: createAuthHandler("POST", logoutDriver),
  currentTrip: createAuthHandler("GET", getCurrentDriverTrip),
  startTrip: createAuthHandler("POST", startCurrentDriverTrip),
  endTrip: createAuthHandler("POST", endCurrentDriverTrip),
};
