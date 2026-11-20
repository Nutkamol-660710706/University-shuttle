import { useState } from "react";
import { ChevronDown, MapPin, TrainFront } from "lucide-react";
import AuthDialog from "./components/auth/AuthDialog.jsx";
import MapWorkspace from "./components/MapWorkspace.jsx";
import StopSidebar from "./components/StopSidebar.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useTramData } from "./hooks/useTramData.js";
import { useUserLocation } from "./hooks/useUserLocation.js";

function App() {
  const { stops, routes, isLoading, error, reload } = useTramData();
  const auth = useAuth();
  const userLocation = useUserLocation(auth.user?.id);
  const [selectedStopNumber, setSelectedStopNumber] = useState(1);
  const [favoriteStops, setFavoriteStops] = useState([4]);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [accountError, setAccountError] = useState("");

  const selectedStop = stops.find((stop) => stop.number === selectedStopNumber);
  const activeRoute = routes[0];

  const toggleFavorite = (stopNumber) => {
    setFavoriteStops((current) =>
      current.includes(stopNumber)
        ? current.filter((number) => number !== stopNumber)
        : [...current, stopNumber],
    );
  };

  const selectStop = (stopNumber) => {
    setSelectedStopNumber(stopNumber);
    setMobilePanelOpen(false);
  };

  async function handleAccountAction() {
    if (!auth.user) {
      setAuthMode("login");
      return;
    }

    try {
      await auth.signOut();
      setAccountError("");
    } catch (logoutError) {
      setAccountError(logoutError.message);
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
          {accountError && <span className="account-error" role="alert">{accountError}</span>}
          {auth.user && <span className="member-name">{auth.user.fullName}</span>}
          <button
            className="avatar-button"
            aria-label={auth.user ? "ออกจากระบบ" : "เข้าสู่ระบบหรือสมัครสมาชิก"}
            title={auth.user ? "คลิกเพื่อออกจากระบบ" : "เข้าสู่ระบบหรือสมัครสมาชิก"}
            onClick={handleAccountAction}
            disabled={auth.isLoading}
          >
            {auth.user ? [...auth.user.fullName][0]?.toUpperCase() || "สมาชิก" : "SU"}
          </button>
        </div>
      </header>

      <section className="workspace">
        <StopSidebar
          stops={stops}
          route={activeRoute}
          selectedStopNumber={selectedStopNumber}
          onSelectStop={selectStop}
          isLoading={isLoading}
          error={error}
          onRetry={reload}
          isOpen={mobilePanelOpen}
          onClose={() => setMobilePanelOpen(false)}
        />
        <MapWorkspace
          stops={stops}
          route={activeRoute}
          selectedStop={selectedStop}
          selectedStopNumber={selectedStopNumber}
          onSelectStop={setSelectedStopNumber}
          onToggleFavorite={toggleFavorite}
          isFavorite={favoriteStops.includes(selectedStopNumber)}
          isLoading={isLoading}
          hasError={Boolean(error)}
          onOpenSidebar={() => setMobilePanelOpen(true)}
          isAuthLoading={auth.isLoading}
          isAuthenticated={Boolean(auth.user)}
          userLocation={userLocation.location}
          isLocationTracking={userLocation.isTracking}
          isLocationLoading={userLocation.isLoading}
          locationError={userLocation.error}
          onStartLocationTracking={userLocation.startTracking}
          onStopLocationTracking={userLocation.stopTracking}
          onClearSavedLocation={userLocation.clearSavedLocation}
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
