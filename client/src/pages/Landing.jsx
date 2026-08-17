import { Link } from "react-router-dom";

const features = [
  { icon: "✓", title: "100% Verified caregivers", text: "Every center and caregiver is document-checked, background-verified and admin-approved before going live on our platform." },
  { icon: "🕐", title: "True 24×7 availability", text: "Filter for genuine round-the-clock centers with night-shift and emergency support — for any work schedule." },
  { icon: "🔍", title: "Transparent pricing", text: "See exact hourly, daily and monthly rates upfront. No hidden charges, no surprises. Compare and decide confidently." },
  { icon: "📅", title: "Flexible booking plans", text: "Book by the hour for emergencies, daily for occasional needs, or subscribe monthly for ongoing care that auto-renews." },
];

const steps = [
  ["01", "Search & Filter", "Find daycare centers near you. Filter by 24×7 availability, age group (infant/toddler/preschool), timing and budget."],
  ["02", "Compare Centers", "View caregiver profiles, safety certifications, photos and real parent reviews before deciding."],
  ["03", "Book Instantly", "Send a booking request for hourly, daily or monthly slots. Providers confirm within hours."],
  ["04", "Track & Review", "Get real-time notifications, track booking status and leave feedback after service."],
];

const cities = ["Bengaluru", "Mumbai", "Pune", "Delhi", "Hyderabad", "Chennai"];

const testimonials = [
  { name: "Riya S.", city: "Bengaluru", text: "Found a 24×7 center for my night shift in 10 minutes. Anita di takes amazing care of Aanya!", rating: 5 },
  { name: "Arjun M.", city: "Pune", text: "Tiny Tots Night Crèche is a lifesaver. As a nurse working nights, this platform changed my life.", rating: 5 },
  { name: "Priya N.", city: "Mumbai", text: "Happy Kids Bandra is outstanding. Dr. Fatima's team is incredibly professional and caring.", rating: 5 },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="container" style={{ padding: "60px 22px 50px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40, alignItems: "center" }} className="hero-grid">
          <div>
            <span className="badge badge-24" style={{ marginBottom: 20, fontSize: "0.85rem", padding: "6px 14px" }}>
              🕐 India's first 24×7 childcare platform
            </span>
            <h1 style={{ fontSize: "3.4rem", lineHeight: 1.04, marginBottom: 20 }}>
              Trusted childcare,<br />
              <span style={{ color: "var(--coral)" }}>any hour</span> you need it.
            </h1>
            <p className="muted" style={{ fontSize: "1.1rem", maxWidth: 480, marginBottom: 30, lineHeight: 1.7 }}>
              Little Steps connects working parents with <strong>verified daycare centers</strong> offering
              round-the-clock, transparent and flexible childcare — from infants to preschoolers.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/search" className="btn btn-primary" style={{ fontSize: "1rem", padding: "13px 26px" }}>
                🔍 Find care near you
              </Link>
              <Link to="/register" className="btn btn-ghost" style={{ fontSize: "1rem", padding: "13px 26px" }}>
                🏫 List your center
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 30, marginTop: 36, flexWrap: "wrap" }}>
              {[["200+", "Verified centers"], ["24×7", "Available care"], ["5000+", "Happy families"], ["3", "Flexible plans"]].map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: "Fraunces,serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--coral-dark)" }}>{n}</div>
                  <div className="muted" style={{ fontSize: "0.8rem", fontWeight: 700 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div className="card" style={{ padding: 28, background: "linear-gradient(160deg,#fff,#fff4ec)" }}>
            <div style={{ textAlign: "center", fontSize: 72, marginBottom: 16 }}>👶</div>
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { icon: "✓", text: "Dr. Fatima Sheikh — 12 yrs · Pediatric First Aid", color: "var(--mint-bg)" },
                { icon: "🏫", text: "Happy Kids 24hr Care · Bandra, Mumbai", color: "#fff" },
                { icon: "🕐", text: "Night shift · Emergency care · Infant care", color: "#fff" },
                { icon: "★", text: "4.9/5 rating · 63 verified reviews", color: "var(--amber-bg)" },
              ].map(({ icon, text, color }) => (
                <div key={text} className="card" style={{ padding: "11px 16px", boxShadow: "none", background: color, display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--navy)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section style={{ background: "var(--navy)", padding: "18px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap" }}>NOW AVAILABLE IN</span>
          {cities.map(c => (
            <Link key={c} to={`/search?city=${c}`} style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem", opacity: 0.9 }}>📍 {c}</Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container" style={{ padding: "60px 22px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: "2.2rem" }}>Why parents trust Little Steps</h2>
          <p className="muted" style={{ fontSize: "1rem", marginTop: 8 }}>Built for India's working parents — transparent, safe, and always available.</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {features.map(f => (
            <div key={f.title} className="card" style={{ padding: 24 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: "var(--mint-bg)", color: "#2f8f68", display: "grid", placeItems: "center", fontSize: 22, marginBottom: 16 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: "1.05rem", marginBottom: 10 }}>{f.title}</h3>
              <p className="muted" style={{ fontSize: "0.88rem", margin: 0, lineHeight: 1.6 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "var(--navy)", padding: "60px 0" }}>
        <div className="container">
          <h2 style={{ fontSize: "2.2rem", color: "#fff", textAlign: "center", marginBottom: 40 }}>How Little Steps works</h2>
          <div className="grid" style={{ gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
            {steps.map(([n, t, d]) => (
              <div key={t}>
                <div style={{ fontFamily: "Fraunces,serif", fontSize: "2.8rem", color: "var(--coral)", fontWeight: 700, marginBottom: 10 }}>{n}</div>
                <h3 style={{ fontSize: "1.15rem", color: "#fff", marginBottom: 10 }}>{t}</h3>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", margin: 0, lineHeight: 1.6 }}>{d}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link to="/search" className="btn btn-primary" style={{ fontSize: "1rem", padding: "13px 28px" }}>Get started for free →</Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container" style={{ padding: "60px 22px" }}>
        <h2 style={{ fontSize: "2.2rem", textAlign: "center", marginBottom: 36 }}>What parents say</h2>
        <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {testimonials.map(t => (
            <div key={t.name} className="card" style={{ padding: 24 }}>
              <div style={{ color: "var(--amber)", fontSize: "1.1rem", marginBottom: 12 }}>{"★".repeat(t.rating)}</div>
              <p style={{ margin: "0 0 16px", lineHeight: 1.7, fontStyle: "italic", color: "var(--navy-soft)" }}>"{t.text}"</p>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--mint-bg)", display: "grid", placeItems: "center", fontWeight: 800, color: "#2f8f68" }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: "var(--navy)", fontSize: "0.9rem" }}>{t.name}</div>
                  <div className="muted" style={{ fontSize: "0.78rem" }}>📍 {t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: "linear-gradient(135deg,var(--coral),var(--peach))", padding: "50px 22px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2rem", color: "#fff", marginBottom: 12 }}>Find trusted care for your child today</h2>
        <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 24, fontSize: "1rem" }}>
          Join 5,000+ parents who trust Little Steps for 24×7 verified childcare.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/search" className="btn" style={{ background: "#fff", color: "var(--coral-dark)", fontWeight: 800 }}>🔍 Find care now</Link>
          <Link to="/register" className="btn" style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.6)" }}>Create free account</Link>
        </div>
      </section>
    </div>
  );
}
