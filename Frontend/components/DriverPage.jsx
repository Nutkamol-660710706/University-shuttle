import { useEffect, useRef, useState } from "react";
import { Clock3, LogOut, Play, Square, TrainFront } from "lucide-react";
import * as driverApi from "../api/driver.js";
import TramMap from "./TramMap.jsx";
import { useDriverAuth } from "../hooks/useDriverAuth.js";
import { useTramData } from "../hooks/useTramData.js";

function withReceivedAt(trip) {
  return trip ? { ...trip, receivedAt: performance.now() } : null;
}

export default function DriverPage() {
  const auth = useDriverAuth();
  const { stops, routes, isLoading: isRouteLoading, error: routeError } = useTramData();
  const [trip, setTrip] = useState(null);
  const [tripError, setTripError] = useState("");
  const [isTripLoading, setIsTripLoading] = useState(true);
  const [isTripUpdating, setIsTripUpdating] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [username, setUsername] = useState("Driver1");
  const [password, setPassword] = useState("");
  const mapRef = useRef(null);
  const loggedTripErrorRef = useRef("");
  const activeRoute = routes[0];
  const driverId = auth.driver?.id;

  useEffect(() => {
    if (!driverId) {
      setTrip(null);
      setIsTripLoading(false);
      return undefined;
    }

    let active = true;
    setIsTripLoading(true);

    async function loadTrip() {
      try {
        const result = await driverApi.getCurrentDriverTrip();
        if (!active) return;
        setTrip(withReceivedAt(result.trip));
        setTripError("");
        loggedTripErrorRef.current = "";
      } catch (loadError) {
        if (!active) return;
        if (loggedTripErrorRef.current !== loadError.message) {
          console.error("Unable to load current driver trip:", loadError);
          loggedTripErrorRef.current = loadError.message;
        }
        setTripError(loadError.message);
      } finally {
        if (active) setIsTripLoading(false);
      }
    }

    void loadTrip();
    const intervalId = window.setInterval(() => void loadTrip(), 3000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [driverId]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");
    try {
      await auth.signIn({ username, password });
      setPassword("");
    } catch (error) {
      setLoginError(error.message);
    }
  }

  async function handleTripAction() {
    setIsTripUpdating(true);
    setTripError("");
    try {
      const result = trip
        ? await driverApi.endDriverTrip()
        : await driverApi.startDriverTrip();
      setTrip(withReceivedAt(result.trip));
    } catch (error) {
      setTripError(error.message);
    } finally {
      setIsTripUpdating(false);
    }
  }

  async function handleLogout() {
    setTripError("");
    try {
      if (trip) await driverApi.endDriverTrip();
      await auth.signOut();
      setTrip(null);
    } catch (error) {
      setTripError(error.message);
    }
  }

  return (
    <main className="driver-page">
      <header className="driver-topbar">
        <a className="brand" href="/" aria-label="กลับหน้ารถราง Silpatram">
          <span className="brand-mark">
            <TrainFront size={22} strokeWidth={2.2} />
          </span>
          <span className="brand-name">silpa<span>tram</span></span>
        </a>
        <span className="driver-page-label">พื้นที่คนขับ</span>
        {auth.driver && (
          <button
            className="driver-logout"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={15} />
            ออกจากระบบ
          </button>
        )}
      </header>

      {auth.isLoading ? (
        <div className="driver-login-state">กำลังตรวจสอบบัญชีคนขับ...</div>
      ) : !auth.driver ? (
        <section className="driver-login-card">
          <div className="driver-login-icon">
            <TrainFront size={24} />
          </div>
          <p className="eyebrow">DRIVER ACCESS</p>
          <h1>เข้าสู่ระบบคนขับ</h1>
          <p>ใช้บัญชีที่ได้รับมอบหมายเพื่อเข้าถึงหน้าควบคุมรถ</p>
          {(loginError || auth.error) && (
            <div className="driver-error" role="alert">
              {loginError || auth.error}
            </div>
          )}
          <form className="driver-login-form" onSubmit={handleLogin}>
            <label>
              <span>Username</span>
              <input
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={!username || !password}>
              เข้าสู่ระบบ
            </button>
          </form>
        </section>
      ) : (
        <section className="driver-dashboard">
          <div className="driver-map-shell">
            {!isRouteLoading && activeRoute && (
              <TramMap
                stops={stops}
                route={activeRoute}
                selectedStopNumber={null}
                onSelectStop={() => {}}
                userLocation={null}
                isLocationTracking={false}
                mapRef={mapRef}
                tramDensities={[]}
                activeDriverTrip={trip}
                isDriverView
              />
            )}
          </div>
          <section className="driver-status-panel" aria-label="สถานะการเดินทาง">
            <div className="driver-status-heading">
              <span className="driver-vehicle-icon"><TrainFront size={20} /></span>
              <span>
                <strong>รถหมายเลข 1</strong>
                <small>
                  {trip
                    ? "กำลังเดินทาง · แสดงตำแหน่งบนแผนที่ผู้โดยสาร"
                    : "พร้อมเริ่มเดินทาง"}
                </small>
              </span>
            </div>
            {isTripLoading && <small>กำลังตรวจสอบสถานะเที่ยวรถ...</small>}
            {(routeError || tripError) && (
              <small className="driver-error" role="alert">
                {tripError || routeError}
              </small>
            )}
            <button
              className={`driver-trip-button ${trip ? "is-active" : ""}`}
              onClick={handleTripAction}
              disabled={
                isTripLoading ||
                isTripUpdating ||
                isRouteLoading ||
                !activeRoute
              }
              type="button"
            >
              {trip ? <Square size={16} /> : <Play size={16} />}
              {isTripUpdating
                ? "กำลังบันทึก..."
                : trip
                  ? "จบการเดินทาง"
                  : "เริ่มเดินทาง"}
            </button>
            {trip && (
              <small className="driver-trip-note">
                <Clock3 size={13} />
                ตำแหน่งจำลองจะเคลื่อนที่ต่อจนกดจบการเดินทาง
              </small>
            )}
          </section>
          {isRouteLoading && (
            <div className="driver-map-message">กำลังโหลดเส้นทาง...</div>
          )}
          {!isRouteLoading && !activeRoute && (
            <div className="driver-map-message" role="alert">
              {routeError || "ไม่พบเส้นทางที่เปิดใช้งาน"}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
