import { useEffect } from "react";
import { LocateFixed } from "lucide-react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";

const campusCenter = [13.8190011, 100.0401044];

function MapControls() {
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

export default function TramMap({
  stops,
  route,
  selectedStopNumber,
  onSelectStop,
}) {
  return (
    <div className="map-frame">
      <MapContainer
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
        <FitStopsBounds stops={stops} />
        {route && (
          <>
            <Polyline
              positions={route.path}
              pathOptions={{
                color: "#435047",
                weight: 8,
                opacity: 0.56,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              positions={route.path}
              pathOptions={{
                color: route.color,
                weight: 4,
                opacity: 0.98,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}
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
            zIndexOffset={selectedStopNumber === stop.number ? 1000 : 0}
          >
            <Popup className="stop-popup">
              <strong>จุด {stop.number}: {stop.name}</strong>
              <span>{stop.position[0]}, {stop.position[1]}</span>
            </Popup>
          </Marker>
        ))}
        <MapControls />
      </MapContainer>
      <div className="map-caption">
        <span className="map-live-dot" />
        แผนที่มหาวิทยาลัยศิลปากร วิทยาเขตพระราชวังสนามจันทร์
      </div>
    </div>
  );
}
