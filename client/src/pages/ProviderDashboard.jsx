import { useEffect, useState } from "react";
import api from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast, CenterBadges, BarChart } from "../components/UI.jsx";

const blankCenter = {
  name:"", city:"", address:"", description:"",
  is24x7:false, supportsNightShift:false, supportsEmergency:false,
  operatingHours:"09:00 - 18:00", ageGroups:[], capacity:10,
  pricing:{ hourly:100, daily:600, monthly:12000 },
  safetyMeasures:[], certifications:[],
};

const blankCaregiver = {
  name:"", experienceYears:1, certifications:[], bio:"", verified:false,
};

const blankSlot = {
  day:"Monday", startTime:"09:00", endTime:"18:00", type:"day", available:true,
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const CERT_OPTIONS = ["First Aid","Child Psychology","Infant CPR","Montessori","Early Childhood Education","Night Care Specialist","Nutrition","Special Needs Care","Swimming Safety","Art Therapy"];

export default function ProviderDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("overview");
  const [centers, setCenters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankCenter);
  const [editingCenter, setEditingCenter] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [caregiverForm, setCaregiverForm] = useState(blankCaregiver);
  const [showCaregiverForm, setShowCaregiverForm] = useState(false);
  const [slotForm, setSlotForm] = useState(blankSlot);
  const [showSlotForm, setShowSlotForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const [c, b] = await Promise.all([
      api.get("/centers/mine/list"),
      api.get("/bookings/provider"),
    ]);
    setCenters(c.data);
    setBookings(b.data);
    if (c.data.length > 0 && !selectedCenter) setSelectedCenter(c.data[0]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const pendingApproval = user?.status === "pending";
  const pending = bookings.filter(b=>b.status==="pending").length;
  const confirmed = bookings.filter(b=>b.status==="confirmed").length;
  const completed = bookings.filter(b=>b.status==="completed").length;
  const earnings = bookings.filter(b=>["confirmed","completed"].includes(b.status)).reduce((s,b)=>s+(b.amount||0),0);

  const earningsData = (() => {
    const months = {};
    bookings.filter(b=>b.status!=="rejected"&&b.status!=="cancelled").forEach(b => {
      const m = new Date(b.createdAt).toLocaleString("default",{month:"short"});
      months[m] = (months[m]||0) + (b.amount||0);
    });
    return Object.entries(months).slice(-6).map(([label,value])=>({label,value}));
  })();

  const toggleArr = (key, val) => setForm(f => {
    const arr = f[key].includes(val) ? f[key].filter(x=>x!==val) : [...f[key], val];
    return { ...f, [key]: arr };
  });

  const saveCenter = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form, capacity: Number(form.capacity),
        pricing: { hourly:Number(form.pricing.hourly), daily:Number(form.pricing.daily), monthly:Number(form.pricing.monthly) },
      };
      if (editingCenter) {
        await api.put(`/centers/${editingCenter}`, payload);
        toast("Center updated ✅");
      } else {
        await api.post("/centers", payload);
        toast("Center submitted for verification ✅");
      }
      setShowForm(false); setForm(blankCenter); setEditingCenter(null);
      load();
    } catch (err) { toast(err.response?.data?.message || "Failed"); }
  };

  const editCenter = (c) => {
    setForm({ ...c, pricing: c.pricing || {hourly:100,daily:600,monthly:12000} });
    setEditingCenter(c._id); setShowForm(true);
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const setStatus = async (id, status) => {
    await api.put(`/bookings/${id}/status`, { status });
    toast(`Booking ${status} ✅`); load();
  };

  // Caregiver management
  const addCaregiver = async (e) => {
    e.preventDefault();
    if (!selectedCenter) return toast("Select a center first");
    try {
      const center = centers.find(c=>c._id===selectedCenter._id);
      const updatedCaregivers = [...(center.caregivers||[]), caregiverForm];
      await api.put(`/centers/${selectedCenter._id}`, { caregivers: updatedCaregivers });
      toast("Caregiver added ✅");
      setCaregiverForm(blankCaregiver); setShowCaregiverForm(false); load();
    } catch(err) { toast("Failed to add caregiver"); }
  };

  const removeCaregiver = async (centerId, idx) => {
    const center = centers.find(c=>c._id===centerId);
    const updatedCaregivers = center.caregivers.filter((_,i)=>i!==idx);
    await api.put(`/centers/${centerId}`, { caregivers: updatedCaregivers });
    toast("Caregiver removed"); load();
  };

  // Slot management
  const addSlot = async (e) => {
    e.preventDefault();
    if (!selectedCenter) return toast("Select a center first");
    try {
      const center = centers.find(c=>c._id===selectedCenter._id);
      const updatedSlots = [...(center.availabilitySlots||[]), slotForm];
      await api.put(`/centers/${selectedCenter._id}`, { availabilitySlots: updatedSlots });
      toast("Slot added ✅");
      setSlotForm(blankSlot); setShowSlotForm(false); load();
    } catch(err) { toast("Failed to add slot"); }
  };

  const removeSlot = async (centerId, idx) => {
    const center = centers.find(c=>c._id===centerId);
    const updatedSlots = (center.availabilitySlots||[]).filter((_,i)=>i!==idx);
    await api.put(`/centers/${centerId}`, { availabilitySlots: updatedSlots });
    toast("Slot removed"); load();
  };

  const sc = selectedCenter ? centers.find(c=>c._id===selectedCenter._id) : null;

  return (
    <div className="container" style={{padding:"34px 22px 70px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:24}}>
        <div>
          <h1 style={{fontSize:"2rem"}}>Provider Dashboard</h1>
          <p className="muted" style={{marginTop:4}}>Manage centers, caregivers, availability and bookings.</p>
        </div>
        {!pendingApproval && (
          <button className="btn btn-primary" onClick={()=>{setShowForm(s=>!s);setEditingCenter(null);setForm(blankCenter);}}>
            {showForm?"✕ Close":"+ Add Center"}
          </button>
        )}
      </div>

      {pendingApproval && (
        <div className="card" style={{padding:20,marginBottom:20,background:"var(--amber-bg)",borderColor:"#f0dcae"}}>
          <strong style={{color:"var(--amber)"}}>⏳ Awaiting admin approval.</strong>
          <p className="muted" style={{margin:"6px 0 0"}}>You can list centers once approved. Usually takes 24 hours.</p>
        </div>
      )}

      {showForm && <CenterForm form={form} setForm={setForm} toggleArr={toggleArr} onSubmit={saveCenter} editing={!!editingCenter} />}

      {/* Tabs */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24}}>
        {[
          ["overview","📊 Overview"],
          ["centers","🏫 My Centers"],
          ["caregivers","👩‍🏫 Caregivers"],
          ["slots","🕐 Availability Slots"],
          ["bookings",`📋 Bookings${pending>0?" ("+pending+" new)":""}`],
        ].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} className={tab===t?"btn btn-primary btn-sm":"btn btn-ghost btn-sm"}>{l}</button>
        ))}
      </div>

      {loading ? <div className="spinner"/> : <>

        {/* OVERVIEW */}
        {tab==="overview" && (
          <div>
            <div className="grid" style={{gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
              {[
                ["🏫",centers.length,"Centers","var(--navy)"],
                ["⏳",pending,"Pending requests","var(--amber)"],
                ["✅",confirmed,"Confirmed","var(--mint)"],
                ["💰",`₹${earnings.toLocaleString()}`,"Total earnings","var(--coral)"],
              ].map(([icon,val,label,color])=>(
                <div key={label} className="card" style={{padding:20}}>
                  <div style={{fontSize:24,marginBottom:8}}>{icon}</div>
                  <div style={{fontFamily:"Fraunces,serif",fontSize:"1.7rem",fontWeight:700,color}}>{val}</div>
                  <div className="muted" style={{fontSize:"0.78rem",fontWeight:700}}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div className="card" style={{padding:22}}>
                <h3 style={{fontSize:"1.05rem",marginBottom:4}}>Earnings by Month</h3>
                <p className="muted" style={{margin:"0 0 8px",fontSize:"0.82rem"}}>Confirmed + completed bookings</p>
                {earningsData.length>0
                  ? <BarChart data={earningsData} labelKey="label" valueKey="value" color="linear-gradient(180deg,#f4845f,#ffb997)"/>
                  : <p className="muted" style={{textAlign:"center",padding:"30px 0"}}>No earnings data yet</p>}
              </div>
              <div className="card" style={{padding:22}}>
                <h3 style={{fontSize:"1.05rem",marginBottom:16}}>Booking Status Breakdown</h3>
                {[["Pending",pending,"var(--amber)"],["Confirmed",confirmed,"var(--mint)"],["Completed",completed,"var(--sky)"]].map(([label,val,color])=>(
                  <div key={label} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:"0.85rem",fontWeight:700}}>{label}</span>
                      <span style={{fontSize:"0.85rem",fontWeight:700,color}}>{val}</span>
                    </div>
                    <div style={{height:8,background:"var(--line)",borderRadius:99}}>
                      <div style={{height:"100%",borderRadius:99,background:color,width:bookings.length>0?`${(val/bookings.length)*100}%`:"0%"}}/>
                    </div>
                  </div>
                ))}
                {centers.length>0 && (
                  <div style={{marginTop:16,padding:"12px 16px",background:"var(--cream)",borderRadius:12}}>
                    <div className="muted" style={{fontSize:"0.78rem",fontWeight:700,marginBottom:4}}>Total capacity used</div>
                    <div style={{fontFamily:"Fraunces,serif",fontSize:"1.4rem",fontWeight:700,color:"var(--navy)"}}>
                      {centers.reduce((s,c)=>s+c.currentBookings,0)} / {centers.reduce((s,c)=>s+c.capacity,0)} slots
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CENTERS */}
        {tab==="centers" && (
          <div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
            {centers.map(c=>(
              <div key={c._id} className="card" style={{padding:20}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:10}}>
                  <h3 style={{fontSize:"1.1rem"}}>{c.name}</h3>
                  <button className="btn btn-ghost btn-sm" onClick={()=>editCenter(c)}>✏️ Edit</button>
                </div>
                <p className="muted" style={{fontSize:"0.85rem",margin:"0 0 10px"}}>📍 {c.city}</p>
                <CenterBadges center={c}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:14,paddingTop:12,borderTop:"1px solid var(--line)"}}>
                  {[["₹"+c.pricing?.hourly,"per hour"],["₹"+c.pricing?.daily,"per day"],["₹"+c.pricing?.monthly,"per month"]].map(([v,l])=>(
                    <div key={l} style={{textAlign:"center"}}>
                      <div style={{fontWeight:800,color:"var(--navy)",fontSize:"0.95rem"}}>{v}</div>
                      <div className="muted" style={{fontSize:"0.7rem"}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
                  <span className="muted" style={{fontSize:"0.8rem"}}>Capacity: {c.capacity}</span>
                  <span className="muted" style={{fontSize:"0.8rem"}}>{c.availableSlots??c.capacity-c.currentBookings} free slots</span>
                </div>
              </div>
            ))}
            {centers.length===0 && (
              <div style={{gridColumn:"1/-1"}} className="card">
                <div style={{padding:50,textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:10}}>🏫</div>
                  <h3>No centers yet</h3>
                  <p className="muted">Add your first childcare center above.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CAREGIVERS */}
        {tab==="caregivers" && (
          <div>
            {centers.length>0 && (
              <div style={{marginBottom:20}}>
                <label style={{fontWeight:700,color:"var(--navy-soft)",fontSize:"0.85rem",display:"block",marginBottom:8}}>Select Center</label>
                <select value={selectedCenter?._id||""} onChange={e=>setSelectedCenter(centers.find(c=>c._id===e.target.value))}
                  style={{padding:"10px 14px",border:"2px solid var(--line)",borderRadius:12,fontSize:"0.95rem",minWidth:280}}>
                  {centers.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{fontSize:"1.2rem"}}>👩‍🏫 Caregivers {sc?`— ${sc.name}`:""}</h3>
              <button className="btn btn-primary btn-sm" onClick={()=>setShowCaregiverForm(s=>!s)}>
                {showCaregiverForm?"✕ Close":"+ Add Caregiver"}
              </button>
            </div>

            {showCaregiverForm && (
              <form onSubmit={addCaregiver} className="card" style={{padding:22,marginBottom:20}}>
                <h4 style={{marginBottom:16}}>Add New Caregiver</h4>
                <div className="row">
                  <div className="field"><label>Full name *</label><input value={caregiverForm.name} onChange={e=>setCaregiverForm({...caregiverForm,name:e.target.value})} required/></div>
                  <div className="field"><label>Experience (years)</label><input type="number" min={0} value={caregiverForm.experienceYears} onChange={e=>setCaregiverForm({...caregiverForm,experienceYears:Number(e.target.value)})}/></div>
                </div>
                <div className="field"><label>Bio</label><textarea rows={2} value={caregiverForm.bio} onChange={e=>setCaregiverForm({...caregiverForm,bio:e.target.value})} placeholder="Brief description..."/></div>
                <div className="field">
                  <label>Certifications</label>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:8}}>
                    {caregiverForm.certifications.map(c=>(
                      <span key={c} className="badge badge-verified" style={{cursor:"pointer"}} onClick={()=>setCaregiverForm({...caregiverForm,certifications:caregiverForm.certifications.filter(x=>x!==c)})}>{c} ✕</span>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {CERT_OPTIONS.filter(c=>!caregiverForm.certifications.includes(c)).map(c=>(
                      <button key={c} type="button" className="btn btn-ghost btn-sm" onClick={()=>setCaregiverForm({...caregiverForm,certifications:[...caregiverForm.certifications,c]})}>{c}</button>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
                  <input type="checkbox" checked={caregiverForm.verified} onChange={e=>setCaregiverForm({...caregiverForm,verified:e.target.checked})} style={{width:17,height:17}}/>
                  <label style={{fontWeight:700,color:"var(--navy-soft)"}}>Mark as verified</label>
                </div>
                <button className="btn btn-primary">Add Caregiver</button>
              </form>
            )}

            <div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
              {sc?.caregivers?.length>0 ? sc.caregivers.map((cg,idx)=>(
                <div key={idx} className="card" style={{padding:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"start",marginBottom:10}}>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{width:46,height:46,borderRadius:"50%",background:"var(--mint-bg)",display:"grid",placeItems:"center",fontSize:22}}>👩‍🏫</div>
                      <div>
                        <div style={{fontWeight:800,color:"var(--navy)"}}>{cg.name}</div>
                        <div className="muted" style={{fontSize:"0.78rem"}}>{cg.experienceYears} yrs exp</div>
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={()=>removeCaregiver(sc._id,idx)}>✕</button>
                  </div>
                  {cg.bio && <p style={{margin:"0 0 10px",fontSize:"0.85rem",color:"var(--navy-soft)"}}>{cg.bio}</p>}
                  <div className="tag-row">
                    {cg.certifications?.map(c=><span key={c} className="badge badge-verified" style={{fontSize:"0.7rem"}}>{c}</span>)}
                    {cg.verified && <span className="badge badge-verified">✓ Verified</span>}
                  </div>
                </div>
              )) : (
                <div className="card" style={{padding:40,textAlign:"center",gridColumn:"1/-1"}}>
                  <div style={{fontSize:36,marginBottom:10}}>👩‍🏫</div>
                  <h3>No caregivers yet</h3>
                  <p className="muted">Add caregivers to build trust with parents.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AVAILABILITY SLOTS */}
        {tab==="slots" && (
          <div>
            {centers.length>0 && (
              <div style={{marginBottom:20}}>
                <label style={{fontWeight:700,color:"var(--navy-soft)",fontSize:"0.85rem",display:"block",marginBottom:8}}>Select Center</label>
                <select value={selectedCenter?._id||""} onChange={e=>setSelectedCenter(centers.find(c=>c._id===e.target.value))}
                  style={{padding:"10px 14px",border:"2px solid var(--line)",borderRadius:12,fontSize:"0.95rem",minWidth:280}}>
                  {centers.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{fontSize:"1.2rem"}}>🕐 Availability Slots {sc?`— ${sc.name}`:""}</h3>
              <button className="btn btn-primary btn-sm" onClick={()=>setShowSlotForm(s=>!s)}>
                {showSlotForm?"✕ Close":"+ Add Slot"}
              </button>
            </div>

            {showSlotForm && (
              <form onSubmit={addSlot} className="card" style={{padding:22,marginBottom:20}}>
                <h4 style={{marginBottom:16}}>Add Availability Slot</h4>
                <div className="row">
                  <div className="field">
                    <label>Day</label>
                    <select value={slotForm.day} onChange={e=>setSlotForm({...slotForm,day:e.target.value})}>
                      {DAYS.map(d=><option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Slot type</label>
                    <select value={slotForm.type} onChange={e=>setSlotForm({...slotForm,type:e.target.value})}>
                      <option value="day">Day (06:00–18:00)</option>
                      <option value="night">Night (18:00–06:00)</option>
                      <option value="emergency">Emergency (24hr)</option>
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="field"><label>Start time</label><input type="time" value={slotForm.startTime} onChange={e=>setSlotForm({...slotForm,startTime:e.target.value})}/></div>
                  <div className="field"><label>End time</label><input type="time" value={slotForm.endTime} onChange={e=>setSlotForm({...slotForm,endTime:e.target.value})}/></div>
                </div>
                <label style={{display:"flex",gap:8,alignItems:"center",fontWeight:700,color:"var(--navy-soft)",cursor:"pointer",marginBottom:16}}>
                  <input type="checkbox" checked={slotForm.available} onChange={e=>setSlotForm({...slotForm,available:e.target.checked})} style={{width:17,height:17}}/>
                  Mark as available
                </label>
                <button className="btn btn-primary">Add Slot</button>
              </form>
            )}

            {/* Weekly schedule view */}
            <div className="grid" style={{gridTemplateColumns:"repeat(7,1fr)",gap:8,marginBottom:20}}>
              {DAYS.map(day=>{
                const daySlots = sc?.availabilitySlots?.filter(s=>s.day===day)||[];
                return (
                  <div key={day} className="card" style={{padding:12,textAlign:"center",minHeight:100}}>
                    <div style={{fontWeight:800,fontSize:"0.78rem",color:"var(--navy)",marginBottom:8}}>{day.slice(0,3)}</div>
                    {daySlots.length>0 ? daySlots.map((s,i)=>(
                      <div key={i} style={{background:s.type==="night"?"#ecebfb":s.type==="emergency"?"#ffe8e8":"var(--mint-bg)",borderRadius:6,padding:"4px 6px",marginBottom:4,fontSize:"0.68rem",fontWeight:700,color:s.type==="night"?"#5b52c4":s.type==="emergency"?"#c0392b":"#2f8f68"}}>
                        {s.startTime}–{s.endTime}
                        <span onClick={()=>removeSlot(sc._id,sc.availabilitySlots.indexOf(s))} style={{cursor:"pointer",marginLeft:4,opacity:0.7}}>✕</span>
                      </div>
                    )) : <div className="muted" style={{fontSize:"0.72rem",marginTop:8}}>No slots</div>}
                  </div>
                );
              })}
            </div>

            <div className="grid" style={{gap:10}}>
              {sc?.availabilitySlots?.length>0 ? sc.availabilitySlots.map((s,idx)=>(
                <div key={idx} className="card" style={{padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:14,alignItems:"center"}}>
                    <span style={{fontWeight:800,color:"var(--navy)",minWidth:80}}>{s.day}</span>
                    <span className={`badge ${s.type==="night"?"badge-night":s.type==="emergency"?"badge-24":"badge-verified"}`} style={s.type==="emergency"?{background:"#ffe8e8",color:"#c0392b"}:{}}>
                      {s.type==="night"?"🌙":s.type==="emergency"?"🚨":"☀️"} {s.type}
                    </span>
                    <span style={{fontWeight:700,color:"var(--navy-soft)",fontSize:"0.9rem"}}>{s.startTime} – {s.endTime}</span>
                    <span className={`badge ${s.available?"badge-verified":"badge-pending"}`}>{s.available?"Available":"Unavailable"}</span>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={()=>removeSlot(sc._id,idx)}>Remove</button>
                </div>
              )) : (
                <div className="card" style={{padding:50,textAlign:"center"}}>
                  <div style={{fontSize:36,marginBottom:10}}>🕐</div>
                  <h3>No slots defined</h3>
                  <p className="muted">Add availability slots so parents know when to book.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {tab==="bookings" && (
          <div>
            {pending>0 && (
              <div style={{padding:"12px 18px",background:"var(--amber-bg)",borderRadius:12,marginBottom:16,fontWeight:700,color:"var(--amber)"}}>
                ⏳ {pending} new booking request{pending>1?"s":""} need your attention
              </div>
            )}
            <div className="grid" style={{gap:12}}>
              {bookings.map(b=>(
                <div key={b._id} className="card" style={{padding:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                      <div style={{width:36,height:36,borderRadius:"50%",background:"var(--mint-bg)",display:"grid",placeItems:"center"}}>👶</div>
                      <div>
                        <div style={{fontWeight:800,color:"var(--navy)"}}>{b.childName} <span className="muted" style={{fontWeight:400}}>({b.ageGroup})</span></div>
                        <div className="muted" style={{fontSize:"0.82rem"}}>{b.parent?.name} · {b.parent?.phone||b.parent?.email}</div>
                      </div>
                    </div>
                    <p className="muted" style={{margin:0,fontSize:"0.85rem"}}>
                      {b.center?.name} · {b.planType} · ₹{b.amount}{b.slotTiming?` · ${b.slotTiming}`:""} · {new Date(b.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span className={`badge ${b.status==="confirmed"?"badge-verified":b.status==="pending"?"badge-pending":"badge-age"}`}
                      style={b.status==="rejected"?{background:"var(--red-bg)",color:"var(--red)"}:{}}>{b.status}</span>
                    {b.status==="pending" && <>
                      <button className="btn btn-mint btn-sm" onClick={()=>setStatus(b._id,"confirmed")}>✓ Accept</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>setStatus(b._id,"rejected")}>✕ Reject</button>
                    </>}
                    {b.status==="confirmed" && <button className="btn btn-ghost btn-sm" onClick={()=>setStatus(b._id,"completed")}>Mark complete</button>}
                  </div>
                </div>
              ))}
              {bookings.length===0 && (
                <div className="card" style={{padding:50,textAlign:"center"}}>
                  <div style={{fontSize:40,marginBottom:10}}>📋</div>
                  <h3>No bookings yet</h3>
                  <p className="muted">Bookings will appear once parents start requesting slots.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </>}
    </div>
  );
}

function CenterForm({ form, setForm, toggleArr, onSubmit, editing }) {
  const set = k => e => setForm({...form,[k]:e.target.value});
  const setPrice = k => e => setForm({...form,pricing:{...form.pricing,[k]:e.target.value}});
  const addToList = (key,val) => { const t=val.trim(); if(t&&!form[key].includes(t)) setForm({...form,[key]:[...form[key],t]}); };
  const removeFromList = (key,val) => setForm({...form,[key]:form[key].filter(x=>x!==val)});

  return (
    <form onSubmit={onSubmit} className="card" style={{padding:26,marginBottom:24}}>
      <h3 style={{marginBottom:20}}>{editing?"✏️ Edit Center":"🏫 Add New Center"}</h3>
      <div className="row">
        <div className="field"><label>Center name *</label><input value={form.name} onChange={set("name")} required/></div>
        <div className="field"><label>City *</label><input value={form.city} onChange={set("city")} required/></div>
      </div>
      <div className="field"><label>Full address</label><input value={form.address} onChange={set("address")} placeholder="Street, Area, City"/></div>
      <div className="field"><label>Description</label><textarea rows={2} value={form.description} onChange={set("description")} placeholder="Tell parents about your center..."/></div>
      <div className="row">
        <div className="field"><label>Total capacity</label><input type="number" value={form.capacity} onChange={set("capacity")} min={1}/></div>
        <div className="field"><label>Operating hours</label><input value={form.operatingHours} onChange={set("operatingHours")} disabled={form.is24x7} placeholder="09:00 - 18:00"/></div>
      </div>
      <div style={{marginBottom:16}}>
        <label style={{display:"block",fontSize:"0.82rem",fontWeight:700,color:"var(--navy-soft)",marginBottom:8}}>Availability</label>
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          {[["is24x7","🕐 24×7"],["supportsNightShift","🌙 Night shift"],["supportsEmergency","🚨 Emergency"]].map(([k,l])=>(
            <label key={k} style={{display:"flex",gap:8,alignItems:"center",fontWeight:700,color:"var(--navy-soft)",cursor:"pointer"}}>
              <input type="checkbox" checked={form[k]} onChange={e=>setForm({...form,[k]:e.target.checked})} style={{width:17,height:17}}/>{l}
            </label>
          ))}
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <label style={{display:"block",fontSize:"0.82rem",fontWeight:700,color:"var(--navy-soft)",marginBottom:8}}>Age groups *</label>
        <div style={{display:"flex",gap:8}}>
          {["infant","toddler","preschool"].map(g=>(
            <button key={g} type="button" onClick={()=>toggleArr("ageGroups",g)} className={form.ageGroups.includes(g)?"btn btn-primary btn-sm":"btn btn-ghost btn-sm"}>
              {g==="infant"?"👶":g==="toddler"?"🧒":"🧑"} {g}
            </button>
          ))}
        </div>
      </div>
      <div className="row">
        <div className="field"><label>₹ per hour</label><input type="number" value={form.pricing.hourly} onChange={setPrice("hourly")}/></div>
        <div className="field"><label>₹ per day</label><input type="number" value={form.pricing.daily} onChange={setPrice("daily")}/></div>
        <div className="field"><label>₹ per month</label><input type="number" value={form.pricing.monthly} onChange={setPrice("monthly")}/></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <div className="field">
          <label>Safety measures</label>
          <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
            {form.safetyMeasures.map(s=><span key={s} className="badge badge-verified" style={{cursor:"pointer"}} onClick={()=>removeFromList("safetyMeasures",s)}>{s} ✕</span>)}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["CCTV","Fire Safety","Secure Entry","First Aid","24hr Staff"].filter(s=>!form.safetyMeasures.includes(s)).map(s=>(
              <button key={s} type="button" className="btn btn-ghost btn-sm" onClick={()=>addToList("safetyMeasures",s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Certifications</label>
          <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
            {form.certifications.map(c=><span key={c} className="badge badge-age" style={{cursor:"pointer"}} onClick={()=>removeFromList("certifications",c)}>{c} ✕</span>)}
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {["Govt. Registered","ISO Certified","NAEYC"].filter(c=>!form.certifications.includes(c)).map(c=>(
              <button key={c} type="button" className="btn btn-ghost btn-sm" onClick={()=>addToList("certifications",c)}>{c}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{display:"flex",gap:12,marginTop:8}}>
        <button className="btn btn-primary">{editing?"Save changes":"Submit for verification"}</button>
      </div>
    </form>
  );
}
