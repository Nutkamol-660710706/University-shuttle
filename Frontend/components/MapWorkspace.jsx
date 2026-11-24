import {
  Clock3,
  MapPin,
  Menu,
  Navigation,
  Star,
  TrainFront,
  Users,
} from "lucide-react";
import TramMap from "./TramMap.jsx";
import { demoTramCount } from "../utils/demoTrams.js";

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
  waitingCount,
  waitingStopNumber,
  isWaitingLoading,
  isUpdatingWaiting,
  waitingError,
  onToggleWaiting,
  onSignIn,
}) {
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
                : "เข้าสู่ระบบเพื่อเริ่มติดตามอัตโนมัติ"
              : isLocationTracking
                ? userLocation
                  ? `${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}`
                  : "กำลังระบุตำแหน่ง..."
                : isLocationLoading
                  ? "กำลังโหลดตำแหน่งล่าสุด..."
                  : userLocation?.updatedAt
                    ? `${userLocation.latitude.toFixed(5)}, ${userLocation.longitude.toFixed(5)}`
                    : "ยังไม่ได้รับตำแหน่ง"}
          </small>
        </div>
        {locationError && (
          <small className="location-sharing-error" role="alert">
            {locationError}
          </small>
        )}
        <small className="location-sharing-note">
          {isLocationTracking
            ? "กำลังแชร์ตำแหน่งล่าสุด · อัปเดตสูงสุดทุก 30 วินาที"
            : isAuthenticated
              ? "สถานะและการจัดการตำแหน่งอยู่ในเมนูบัญชี"
              : "เฉพาะสมาชิกที่เข้าสู่ระบบ · ต้องอนุญาตตำแหน่งในเบราว์เซอร์"}
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
        <div className="legend-heading"><span>รถรางจำลอง</span><TrainFront size={15} /></div>
        <div className="stop-count-large"><strong>{demoTramCount}</strong><span>คัน</span></div>
        <p>รถ Demo วิ่งวนอัตโนมัติ</p>
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
          <span>รถราง Demo เคลื่อนที่ตามแนวเส้นทางที่ซ่อนไว้</span>
        </div>
        <div className="waiting-stop-summary" aria-live="polite">
          <Users size={16} />
          <span>
            <strong>{waitingCount} คน</strong>
            <small>แจ้งว่ากำลังรอที่ป้ายนี้</small>
          </span>
        </div>
        {waitingError && (
          <small className="waiting-stop-error" role="alert">
            {waitingError}
          </small>
        )}
        <button
          className={`waiting-stop-button ${waitingStopNumber === selectedStopNumber ? "is-waiting" : ""}`}
          onClick={() =>
            isAuthenticated
              ? onToggleWaiting(selectedStopNumber)
              : onSignIn()
          }
          disabled={!selectedStop || isWaitingLoading || isUpdatingWaiting}
          type="button"
        >
          {isUpdatingWaiting
            ? "กำลังบันทึก..."
            : waitingStopNumber === selectedStopNumber
              ? "ยกเลิกการแจ้งว่ากำลังรอ"
              : !isAuthenticated
                ? "เข้าสู่ระบบเพื่อแจ้งว่ากำลังรอ"
                : "แจ้งว่ากำลังรอที่ป้ายนี้"}
        </button>
        <small className="waiting-stop-expiry">
          สถานะการรอหมดอายุอัตโนมัติภายใน 2 ชั่วโมง
        </small>
        <div className="tram-arrival-warning">
          <Navigation size={13} />
          <span>ตำแหน่งรถ Demo เป็นการจำลอง ไม่ใช่ GPS รถจริง</span>
        </div>
      </div>

      <div className="map-attribution-note">© OpenStreetMap · พิกัดป้ายตามข้อมูลที่ได้รับ</div>
    </section>
  );
}
