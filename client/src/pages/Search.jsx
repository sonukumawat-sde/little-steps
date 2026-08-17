import { useEffect, useState } from "react";
import api from "../api/client.js";
import CenterCard from "../components/CenterCard.jsx";
import SearchMapView from "../components/SearchMapView.jsx";

const empty = { q: "", city: "", is24x7: false, ageGroup: "", timing: "", planType: "hourly", maxPrice: "" };

export default function Search() {
  const [filters, setFilters] = useState(empty);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v === "" || v === false) return;
      if (k === "maxPrice" && !filters.planType) return;
      params[k] = v;
    });
    // only send price with plan
    if (params.maxPrice && !params.planType) delete params.maxPrice;
    try {
      const { data } = await api.get("/centers", { params });
      setCenters(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div className="container" style={{ padding: "38px 22px 70px" }}>
      <h1 style={{ fontSize: "2.2rem", marginBottom: 6 }}>Find trusted care</h1>
      <p className="muted" style={{ marginTop: 0, marginBottom: 26 }}>
        Filter verified centers by availability, age group, timing and budget.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 26, alignItems: "start" }}>
        {/* Filter panel */}
        <div className="card" style={{ padding: 22, position: "sticky", top: 88 }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: 16 }}>Filters</h3>

          <div className="field">
            <label>Search by name</label>
            <input value={filters.q} onChange={(e) => set("q", e.target.value)} placeholder="e.g. Sunshine" />
          </div>
          <div className="field">
            <label>City</label>
            <input value={filters.city} onChange={(e) => set("city", e.target.value)} placeholder="Any city" />
          </div>
          <div className="field">
            <label>Age group</label>
            <select value={filters.ageGroup} onChange={(e) => set("ageGroup", e.target.value)}>
              <option value="">Any age</option>
              <option value="infant">Infant</option>
              <option value="toddler">Toddler</option>
              <option value="preschool">Preschool</option>
            </select>
          </div>
          <div className="field">
            <label>Timing</label>
            <select value={filters.timing} onChange={(e) => set("timing", e.target.value)}>
              <option value="">Any timing</option>
              <option value="night">Night shift</option>
              <option value="emergency">Emergency care</option>
            </select>
          </div>
          <div className="field">
            <label>Max price per…</label>
            <div className="row">
              <select value={filters.planType} onChange={(e) => set("planType", e.target.value)}>
                <option value="hourly">Hour</option>
                <option value="daily">Day</option>
                <option value="monthly">Month</option>
              </select>
              <input type="number" value={filters.maxPrice} onChange={(e) => set("maxPrice", e.target.value)} placeholder="₹ max" />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: "var(--navy-soft)", margin: "6px 0 16px", cursor: "pointer" }}>
            <input type="checkbox" checked={filters.is24x7} onChange={(e) => set("is24x7", e.target.checked)} style={{ width: 18, height: 18 }} />
            Only 24×7 centers
          </label>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={load}>
            Apply filters
          </button>
          <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => { setFilters(empty); setTimeout(load, 0); }}>
            Reset
          </button>
        </div>

        {/* Results */}
        <div>
          {!loading && centers.length > 0 && <SearchMapView centers={centers} />}
          {loading ? (
            <div className="spinner" />
          ) : centers.length === 0 ? (
            <div className="card" style={{ padding: 50, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <h3>No centers match those filters</h3>
              <p className="muted">Try widening your search or resetting the filters.</p>
            </div>
          ) : (
            <>
              <p className="muted" style={{ fontWeight: 700, marginBottom: 16 }}>{centers.length} center{centers.length > 1 ? "s" : ""} found</p>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
                {centers.map((c) => <CenterCard key={c._id} center={c} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
