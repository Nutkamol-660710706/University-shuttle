import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
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
  demoPassengerDensityLabels,
  getDemoTravelTimeBetweenStops,
  getMockTramDensities,
  getNextDemoTramArrival,
} from "../utils/demoTrams.js";

function formatArrivalTime(seconds) {
  if (seconds === null) return "ยังคำนวณเวลาไม่ได้";
  if (seconds < 1) return "กำลังถึงป้าย";
  if (seconds < 60) return `ประมาณ ${Math.ceil(seconds)} วินาที`;
  return `ประมาณ ${Math.ceil(seconds / 60)} นาที`;
}

function formatCompactArrivalTime(seconds) {
  if (seconds === null) return "ยังคำนวณเวลาไม่ได้";
  if (seconds < 1) return "รถกำลังถึงป้าย";
  return `อีกประมาณ ${Math.ceil(seconds / 60)} นาที`;
}

function StopDropdown({ label, stops, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownId = useId();
  const dropdownRef = useRef(null);
  const selectedStop = stops.find((stop) => stop.number === value);

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnOutsideClick(event) {
      if (!dropdownRef.current?.contains(event.target)) setIsOpen(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="trip-estimate-dropdown" ref={dropdownRef}>
      <button
        className="trip-estimate-dropdown-trigger"
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        onClick={() => setIsOpen((open) => !open)}
        disabled={stops.length === 0}
      >
        <span>
          {selectedStop
            ? `จุด ${selectedStop.number} · ${selectedStop.name}`
            : "เลือกป้าย"}
        </span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          className="trip-estimate-dropdown-menu"
          id={dropdownId}
          role="listbox"
          aria-label={label}
        >
          {stops.map((stop) => (
            <button
              className={`trip-estimate-dropdown-option ${stop.number === value ? "is-selected" : ""}`}
              key={stop.number}
              type="button"
              role="option"
              aria-selected={stop.number === value}
              onClick={() => {
                onChange(stop.number);
                setIsOpen(false);
              }}
            >
              จุด {stop.number} · {stop.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
  activeTripError,
  activeDriverTrip,
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
  const [isStopDetailsCompact, setIsStopDetailsCompact] = useState(false);
  const [tramDensities] = useState(() => getMockTramDensities());
  const [fromStopNumber, setFromStopNumber] = useState(null);
  const [toStopNumber, setToStopNumber] = useState(null);
  const routeProfile = useMemo(
    () => createRouteProfile(route?.path),
    [route?.path],
  );
  const fromStop = stops.find((stop) => stop.number === fromStopNumber);
  const toStop = stops.find((stop) => stop.number === toStopNumber);
  const tripSeconds =
    fromStop && toStop && fromStopNumber !== toStopNumber
      ? getDemoTravelTimeBetweenStops(
          routeProfile,
          fromStop.position,
          toStop.position,
        )
      : null;
  const arrival = selectedStop
    ? getNextDemoTramArrival(
        routeProfile,
        etaElapsedSeconds,
        selectedStop.position,
      )
    : null;
  const arrivalDensity = arrival
    ? tramDensities[arrival.tramId - 1]
    : null;

  useEffect(() => {
    if (stops.length === 0) return;
    setFromStopNumber((current) => current ?? stops[0].number);
    setToStopNumber((current) => current ?? stops[1]?.number ?? stops[0].number);
  }, [stops]);

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
          {hasError || activeTripError
            ? "ข้อมูลไม่พร้อม"
            : isLoading
              ? "กำลังโหลดข้อมูล"
              : `มีป้าย ${stops.length} จุด`}
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
                  ? "กำลังแชร์ตำแหน่งล่าสุด"
                  : "กำลังระบุตำแหน่ง..."
                : isLocationLoading
                  ? "กำลังโหลดตำแหน่งล่าสุด..."
                  : userLocation?.updatedAt
                    ? "มีตำแหน่งล่าสุดที่บันทึกไว้"
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
        tramDensities={tramDensities}
        activeDriverTrip={activeDriverTrip}
      />

      {isStopDetailsOpen && (
        <div className={`arrival-card tram-arrival-card ${isStopDetailsCompact ? "is-compact" : ""}`}>
          {isStopDetailsCompact && (
            <div className="stop-details-compact" aria-live="polite">
              <Clock3 size={17} />
              <strong>{formatCompactArrivalTime(arrival?.seconds ?? null)}</strong>
              <button
                className="favorite-button"
                aria-label="ขยายรายละเอียดป้าย"
                title="ขยายรายละเอียดป้าย"
                aria-expanded={false}
                onClick={() => setIsStopDetailsCompact(false)}
                type="button"
              >
                <ChevronUp size={17} />
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
          )}
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
              className="favorite-button"
              aria-label="ย่อรายละเอียดป้าย"
              title="ย่อรายละเอียดป้าย"
              aria-expanded={true}
              onClick={() => setIsStopDetailsCompact(true)}
              type="button"
            >
              <ChevronDown size={17} />
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
          {selectedStop && (
            <div className="waiting-stop-eta">
              <Clock3 size={16} />
              <span>
                <strong>รถ Demo D{arrival?.tramId ?? "-"} คันถัดไป</strong>
                <small>
                  {selectedStop.name} · {formatArrivalTime(arrival?.seconds ?? null)}
                </small>
                {arrivalDensity && (
                  <small>
                    ความหนาแน่นผู้โดยสาร: {demoPassengerDensityLabels[arrivalDensity]}
                  </small>
                )}
                <small>เวลาประมาณจากรถจำลอง ไม่ใช่รถจริง</small>
              </span>
            </div>
          )}
          <div className="trip-estimate">
            <strong className="trip-estimate-heading">คาดการณ์เวลาเดินทางระหว่างป้าย</strong>
            <div className="trip-estimate-field">
              <span>จากป้าย</span>
              <StopDropdown
                label="เลือกป้ายต้นทาง"
                stops={stops}
                value={fromStopNumber}
                onChange={setFromStopNumber}
              />
            </div>
            <div className="trip-estimate-field">
              <span>ไปยังป้าย</span>
              <StopDropdown
                label="เลือกป้ายปลายทาง"
                stops={stops}
                value={toStopNumber}
                onChange={setToStopNumber}
              />
            </div>
            {fromStop && toStop && fromStopNumber === toStopNumber ? (
              <small className="trip-estimate-message">
                เลือกป้ายต้นทางและปลายทางคนละป้าย
              </small>
            ) : tripSeconds === null ? (
              <small className="trip-estimate-message">
                ยังไม่มีข้อมูลเส้นทางสำหรับคำนวณ
              </small>
            ) : (
              <div className="trip-estimate-result" aria-live="polite">
                <Clock3 size={15} />
                <span>
                  <strong>ประมาณ {Math.ceil(tripSeconds / 60)} นาที</strong>
                  <small>เวลาเดินทางตามเส้นทางจำลอง ไม่รวมเวลารอรถ</small>
                </span>
              </div>
            )}
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
      )}

      <div className="map-attribution-note">© OpenStreetMap · พิกัดป้ายตามข้อมูลที่ได้รับ</div>
    </section>
  );
}
