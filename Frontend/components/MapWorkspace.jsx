import { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock3,
  MapPin,
  Menu,
  Navigation,
  Star,
  TrainFront,
  Users,
  X,
} from "lucide-react";
import TramMap, { campusCenter } from "./TramMap.jsx";
import {
  createRouteProfile,
  getNextDemoTramArrivalSeconds,
} from "../utils/demoTrams.js";

function formatArrivalTime(seconds) {
  if (seconds === null) return "ยังคำนวณเวลาไม่ได้";
  if (seconds < 1) return "กำลังถึงป้าย";
  if (seconds < 60) return `ประมาณ ${Math.ceil(seconds)} วินาที`;
  return `ประมาณ ${Math.ceil(seconds / 60)} นาที`;
}

export default function MapWorkspace({
  stops,
  route,
  selectedStop,
  selectedStopNumber,
  onSelectStop,
  isStopDetailsOpen,
  onCloseStopDetails,
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
  const mapRef = useRef(null);
  const [etaElapsedSeconds, setEtaElapsedSeconds] = useState(0);
  const routeProfile = useMemo(
    () => createRouteProfile(route?.path),
    [route?.path],
  );
  const waitingStop = stops.find(({ number }) => number === waitingStopNumber);
  const arrivalSeconds = waitingStop
    ? getNextDemoTramArrivalSeconds(
        routeProfile,
        etaElapsedSeconds,
        waitingStop.position,
      )
    : null;

  useEffect(() => {
    const startedAt = performance.now();
    const intervalId = window.setInterval(() => {
      setEtaElapsedSeconds((performance.now() - startedAt) / 1000);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  function focusCampus() {
    mapRef.current?.flyTo(campusCenter, 16, { duration: 0.7 });
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
        <button
          className="map-location map-campus-button"
          onClick={focusCampus}
          aria-label="กลับไปยังบริเวณมหาวิทยาลัยศิลปากร สนามจันทร์"
          title="กลับไปยังบริเวณมหาวิทยาลัย"
          type="button"
        >
          <span className="location-icon"><MapPin size={17} /></span>
          <span>
            <strong>มหาวิทยาลัยศิลปากร สนามจันทร์</strong>
            <small>อำเภอเมืองนครปฐม จังหวัดนครปฐม</small>
          </span>
        </button>
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
        mapRef={mapRef}
      />

      {isStopDetailsOpen && (
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
              type="button"
            >
              <Star size={17} fill={isFavorite ? "currentColor" : "none"} />
            </button>
            <button
              className="favorite-button stop-details-close"
              aria-label="ปิดรายละเอียดป้าย"
              title="ปิดรายละเอียดป้าย"
              onClick={onCloseStopDetails}
              type="button"
            >
              <X size={17} />
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
          {waitingStop && (
            <div className="waiting-stop-eta" aria-live="polite">
              <Clock3 size={16} />
              <span>
                <strong>รถ Demo คันถัดไปถึงป้ายที่คุณรอ</strong>
                <small>
                  {waitingStop.name} · {formatArrivalTime(arrivalSeconds)}
                </small>
                <small>เวลาประมาณจากรถจำลอง ไม่ใช่รถจริง</small>
              </span>
            </div>
          )}
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
      )}

      <div className="map-attribution-note">© OpenStreetMap · พิกัดป้ายตามข้อมูลที่ได้รับ</div>
    </section>
  );
}
