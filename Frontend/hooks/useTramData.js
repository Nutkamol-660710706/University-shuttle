import { useCallback, useEffect, useState } from "react";
import { getRoutes, getStops } from "../api/tram.js";

export function useTramData() {
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setIsLoading(true);
      setError("");

      try {
        const [stopData, routeData] = await Promise.all([
          getStops(controller.signal),
          getRoutes(controller.signal),
        ]);
        setStops(stopData);
        setRoutes(routeData);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          console.error("Unable to load tram data:", loadError);
          setError(loadError.message);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, [reloadCount]);

  const reload = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  return { stops, routes, isLoading, error, reload };
}
