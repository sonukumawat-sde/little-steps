import { Link } from "react-router-dom";
import { CenterBadges, AgeBadges } from "./UI.jsx";

export default function CenterCard({ center }) {
  return (
    <Link to={`/center/${center._id}`} className="card" style={{ overflow: "hidden", display: "block" }}>
      <div
        style={{
          height: 130,
          background: "linear-gradient(135deg,#ffe0cc,#ffb997)",
          display: "grid",
          placeItems: "center",
          fontSize: 46,
        }}
      >
        🏫
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
          <h3 style={{ fontSize: "1.15rem" }}>{center.name}</h3>
          {center.rating > 0 && (
            <span style={{ fontWeight: 800, color: "var(--amber)", whiteSpace: "nowrap" }}>
              ★ {center.rating}
            </span>
          )}
        </div>
        <p className="muted" style={{ margin: "6px 0 12px", fontSize: "0.88rem" }}>
          📍 {center.city}
        </p>
        <div style={{ marginBottom: 10 }}>
          <CenterBadges center={center} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <AgeBadges groups={center.ageGroups} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid var(--line)",
            paddingTop: 12,
          }}
        >
          <div>
            <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--navy)" }}>
              ₹{center.pricing?.hourly}
            </span>
            <span className="muted" style={{ fontSize: "0.82rem" }}>
              /hour
            </span>
          </div>
          <span
            className="muted"
            style={{ fontSize: "0.8rem", fontWeight: 700 }}
          >
            {center.availableSlots ?? "—"} slots left
          </span>
        </div>
      </div>
    </Link>
  );
}
