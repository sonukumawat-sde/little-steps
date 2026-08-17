// OpenStreetMap + Leaflet — FREE, no API key needed
import { useEffect, useRef } from "react";

export default function MapView({ center, height = 300 }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!center?.location?.lat || !center?.location?.lng) return;
    if (mapInstance.current) return; // already initialized

    // Dynamically load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Dynamically load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = window.L;
      const map = L.map(mapRef.current).setView(
        [center.location.lat, center.location.lng], 15
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Custom marker
      const icon = L.divIcon({
        html: `<div style="background:var(--coral,#f4845f);width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
          <div style="transform:rotate(45deg);text-align:center;line-height:30px;font-size:16px">🏫</div>
        </div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      L.marker([center.location.lat, center.location.lng], { icon })
        .addTo(map)
        .bindPopup(`<strong>${center.name}</strong><br/>📍 ${center.address || center.city}`)
        .openPopup();

      mapInstance.current = map;
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center]);

  if (!center?.location?.lat) {
    return (
      <div style={{
        height, background: "linear-gradient(135deg,#e8f4fd,#d4eaf7)",
        borderRadius: "var(--radius)", display: "grid", placeItems: "center",
        border: "1px solid var(--line)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🗺️</div>
          <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
            📍 {center?.address || center?.city}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--line)" }}>
      <div ref={mapRef} style={{ height, width: "100%", zIndex: 1 }} />
    </div>
  );
}
