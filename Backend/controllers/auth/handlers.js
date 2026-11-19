import { createAuthHandler } from "./authHandler.js";
import { register } from "./registrationController.js";
import {
  getCurrentUser,
  login,
  logout,
} from "./sessionController.js";
import {
  startPasswordReset,
  verifyPasswordReset,
} from "./passwordResetController.js";

export const authHandlers = {
  register: createAuthHandler("POST", register),
  login: createAuthHandler("POST", login),
  currentUser: createAuthHandler("GET", getCurrentUser),
  logout: createAuthHandler("POST", logout),
  startPasswordReset: createAuthHandler("POST", startPasswordReset),
  verifyPasswordReset: createAuthHandler("POST", verifyPasswordReset),
};
