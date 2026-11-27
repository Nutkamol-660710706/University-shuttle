import { useCallback, useEffect, useState } from "react";
import * as driverApi from "../api/driver.js";

export function useDriverAuth() {
  const [driver, setDriver] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    driverApi
      .getCurrentDriver()
      .then(({ driver: currentDriver }) => {
        if (active) setDriver(currentDriver);
      })
      .catch((loadError) => {
        if (active) {
          console.error("Unable to load current driver:", loadError);
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (credentials) => {
    setError("");
    try {
      const result = await driverApi.loginDriver(credentials);
      setDriver(result.driver);
      return result.driver;
    } catch (loginError) {
      setError(loginError.message);
      throw loginError;
    }
  }, []);

  const signOut = useCallback(async () => {
    await driverApi.logoutDriver();
    setDriver(null);
    setError("");
  }, []);

  return { driver, isLoading, error, signIn, signOut };
}
