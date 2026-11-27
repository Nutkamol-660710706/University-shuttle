import { useEffect, useRef, useState } from "react";
import { getActiveTramTrips } from "../api/tram.js";

export function useActiveTramTrips() {
  const [trips, setTrips] = useState([]);
  const [error, setError] = useState("");
  const loggedErrorRef = useRef("");

  useEffect(() => {
    let active = true;

    async function loadTrips() {
      try {
        const activeTrips = await getActiveTramTrips();
        if (!active) return;
        const receivedAt = performance.now();
        setTrips(activeTrips.map((trip) => ({ ...trip, receivedAt })));
        setError("");
        loggedErrorRef.current = "";
      } catch (loadError) {
        if (!active) return;
        if (loggedErrorRef.current !== loadError.message) {
          console.error("Unable to load active tram trips:", loadError);
          loggedErrorRef.current = loadError.message;
        }
        setError(loadError.message);
      }
    }

    void loadTrips();
    const intervalId = window.setInterval(() => void loadTrips(), 3000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return { trips, error };
}
