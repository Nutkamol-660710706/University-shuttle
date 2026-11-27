import { useState } from "react";
import {
  ChevronDown,
  LogOut,
  MapPin,
  Pause,
  Play,
  Trash2,
  TrainFront,
} from "lucide-react";
import AuthDialog from "./components/auth/AuthDialog.jsx";
import MapWorkspace from "./components/MapWorkspace.jsx";
import StopSidebar from "./components/StopSidebar.jsx";
import DriverPage from "./components/DriverPage.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useActiveTramTrips } from "./hooks/useActiveTramTrips.js";
import { useTramData } from "./hooks/useTramData.js";
import { useUserLocation } from "./hooks/useUserLocation.js";
import { useWaitingStops } from "./hooks/useWaitingStops.js";

function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path === "/driver" ? <DriverPage /> : <PassengerApp />;
}

function PassengerApp() {
  const { stops, routes, isLoading, error, reload } = useTramData();
  const { trips: activeTramTrips, error: activeTripError } = useActiveTramTrips();
  const auth = useAuth();
  const userLocation = useUserLocation(auth.user?.id);
  const waiting = useWaitingStops(auth.user?.id);
  const [selectedStopNumber, setSelectedStopNumber] = useState(1);
  const [isStopDetailsOpen, setIsStopDetailsOpen] = useState(true);
  const [favoriteStops, setFavoriteStops] = useState([4]);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [accountError, setAccountError] = useState("");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const selectedStop = stops.find((stop) => stop.number === selectedStopNumber);
  const activeRoute = routes[0];
  const activeDriverTrip = activeTramTrips.find(
    (trip) => trip.tramNumber === 1,
  );

  const toggleFavorite = (stopNumber) => {
    setFavoriteStops((current) =>
      current.includes(stopNumber)
        ? current.filter((number) => number !== stopNumber)
        : [...current, stopNumber],
    );
  };

  const selectStop = (stopNumber) => {
    setSelectedStopNumber(stopNumber);
    setIsStopDetailsOpen(true);
    setMobilePanelOpen(false);
  };

  async function handleAccountAction() {
    if (!auth.user) {
      setAuthMode("login");
      return;
    }

    setAccountError("");
    setIsAccountMenuOpen((isOpen) => !isOpen);
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    setAccountError("");
    try {
      await auth.signOut();
      setIsAccountMenuOpen(false);
    } catch (logoutError) {
      setAccountError(logoutError.message);
    } finally {
      setIsSigningOut(false);
    }
  }

  async function handleClearLocation() {
    try {
      await userLocation.clearSavedLocation();
      setAccountError("");
    } catch (clearError) {
      setAccountError(clearError.message);
    }
  }

  function handleLocationTrackingAction() {
    setAccountError("");
    if (userLocation.isTracking) {
      userLocation.stopTracking();
    } else {
      userLocation.startTracking();
    }
  }

  async function handleToggleWaiting(stopNumber) {
    if (!auth.user) {
      setAuthMode("login");
      return;
    }

    try {
      await waiting.toggleWaitingAtStop(stopNumber);
    } catch (waitingError) {
      console.error("Unable to update waiting stop:", waitingError);
      setAccountError(waitingError.message);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="Silpakorn Tram หน้าหลัก">
          <span className="brand-mark">
            <TrainFront size={22} strokeWidth={2.2} />
          </span>
          <span className="brand-name">silpa<span>tram</span></span>
          <span className="brand-divider" />
          <span className="brand-caption">CAMPUS TRAM</span>
        </a>
        <div className="topbar-center">
          <span className="campus-mark"><MapPin size={15} /></span>
          <span>ศิลปากร สนามจันทร์</span>
          <ChevronDown size={15} />
        </div>
        <div className="topbar-actions">
          <span className="service-status"><span />รถรางในมหาวิทยาลัย</span>
          <a className="driver-access-link" href="/driver">
            <TrainFront size={14} />
            <span>คนขับ</span>
          </a>
          {accountError && <span className="account-error" role="alert">{accountError}</span>}
          {auth.user && <span className="member-name">{auth.user.fullName}</span>}
          {auth.user && (
            <button
              className="topbar-logout-button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              title="ออกจากระบบ"
              type="button"
            >
              <LogOut size={15} />
              <span>{isSigningOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</span>
            </button>
          )}
          <button
            className="avatar-button"
            aria-label={auth.user ? "เปิดเมนูบัญชี" : "เข้าสู่ระบบหรือสมัครสมาชิก"}
            aria-expanded={auth.user ? isAccountMenuOpen : undefined}
            aria-haspopup={auth.user ? "true" : undefined}
            title={auth.user ? "เมนูบัญชี" : "เข้าสู่ระบบหรือสมัครสมาชิก"}
            onClick={handleAccountAction}
            disabled={auth.isLoading || isSigningOut}
          >
            {auth.user ? [...auth.user.fullName][0]?.toUpperCase() || "สมาชิก" : "SU"}
          </button>
          {auth.user && isAccountMenuOpen && (
            <div className="account-menu" role="region" aria-label="เมนูบัญชี">
              <strong className="account-menu-name">{auth.user.fullName}</strong>
              <div className="account-menu-location">
                <span>ตำแหน่งของฉัน</span>
                <small>
                  {userLocation.isTracking
                    ? "กำลังแชร์ตำแหน่ง"
                    : userLocation.location?.updatedAt
                      ? `หยุดแชร์ · บันทึกล่าสุด ${new Date(userLocation.location.updatedAt).toLocaleString("th-TH")}`
                      : "ยังไม่มีตำแหน่งที่บันทึก"}
                </small>
              </div>
              {userLocation.error && (
                <small className="account-menu-error" role="alert">
                  {userLocation.error}
                </small>
              )}
              <button
                className="account-menu-action"
                onClick={handleLocationTrackingAction}
                type="button"
              >
                {userLocation.isTracking ? <Pause size={15} /> : <Play size={15} />}
                {userLocation.isTracking ? "หยุดแชร์ตำแหน่ง" : "เริ่มแชร์อีกครั้ง"}
              </button>
              {userLocation.location && !userLocation.isTracking && (
                <button
                  className="account-menu-action account-menu-delete"
                  onClick={handleClearLocation}
                  type="button"
                >
                  <Trash2 size={15} />
                  ลบตำแหน่งที่บันทึก
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <section className="workspace">
        <StopSidebar
          stops={stops}
          selectedStopNumber={selectedStopNumber}
          onSelectStop={selectStop}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
          waitingCounts={waiting.waitingCounts}
          isOpen={mobilePanelOpen}
          onClose={() => setMobilePanelOpen(false)}
        />
        <MapWorkspace
          stops={stops}
          route={activeRoute}
          selectedStop={selectedStop}
          selectedStopNumber={selectedStopNumber}
          onSelectStop={selectStop}
          isStopDetailsOpen={isStopDetailsOpen}
          onCloseStopDetails={() => setIsStopDetailsOpen(false)}
          onToggleFavorite={toggleFavorite}
          isFavorite={favoriteStops.includes(selectedStopNumber)}
          isLoading={isLoading}
          hasError={Boolean(error)}
          activeTripError={activeTripError}
          activeDriverTrip={activeDriverTrip}
          onOpenSidebar={() => setMobilePanelOpen(true)}
          isAuthLoading={auth.isLoading}
          isAuthenticated={Boolean(auth.user)}
          userLocation={userLocation.location}
          isLocationTracking={userLocation.isTracking}
          isLocationLoading={userLocation.isLoading}
          locationError={userLocation.error}
          waitingCount={waiting.waitingCounts[selectedStopNumber] ?? 0}
          waitingStopNumber={waiting.waitingStopNumber}
          isWaitingLoading={waiting.isLoading}
          isUpdatingWaiting={waiting.isUpdating}
          waitingError={waiting.error}
          onToggleWaiting={handleToggleWaiting}
          onSignIn={() => setAuthMode("login")}
        />
      </section>
      {authMode && (
        <AuthDialog
          initialMode={authMode}
          auth={auth}
          onClose={() => setAuthMode(null)}
        />
      )}
    </main>
  );
}

export default App;
