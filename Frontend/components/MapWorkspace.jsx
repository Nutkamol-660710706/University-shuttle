import {
  Clock3,
  LocateFixed,
  MapPin,
  Menu,
  Navigation,
  Star,
  Trash2,
  TrainFront,
} from "lucide-react";
import TramMap from "./TramMap.jsx";

export default function MapWorkspace({
  stops,
  route,
  selectedStop,
  selectedStopNumber,
  onSelectStop,
  onToggleFavorite,
  isFavorite,
  isLoading,
  hasError,
  onOpenSidebar,
  isAuthLoading,
  isAuthenticated,
  userLocation,
  isLocationTracking,
  isLocationLoading,
  locationError,
  onStartLocationTracking,
  onStopLocationTracking,
  onClearSavedLocation,
}) {
  async function handleClearLocation() {
    try {
      await onClearSavedLocation();
    } catch (clearError) {
      console.error("Unable to delete saved user location:", clearError);
    }
  }

  return (
    <section className="map-area" aria-label="แผนที่รถรางมหาวิทยาลัยศิลปากร">
      <div className="map-topline">
        <button
          className="mobile-menu-button"
          onClick={onOpenSidebar}
          aria-label="เปิดรายการจุดจอด"
        >
          <Menu size={19} />
        </button>
        <div className="map-location">
          <span className="location-icon"><MapPin size={17} /></span>
          <span>
            <strong>มหาวิทยาลัยศิลปากร สนามจันทร์</strong>
            <small>อำเภอเมืองนครปฐม จังหวัดนครปฐม</small>
          </span>
        </div>
        <div className="map-data-status">
          <span />
          {hasError ? "ข้อมูลไม่พร้อม" : isLoading ? "กำลังโหลดข้อมูล" : `มีพิกัด ${stops.length} จุด`}
        </div>
      </div>

      <div className="location-sharing-panel">
        <div className="location-sharing-copy">
          <strong>ตำแหน่งของฉัน</strong>
          <small>
            {!isAuthenticated
              ? isAuthLoading
                ? "กำลังตรวจสอบบัญชี..."
                : "เข้าสู่ระบบเพื่อบันทึกตำแหน่ง"
              : isLocationTracking
                ? "กำลังติดตาม · อัปเดตสูงสุดทุก 30 วินาที"
                : isLocationLoading
                  ? "กำลังโหลดตำแหน่งล่าสุด..."
                  : userLocation?.updatedAt
                    ? `บันทึกล่าสุด ${new Date(userLocation.updatedAt).toLocaleString("th-TH")}`
                    : "ยังไม่มีตำแหน่งที่บันทึก"}
          </small>
        </div>
        {isLocationTracking ? (
          <button
            className="location-tracking-button is-tracking"
            onClick={onStopLocationTracking}
            type="button"
          >
            หยุดติดตาม
          </button>
        ) : (
          <button
            className="location-tracking-button"
            onClick={onStartLocationTracking}
            disabled={!isAuthenticated || isAuthLoading}
            type="button"
          >
            <LocateFixed size={14} />
            เริ่มติดตาม
          </button>
        )}
        {userLocation && !isLocationTracking && (
          <button
            className="location-delete-button"
            aria-label="ลบตำแหน่งที่บันทึก"
            title="ลบตำแหน่งที่บันทึก"
            onClick={handleClearLocation}
            type="button"
          >
            <Trash2 size={14} />
          </button>
        )}
        {locationError && (
          <small className="location-sharing-error" role="alert">
            {locationError}
          </small>
        )}
        <small className="location-sharing-note">
          กดเริ่มเพื่อแชร์พิกัดใหม่สูงสุดทุก 30 วินาที ไม่มีประวัติเส้นทาง และลบได้
        </small>
      </div>

      <TramMap
        stops={stops}
        route={route}
        selectedStopNumber={selectedStopNumber}
        onSelectStop={onSelectStop}
        userLocation={userLocation}
        isLocationTracking={isLocationTracking}
      />

      <div className="map-legend tram-map-legend">
        <div className="legend-heading"><span>{route?.name || "จุดจอดรถราง"}</span><TrainFront size={15} /></div>
        <div className="stop-count-large"><strong>{stops.length}</strong><span>จุด</span></div>
        {route && (
          <>
            <div className="tram-route-key"><span style={{ backgroundColor: route.color }} />เส้นทางรถราง</div>
            <p>ลำดับจุดจอดในเส้นทาง</p>
          </>
        )}
      </div>

      <div className="arrival-card tram-arrival-card">
        <div className="arrival-top">
          <div className="arrival-icon tram-arrival-icon">
            <TrainFront size={20} />
          </div>
          <div className="arrival-title">
            <span>จุดจอดที่เลือก{selectedStop ? ` · จุด ${selectedStop.number}` : ""}</span>
            <strong>{selectedStop?.name || (isLoading ? "กำลังโหลด..." : "ไม่มีข้อมูลจุดจอด")}</strong>
          </div>
          <button
            className={`favorite-button ${isFavorite ? "is-favorite" : ""}`}
            aria-label="บันทึกจุดจอดเป็นรายการโปรด"
            onClick={() => onToggleFavorite(selectedStopNumber)}
            disabled={!selectedStop}
          >
            <Star size={17} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="tram-arrival-info">
          <Clock3 size={14} />
          <span>เวลาถึงจะแสดงเมื่อมีข้อมูลตำแหน่งรถและตารางเดินรถ</span>
        </div>
        <div className="tram-arrival-warning">
          <Navigation size={13} />
          <span>แนวเส้นทางอ้างอิงจากแผนที่ที่ส่งมา ไม่ใช่ข้อมูลติดตามรถ GPS แบบเรียลไทม์</span>
        </div>
      </div>

      <div className="map-attribution-note">© OpenStreetMap · พิกัดป้ายตามข้อมูลที่ได้รับ</div>
    </section>
  );
}
