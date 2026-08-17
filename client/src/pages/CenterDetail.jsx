import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast, CenterBadges, AgeBadges } from "../components/UI.jsx";
import MapView from "../components/MapView.jsx";

export default function CenterDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [center, setCenter] = useState(null);
  const [booking, setBooking] = useState({ childName: "", ageGroup: "", planType: "hourly", startDate: "", slotTiming: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get(`/centers/${id}`).then((r) => {
      setCenter(r.data);
      setBooking((b) => ({ ...b, ageGroup: r.data.ageGroups?.[0] || "" }));
    });
  }, [id]);

  if (!center) return <div className="spinner" />;

  const price = center.pricing?.[booking.planType] || 0;

  const book = async (e) => {
    e.preventDefault();
    if (!user) return nav("/login");
    if (user.role !== "parent") return toast("Only parents can book.");
    setBusy(true);
    try {
      await api.post("/bookings", { centerId: center._id, ...booking });
      toast("Booking request sent! Track it in your dashboard.");
      nav("/parent");
    } catch (err) {
      toast(err.response?.data?.message || "Booking failed");
    } finally {
      setBusy(false);
    }
  };

  const subscribe = async () => {
    if (!user) return nav("/login");
    if (user.role !== "parent") return toast("Only parents can subscribe.");
    try {
      await api.post("/subscriptions", { centerId: center._id });
      toast("Monthly subscription activated!");
      nav("/parent");
    } catch (err) {
      toast(err.response?.data?.message || "Subscription failed");
    }
  };

  return (
    <div className="container" style={{ padding: "34px 22px 70px" }}>
      <button className="btn btn-ghost btn-sm" onClick={() => nav(-1)} style={{ marginBottom: 18 }}>← Back</button>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 30, alignItems: "start" }}>
        {/* Left: details */}
        <div>
          <div style={{ height: 200, borderRadius: "var(--radius)", background: "linear-gradient(135deg,#ffe0cc,#ffb997)", display: "grid", placeItems: "center", fontSize: 72, marginBottom: 20 }}>🏫</div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: "2.1rem" }}>{center.name}</h1>
              <p className="muted" style={{ margin: "6px 0 0" }}>📍 {center.address || center.city}</p>
            </div>
            {center.rating > 0 && (
              <div className="card" style={{ padding: "10px 16px", textAlign: "center", boxShadow: "none" }}>
                <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--amber)" }}>★ {center.rating}</div>
                <div className="muted" style={{ fontSize: "0.72rem" }}>{center.ratingCount} reviews</div>
              </div>
            )}
          </div>

          <div style={{ margin: "16px 0" }}><CenterBadges center={center} /></div>
          <p style={{ fontSize: "1rem", color: "var(--navy-soft)" }}>{center.description}</p>

          <Section title="Age groups supported"><AgeBadges groups={center.ageGroups} /></Section>

          <Section title="Operating hours">
            <p style={{ margin: 0, fontWeight: 700, color: "var(--navy)" }}>
              {center.is24x7 ? "🕐 Open 24×7 — day, night & emergency care" : `🕐 ${center.operatingHours}`}
            </p>
          </Section>

          <Section title="Safety measures">
            <div className="tag-row">
              {center.safetyMeasures?.map((s) => <span key={s} className="badge badge-verified">🛡 {s}</span>)}
            </div>
          </Section>

          {center.certifications?.length > 0 && (
            <Section title="Certifications">
              <div className="tag-row">
                {center.certifications.map((c) => <span key={c} className="badge badge-age">📜 {c}</span>)}
              </div>
            </Section>
          )}

          <Section title="Location & directions">
            <MapView center={center} height={280} />
            {center.address && (
              <p className="muted" style={{ margin: "10px 0 0", fontSize: "0.88rem" }}>
                📍 {center.address}
              </p>
            )}
          </Section>

          <Section title="Our caregivers">
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
              {center.caregivers?.length ? center.caregivers.map((cg) => (
                <div key={cg._id || cg.name} className="card" style={{ padding: 16, boxShadow: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--mint-bg)", display: "grid", placeItems: "center", fontSize: 20 }}>👩‍🏫</div>
                    <div>
                      <div style={{ fontWeight: 800, color: "var(--navy)" }}>{cg.name}</div>
                      <div className="muted" style={{ fontSize: "0.78rem" }}>{cg.experienceYears} yrs exp {cg.verified && "· ✓ verified"}</div>
                    </div>
                  </div>
                  <div className="tag-row">
                    {cg.certifications?.map((c) => <span key={c} className="badge badge-verified" style={{ fontSize: "0.68rem" }}>{c}</span>)}
                  </div>
                </div>
              )) : <p className="muted">Caregiver profiles coming soon.</p>}
            </div>
          </Section>
        </div>

        {/* Right: booking */}
        <div className="card" style={{ padding: 26, position: "sticky", top: 88 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
            <span style={{ fontFamily: "Fraunces,serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--navy)" }}>₹{price}</span>
            <span className="muted" style={{ fontWeight: 700 }}>/ {booking.planType.replace("ly", "")}</span>
          </div>
          <p className="muted" style={{ marginTop: 0, fontSize: "0.85rem" }}>{center.availableSlots} slots available now</p>

          <form onSubmit={book} style={{ marginTop: 12 }}>
            <div className="field">
              <label>Child's name</label>
              <input value={booking.childName} onChange={(e) => setBooking({ ...booking, childName: e.target.value })} required />
            </div>
            <div className="field">
              <label>Age group</label>
              <select value={booking.ageGroup} onChange={(e) => setBooking({ ...booking, ageGroup: e.target.value })} required>
                {center.ageGroups?.map((g) => <option key={g} value={g}>{g[0].toUpperCase() + g.slice(1)}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Plan</label>
              <select value={booking.planType} onChange={(e) => setBooking({ ...booking, planType: e.target.value })}>
                <option value="hourly">Hourly — ₹{center.pricing?.hourly}</option>
                <option value="daily">Daily — ₹{center.pricing?.daily}</option>
                <option value="monthly">Monthly — ₹{center.pricing?.monthly}</option>
              </select>
            </div>
            <div className="field">
              <label>Start date</label>
              <input type="date" value={booking.startDate} onChange={(e) => setBooking({ ...booking, startDate: e.target.value })} required />
            </div>
            {center.is24x7 && (
              <div className="field">
                <label>Preferred timing</label>
                <select value={booking.slotTiming} onChange={(e) => setBooking({ ...booking, slotTiming: e.target.value })}>
                  <option value="">Day</option>
                  <option value="night">Night (22:00–06:00)</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
            )}
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy || center.availableSlots <= 0}>
              {center.availableSlots <= 0 ? "Fully booked" : busy ? "Sending…" : "Request booking"}
            </button>
          </form>

          <div style={{ borderTop: "1px solid var(--line)", marginTop: 18, paddingTop: 16 }}>
            <p className="muted" style={{ fontSize: "0.82rem", marginTop: 0 }}>Need ongoing care?</p>
            <button className="btn btn-mint" style={{ width: "100%", justifyContent: "center" }} onClick={subscribe}>
              Subscribe monthly · ₹{center.pricing?.monthly}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 24 }}>
      <h3 style={{ fontSize: "1.05rem", marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
  );
}
