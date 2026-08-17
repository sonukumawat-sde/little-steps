import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client.js";
import { useToast } from "../components/UI.jsx";

const statusColor = {
  pending:"badge-pending", confirmed:"badge-verified",
  rejected:"", completed:"badge-age", cancelled:"badge-pending",
};

export default function ParentDashboard() {
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [subs, setSubs] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [tab, setTab] = useState("bookings");
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState({});
  const [comment, setComment] = useState({});
  const [disputeForm, setDisputeForm] = useState({ bookingId:"", reason:"", description:"" });
  const [showDisputeFor, setShowDisputeFor] = useState(null);

  const load = async () => {
    setLoading(true);
    const [b, s, d] = await Promise.all([
      api.get("/bookings/mine"),
      api.get("/subscriptions/mine"),
      api.get("/disputes/mine"),
    ]);
    setBookings(b.data); setSubs(s.data); setDisputes(d.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submitFeedback = async (id) => {
    if (!rating[id]) return toast("Pick a rating first");
    try {
      await api.post(`/bookings/${id}/feedback`, { rating: Number(rating[id]), comment: comment[id] || "" });
      toast("Thanks for your feedback! ⭐"); load();
    } catch { toast("Failed to submit"); }
  };

  const cancelSub = async (id) => {
    await api.put(`/subscriptions/${id}/cancel`);
    toast("Subscription cancelled"); load();
  };

  const raiseDispute = async (e) => {
    e.preventDefault();
    try {
      await api.post("/disputes", disputeForm);
      toast("Dispute raised — admin will review shortly ✅");
      setShowDisputeFor(null);
      setDisputeForm({ bookingId:"", reason:"", description:"" });
      load();
    } catch(err) { toast(err.response?.data?.message || "Failed"); }
  };

  const confirmed = bookings.filter(b=>b.status==="confirmed").length;
  const activeSubs = subs.filter(s=>s.status==="active").length;
  const spent = bookings.filter(b=>["confirmed","completed"].includes(b.status)).reduce((s,b)=>s+(b.amount||0),0);

  const REASONS = ["Service not as described","Overbooking","Staff misconduct","Safety concern","Incorrect billing","Other"];

  return (
    <div className="container" style={{ padding:"34px 22px 70px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12, marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:"2rem" }}>Your Childcare</h1>
          <p className="muted" style={{ marginTop:4 }}>Manage bookings, subscriptions and leave feedback.</p>
        </div>
        <Link to="/search" className="btn btn-primary">+ Find Care</Link>
      </div>

      {/* Stats */}
      <div className="grid" style={{ gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {[
          ["📋", bookings.length, "Total bookings", "var(--navy)"],
          ["✅", confirmed, "Confirmed", "var(--mint)"],
          ["🔄", activeSubs, "Active plans", "var(--sky)"],
          ["💰", `₹${spent.toLocaleString()}`, "Total spent", "var(--coral)"],
        ].map(([icon,val,label,color])=>(
          <div key={label} className="card" style={{ padding:16, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:22 }}>{icon}</span>
            <div>
              <div style={{ fontFamily:"Fraunces,serif", fontSize:"1.5rem", fontWeight:700, color }}>{val}</div>
              <div className="muted" style={{ fontSize:"0.78rem", fontWeight:700 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
        {[
          ["bookings",`📋 Bookings (${bookings.length})`],
          ["subs",`🔄 Subscriptions (${subs.length})`],
          ["disputes",`⚠️ Disputes (${disputes.length})`],
        ].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} className={tab===t?"btn btn-primary btn-sm":"btn btn-ghost btn-sm"}>{l}</button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : <>

        {/* BOOKINGS */}
        {tab==="bookings" && (
          bookings.length===0
          ? <Empty icon="🍼" label="No bookings yet" cta />
          : <div className="grid" style={{ gap:14 }}>
              {bookings.map(b=>(
                <div key={b._id} className="card" style={{ padding:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", flexWrap:"wrap", gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                        <span style={{ fontFamily:"Fraunces,serif", fontSize:"1.1rem", fontWeight:700, color:"var(--navy)" }}>{b.center?.name || "Center"}</span>
                        <span className={`badge ${statusColor[b.status]}`}
                          style={["rejected","cancelled"].includes(b.status)?{background:"var(--red-bg)",color:"var(--red)"}:{}}>
                          {b.status}
                        </span>
                      </div>
                      <p className="muted" style={{ margin:0, fontSize:"0.86rem" }}>
                        👶 {b.childName} ({b.ageGroup}) · 📅 {b.planType} ·
                        💰 ₹{b.amount} {b.slotTiming?`· 🕐 ${b.slotTiming}`:""}
                      </p>
                      <p className="muted" style={{ margin:"4px 0 0", fontSize:"0.8rem" }}>
                        {new Date(b.startDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{ display:"flex", gap:8, flexDirection:"column", alignItems:"flex-end" }}>
                      {b.status==="completed" && !b.feedback?.rating && (
                        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                          <select value={rating[b._id]||""} onChange={e=>setRating({...rating,[b._id]:e.target.value})}
                            style={{ padding:"8px 10px", borderRadius:10, border:"2px solid var(--line)", fontSize:"0.88rem" }}>
                            <option value="">Rate your experience</option>
                            {[5,4,3,2,1].map(n=><option key={n} value={n}>{"★".repeat(n)} ({n}/5)</option>)}
                          </select>
                          <button className="btn btn-mint btn-sm" onClick={()=>submitFeedback(b._id)}>Submit</button>
                        </div>
                      )}
                      {b.status==="completed" && !b.feedback?.rating && (
                        <div style={{ width:"100%" }}>
                          <input placeholder="Share your experience... (optional)"
                            value={comment[b._id]||""} onChange={e=>setComment({...comment,[b._id]:e.target.value})}
                            style={{ width:"100%", padding:"8px 12px", border:"2px solid var(--line)", borderRadius:10, fontSize:"0.85rem" }} />
                        </div>
                      )}
                      {b.feedback?.rating && (
                        <span className="badge badge-age">You rated ★ {b.feedback.rating}/5</span>
                      )}
                      {["confirmed","completed"].includes(b.status) && !disputes.find(d=>String(d.booking?._id)===String(b._id)) && (
                        <button className="btn btn-ghost btn-sm" style={{ color:"var(--red)", borderColor:"var(--red)" }}
                          onClick={()=>{ setShowDisputeFor(b._id); setDisputeForm({bookingId:b._id,reason:"",description:""}); }}>
                          ⚠️ Raise dispute
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dispute form inline */}
                  {showDisputeFor===b._id && (
                    <form onSubmit={raiseDispute} style={{ marginTop:16, padding:16, background:"var(--red-bg)", borderRadius:12 }}>
                      <h4 style={{ color:"var(--red)", marginBottom:12 }}>⚠️ Raise a Dispute</h4>
                      <div className="field">
                        <label>Reason</label>
                        <select value={disputeForm.reason} onChange={e=>setDisputeForm({...disputeForm,reason:e.target.value})} required>
                          <option value="">Select reason...</option>
                          {REASONS.map(r=><option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label>Description</label>
                        <textarea rows={3} value={disputeForm.description} onChange={e=>setDisputeForm({...disputeForm,description:e.target.value})}
                          placeholder="Please describe the issue in detail..." required />
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        <button type="submit" className="btn btn-danger btn-sm">Submit dispute</button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={()=>setShowDisputeFor(null)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
        )}

        {/* SUBSCRIPTIONS */}
        {tab==="subs" && (
          subs.length===0
          ? <Empty icon="🔄" label="No subscriptions yet" cta />
          : <div className="grid" style={{ gap:14 }}>
              {subs.map(s=>(
                <div key={s._id} className="card" style={{ padding:22, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                  <div>
                    <h3 style={{ fontSize:"1.1rem", marginBottom:6 }}>{s.center?.name}</h3>
                    <p className="muted" style={{ margin:0, fontSize:"0.86rem" }}>
                      📍 {s.center?.city} · ₹{s.amount}/month ·
                      Renews {new Date(s.endDate).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                    </p>
                  </div>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <span className={`badge ${s.status==="active"?"badge-verified":"badge-pending"}`}>{s.status}</span>
                    {s.status==="active" && (
                      <button className="btn btn-danger btn-sm" onClick={()=>cancelSub(s._id)}>Cancel</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
        )}

        {/* DISPUTES */}
        {tab==="disputes" && (
          disputes.length===0
          ? <Empty icon="🤝" label="No disputes raised" />
          : <div className="grid" style={{ gap:14 }}>
              {disputes.map(d=>(
                <div key={d._id} className="card" style={{ padding:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"start", flexWrap:"wrap", gap:10 }}>
                    <div>
                      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:6 }}>
                        <span style={{ fontWeight:800, color:"var(--navy)" }}>Dispute #{d._id.slice(-6).toUpperCase()}</span>
                        <span className={`badge ${d.status==="resolved"?"badge-verified":d.status==="open"?"badge-pending":"badge-age"}`}>
                          {d.status.replace("_"," ")}
                        </span>
                      </div>
                      <p style={{ margin:0, fontSize:"0.88rem" }}><strong>Reason:</strong> {d.reason}</p>
                      <p style={{ margin:"4px 0 0", fontSize:"0.85rem", color:"var(--muted)" }}>{d.description}</p>
                      {d.resolution && (
                        <div style={{ marginTop:10, padding:"10px 14px", background:"var(--mint-bg)", borderRadius:10 }}>
                          <span style={{ fontWeight:700, color:"#2f8f68" }}>Admin resolution: </span>{d.resolution}
                        </div>
                      )}
                    </div>
                    <span className="muted" style={{ fontSize:"0.78rem" }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
        )}
      </>}
    </div>
  );
}

function Empty({ icon, label, cta }) {
  return (
    <div className="card" style={{ padding:50, textAlign:"center" }}>
      <div style={{ fontSize:40, marginBottom:10 }}>{icon}</div>
      <h3>{label}</h3>
      {cta && <Link to="/search" className="btn btn-primary" style={{ marginTop:12 }}>Find care near you</Link>}
    </div>
  );
}
