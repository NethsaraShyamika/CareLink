import { useState, useEffect } from "react";
import axios from "axios";
import DoctorSidebar from "./Doctorsidebar";

import { API_GATEWAY } from "../../utils/api";

const API_BASE = import.meta.env.VITE_API_GATEWAY_URL || API_GATEWAY;

const SPECIALIZATIONS = [
  "Cardiology","Dermatology","Endocrinology","Gastroenterology",
  "General Practice","Gynecology","Hematology","Nephrology",
  "Neurology","Oncology","Ophthalmology","Orthopedics",
  "Pediatrics","Psychiatry","Pulmonology","Radiology",
  "Rheumatology","Surgery","Urology","Other",
];

const DAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];
const DAY_LABELS = { MON:"Mon",TUE:"Tue",WED:"Wed",THU:"Thu",FRI:"Fri",SAT:"Sat",SUN:"Sun" };

const initialForm = {
  firstName:"", lastName:"", specialization:"", licenseNumber:"",
  yearsOfExperience:"", consultationFee:"", hospitalOrClinic:"",
  workingDays:["MON","TUE","WED","THU","FRI"],
  availabilityStartTime:"08:00", availabilityEndTime:"18:00", slotMinutes:30,
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --accent: #4F46E5;
    --accent-dark: #3730A3;
    --accent-light: #E0E7FF;
    --bg: #F9FAFB;
    --surface: #FFFFFF;
    --border: #E5E7EB;
    --border-soft: #F3F4F6;
    --text: #111827;
    --text-sec: #6B7280;
    --text-muted: #9CA3AF;
    --success-bg: #F0FDF4;
    --success-text: #166534;
    --success-border: #BBF7D0;
    --error-bg: #FEF2F2;
    --error-text: #991B1B;
    --error-border: #FECACA;
    --r-md: 10px;
    --r-lg: 14px;
    --r-xl: 18px;
    --shadow: 0 1px 3px rgba(0,0,0,.06);
    --shadow-md: 0 4px 16px rgba(0,0,0,.08);
  }

  body {
    font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  .prof-dash   { display: flex; height: 100vh; overflow: hidden; }
  .prof-main   { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .prof-scroll { flex: 1; overflow-y: auto; }

  /* Topbar */
  .prof-topbar {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 16px 32px; display: flex; align-items: center;
    justify-content: space-between; flex-shrink: 0;
  }
  .prof-tb-title { font-size: 18px; font-weight: 800; letter-spacing: -0.4px; }
  .prof-tb-date  { font-size: 12px; color: var(--text-sec); margin-top: 2px; }

  /* Hero banner */
  .prof-hero {
    background: linear-gradient(135deg, #4F46E5 0%, #2563EB 100%);
    padding: 36px 40px 28px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 24px;
  }
  .prof-hero-av {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(255,255,255,.2);
    border: 3px solid rgba(255,255,255,.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; font-weight: 800; flex-shrink: 0;
  }
  .prof-hero-name { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .prof-hero-spec { font-size: 13px; opacity: .8; margin-top: 3px; }
  .prof-hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,.15);
    border: 1px solid rgba(255,255,255,.25);
    border-radius: 99px; padding: 4px 12px;
    font-size: 12px; font-weight: 600;
    margin-top: 10px;
  }

  /* Content container */
  .prof-content { padding: 32px 40px; max-width: 860px; }

  /* Section tabs */
  .prof-sec-tabs {
    display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap;
  }
  .prof-sec-tab {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: var(--r-lg);
    border: 1.5px solid var(--border);
    background: var(--surface);
    color: var(--text-sec);
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all .15s; font-family: inherit;
  }
  .prof-sec-tab:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .prof-sec-tab.active {
    border-color: var(--accent); background: var(--accent-light);
    color: var(--accent);
  }

  /* Progress bar */
  .prof-progress {
    display: flex; gap: 6px; margin-bottom: 28px;
  }
  .prof-prog-step {
    flex: 1; height: 4px; border-radius: 99px;
    transition: background .3s;
  }

  /* Card */
  .prof-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl); overflow: hidden;
    box-shadow: var(--shadow); margin-bottom: 20px;
  }
  .prof-card-hdr {
    display: flex; align-items: center; gap: 14px;
    padding: 20px 24px; border-bottom: 1px solid var(--border-soft);
  }
  .prof-card-icon {
    width: 40px; height: 40px; border-radius: var(--r-md);
    background: var(--accent-light); color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .prof-card-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .prof-card-sub   { font-size: 12.5px; color: var(--text-muted); }
  .prof-card-body  { padding: 24px; }

  /* Grid */
  .prof-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .prof-span2 { grid-column: span 2; }

  /* Field */
  .prof-field { display: flex; flex-direction: column; gap: 6px; }
  .prof-label { font-size: 13px; font-weight: 600; color: #374151; }
  .prof-req   { color: #EF4444; margin-left: 2px; }
  .prof-input {
    height: 44px; border-radius: var(--r-md);
    border: 1.5px solid var(--border);
    padding: 0 14px; font-size: 13.5px;
    color: var(--text); background: #FAFAFA;
    outline: none; transition: border .18s, box-shadow .18s;
    width: 100%; font-family: inherit;
  }
  .prof-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,.1); background: #fff; }
  .prof-input.error { border-color: #EF4444; }
  .prof-select {
    height: 44px; border-radius: var(--r-md);
    border: 1.5px solid var(--border);
    padding: 0 14px; font-size: 13.5px;
    color: var(--text); background: #FAFAFA;
    outline: none; width: 100%; cursor: pointer; font-family: inherit;
  }
  .prof-select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
  .prof-select.error { border-color: #EF4444; }
  .prof-field-error { font-size: 12px; color: #EF4444; }
  .prof-field-hint  { font-size: 12px; color: var(--text-muted); }

  /* Day chips */
  .prof-days { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
  .prof-day-chip {
    width: 54px; height: 40px; border-radius: var(--r-md);
    border: 1.5px solid var(--border);
    background: #FAFAFA; color: var(--text-sec);
    font-size: 12.5px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all .15s; user-select: none; font-family: inherit;
  }
  .prof-day-chip:hover { border-color: var(--accent); color: var(--accent); }
  .prof-day-chip.selected { background: var(--accent); border-color: var(--accent); color: #fff; }

  /* Slot buttons */
  .prof-slots { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
  .prof-slot-btn {
    padding: 9px 18px; border-radius: var(--r-md);
    border: 1.5px solid var(--border);
    background: #FAFAFA; color: var(--text-sec);
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all .15s; font-family: inherit;
  }
  .prof-slot-btn:hover  { border-color: var(--accent); color: var(--accent); }
  .prof-slot-btn.selected { background: var(--accent-light); border-color: var(--accent); color: var(--accent); }

  /* Summary box */
  .prof-summary {
    background: #F5F3FF; border: 1px solid #DDD6FE;
    border-radius: var(--r-lg); padding: 18px 22px; margin-bottom: 24px;
  }
  .prof-summary-title { font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 10px; }
  .prof-summary-row   { font-size: 13px; color: #374151; margin-bottom: 5px; }
  .prof-summary-row:last-child { margin-bottom: 0; }

  /* Status info rows */
  .prof-info-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 24px; border-bottom: 1px solid var(--border-soft);
  }
  .prof-info-row:last-child { border-bottom: none; }
  .prof-info-label { font-size: 13px; color: var(--text-sec); font-weight: 500; }
  .prof-info-val   { font-size: 14px; color: var(--text); font-weight: 600; }

  /* Badges */
  .prof-badge-pending  { display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:99px;background:#FEF3C7;color:#92400E;font-size:12.5px;font-weight:700; }
  .prof-badge-approved { display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:99px;background:#F0FDF4;color:#166534;font-size:12.5px;font-weight:700; }
  .prof-badge-rejected { display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:99px;background:#FEF2F2;color:#991B1B;font-size:12.5px;font-weight:700; }
  .prof-dot-pending    { width:7px;height:7px;border-radius:50%;background:#F59E0B; }
  .prof-dot-approved   { width:7px;height:7px;border-radius:50%;background:#22C55E; }
  .prof-dot-rejected   { width:7px;height:7px;border-radius:50%;background:#EF4444; }

  /* Alert */
  .prof-alert {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 16px; border-radius: var(--r-md);
    font-size: 13.5px; font-weight: 500; margin-bottom: 20px;
  }
  .prof-alert-success { background: var(--success-bg); border: 1px solid var(--success-border); color: var(--success-text); }
  .prof-alert-error   { background: var(--error-bg);   border: 1px solid var(--error-border);   color: var(--error-text); }

  /* Buttons */
  .prof-btn-back {
    padding: 10px 22px; border-radius: var(--r-md);
    background: var(--bg); color: var(--text-sec);
    border: 1px solid var(--border); font-size: 13.5px; font-weight: 600;
    cursor: pointer; font-family: inherit; transition: background .15s;
  }
  .prof-btn-back:hover { background: #F3F4F6; }
  .prof-btn-next {
    padding: 10px 24px; border-radius: var(--r-md);
    background: var(--accent); color: #fff;
    border: none; font-size: 13.5px; font-weight: 600;
    cursor: pointer; font-family: inherit; transition: background .15s;
  }
  .prof-btn-next:hover { background: var(--accent-dark); }
  .prof-btn-submit {
    display: flex; align-items: center; justify-content: center; gap: 9px;
    flex: 1; height: 48px;
    background: linear-gradient(135deg, #4F46E5 0%, #2563EB 100%);
    color: #fff; border: none; border-radius: var(--r-lg);
    font-size: 14.5px; font-weight: 700;
    cursor: pointer; font-family: inherit;
    box-shadow: 0 4px 14px rgba(79,70,229,.35);
    transition: opacity .2s;
  }
  .prof-btn-submit:disabled { opacity: .65; cursor: not-allowed; }

  /* Spinner */
  .prof-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2.5px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    animation: profSpin .75s linear infinite;
  }
  @keyframes profSpin { to { transform: rotate(360deg); } }

  /* Nav footer row */
  .prof-nav-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 4px; }

  @media (max-width: 860px) {
    .prof-hero   { padding: 24px 22px; }
    .prof-content{ padding: 20px 18px; }
    .prof-grid2  { grid-template-columns: 1fr; }
    .prof-span2  { grid-column: span 1; }
  }
`;

function StatusBadge({ status }) {
  const cls = { pending: "prof-badge-pending", approved: "prof-badge-approved", rejected: "prof-badge-rejected" };
  const dot = { pending: "prof-dot-pending", approved: "prof-dot-approved", rejected: "prof-dot-rejected" };
  const label = (status || "pending").charAt(0).toUpperCase() + (status || "pending").slice(1);
  return (
    <span className={cls[status] || cls.pending}>
      <span className={dot[status] || dot.pending} />
      {label}
    </span>
  );
}

export default function DoctorProfile() {
  const [form, setForm]             = useState(initialForm);
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [alert, setAlert]           = useState(null);
  const [isUpdate, setIsUpdate]     = useState(false);
  const [existingDoctor, setExistingDoctor] = useState(null);
  const [activeSection, setActiveSection]   = useState(0);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      .prof-input:focus { border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,.1) !important; background: #fff !important; }
      .prof-select:focus { border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,.1) !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/doctors/me`, { headers: { Authorization: `Bearer ${token}` } });
        setExistingDoctor(data);
        setIsUpdate(true);
        setForm({
          firstName: data.firstName || "",
          lastName:  data.lastName  || "",
          specialization: data.specialization || "",
          licenseNumber:  data.licenseNumber  || "",
          yearsOfExperience: data.yearsOfExperience ?? "",
          consultationFee:   data.consultationFee   ?? "",
          hospitalOrClinic:  data.hospitalOrClinic  || "",
          workingDays: data.workingDays || ["MON","TUE","WED","THU","FRI"],
          availabilityStartTime: data.availabilityStartTime || "08:00",
          availabilityEndTime:   data.availabilityEndTime   || "18:00",
          slotMinutes: data.slotMinutes || 30,
        });
      } catch { /* no profile yet */ }
      finally { setFetchLoading(false); }
    };
    fetchProfile();
  }, []);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  const toggleDay = (day) =>
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day],
    }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim())  e.firstName  = "First name is required";
    if (!form.lastName.trim())   e.lastName   = "Last name is required";
    if (!form.specialization)    e.specialization = "Specialization is required";
    if (!form.licenseNumber.trim()) e.licenseNumber = "License number is required";
    if (form.yearsOfExperience === "" || isNaN(form.yearsOfExperience) || Number(form.yearsOfExperience) < 0)
      e.yearsOfExperience = "Enter valid years (≥ 0)";
    if (form.consultationFee === "" || isNaN(form.consultationFee) || Number(form.consultationFee) < 0)
      e.consultationFee = "Enter valid fee (≥ 0)";
    if (form.workingDays.length === 0) e.workingDays = "Select at least one working day";
    if (!form.availabilityStartTime) e.availabilityStartTime = "Required";
    if (!form.availabilityEndTime)   e.availabilityEndTime   = "Required";
    if (form.availabilityStartTime >= form.availabilityEndTime)
      e.availabilityEndTime = "End time must be after start time";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      const sec = { firstName:0,lastName:0,hospitalOrClinic:0, specialization:1,licenseNumber:1,yearsOfExperience:1,consultationFee:1, workingDays:2,availabilityStartTime:2,availabilityEndTime:2 };
      const firstErr = Object.keys(e)[0];
      if (sec[firstErr] !== undefined) setActiveSection(sec[firstErr]);
      return;
    }
    setLoading(true); setAlert(null);
    try {
      const token = localStorage.getItem("token");
      const payload = { ...form, yearsOfExperience: Number(form.yearsOfExperience), consultationFee: Number(form.consultationFee), slotMinutes: Number(form.slotMinutes) };
      const { data } = await axios.post(`${API_BASE}/doctors/profile`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setAlert({ type: "success", msg: data.message || (isUpdate ? "Profile updated!" : "Profile created!") });
      setExistingDoctor(data.doctor);
      setIsUpdate(true);
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.message || "Something went wrong." });
    } finally { setLoading(false); }
  };

  const slotsPerDay = () => {
    const [sh, sm] = (form.availabilityStartTime || "08:00").split(":").map(Number);
    const [eh, em] = (form.availabilityEndTime   || "18:00").split(":").map(Number);
    return Math.max(0, Math.floor(((eh * 60 + em) - (sh * 60 + sm)) / form.slotMinutes));
  };

  const doctorInitials = existingDoctor?.firstName && existingDoctor?.lastName
    ? `${existingDoctor.firstName[0]}${existingDoctor.lastName[0]}`
    : form.firstName[0] ? `${form.firstName[0]}${form.lastName[0] || ""}` : "DR";
  const doctorDisplayName = existingDoctor
    ? `Dr. ${existingDoctor.firstName} ${existingDoctor.lastName}`
    : form.firstName ? `Dr. ${form.firstName} ${form.lastName}` : "Your Profile";

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  if (fetchLoading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="prof-dash">
          <DoctorSidebar activeNav="profile" doctorProfile={null} />
          <div className="prof-main" style={{ display:"flex",alignItems:"center",justifyContent:"center" }}>
            <div style={{ textAlign:"center" }}>
              <div className="prof-spinner" style={{ margin:"0 auto 16px", width:44, height:44, borderWidth:3 }} />
              <p style={{ color:"var(--text-sec)", fontSize:14 }}>Loading your profile…</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  const SECTIONS = [
    { key:0, label:"Personal",     emoji:"👤" },
    { key:1, label:"Professional", emoji:"🩺" },
    { key:2, label:"Availability", emoji:"📅" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="prof-dash">
        {/* ── Shared Sidebar ── */}
        <DoctorSidebar activeNav="profile" doctorProfile={existingDoctor} />

        {/* ── Main ── */}
        <div className="prof-main">
          <header className="prof-topbar">
            <div>
              <div className="prof-tb-title">{isUpdate ? "Edit Profile" : "Create Profile"}</div>
              <div className="prof-tb-date">{today}</div>
            </div>
          </header>

          <div className="prof-scroll">
            {/* Hero */}
            <div className="prof-hero">
              <div className="prof-hero-av">{doctorInitials}</div>
              <div>
                <div className="prof-hero-name">{doctorDisplayName}</div>
                <div className="prof-hero-spec">{existingDoctor?.specialization || form.specialization || "Doctor"}</div>
                {existingDoctor && (
                  <div className="prof-hero-badge">
                    <span>●</span>
                    {existingDoctor.verificationStatus === "approved" ? "Verified Doctor" : "Pending Verification"}
                  </div>
                )}
              </div>
            </div>

            <div className="prof-content">
              {/* Verification status card */}
              {existingDoctor && (
                <div className="prof-card" style={{ marginBottom: 24 }}>
                  <div className="prof-info-row">
                    <span className="prof-info-label">Verification Status</span>
                    <StatusBadge status={existingDoctor.verificationStatus} />
                  </div>
                  <div className="prof-info-row">
                    <span className="prof-info-label">Member Since</span>
                    <span className="prof-info-val">
                      {existingDoctor.createdAt
                        ? new Date(existingDoctor.createdAt).toLocaleDateString("en-US", { year:"numeric",month:"long",day:"numeric" })
                        : "—"}
                    </span>
                  </div>
                  <div className="prof-info-row">
                    <span className="prof-info-label">License Number</span>
                    <span className="prof-info-val">{existingDoctor.licenseNumber || "—"}</span>
                  </div>
                </div>
              )}

              {/* Alert */}
              {alert && (
                <div className={`prof-alert prof-alert-${alert.type}`}>
                  <span>{alert.type === "success" ? "✅" : "⚠️"}</span>
                  {alert.msg}
                </div>
              )}

              {/* Section tabs */}
              <div className="prof-sec-tabs">
                {SECTIONS.map((s) => (
                  <button key={s.key} className={`prof-sec-tab${activeSection === s.key ? " active" : ""}`} onClick={() => setActiveSection(s.key)}>
                    <span>{s.emoji}</span>{s.label}
                  </button>
                ))}
              </div>

              {/* Progress */}
              <div className="prof-progress">
                {[0,1,2].map((i) => (
                  <div key={i} className="prof-prog-step" style={{ background: activeSection >= i ? "#4F46E5" : "#E5E7EB" }} />
                ))}
              </div>

              {/* ── Section 0: Personal ── */}
              {activeSection === 0 && (
                <div className="prof-card">
                  <div className="prof-card-hdr">
                    <div className="prof-card-icon">👤</div>
                    <div>
                      <div className="prof-card-title">Personal Information</div>
                      <div className="prof-card-sub">Your name as it appears to patients</div>
                    </div>
                  </div>
                  <div className="prof-card-body">
                    <div className="prof-grid2">
                      {[
                        { field:"firstName", label:"First Name", ph:"e.g. Amara" },
                        { field:"lastName",  label:"Last Name",  ph:"e.g. Perera" },
                      ].map(({ field, label, ph }) => (
                        <div key={field} className="prof-field">
                          <label className="prof-label">{label}<span className="prof-req">*</span></label>
                          <input className={`prof-input${errors[field] ? " error" : ""}`} placeholder={ph} value={form[field]} onChange={set(field)} />
                          {errors[field] && <p className="prof-field-error">{errors[field]}</p>}
                        </div>
                      ))}
                      <div className={`prof-field prof-span2`}>
                        <label className="prof-label">Hospital / Clinic</label>
                        <input className="prof-input" placeholder="e.g. City General Hospital or Online" value={form.hospitalOrClinic} onChange={set("hospitalOrClinic")} />
                        <p className="prof-field-hint">Leave blank if you primarily work online.</p>
                      </div>
                    </div>
                    <div style={{ display:"flex", justifyContent:"flex-end", marginTop:24 }}>
                      <button className="prof-btn-next" onClick={() => setActiveSection(1)}>Next: Professional →</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Section 1: Professional ── */}
              {activeSection === 1 && (
                <div className="prof-card">
                  <div className="prof-card-hdr">
                    <div className="prof-card-icon">🩺</div>
                    <div>
                      <div className="prof-card-title">Professional Details</div>
                      <div className="prof-card-sub">Your credentials and specialization</div>
                    </div>
                  </div>
                  <div className="prof-card-body">
                    <div className="prof-grid2">
                      <div className="prof-field prof-span2">
                        <label className="prof-label">Specialization<span className="prof-req">*</span></label>
                        <select className={`prof-select${errors.specialization ? " error" : ""}`} value={form.specialization} onChange={set("specialization")}>
                          <option value="">— Select specialization —</option>
                          {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {errors.specialization && <p className="prof-field-error">{errors.specialization}</p>}
                      </div>
                      <div className="prof-field">
                        <label className="prof-label">License Number<span className="prof-req">*</span></label>
                        <input className={`prof-input${errors.licenseNumber ? " error" : ""}`} placeholder="e.g. SLMC-12345" value={form.licenseNumber} onChange={set("licenseNumber")} />
                        {errors.licenseNumber && <p className="prof-field-error">{errors.licenseNumber}</p>}
                      </div>
                      <div className="prof-field">
                        <label className="prof-label">Years of Experience<span className="prof-req">*</span></label>
                        <input type="number" min="0" className={`prof-input${errors.yearsOfExperience ? " error" : ""}`} placeholder="e.g. 8" value={form.yearsOfExperience} onChange={set("yearsOfExperience")} />
                        {errors.yearsOfExperience && <p className="prof-field-error">{errors.yearsOfExperience}</p>}
                      </div>
                      <div className="prof-field">
                        <label className="prof-label">Consultation Fee (LKR)<span className="prof-req">*</span></label>
                        <input type="number" min="0" className={`prof-input${errors.consultationFee ? " error" : ""}`} placeholder="e.g. 2500" value={form.consultationFee} onChange={set("consultationFee")} />
                        {errors.consultationFee && <p className="prof-field-error">{errors.consultationFee}</p>}
                      </div>
                    </div>
                    <div className="prof-nav-row" style={{ marginTop:24 }}>
                      <button className="prof-btn-back" onClick={() => setActiveSection(0)}>← Back</button>
                      <button className="prof-btn-next" onClick={() => setActiveSection(2)}>Next: Availability →</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Section 2: Availability ── */}
              {activeSection === 2 && (
                <div className="prof-card">
                  <div className="prof-card-hdr">
                    <div className="prof-card-icon">📅</div>
                    <div>
                      <div className="prof-card-title">Availability Settings</div>
                      <div className="prof-card-sub">When are you available for appointments?</div>
                    </div>
                  </div>
                  <div className="prof-card-body">
                    {/* Days */}
                    <div className="prof-field" style={{ marginBottom:20 }}>
                      <label className="prof-label">Working Days<span className="prof-req">*</span></label>
                      <div className="prof-days">
                        {DAYS.map((d) => (
                          <button key={d} className={`prof-day-chip${form.workingDays.includes(d) ? " selected" : ""}`} onClick={() => toggleDay(d)}>
                            {DAY_LABELS[d]}
                          </button>
                        ))}
                      </div>
                      {errors.workingDays && <p className="prof-field-error">{errors.workingDays}</p>}
                      <p className="prof-field-hint">{form.workingDays.length} day{form.workingDays.length !== 1 ? "s" : ""} selected</p>
                    </div>

                    {/* Time range */}
                    <div className="prof-grid2" style={{ marginBottom:20 }}>
                      <div className="prof-field">
                        <label className="prof-label">Start Time<span className="prof-req">*</span></label>
                        <input type="time" className={`prof-input${errors.availabilityStartTime ? " error" : ""}`} value={form.availabilityStartTime} onChange={set("availabilityStartTime")} />
                        {errors.availabilityStartTime && <p className="prof-field-error">{errors.availabilityStartTime}</p>}
                      </div>
                      <div className="prof-field">
                        <label className="prof-label">End Time<span className="prof-req">*</span></label>
                        <input type="time" className={`prof-input${errors.availabilityEndTime ? " error" : ""}`} value={form.availabilityEndTime} onChange={set("availabilityEndTime")} />
                        {errors.availabilityEndTime && <p className="prof-field-error">{errors.availabilityEndTime}</p>}
                      </div>
                    </div>

                    {/* Slot duration */}
                    <div className="prof-field" style={{ marginBottom:22 }}>
                      <label className="prof-label">Appointment Slot Duration</label>
                      <div className="prof-slots">
                        {[15,20,30,45,60].map((m) => (
                          <button key={m} className={`prof-slot-btn${form.slotMinutes === m ? " selected" : ""}`} onClick={() => setForm((f) => ({ ...f, slotMinutes:m }))}>
                            {m} min
                          </button>
                        ))}
                      </div>
                      <p className="prof-field-hint">With {form.slotMinutes}-min slots, you can see ~{slotsPerDay()} patients per day.</p>
                    </div>

                    {/* Summary */}
                    <div className="prof-summary">
                      <div className="prof-summary-title">📋 Schedule Summary</div>
                      <div className="prof-summary-row"><strong>Days:</strong> {form.workingDays.length > 0 ? form.workingDays.map((d) => DAY_LABELS[d]).join(", ") : "—"}</div>
                      <div className="prof-summary-row"><strong>Hours:</strong> {form.availabilityStartTime} – {form.availabilityEndTime}</div>
                      <div className="prof-summary-row"><strong>Slot:</strong> {form.slotMinutes} minutes · ~{slotsPerDay()} patients/day</div>
                    </div>

                    <div className="prof-nav-row">
                      <button className="prof-btn-back" onClick={() => setActiveSection(1)}>← Back</button>
                      <button className="prof-btn-submit" onClick={handleSubmit} disabled={loading}>
                        {loading ? <><div className="prof-spinner" />{isUpdate ? "Updating…" : "Creating…"}</> : <>{isUpdate ? "✅ Update Profile" : "🚀 Create Profile"}</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}