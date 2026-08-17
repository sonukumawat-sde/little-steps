import { useEffect, useState } from "react";
import api from "../api/client.js";
import { useToast, BarChart } from "../components/UI.jsx";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DEFAULT_CATEGORIES = [
  { id:1, name:"Infant Care", ageRange:"0–12 months", description:"Specialized care for newborns and infants", active:true },
  { id:2, name:"Toddler Care", ageRange:"1–3 years", description:"Play-based learning and supervision", active:true },
  { id:3, name:"Preschool", ageRange:"3–6 years", description:"Structured early education programs", active:true },
  { id:4, name:"After School", ageRange:"6–12 years", description:"Post-school supervision and activities", active:false },
];

const DEFAULT_POLICIES = [
  { id:1, title:"Child Safety Policy", content:"All caregivers must undergo background verification. CCTV mandatory in all rooms. No unauthorized person allowed on premises.", category:"safety", active:true },
  { id:2, title:"Caregiver Verification Standards", content:"Valid government ID, police clearance certificate, and childcare certification required for all caregivers.", category:"verification", active:true },
  { id:3, title:"Emergency Response Protocol", content:"In case of medical emergency, caregiver must call ambulance within 2 minutes and notify parents immediately.", category:"emergency", active:true },
  { id:4, title:"Refund & Cancellation Policy", content:"Full refund for cancellations 24hrs before booking. 50% refund for same-day cancellations. No refund for no-shows.", category:"booking", active:true },
];

export default function AdminDashboard() {
  const toast = useToast();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [pendingCenters, setPendingCenters] = useState([]);
  const [allCenters, setAllCenters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolution, setResolution] = useState({});
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [policies, setPolicies] = useState(DEFAULT_POLICIES);
  const [newPolicy, setNewPolicy] = useState({ title:"", content:"", category:"safety" });
  const [showPolicyForm, setShowPolicyForm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [a, pu, au, pc, ac, b, d] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/users/pending"),
        api.get("/admin/users/all"),
        api.get("/admin/centers/pending"),
        api.get("/admin/centers/all"),
        api.get("/admin/bookings"),
        api.get("/disputes/all"),
      ]);
      setStats(a.data);
      setPendingUsers(pu.data);
      setAllUsers(au.data);
      setPendingCenters(pc.data);
      setAllCenters(ac.data);
      setBookings(b.data);
      setDisputes(d.data);
    } catch(e) { toast("Error loading data"); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setUser = async (id, status) => {
    await api.put(`/admin/users/${id}/status`, { status });
    toast(`User ${status} ✅`); load();
  };
  const setCenter = async (id, verificationStatus) => {
    await api.put(`/admin/centers/${id}/verify`, { verificationStatus });
    toast(`Center ${verificationStatus} ✅`); load();
  };
  const resolveDispute = async (id) => {
    if (!resolution[id]) return toast("Enter resolution first");
    await api.put(`/disputes/${id}/resolve`, { resolution: resolution[id], status: "resolved" });
    toast("Dispute resolved ✅"); load();
  };

  if (loading || !stats) return <div className="spinner" />;

  const monthlyData = (stats.monthlyBookings || []).map(m => ({
    label: MONTHS[m._id.month - 1],
    value: m.count,
    revenue: m.revenue,
  }));

  const kpis = [
    ["👥", stats.totalUsers, "Total users", "var(--sky)"],
    ["🧑‍🍼", stats.totalParents, "Parents", "var(--mint)"],
    ["🏫", stats.verifiedCenters, "Verified centers", "var(--coral)"],
    ["📋", stats.totalBookings, "Total bookings", "var(--navy)"],
    ["✅", stats.confirmedBookings, "Confirmed", "var(--mint)"],
    ["📈", `${stats.bookingConversionRate}%`, "Conversion rate", "var(--amber)"],
    ["🔄", stats.activeSubscriptions, "Active subscriptions", "var(--sky)"],
    ["⚠️", stats.openDisputes, "Open disputes", "var(--red)"],
  ];

  return (
    <div className="container" style={{ padding: "34px 22px 70px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:"2rem" }}>Admin Control Center</h1>
          <p className="muted" style={{ marginTop:4 }}>Manage users, centers, bookings and disputes.</p>
        </div>
        {pendingUsers.length > 0 && (
          <span className="badge badge-pending" style={{ fontSize:"0.9rem", padding:"8px 16px" }}>
            ⏳ {pendingUsers.length} pending approval{pendingUsers.length>1?"s":""}
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
        {[
          ["overview","📊 Analytics"],
          ["approvals",`👤 Approvals${pendingUsers.length>0?" ("+pendingUsers.length+")":""}`],
          ["centers",`🏫 Centers${pendingCenters.length>0?" ("+pendingCenters.length+")":""}`],
          ["bookings","📋 Bookings"],
          ["disputes",`⚠️ Disputes${stats.openDisputes>0?" ("+stats.openDisputes+")":""}`],
          ["users","👥 All Users"],
          ["categories","📂 Categories"],
          ["policies","📋 Safety Policies"],
        ].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)}
            className={tab===t ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}>{l}</button>
        ))}
      </div>

      {/* ANALYTICS */}
      {tab === "overview" && (
        <div>
          {/* KPI cards */}
          <div className="grid grid-4col" style={{ gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
            {kpis.map(([icon, val, label, color]) => (
              <div key={label} className="card" style={{ padding:20 }}>
                <div style={{ fontSize:26, marginBottom:8 }}>{icon}</div>
                <div style={{ fontFamily:"Fraunces,serif", fontSize:"1.9rem", fontWeight:700, color }}>{val}</div>
                <div className="muted" style={{ fontSize:"0.78rem", fontWeight:700, marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            <div className="card" style={{ padding:22 }}>
              <h3 style={{ fontSize:"1.05rem", marginBottom:4 }}>Monthly Bookings</h3>
              <p className="muted" style={{ margin:"0 0 12px", fontSize:"0.82rem" }}>Last 6 months activity</p>
              {monthlyData.length > 0
                ? <BarChart data={monthlyData} labelKey="label" valueKey="value" />
                : <p className="muted" style={{textAlign:"center",padding:"30px 0"}}>No booking data yet</p>}
            </div>
            <div className="card" style={{ padding:22 }}>
              <h3 style={{ fontSize:"1.05rem", marginBottom:16 }}>Platform Health</h3>
              {[
                ["Verified centers", stats.verifiedCenters, stats.totalCenters, "var(--mint)"],
                ["Confirmed bookings", stats.confirmedBookings, stats.totalBookings, "var(--coral)"],
                ["Active subscriptions", stats.activeSubscriptions, stats.totalUsers, "var(--sky)"],
              ].map(([label, val, total, color]) => (
                <div key={label} style={{ marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:"0.85rem", fontWeight:700, color:"var(--navy)" }}>{label}</span>
                    <span style={{ fontSize:"0.85rem", fontWeight:700, color }}>{val}/{total}</span>
                  </div>
                  <div style={{ height:8, background:"var(--line)", borderRadius:99 }}>
                    <div style={{ height:"100%", borderRadius:99, background:color, width: total > 0 ? `${(val/total)*100}%` : "0%" }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop:20, padding:14, background:"var(--cream)", borderRadius:12 }}>
                <div style={{ fontWeight:800, color:"var(--navy)", fontSize:"1.1rem" }}>{stats.avgUtilization}%</div>
                <div className="muted" style={{ fontSize:"0.8rem" }}>Average center utilization</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* APPROVALS */}
      {tab === "approvals" && (
        <div>
          <h3 style={{ marginBottom:16 }}>Pending Provider Approvals</h3>
          {pendingUsers.length === 0
            ? <Empty icon="✅" label="No pending approvals" />
            : <div className="grid" style={{ gap:12 }}>
                {pendingUsers.map(u => (
                  <div key={u._id} className="card" style={{ padding:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                    <div>
                      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                        <span style={{ width:40, height:40, borderRadius:"50%", background:"var(--mint-bg)", display:"grid", placeItems:"center", fontSize:18 }}>🏫</span>
                        <div>
                          <div style={{ fontWeight:800, color:"var(--navy)" }}>{u.name}</div>
                          <div className="muted" style={{ fontSize:"0.82rem" }}>{u.email} · {u.city || "—"} · Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn btn-mint btn-sm" onClick={() => setUser(u._id, "approved")}>✓ Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setUser(u._id, "rejected")}>✕ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* CENTERS */}
      {tab === "centers" && (
        <div>
          {pendingCenters.length > 0 && (
            <>
              <h3 style={{ marginBottom:14 }}>⏳ Awaiting Verification ({pendingCenters.length})</h3>
              <div className="grid" style={{ gap:12, marginBottom:28 }}>
                {pendingCenters.map(c => (
                  <div key={c._id} className="card" style={{ padding:20 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", gap:10, alignItems:"start" }}>
                          <span style={{ fontSize:28 }}>🏫</span>
                          <div>
                            <h3 style={{ fontSize:"1.1rem", marginBottom:4 }}>{c.name}</h3>
                            <p className="muted" style={{ margin:"0 0 6px", fontSize:"0.85rem" }}>
                              📍 {c.city} · By {c.provider?.name} · Capacity {c.capacity}
                            </p>
                            <p className="muted" style={{ margin:"0 0 8px", fontSize:"0.85rem" }}>
                              {c.is24x7 ? "🕐 24×7" : `🕐 ${c.operatingHours}`} ·
                              {c.supportsNightShift ? " 🌙 Night" : ""} ·
                              ₹{c.pricing?.hourly}/hr · ₹{c.pricing?.monthly}/mo
                            </p>
                            <div className="tag-row">
                              {c.certifications?.length
                                ? c.certifications.map(x => <span key={x} className="badge badge-age">📜 {x}</span>)
                                : <span className="badge badge-pending">No certifications</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:8, alignSelf:"center" }}>
                        <button className="btn btn-mint btn-sm" onClick={() => setCenter(c._id, "verified")}>✓ Verify</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setCenter(c._id, "rejected")}>✕ Reject</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <h3 style={{ marginBottom:14 }}>All Centers ({allCenters.length})</h3>
          <div className="grid" style={{ gap:10 }}>
            {allCenters.map(c => (
              <div key={c._id} className="card" style={{ padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                <div>
                  <span style={{ fontWeight:700, color:"var(--navy)" }}>{c.name}</span>
                  <span className="muted" style={{ fontSize:"0.82rem", marginLeft:10 }}>{c.city} · {c.provider?.name}</span>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span className={`badge ${c.verificationStatus==="verified"?"badge-verified":c.verificationStatus==="pending"?"badge-pending":"badge"}`}
                    style={c.verificationStatus==="rejected"?{background:"var(--red-bg)",color:"var(--red)"}:{}}>
                    {c.verificationStatus}
                  </span>
                  {c.verificationStatus === "pending" && (
                    <button className="btn btn-mint btn-sm" onClick={() => setCenter(c._id, "verified")}>Verify</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOOKINGS */}
      {tab === "bookings" && (
        <div>
          <h3 style={{ marginBottom:14 }}>All Bookings ({bookings.length})</h3>
          <div className="grid" style={{ gap:10 }}>
            {bookings.map(b => (
              <div key={b._id} className="card" style={{ padding:"14px 20px", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, alignItems:"center" }}>
                <div>
                  <span style={{ fontWeight:700, color:"var(--navy)" }}>{b.center?.name}</span>
                  <span className="muted" style={{ fontSize:"0.82rem", marginLeft:8 }}>{b.parent?.name} · {b.childName} · {b.planType}</span>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontWeight:700, color:"var(--coral-dark)" }}>₹{b.amount}</span>
                  <span className={`badge ${
                    b.status==="confirmed"?"badge-verified":
                    b.status==="pending"?"badge-pending":
                    b.status==="completed"?"badge-age":"badge"
                  }`} style={b.status==="rejected"||b.status==="cancelled"?{background:"var(--red-bg)",color:"var(--red)"}:{}}>
                    {b.status}
                  </span>
                  <span className="muted" style={{ fontSize:"0.75rem" }}>{new Date(b.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {bookings.length === 0 && <Empty icon="📋" label="No bookings yet" />}
          </div>
        </div>
      )}

      {/* DISPUTES */}
      {tab === "disputes" && (
        <div>
          <h3 style={{ marginBottom:14 }}>Disputes & Grievances ({disputes.length})</h3>
          {disputes.length === 0
            ? <Empty icon="🤝" label="No disputes raised" />
            : <div className="grid" style={{ gap:14 }}>
                {disputes.map(d => (
                  <div key={d._id} className="card" style={{ padding:22 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10, marginBottom:12 }}>
                      <div>
                        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:6 }}>
                          <span style={{ fontWeight:800, color:"var(--navy)" }}>Dispute #{d._id.slice(-6).toUpperCase()}</span>
                          <span className={`badge dispute-badge-${d.status}`}>{d.status.replace("_"," ")}</span>
                        </div>
                        <p className="muted" style={{ margin:0, fontSize:"0.85rem" }}>
                          Raised by <strong>{d.raisedBy?.name}</strong> against <strong>{d.against?.name}</strong>
                        </p>
                        <p style={{ margin:"8px 0 0", fontSize:"0.9rem", color:"var(--navy-soft)" }}>
                          <strong>Reason:</strong> {d.reason}
                        </p>
                        <p style={{ margin:"4px 0 0", fontSize:"0.88rem" }}>{d.description}</p>
                        {d.resolution && (
                          <div style={{ marginTop:10, padding:"10px 14px", background:"var(--mint-bg)", borderRadius:10 }}>
                            <span style={{ fontWeight:700, color:"#2f8f68" }}>Resolution: </span>{d.resolution}
                          </div>
                        )}
                      </div>
                      <span className="muted" style={{ fontSize:"0.78rem" }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                    {d.status === "open" && (
                      <div style={{ display:"flex", gap:10, marginTop:8 }}>
                        <input
                          placeholder="Enter resolution..."
                          value={resolution[d._id] || ""}
                          onChange={e => setResolution(r => ({ ...r, [d._id]: e.target.value }))}
                          style={{ flex:1, padding:"10px 14px", border:"2px solid var(--line)", borderRadius:10, fontSize:"0.9rem" }}
                        />
                        <button className="btn btn-mint btn-sm" onClick={() => resolveDispute(d._id)}>Resolve</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* SERVICE CATEGORIES */}
      {tab === "categories" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div>
              <h3 style={{fontSize:"1.2rem"}}>📂 Service Categories & Age Groups</h3>
              <p className="muted" style={{margin:"4px 0 0",fontSize:"0.85rem"}}>Manage childcare service categories available on the platform.</p>
            </div>
          </div>
          <div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16,marginBottom:24}}>
            {categories.map(cat=>(
              <div key={cat.id} className="card" style={{padding:22,opacity:cat.active?1:0.6}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:10}}>
                  <div>
                    <h3 style={{fontSize:"1.05rem",marginBottom:4}}>{cat.name}</h3>
                    <span className="badge badge-age">{cat.ageRange}</span>
                  </div>
                  <label style={{display:"flex",gap:6,alignItems:"center",cursor:"pointer"}}>
                    <input type="checkbox" checked={cat.active}
                      onChange={()=>setCategories(cs=>cs.map(c=>c.id===cat.id?{...c,active:!c.active}:c))}
                      style={{width:17,height:17}}/>
                    <span style={{fontSize:"0.8rem",fontWeight:700,color:"var(--navy-soft)"}}>{cat.active?"Active":"Inactive"}</span>
                  </label>
                </div>
                <p className="muted" style={{margin:0,fontSize:"0.85rem"}}>{cat.description}</p>
              </div>
            ))}
          </div>
          <div className="card" style={{padding:22}}>
            <h4 style={{marginBottom:16}}>Add New Category</h4>
            <div className="row">
              <div className="field"><label>Category name</label><input placeholder="e.g. Special Needs Care"/></div>
              <div className="field"><label>Age range</label><input placeholder="e.g. 2–10 years"/></div>
            </div>
            <div className="field"><label>Description</label><input placeholder="Brief description of this category..."/></div>
            <button className="btn btn-primary btn-sm" onClick={()=>toast("Category saved ✅")}>Save Category</button>
          </div>
        </div>
      )}

      {/* SAFETY POLICIES */}
      {tab === "policies" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div>
              <h3 style={{fontSize:"1.2rem"}}>📋 Content & Safety Policy Management</h3>
              <p className="muted" style={{margin:"4px 0 0",fontSize:"0.85rem"}}>Manage platform safety policies visible to parents and providers.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={()=>setShowPolicyForm(s=>!s)}>
              {showPolicyForm?"✕ Close":"+ Add Policy"}
            </button>
          </div>

          {showPolicyForm && (
            <div className="card" style={{padding:22,marginBottom:20}}>
              <h4 style={{marginBottom:16}}>New Safety Policy</h4>
              <div className="row">
                <div className="field"><label>Policy title</label>
                  <input value={newPolicy.title} onChange={e=>setNewPolicy({...newPolicy,title:e.target.value})} placeholder="e.g. Child Safety Standards"/>
                </div>
                <div className="field"><label>Category</label>
                  <select value={newPolicy.category} onChange={e=>setNewPolicy({...newPolicy,category:e.target.value})}>
                    <option value="safety">Safety</option>
                    <option value="verification">Verification</option>
                    <option value="emergency">Emergency</option>
                    <option value="booking">Booking</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
              <div className="field"><label>Policy content</label>
                <textarea rows={4} value={newPolicy.content} onChange={e=>setNewPolicy({...newPolicy,content:e.target.value})} placeholder="Describe the policy in detail..."/>
              </div>
              <button className="btn btn-primary btn-sm" onClick={()=>{
                if(!newPolicy.title||!newPolicy.content) return toast("Fill all fields");
                setPolicies(ps=>[...ps,{id:Date.now(),...newPolicy,active:true}]);
                setNewPolicy({title:"",content:"",category:"safety"});
                setShowPolicyForm(false);
                toast("Policy added ✅");
              }}>Add Policy</button>
            </div>
          )}

          <div className="grid" style={{gap:14}}>
            {policies.map(p=>(
              <div key={p.id} className="card" style={{padding:22,opacity:p.active?1:0.6}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:10}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{fontSize:"1.4rem"}}>
                      {p.category==="safety"?"🛡":p.category==="verification"?"✓":p.category==="emergency"?"🚨":p.category==="booking"?"📅":"📋"}
                    </span>
                    <div>
                      <h3 style={{fontSize:"1.05rem",marginBottom:4}}>{p.title}</h3>
                      <span className="badge badge-age">{p.category}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span className={`badge ${p.active?"badge-verified":"badge-pending"}`}>{p.active?"Active":"Inactive"}</span>
                    <button className={`btn btn-sm ${p.active?"btn-danger":"btn-mint"}`}
                      onClick={()=>setPolicies(ps=>ps.map(pol=>pol.id===p.id?{...pol,active:!pol.active}:pol))}>
                      {p.active?"Deactivate":"Activate"}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={()=>{setPolicies(ps=>ps.filter(pol=>pol.id!==p.id));toast("Policy removed");}}>✕</button>
                  </div>
                </div>
                <p style={{margin:0,fontSize:"0.9rem",color:"var(--navy-soft)",lineHeight:1.6}}>{p.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL USERS */}
      {tab === "users" && (
        <div>
          <h3 style={{ marginBottom:14 }}>All Users ({allUsers.length})</h3>
          <div className="grid" style={{ gap:10 }}>
            {allUsers.map(u => (
              <div key={u._id} className="card" style={{ padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <span style={{ width:36, height:36, borderRadius:"50%", background:"var(--mint-bg)", display:"grid", placeItems:"center" }}>
                    {u.role==="parent"?"👨‍👩‍👧":"🏫"}
                  </span>
                  <div>
                    <div style={{ fontWeight:700, color:"var(--navy)" }}>{u.name}</div>
                    <div className="muted" style={{ fontSize:"0.78rem" }}>{u.email} · {u.city || "—"}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span className="badge badge-age">{u.role}</span>
                  <span className={`badge ${u.status==="approved"?"badge-verified":"badge-pending"}`}>{u.status}</span>
                  {u.status==="pending" && <button className="btn btn-mint btn-sm" onClick={() => setUser(u._id,"approved")}>Approve</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Empty({ icon, label }) {
  return (
    <div className="card" style={{ padding:50, textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:10 }}>{icon}</div>
      <h3 style={{ color:"var(--muted)" }}>{label}</h3>
    </div>
  );
}
