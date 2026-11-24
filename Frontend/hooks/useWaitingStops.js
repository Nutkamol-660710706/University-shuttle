import { useCallback, useEffect, useState } from "react";
import {
  deleteMyWaitingStop,
  getMyWaitingStop,
  getWaitingStopCounts,
  saveMyWaitingStop,
} from "../api/waiting.js";

export function useWaitingStops(userId) {
  const [waitingCounts, setWaitingCounts] = useState({});
  const [waitingStopNumber, setWaitingStopNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadWaitingData() {
      try {
        const [counts, currentWaiting] = await Promise.all([
          getWaitingStopCounts(),
          userId ? getMyWaitingStop() : Promise.resolve({ stopNumber: null }),
        ]);
        if (!active) return;
        setWaitingCounts(
          Object.fromEntries(
            counts.map(({ stopNumber, waitingCount }) => [
              stopNumber,
              waitingCount,
            ]),
          ),
        );
        setWaitingStopNumber(currentWaiting.stopNumber);
        setError("");
      } catch (loadError) {
        if (!active) return;
        console.error("Unable to load waiting stop data:", loadError);
        setError(loadError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    setIsLoading(true);
    loadWaitingData();
    const intervalId = window.setInterval(loadWaitingData, 30_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [reloadCount, userId]);

  const toggleWaitingAtStop = useCallback(
    async (stopNumber) => {
      setIsUpdating(true);
      try {
        if (waitingStopNumber === stopNumber) {
          await deleteMyWaitingStop();
        } else {
          await saveMyWaitingStop(stopNumber);
        }
        setReloadCount((count) => count + 1);
      } finally {
        setIsUpdating(false);
      }
    },
    [waitingStopNumber],
  );

  const reload = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  return {
    waitingCounts,
    waitingStopNumber,
    isLoading,
    isUpdating,
    error,
    toggleWaitingAtStop,
    reload,
  };
}
