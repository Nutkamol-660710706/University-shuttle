import { useCallback, useEffect, useRef, useState } from "react";
import * as locationApi from "../api/location.js";

const locationSaveInterval = 30_000;

export function useUserLocation(userId) {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");
  const watchIdRef = useRef(null);
  const intervalIdRef = useRef(null);
  const latestPositionRef = useRef(null);
  const uploadInProgressRef = useRef(false);
  const lastUploadedTimestampRef = useRef(null);
  const firstPositionRef = useRef(true);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    latestPositionRef.current = null;
    setIsTracking(false);
  }, []);

  const uploadLatestPosition = useCallback(async () => {
    const position = latestPositionRef.current;
    if (
      !position ||
      uploadInProgressRef.current ||
      position.timestamp === lastUploadedTimestampRef.current ||
      Date.now() - position.receivedAt > locationSaveInterval
    ) {
      return;
    }

    uploadInProgressRef.current = true;
    try {
      const result = await locationApi.saveMyLocation({
        latitude: position.latitude,
        longitude: position.longitude,
        accuracyMeters: position.accuracyMeters,
      });
      lastUploadedTimestampRef.current = position.timestamp;
      setLocation(result.location);
      setError("");
    } catch (saveError) {
      console.error("Unable to save user location:", saveError);
      setError(saveError.message);
    } finally {
      uploadInProgressRef.current = false;
    }
  }, []);

  useEffect(() => {
    let active = true;
    stopTracking();
    setLocation(null);
    setError("");

    if (!userId) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    locationApi
      .getMyLocation()
      .then(({ location: savedLocation }) => {
        if (active) setLocation(savedLocation);
      })
      .catch((loadError) => {
        if (active) {
          console.error("Unable to load saved user location:", loadError);
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      stopTracking();
    };
  }, [stopTracking, userId]);

  const startTracking = useCallback(() => {
    if (!userId) {
      setError("กรุณาเข้าสู่ระบบก่อนบันทึกตำแหน่ง");
      return;
    }
    if (!navigator.geolocation) {
      setError("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }

    setError("");
    latestPositionRef.current = null;
    lastUploadedTimestampRef.current = null;
    firstPositionRef.current = true;
    setIsTracking(true);

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy,
            timestamp: position.timestamp,
            receivedAt: Date.now(),
          };
          latestPositionRef.current = currentPosition;
          setLocation({
            ...currentPosition,
            updatedAt: new Date().toISOString(),
          });

          if (firstPositionRef.current) {
            firstPositionRef.current = false;
            void uploadLatestPosition();
          }
        },
        (locationError) => {
          stopTracking();
          setError(
            locationError.code === 1
              ? "ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง กรุณาอนุญาตในเบราว์เซอร์แล้วลองอีกครั้ง"
              : "ระบุตำแหน่งไม่สำเร็จ กรุณาตรวจสอบ GPS และลองอีกครั้ง",
          );
        },
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
      );
      intervalIdRef.current = window.setInterval(
        () => void uploadLatestPosition(),
        locationSaveInterval,
      );
    } catch (trackingError) {
      stopTracking();
      setError(trackingError.message || "เริ่มติดตามตำแหน่งไม่สำเร็จ");
    }
  }, [stopTracking, uploadLatestPosition, userId]);

  const clearSavedLocation = useCallback(async () => {
    if (isTracking) {
      throw new Error("กรุณาหยุดติดตามก่อนลบตำแหน่งที่บันทึก");
    }
    try {
      await locationApi.deleteMyLocation();
      setLocation(null);
      setError("");
    } catch (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }
  }, [isTracking]);

  return {
    location,
    isTracking,
    isLoading,
    error,
    startTracking,
    stopTracking,
    clearSavedLocation,
  };
}
