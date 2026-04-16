import { useState, useEffect } from "react";
import axios from "axios";

// ─── Mock / placeholder data (replace with real API calls) ───────────────────
const MOCK_STATS = {
  todayAppointments: 12,
  activePatients: 48,
  videoSessions: 3,
  prescriptionsIssued: 7,
};

const MOCK_APPOINTMENTS = [
  { id: "a1", patientName: "Nimal Kumara", initials: "NK", age: 34, gender: "M", reason: "Chest pain follow-up", type: "video", time: "11:00 AM", status: "confirmed" },
  { id: "a2", patientName: "Sandali Perera", initials: "SP", age: 52, gender: "F", reason: "Annual cardiac checkup", type: "in-person", time: "12:30 PM", status: "confirmed" },
  { id: "a3", patientName: "Ashen Rajapaksa", initials: "AR", age: 27, gender: "M", reason: "Palpitations · New patient", type: "in-person", time: "2:00 PM", status: "pending" },
  { id: "a4", patientName: "Fathima Mansoor", initials: "FM", age: 45, gender: "F", reason: "Hypertension management", type: "video", time: "3:30 PM", status: "confirmed" },
  { id: "a5", patientName: "Kamal Silva", initials: "KS", age: 61, gender: "M", reason: "Post-surgery review", type: "in-person", time: "4:45 PM", status: "pending" },
];

const MOCK_REPORTS = [
  { id: "r1", patientName: "Nimal Kumara", title: "ECG Report", date: "Apr 15", type: "PDF" },
  { id: "r2", patientName: "Sandali Perera", title: "Blood panel results", date: "Apr 14", type: "PDF" },
  { id: "r3", patientName: "Kamal Silva", title: "Chest X-ray", date: "Apr 12", type: "IMG" },
  { id: "r4", patientName: "Fathima Mansoor", title: "Echocardiogram", date: "Apr 10", type: "PDF" },
  { id: "r5", patientName: "Ashen Rajapaksa", title: "Lipid profile", date: "Apr 9", type: "PDF" },
];

const SCHEDULE = [
  { day: "Mon", slots: [{ time: "9:00", booked: false }, { time: "10:00", booked: true }, { time: "11:00", booked: false }] },
  { day: "Tue", slots: [{ time: "9:00", booked: true }, { time: "10:00", booked: true }, { time: "2:00", booked: false }, { time: "3:00", booked: false }] },
  { day: "Wed", slots: [{ time: "11:00", booked: false }, { time: "12:30", booked: false }, { time: "2:00", booked: false }, { time: "3:30", booked: false }, { time: "4:45", booked: false }], today: true },
  { day: "Thu", slots: [{ time: "9:00", booked: false }, { time: "10:30", booked: false }, { time: "2:00", booked: true }] },
  { day: "Fri", slots: [{ time: "9:00", booked: true }, { time: "11:00", booked: false }, { time: "3:00", booked: false }] },
  { day: "Sat", slots: [{ time: "9:00", booked: false }, { time: "10:00", booked: false }] },
  { day: "Sun", slots: [], dayOff: true },
];

// ─── Avatar color map ────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: "#E6F1FB", color: "#185FA5" },
  { bg: "#EAF3DE", color: "#3B6D11" },
  { bg: "#FAEEDA", color: "#854F0B" },
  { bg: "#EEEDFE", color: "#534AB7" },
  { bg: "#FCEBEB", color: "#A32D2D" },
];
const avatarColor = (idx) => AVATAR_COLORS[idx % AVATAR_COLORS.length];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, value, label, change, changeDir, iconBg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>{icon}</div>
      <div className="stat-val">{value}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={`stat-change ${changeDir}`}>{change}</div>
      )}
    </div>
  );
}

function AppointmentItem({ appt, idx, onAccept, onReject, onJoin }) {
  const { bg, color } = avatarColor(idx);
  return (
    <div className="appt-item">
      <div className="appt-avatar" style={{ background: bg, color }}>{appt.initials}</div>
      <div className="appt-info">
        <div className="appt-name">{appt.patientName}</div>
        <div className="appt-detail">{appt.reason} · {appt.age}{appt.gender}</div>
      </div>
      <span className={`badge ${appt.type === "video" ? "badge-video" : "badge-in-person"}`}>
        {appt.type === "video" ? "Video" : "In-person"}
      </span>
      <div className="appt-time">{appt.time}</div>

      {appt.status === "pending" && (
        <>
          <button className="btn-accept" onClick={() => onAccept(appt.id)}>Accept</button>
          <button className="btn-reject" onClick={() => onReject(appt.id)}>Reject</button>
        </>
      )}
      {appt.status === "confirmed" && appt.type === "video" && (
        <button className="btn-join" onClick={() => onJoin(appt.id)}>Join</button>
      )}
      {appt.status === "confirmed" && appt.type !== "video" && (
        <button className="btn-view-small">View</button>
      )}
    </div>
  );
}

function SchedulePanel({ schedule }) {
  return (
    <div className="schedule-grid">
      {schedule.map(({ day, slots, dayOff, today }) => (
        <div key={day} className={`schedule-day ${today ? "schedule-today" : ""}`}>
          <span className={`day-name ${today ? "day-today" : ""}`}>{day}</span>
          <div className="slot-row">
            {dayOff
              ? <span className="slot off">Day off</span>
              : slots.map((s) => (
                <span key={s.time} className={`slot ${s.booked ? "booked" : ""}`}>{s.time}</span>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrescriptionForm({ patients }) {
  const [form, setForm] = useState({ patientId: "", medication: "", dosage: "", duration: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.patientId || !form.medication) return;
    setLoading(true);
    try {
      // POST /api/prescriptions  (adjust endpoint to match your Express route)
      await axios.post("/api/prescriptions", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setSuccess(true);
      setForm({ patientId: "", medication: "", dosage: "", duration: "", notes: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to issue prescription:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rx-form">
      {success && <div className="success-banner">Prescription issued successfully!</div>}
      <div>
        <label className="rx-label">Patient</label>
        <select className="rx-input" name="patientId" value={form.patientId} onChange={handleChange}>
          <option value="">Select patient…</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.patientName}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="rx-label">Medication</label>
        <input className="rx-input" type="text" name="medication" placeholder="e.g. Atorvastatin 10mg" value={form.medication} onChange={handleChange} />
      </div>
      <div className="rx-row">
        <div>
          <label className="rx-label">Dosage</label>
          <input className="rx-input" type="text" name="dosage" placeholder="e.g. 1 tab daily" value={form.dosage} onChange={handleChange} />
        </div>
        <div>
          <label className="rx-label">Duration</label>
          <input className="rx-input" type="text" name="duration" placeholder="e.g. 30 days" value={form.duration} onChange={handleChange} />
        </div>
      </div>
      <div>
        <label className="rx-label">Notes</label>
        <textarea className="rx-input" name="notes" rows={2} placeholder="Additional instructions…" value={form.notes} onChange={handleChange} style={{ resize: "none" }} />
      </div>
      <button className="btn-rx" onClick={handleSubmit} disabled={loading}>
        {loading ? "Issuing…" : "Issue prescription"}
      </button>
    </div>
  );
}

function ReportItem({ report, idx }) {
  const isImg = report.type === "IMG";
  const { bg, color } = avatarColor(idx);
  return (
    <div className="report-item">
      <div className="report-icon" style={{ background: isImg ? "#E6F1FB" : "#FAEEDA" }}>
        {isImg
          ? <svg width="14" height="14" viewBox="0 0 20 20" fill="#185FA5"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 5 2-3 3 6z" clipRule="evenodd" /></svg>
          : <svg width="14" height="14" viewBox="0 0 20 20" fill="#854F0B"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="report-name">{report.title}</div>
        <div className="report-meta">{report.patientName} · {report.date} · {report.type}</div>
      </div>
      <button className="btn-view">View</button>
    </div>
  );
}

// ─── Sidebar Nav Item ────────────────────────────────────────────────────────
function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <div className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      {label}
      {badge != null && <span className="nav-badge">{badge}</span>}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [available, setAvailable] = useState(true);
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [stats, setStats] = useState(MOCK_STATS);

  // Fetch real data on mount — swap MOCK_* above with API responses
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Example: fetch today's appointments
    // axios.get("/api/appointments/today", { headers: { Authorization: `Bearer ${token}` } })
    //   .then(res => setAppointments(res.data))
    //   .catch(console.error);

    // Example: fetch stats
    // axios.get("/api/doctors/stats", { headers: { Authorization: `Bearer ${token}` } })
    //   .then(res => setStats(res.data))
    //   .catch(console.error);
  }, []);

  const handleAccept = async (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "confirmed" } : a))
    );
    // await axios.patch(`/api/appointments/${id}`, { status: "confirmed" }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
  };

  const handleReject = async (id) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    // await axios.patch(`/api/appointments/${id}`, { status: "cancelled" }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
  };

  const handleJoin = (id) => {
    // Navigate to video session page or open video SDK
    // navigate(`/video-session/${id}`);
    alert(`Joining video session for appointment ${id}`);
  };

  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const videoCount = appointments.filter((a) => a.type === "video" && a.status === "confirmed").length;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f6fa; color: #1a1a2e; }

        .dash { display: flex; min-height: 100vh; }

        /* ── Sidebar ── */
        .sidebar { width: 220px; flex-shrink: 0; background: #fff; border-right: 1px solid #e8eaf0; display: flex; flex-direction: column; padding: 20px 0; }
        .logo { padding: 0 20px 24px; display: flex; align-items: center; gap: 10px; }
        .logo-icon { width: 32px; height: 32px; border-radius: 8px; background: #185FA5; display: flex; align-items: center; justify-content: center; }
        .logo-text { font-size: 15px; font-weight: 600; color: #1a1a2e; }
        .logo-sub { font-size: 11px; color: #888; }
        .nav-section { padding: 0 12px; margin-bottom: 4px; }
        .nav-label { font-size: 10px; color: #aaa; letter-spacing: 0.08em; padding: 8px 8px 4px; text-transform: uppercase; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #555; transition: background 0.15s; user-select: none; }
        .nav-item:hover { background: #f5f6fa; color: #1a1a2e; }
        .nav-item.active { background: #E6F1FB; color: #185FA5; font-weight: 600; }
        .nav-item svg { flex-shrink: 0; }
        .nav-badge { margin-left: auto; background: #185FA5; color: #fff; font-size: 10px; border-radius: 99px; padding: 1px 6px; }
        .sidebar-footer { margin-top: auto; padding: 16px 12px 0; border-top: 1px solid #e8eaf0; }
        .doc-card { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; }
        .doc-avatar { width: 36px; height: 36px; border-radius: 50%; background: #E6F1FB; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #185FA5; flex-shrink: 0; }
        .doc-name { font-size: 13px; font-weight: 600; }
        .doc-spec { font-size: 11px; color: #888; }
        .online-dot { width: 8px; height: 8px; border-radius: 50%; background: #639922; margin-left: auto; flex-shrink: 0; }

        /* ── Main ── */
        .main { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
        .topbar { background: #fff; border-bottom: 1px solid #e8eaf0; padding: 14px 24px; display: flex; align-items: center; gap: 16px; }
        .topbar-title { font-size: 16px; font-weight: 600; }
        .topbar-date { font-size: 13px; color: #888; margin-left: 4px; }
        .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
        .avail-toggle { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555; }
        .toggle-pill { width: 36px; height: 20px; border-radius: 99px; position: relative; cursor: pointer; transition: background 0.2s; }
        .toggle-pill::after { content: ''; width: 16px; height: 16px; border-radius: 50%; background: white; position: absolute; top: 2px; transition: left 0.2s; }
        .toggle-on { background: #639922; }
        .toggle-on::after { left: 18px; }
        .toggle-off { background: #ccc; }
        .toggle-off::after { left: 2px; }
        .notif-btn { width: 32px; height: 32px; border-radius: 8px; background: #f5f6fa; border: 1px solid #e8eaf0; display: flex; align-items: center; justify-content: center; cursor: pointer; position: relative; }
        .notif-dot { position: absolute; top: 6px; right: 6px; width: 6px; height: 6px; border-radius: 50%; background: #E24B4A; }

        /* ── Content ── */
        .content { flex: 1; overflow-y: auto; padding: 20px 24px; background: #f5f6fa; }

        /* ── Stats ── */
        .stats-row { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
        .stat-card { background: #fff; border: 1px solid #e8eaf0; border-radius: 12px; padding: 14px 16px; }
        .stat-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .stat-val { font-size: 22px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: #888; }
        .stat-change { font-size: 11px; margin-top: 6px; }
        .up { color: #3B6D11; }
        .down { color: #A32D2D; }

        /* ── Two col ── */
        .two-col { display: grid; grid-template-columns: 1fr 320px; gap: 16px; margin-bottom: 16px; }
        .panel { background: #fff; border: 1px solid #e8eaf0; border-radius: 12px; }
        .panel-header { padding: 14px 16px 0; display: flex; align-items: center; justify-content: space-between; }
        .panel-title { font-size: 14px; font-weight: 600; }
        .panel-action { font-size: 12px; color: #185FA5; cursor: pointer; }
        .panel-body { padding: 12px 16px 16px; }

        /* ── Appointments ── */
        .appt-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
        .appt-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; border: 1px solid #e8eaf0; background: #fafbfc; }
        .appt-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; flex-shrink: 0; }
        .appt-info { flex: 1; min-width: 0; }
        .appt-name { font-size: 13px; font-weight: 600; }
        .appt-detail { font-size: 11px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .appt-time { font-size: 12px; color: #888; flex-shrink: 0; }
        .badge { font-size: 10px; padding: 2px 8px; border-radius: 99px; font-weight: 600; flex-shrink: 0; }
        .badge-pending { background: #FAEEDA; color: #854F0B; }
        .badge-confirmed { background: #EAF3DE; color: #3B6D11; }
        .badge-video { background: #E6F1FB; color: #185FA5; }
        .badge-in-person { background: #EEEDFE; color: #534AB7; }
        .btn-join { font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #185FA5; color: white; border: none; cursor: pointer; flex-shrink: 0; font-weight: 600; }
        .btn-accept { font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #639922; color: white; border: none; cursor: pointer; flex-shrink: 0; font-weight: 600; }
        .btn-reject { font-size: 11px; padding: 4px 10px; border-radius: 6px; background: transparent; color: #888; border: 1px solid #e8eaf0; cursor: pointer; flex-shrink: 0; }
        .btn-view-small { font-size: 11px; padding: 4px 10px; border-radius: 6px; background: transparent; color: #555; border: 1px solid #e8eaf0; cursor: pointer; flex-shrink: 0; }

        /* ── Schedule ── */
        .schedule-grid { margin-top: 12px; }
        .schedule-day { display: flex; align-items: center; gap: 10px; padding: 6px 4px; border-bottom: 1px solid #f0f1f5; }
        .schedule-day:last-child { border-bottom: none; }
        .schedule-today { background: #f0f7ff; border-radius: 6px; padding: 6px 8px; }
        .day-name { font-size: 12px; color: #888; width: 36px; flex-shrink: 0; }
        .day-today { color: #185FA5; font-weight: 700; }
        .slot-row { display: flex; gap: 4px; flex-wrap: wrap; }
        .slot { font-size: 11px; padding: 2px 7px; border-radius: 4px; background: #E6F1FB; color: #185FA5; }
        .slot.booked { background: #f0f1f5; color: #aaa; text-decoration: line-through; }
        .slot.off { background: transparent; color: #ccc; font-style: italic; }

        /* ── Bottom row ── */
        .bottom-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* ── Prescription ── */
        .rx-form { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
        .rx-label { font-size: 11px; color: #888; margin-bottom: 2px; display: block; }
        .rx-input { font-size: 13px; padding: 8px 10px; border: 1px solid #e8eaf0; border-radius: 8px; background: #fafbfc; color: #1a1a2e; width: 100%; outline: none; }
        .rx-input:focus { border-color: #185FA5; }
        .rx-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .btn-rx { padding: 9px; border-radius: 8px; background: #185FA5; color: white; border: none; cursor: pointer; font-size: 13px; font-weight: 600; margin-top: 4px; }
        .btn-rx:disabled { opacity: 0.6; cursor: not-allowed; }
        .success-banner { background: #EAF3DE; color: #3B6D11; font-size: 13px; padding: 8px 12px; border-radius: 8px; font-weight: 600; }

        /* ── Reports ── */
        .report-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f1f5; }
        .report-item:last-child { border-bottom: none; }
        .report-icon { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .report-name { font-size: 13px; font-weight: 600; }
        .report-meta { font-size: 11px; color: #888; }
        .btn-view { font-size: 11px; padding: 3px 9px; border-radius: 6px; border: 1px solid #e8eaf0; background: transparent; color: #185FA5; cursor: pointer; margin-left: auto; flex-shrink: 0; }

        @media (max-width: 1024px) {
          .two-col { grid-template-columns: 1fr; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .bottom-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .sidebar { display: none; }
          .stats-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="dash">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-icon">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v14M3 10h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="logo-text">CareLink</div>
              <div className="logo-sub">Doctor Portal</div>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">Main</div>
            <NavItem active={activeNav === "dashboard"} onClick={() => setActiveNav("dashboard")} label="Dashboard"
              icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>}
            />
            <NavItem active={activeNav === "appointments"} onClick={() => setActiveNav("appointments")} label="Appointments" badge={pendingCount}
              icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" /></svg>}
            />
            <NavItem active={activeNav === "patients"} onClick={() => setActiveNav("patients")} label="My Patients"
              icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>}
            />
            <NavItem active={activeNav === "reports"} onClick={() => setActiveNav("reports")} label="Medical Reports"
              icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 5 2-3 3 6z" clipRule="evenodd" /></svg>}
            />
            <NavItem active={activeNav === "prescriptions"} onClick={() => setActiveNav("prescriptions")} label="Prescriptions"
              icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>}
            />
          </div>

          <div className="nav-section" style={{ marginTop: 8 }}>
            <div className="nav-label">Consultations</div>
            <NavItem active={activeNav === "video"} onClick={() => setActiveNav("video")} label="Video Sessions" badge={videoCount}
              icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>}
            />
            <NavItem active={activeNav === "ai"} onClick={() => setActiveNav("ai")} label="AI Symptom Reports"
              icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" /></svg>}
            />
          </div>

          <div className="sidebar-footer">
            <div className="doc-card">
              <div className="doc-avatar">DS</div>
              <div>
                <div className="doc-name">Dr. Saman</div>
                <div className="doc-spec">Cardiologist</div>
              </div>
              <div className="online-dot" />
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <div>
              <span className="topbar-title">Good morning, Dr. Saman</span>
              <span className="topbar-date">— {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            <div className="topbar-right">
              <div className="avail-toggle">
                <span>{available ? "Available" : "Unavailable"}</span>
                <div
                  className={`toggle-pill ${available ? "toggle-on" : "toggle-off"}`}
                  onClick={() => setAvailable((v) => !v)}
                />
              </div>
              <div className="notif-btn">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                <div className="notif-dot" />
              </div>
            </div>
          </div>

          <div className="content">
            {/* Stats */}
            <div className="stats-row">
              <StatCard iconBg="#E6F1FB" value={stats.todayAppointments} label="Today's appointments" change="↑ 3 more than yesterday" changeDir="up"
                icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="#185FA5"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" /></svg>}
              />
              <StatCard iconBg="#EAF3DE" value={stats.activePatients} label="Active patients" change="↑ 5 this week" changeDir="up"
                icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="#3B6D11"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>}
              />
              <StatCard iconBg="#EEEDFE" value={stats.videoSessions} label="Video sessions today" change="Next at 11:00 AM"
                icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="#534AB7"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>}
              />
              <StatCard iconBg="#FAEEDA" value={stats.prescriptionsIssued} label="Prescriptions issued" change="↓ 2 vs last week" changeDir="down"
                icon={<svg width="16" height="16" viewBox="0 0 20 20" fill="#854F0B"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>}
              />
            </div>

            {/* Two col */}
            <div className="two-col">
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Today's appointments</div>
                  <div className="panel-action">View all →</div>
                </div>
                <div className="panel-body">
                  <div className="appt-list">
                    {appointments.map((appt, idx) => (
                      <AppointmentItem key={appt.id} appt={appt} idx={idx} onAccept={handleAccept} onReject={handleReject} onJoin={handleJoin} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">My schedule</div>
                  <div className="panel-action">Edit →</div>
                </div>
                <div className="panel-body">
                  <SchedulePanel schedule={SCHEDULE} />
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div className="bottom-row">
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Issue prescription</div>
                </div>
                <div className="panel-body">
                  <PrescriptionForm patients={appointments} />
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">Patient-uploaded reports</div>
                  <div className="panel-action">View all →</div>
                </div>
                <div className="panel-body" style={{ marginTop: 10 }}>
                  {MOCK_REPORTS.map((r, idx) => (
                    <ReportItem key={r.id} report={r} idx={idx} />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
