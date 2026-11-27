import { useEffect, useMemo, useRef, useState } from "react";
import { Locate, LocateFixed } from "lucide-react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  createRouteProfile,
  demoTramSpeedMetersPerSecond,
  demoPassengerDensityLabels,
  getDemoTramPositions,
  getPositionAtDistance,
} from "../utils/demoTrams.js";

export const campusCenter = [13.8190011, 100.0401044];
const demoTramIcons = Array.from({ length: 5 }, (_, index) =>
  L.divIcon({
    className: "demo-tram-marker-wrap",
    html: `<span class="demo-tram-marker"><span class="demo-tram-label">D${index + 1}</span><span class="demo-tram-car"><span class="demo-tram-window"></span><span class="demo-tram-wheel"></span><span class="demo-tram-wheel"></span></span></span>`,
    iconSize: [42, 38],
    iconAnchor: [21, 19],
  }),
);

function MapControls({ userLocation }) {
  const map = useMap();

  return (
    <div className="map-controls">
      <button className="map-control" aria-label="ซูมเข้า" onClick={() => map.zoomIn()}>
        +
      </button>
      <button className="map-control" aria-label="ซูมออก" onClick={() => map.zoomOut()}>
        −
      </button>
      <span className="map-control-divider" />
      <button
        className="map-control locate-control"
        aria-label="ดูตำแหน่งของฉัน"
        title="ดูตำแหน่งของฉัน"
        disabled={!userLocation}
        onClick={() =>
          userLocation &&
          map.flyTo(
            [userLocation.latitude, userLocation.longitude],
            Math.max(map.getZoom(), 16),
            { duration: 0.7 },
          )
        }
      >
        <Locate size={18} />
      </button>
      <button
        className="map-control locate-control"
        aria-label="กลับไปยังมหาวิทยาลัยศิลปากร สนามจันทร์"
        onClick={() => map.flyTo(campusCenter, 16, { duration: 0.7 })}
      >
        <LocateFixed size={18} />
      </button>
    </div>
  );
}

function FitStopsBounds({ stops }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length === 0) return;
    map.fitBounds(
      L.latLngBounds(stops.map((stop) => stop.position)),
      { padding: [55, 55], maxZoom: 16 },
    );
  }, [map, stops]);

  return null;
}

function FocusSelectedStop({ stops, selectedStopNumber }) {
  const map = useMap();
  const previousStopNumberRef = useRef(selectedStopNumber);

  useEffect(() => {
    if (previousStopNumberRef.current === selectedStopNumber) return;

    const stop = stops.find(({ number }) => number === selectedStopNumber);
    if (!stop) return;

    previousStopNumberRef.current = selectedStopNumber;
    map.flyTo(stop.position, Math.max(map.getZoom(), 16), { duration: 0.7 });
  }, [map, selectedStopNumber, stops]);

  return null;
}

function FocusFirstLocation({ userLocation, isLocationTracking }) {
  const map = useMap();
  const focusedDuringTrackingRef = useRef(false);

  useEffect(() => {
    if (!isLocationTracking) {
      focusedDuringTrackingRef.current = false;
      return;
    }
    if (!userLocation || focusedDuringTrackingRef.current) return;

    focusedDuringTrackingRef.current = true;
    map.flyTo(
      [userLocation.latitude, userLocation.longitude],
      Math.max(map.getZoom(), 16),
      { duration: 0.7 },
    );
  }, [isLocationTracking, map, userLocation]);

  return null;
}

export default function TramMap({
  stops,
  route,
  selectedStopNumber,
  onSelectStop,
  userLocation,
  isLocationTracking,
  mapRef,
  tramDensities,
  activeDriverTrip,
  isDriverView = false,
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const routeProfile = useMemo(
    () => createRouteProfile(route?.path),
    [route?.path],
  );
  const demoTrams = useMemo(
    () => getDemoTramPositions(routeProfile, elapsedSeconds),
    [elapsedSeconds, routeProfile],
  );
  const activeTripElapsedSeconds = activeDriverTrip
    ? activeDriverTrip.elapsedSeconds +
      Math.max(0, (performance.now() - activeDriverTrip.receivedAt) / 1000)
    : 0;
  const activeTripPosition = activeDriverTrip
    ? getPositionAtDistance(
        routeProfile,
        activeTripElapsedSeconds * demoTramSpeedMetersPerSecond,
      )
    : null;
  const visibleTrams = isDriverView
    ? [
        {
          id: 1,
          position:
            activeTripPosition ??
            getPositionAtDistance(routeProfile, 0),
        },
      ]
    : demoTrams.map((tram) =>
        tram.id === activeDriverTrip?.tramNumber && activeTripPosition
          ? { ...tram, position: activeTripPosition }
          : tram,
      );

  useEffect(() => {
    const startedAt = performance.now();
    let lastUpdatedAt = 0;
    let frameId;

    function animate(now) {
      if (now - lastUpdatedAt >= 100) {
        setElapsedSeconds((now - startedAt) / 1000);
        lastUpdatedAt = now;
      }
      frameId = requestAnimationFrame(animate);
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div className="map-frame">
      <MapContainer
        ref={mapRef}
        center={campusCenter}
        zoom={16}
        minZoom={13}
        maxZoom={19}
        zoomControl={false}
        scrollWheelZoom
        className="tracking-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {isDriverView && route?.path?.length > 1 && (
          <Polyline
            positions={route.path}
            pathOptions={{ color: route.color, opacity: 0.8, weight: 5 }}
          />
        )}
        <FitStopsBounds stops={stops} />
        <FocusSelectedStop
          stops={stops}
          selectedStopNumber={selectedStopNumber}
        />
        {stops.map((stop) => (
          <Marker
            key={stop.number}
            position={stop.position}
            icon={L.divIcon({
              className: "stop-marker-wrap",
              html: `<span class="stop-marker stop-marker-number ${selectedStopNumber === stop.number ? "is-selected" : ""}"><span>${stop.number}</span></span>`,
              iconSize: [27, 27],
              iconAnchor: [13, 13],
            })}
            eventHandlers={{ click: () => onSelectStop(stop.number) }}
            title={`จุด ${stop.number}: ${stop.name}`}
            zIndexOffset={selectedStopNumber === stop.number ? 1000 : 0}
          >
            <Popup className="stop-popup">
              <strong>จุด {stop.number}: {stop.name}</strong>
            </Popup>
          </Marker>
        ))}
        {visibleTrams.filter((tram) => tram.position).map((tram) => {
          const density = tramDensities[tram.id - 1];
          return (
            <Marker
              key={tram.id}
              position={tram.position}
              icon={demoTramIcons[tram.id - 1]}
              title={
                isDriverView
                  ? `รถหมายเลข ${tram.id} · รถที่คุณขับ`
                  : `รถ Demo ${tram.id} · กดเพื่อดูความหนาแน่น`
              }
              zIndexOffset={700}
            >
              <Popup className="tram-density-popup">
                {isDriverView ? (
                  <>
                    <strong>รถหมายเลข {tram.id}</strong>
                    <span>{activeDriverTrip ? "กำลังเดินทาง" : "พร้อมเริ่มเดินทาง"}</span>
                  </>
                ) : (
                  <>
                    <strong>รถราง Demo {tram.id}</strong>
                    <span>ความหนาแน่นผู้โดยสาร</span>
                    <strong className={`tram-density-badge density-${density}`}>
                      {demoPassengerDensityLabels[density]}
                    </strong>
                    <small>ข้อมูลจำลองแบบสุ่ม ไม่ใช่จำนวนจริง</small>
                  </>
                )}
              </Popup>
            </Marker>
          );
        })}
        {userLocation && (
          <>
            {userLocation.accuracyMeters > 0 && (
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={userLocation.accuracyMeters}
                pathOptions={{
                  color: "#2878d0",
                  fillColor: "#4b9bf0",
                  fillOpacity: 0.12,
                  weight: 1,
                }}
              />
            )}
            <CircleMarker
              center={[userLocation.latitude, userLocation.longitude]}
              radius={8}
              pathOptions={{
                color: "#fff",
                fillColor: "#2878d0",
                fillOpacity: 1,
                weight: 3,
              }}
            >
              <Popup>
                <strong>ตำแหน่งล่าสุดของฉัน</strong>
                <span>
                  {userLocation.updatedAt
                    ? new Date(userLocation.updatedAt).toLocaleString("th-TH")
                    : "กำลังบันทึกตำแหน่ง"}
                </span>
              </Popup>
            </CircleMarker>
          </>
        )}
        <FocusFirstLocation
          userLocation={userLocation}
          isLocationTracking={isLocationTracking}
        />
        <MapControls userLocation={userLocation} />
      </MapContainer>
      <div className="map-caption">
        <span className="map-live-dot" />
        {isDriverView
          ? "หน้าจอจำลองการเดินทาง · รถหมายเลข 1"
          : "แผนที่มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์"}
      </div>
    </div>
  );
}
