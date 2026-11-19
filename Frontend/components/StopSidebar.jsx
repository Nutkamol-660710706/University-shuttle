import { useMemo, useState } from "react";
import {
  Check,
  MapPin,
  Search,
  Star,
  X,
} from "lucide-react";

export default function StopSidebar({
  stops,
  route,
  selectedStopNumber,
  onSelectStop,
  isLoading,
  error,
  onRetry,
  isOpen,
  onClose,
}) {
  const [search, setSearch] = useState("");
  const [favoriteStops, setFavoriteStops] = useState([4]);

  const visibleStops = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("th");
    if (!query) return stops;
    return stops.filter(
      (stop) =>
        stop.name.toLocaleLowerCase("th").includes(query) ||
        String(stop.number).includes(query),
    );
  }, [search, stops]);

  const toggleFavorite = (stopNumber) => {
    setFavoriteStops((current) =>
      current.includes(stopNumber)
        ? current.filter((number) => number !== stopNumber)
        : [...current, stopNumber],
    );
  };

  return (
    <aside className={`sidebar tram-sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">SILPAKORN UNIVERSITY · SANAM CHANDRA</p>
          <h1>รถรางสนามจันทร์</h1>
          <p className="panel-subtitle">รวมจุดจอดรถรางภายในมหาวิทยาลัย</p>
        </div>
        <button
          className="close-panel"
          onClick={onClose}
          aria-label="ปิดรายการจุดจอด"
        >
          <X size={19} />
        </button>
      </div>

      <div className="search-box">
        <Search size={18} />
        <input
          aria-label="ค้นหาจุดจอดรถราง"
          placeholder="ค้นหาชื่อจุดจอด หรือหมายเลข..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="section-title-row tram-stops-heading">
        <h2>จุดจอดรถราง</h2>
        <span className="route-count">{visibleStops.length} / {stops.length} จุด</span>
      </div>
      <div className="tram-stop-list">
        {isLoading && <div className="backend-message">กำลังโหลดข้อมูล...</div>}
        {error && (
          <div className="backend-message backend-error" role="alert">
            <strong>โหลดข้อมูลไม่สำเร็จ</strong>
            <span>{error}</span>
            <button onClick={onRetry}>ลองอีกครั้ง</button>
          </div>
        )}
        {visibleStops.map((stop) => {
          const isSelected = stop.number === selectedStopNumber;
          const isFavorite = favoriteStops.includes(stop.number);
          return (
            <div
              className={`tram-stop-card ${isSelected ? "tram-stop-selected" : ""}`}
              key={stop.number}
            >
              <button
                className="tram-stop-select"
                onClick={() => onSelectStop(stop.number)}
                aria-label={`เลือกจุด ${stop.number} ${stop.name}`}
              >
                <span className="stop-number">{stop.number}</span>
                <span className="tram-stop-name">{stop.name}</span>
                <span className="stop-chevron">›</span>
              </button>
              <button
                className={`stop-favorite ${isFavorite ? "is-favorite" : ""}`}
                onClick={() => toggleFavorite(stop.number)}
                aria-label={isFavorite ? `นำ ${stop.name} ออกจากรายการโปรด` : `บันทึก ${stop.name} เป็นรายการโปรด`}
              >
                <Star size={15} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
          );
        })}
        {!isLoading && !error && visibleStops.length === 0 && (
          <div className="empty-state">
            <Search size={20} />
            <strong>ไม่พบจุดจอดที่ค้นหา</strong>
            <span>ลองค้นหาด้วยชื่อหรือหมายเลขจุด</span>
          </div>
        )}
      </div>

      <div className="sidebar-bottom tram-sidebar-bottom">
        <div className="tram-note">
          <span className="tram-note-icon"><MapPin size={16} /></span>
          <span>
            <strong>{isLoading ? "กำลังโหลดข้อมูล" : `${stops.length} จุดจอด`}</strong>
            <small>
              {route
                ? `เส้นทาง ${route.name}`
                : "ข้อมูลจุดจอดและเส้นทางจากระบบ"}
            </small>
          </span>
        </div>
      </div>
      <div className="panel-footnote">
        <span><Check size={13} />ข้อมูลจากระบบ</span>
        <span>{stops.length} จุด</span>
      </div>
    </aside>
  );
}
