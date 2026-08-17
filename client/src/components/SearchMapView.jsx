import { useEffect, useRef } from "react";

export default function SearchMapView({ centers = [], height = 320 }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const centersWithLocation = centers.filter(c => c.location?.lat && c.location?.lng);

  useEffect(() => {
    if (centersWithLocation.length === 0) return;
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = window.L;
      if (!L || !mapRef.current) return;

      const first = centersWithLocation[0];
      const map = L.map(mapRef.current).setView([first.location.lat, first.location.lng], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      centersWithLocation.forEach(c => {
        const color = c.is24x7 ? "#f4845f" : "#7cc9a9";
        const icon = L.divIcon({
          html: `<div style="background:${color};width:32px;height:32px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:grid;place-items:center;font-size:14px">🏫</div>`,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([c.location.lat, c.location.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:180px">
              <strong style="color:#2d3a5e">${c.name}</strong><br/>
              <span style="color:#7a8499;font-size:0.82rem">📍 ${c.city}</span><br/>
              <span style="color:#f4845f;font-weight:700">₹${c.pricing?.hourly}/hr</span>
              ${c.is24x7 ? ' · <span style="color:#e26d47">🕐 24×7</span>' : ""}
            </div>
          `);
      });

      // Fit all markers
      if (centersWithLocation.length > 1) {
        const bounds = L.latLngBounds(centersWithLocation.map(c => [c.location.lat, c.location.lng]));
        map.fitBounds(bounds, { padding: [30, 30] });
      }

      mapInstance.current = map;
    };

    if (window.L) {
      initMap();
    } else {
      const existing = document.getElementById("leaflet-js");
      if (existing) {
        existing.onload = initMap;
      } else {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = initMap;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [centers]);

  if (centersWithLocation.length === 0) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h3 style={{ fontSize: "1rem", margin: 0 }}>📍 Centers on map</h3>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#f4845f" }}>🏫 24×7 centers</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7cc9a9" }}>🏫 Other centers</span>
        </div>
      </div>
      <div style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--line)" }}>
        <div ref={mapRef} style={{ height, width: "100%", zIndex: 1 }} />
      </div>
    </div>
  );
}
