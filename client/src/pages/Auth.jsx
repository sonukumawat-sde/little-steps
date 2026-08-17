import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../components/UI.jsx";

const dashFor = (role) =>
  role === "admin" ? "/admin" : role === "provider" ? "/provider" : "/parent";

function Shell({ title, sub, children }) {
  return (
    <div className="container" style={{ maxWidth: 460, padding: "56px 22px" }}>
      <div className="card" style={{ padding: 34 }}>
        <h1 style={{ fontSize: "1.8rem", marginBottom: 6 }}>{title}</h1>
        <p className="muted" style={{ marginTop: 0, marginBottom: 24 }}>{sub}</p>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast(`Welcome back, ${user.name.split(" ")[0]}!`);
      nav(dashFor(user.role));
    } catch (err) {
      toast(err.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const fill = (email) => setForm({ email, password: email.includes("admin") ? "admin123" : email.includes("provider") ? "provider123" : "parent123" });

  return (
    <Shell title="Welcome back" sub="Log in to manage your childcare.">
      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
        <p className="muted" style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: 8 }}>Quick demo logins:</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[["Parent", "parent@littlesteps.com"], ["Provider", "provider@littlesteps.com"], ["Admin", "admin@littlesteps.com"]].map(([l, e]) => (
            <button key={l} type="button" className="btn btn-ghost btn-sm" onClick={() => fill(e)}>{l}</button>
          ))}
        </div>
      </div>
      <p className="muted" style={{ marginTop: 18, fontSize: "0.9rem" }}>
        New here? <Link to="/register" style={{ color: "var(--coral-dark)", fontWeight: 700 }}>Create an account</Link>
      </p>
    </Shell>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", city: "", role: "parent" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await register(form);
      if (user.role === "provider" && user.status === "pending") {
        toast("Account created — awaiting admin approval.");
      } else {
        toast(`Welcome, ${user.name.split(" ")[0]}!`);
      }
      nav(dashFor(user.role));
    } catch (err) {
      toast(err.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <Shell title="Create your account" sub="Join as a parent or list your center.">
      <form onSubmit={submit}>
        <div className="field">
          <label>I am a…</label>
          <select value={form.role} onChange={set("role")}>
            <option value="parent">Parent looking for care</option>
            <option value="provider">Childcare provider</option>
          </select>
        </div>
        <div className="field">
          <label>Full name</label>
          <input value={form.name} onChange={set("name")} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set("email")} required />
        </div>
        <div className="row">
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={set("phone")} />
          </div>
          <div className="field">
            <label>City</label>
            <input value={form.city} onChange={set("city")} />
          </div>
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.password} onChange={set("password")} required minLength={6} />
        </div>
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 18, fontSize: "0.9rem" }}>
        Already registered? <Link to="/login" style={{ color: "var(--coral-dark)", fontWeight: 700 }}>Log in</Link>
      </p>
    </Shell>
  );
}
