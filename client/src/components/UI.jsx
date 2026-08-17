import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import api from "../api/client.js";

/* ---------- Logo ---------- */
export function Logo({ size = 26 }) {
  return (
    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <span style={{ width: size+8, height: size+8, borderRadius: "50%", background: "linear-gradient(135deg,#ffb997,#f4845f)", display: "grid", placeItems: "center", fontSize: size-6 }}>🧸</span>
      <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: size-2, color: "var(--navy)" }}>Little&nbsp;Steps</span>
    </Link>
  );
}

/* ---------- Notification Bell ---------- */
function NotifBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const ref = useRef();

  const loadCount = async () => {
    try { const { data } = await api.get("/notifications/unread-count"); setCount(data.count); } catch {}
  };
  const loadNotifs = async () => {
    try { const { data } = await api.get("/notifications"); setNotifs(data); } catch {}
  };

  useEffect(() => { loadCount(); const t = setInterval(loadCount, 30000); return () => clearInterval(t); }, []);

  const toggle = async () => {
    if (!open) { await loadNotifs(); await api.put("/notifications/mark-read"); setCount(0); }
    setOpen(o => !o);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const timeAgo = (d) => {
    const diff = Date.now() - new Date(d);
    const m = Math.floor(diff/60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m/60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="notif-bell" onClick={toggle} title="Notifications">
        🔔
        {count > 0 && <span className="notif-badge">{count > 9 ? "9+" : count}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800, color: "var(--navy)", fontFamily: "Fraunces,serif" }}>Notifications</span>
            <span className="muted" style={{ fontSize: "0.78rem" }}>{notifs.length} total</span>
          </div>
          {notifs.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🔕</div>
              <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>No notifications yet</p>
            </div>
          ) : notifs.slice(0,8).map(n => (
            <div key={n._id} className={`notif-item ${!n.read ? "unread" : ""}`}>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--navy)", marginBottom: 3 }}>{n.title}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 4 }}>{n.message}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--peach)", fontWeight: 700 }}>{timeAgo(n.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Navbar ---------- */
export function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const dash = () => {
    if (!user) return "/login";
    return user.role === "admin" ? "/admin" : user.role === "provider" ? "/provider" : "/parent";
  };

  return (
    <header style={{ borderBottom: "1px solid var(--line)", background: "rgba(255,249,244,0.95)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div className="container" style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <nav className="nav-links" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/search" className="muted hide-mobile" style={{ fontWeight: 700 }}>Find Care</Link>
          {user ? (
            <>
              <NotifBell />
              <Link to={dash()} className="btn btn-ghost btn-sm">
                {user.role[0].toUpperCase() + user.role.slice(1)} Dashboard
              </Link>
              <button className="btn btn-primary btn-sm" onClick={() => { logout(); nav("/"); }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/* ---------- Badges ---------- */
export function CenterBadges({ center }) {
  return (
    <div className="tag-row">
      {center.is24x7 && <span className="badge badge-24">🕐 24×7</span>}
      {center.supportsNightShift && <span className="badge badge-night">🌙 Night shift</span>}
      {center.supportsEmergency && <span className="badge badge-24" style={{background:"#ffe8e8",color:"#c0392b"}}>🚨 Emergency</span>}
      {center.verificationStatus === "verified" && <span className="badge badge-verified">✓ Verified</span>}
      {center.verificationStatus === "pending" && <span className="badge badge-pending">⏳ Pending</span>}
    </div>
  );
}

export function AgeBadges({ groups = [] }) {
  const label = { infant: "👶 Infant", toddler: "🧒 Toddler", preschool: "🧑 Preschool" };
  return (
    <div className="tag-row">
      {groups.map(g => <span key={g} className="badge badge-age">{label[g] || g}</span>)}
    </div>
  );
}

/* ---------- Simple Bar Chart ---------- */
export function BarChart({ data = [], labelKey = "label", valueKey = "value", color }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="chart-bar">
      {data.map((d, i) => (
        <div key={i} className="chart-col">
          <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--navy)" }}>{d[valueKey]}</span>
          <div className="chart-fill" style={{ height: `${(d[valueKey]/max)*90}px`, background: color || "linear-gradient(180deg,var(--coral),var(--peach))" }} />
          <span className="chart-label">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Toast ---------- */
const ToastCtx = createContext();
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState("");
  const show = useCallback((m) => { setMsg(m); setTimeout(() => setMsg(""), 2800); }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && <div className="toast">{msg}</div>}
    </ToastCtx.Provider>
  );
}
