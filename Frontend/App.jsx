import { useState } from "react";
import { ChevronDown, MapPin, Star, TrainFront } from "lucide-react";
import MapWorkspace from "./components/MapWorkspace.jsx";
import StopSidebar from "./components/StopSidebar.jsx";
import { useTramData } from "./hooks/useTramData.js";

function App() {
  const { stops, routes, isLoading, error, reload } = useTramData();
  const [selectedStopNumber, setSelectedStopNumber] = useState(1);
  const [favoriteStops, setFavoriteStops] = useState([4]);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

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
          <button className="avatar-button" aria-label="มหาวิทยาลัยศิลปากร">SU</button>
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
        />
      </section>
    </main>
  );
}

export default App;
