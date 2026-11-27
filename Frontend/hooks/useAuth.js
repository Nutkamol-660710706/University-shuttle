import { useCallback, useEffect, useState } from "react";
import * as authApi from "../api/auth.js";
import * as driverApi from "../api/driver.js";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    authApi
      .getCurrentUser()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch((error) => {
        console.error("Unable to load current user:", error);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (credentials) => {
    if (
      typeof credentials?.username === "string" &&
      credentials.username.trim().toLowerCase() === "driver1"
    ) {
      await driverApi.loginDriver(credentials);
      window.location.replace("/driver");
      return null;
    }

    const result = await authApi.login(credentials);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(async (details) => {
    const result = await authApi.register(details);
    setUser(result.user);
    return result.user;
  }, []);

  const signOut = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    signIn,
    signOut,
    register,
    startPasswordReset: authApi.startPasswordReset,
    verifyPasswordReset: authApi.verifyPasswordReset,
  };
}
