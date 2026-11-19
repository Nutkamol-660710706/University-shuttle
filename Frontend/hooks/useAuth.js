import { useCallback, useEffect, useState } from "react";
import * as authApi from "../api/auth.js";

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
    const result = await authApi.login(credentials);
    setUser(result.user);
    return result.user;
  }, []);

  const completeRegistration = useCallback(async (details) => {
    const result = await authApi.verifyRegistration(details);
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
    startRegistration: authApi.startRegistration,
    completeRegistration,
    startPasswordReset: authApi.startPasswordReset,
    verifyPasswordReset: authApi.verifyPasswordReset,
  };
}
