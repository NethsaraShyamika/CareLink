import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_DOCTOR_SERVICE_URL || "http://localhost:3002";

const SPECIALIZATIONS = [
  "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology",
  "General Practice", "Gynecology", "Hematology", "Nephrology",
  "Neurology", "Oncology", "Ophthalmology", "Orthopedics",
  "Pediatrics", "Psychiatry", "Pulmonology", "Radiology",
  "Rheumatology", "Surgery", "Urology", "Other"
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DAY_LABELS = { MON: "Mon", TUE: "Tue", WED: "Wed", THU: "Thu", FRI: "Fri", SAT: "Sat", SUN: "Sun" };

const initialForm = {
  firstName: "",
  lastName: "",
  specialization: "",
  licenseNumber: "",
  yearsOfExperience: "",
  consultationFee: "",
  hospitalOrClinic: "",
  workingDays: ["MON", "TUE", "WED", "THU", "FRI"],
  availabilityStartTime: "08:00",
  availabilityEndTime: "18:00",
  slotMinutes: 30,
};

// ─── Inline Styles ────────────────────────────────────────────────────────────
const styles = {
  // Layout
  page: {
    minHeight: "100vh",
    background: "#F9FAFB",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    padding: "32px 16px",
  },
  container: {
    maxWidth: 820,
    margin: "0 auto",
  },

  // Header
  header: {
    marginBottom: 32,
  },
  headerBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#E0E7FF",
    color: "#4F46E5",
    borderRadius: 20,
    padding: "4px 14px",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 6px",
    lineHeight: 1.2,
  },
  headerSub: {
    fontSize: 15,
    color: "#6B7280",
    margin: 0,
  },

  // Progress Bar
  progressWrap: {
    display: "flex",
    gap: 4,
    marginBottom: 32,
  },
  progressStep: (active, done) => ({
    flex: 1,
    height: 4,
    borderRadius: 99,
    background: done ? "#4F46E5" : active ? "#4F46E5" : "#E5E7EB",
    transition: "background 0.3s",
  }),

  // Card
  card: {
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid #E5E7EB",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    marginBottom: 20,
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "20px 24px",
    borderBottom: "1px solid #F3F4F6",
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#E0E7FF",
    color: "#4F46E5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
    margin: 0,
  },
  cardSub: {
    fontSize: 13,
    color: "#9CA3AF",
    margin: "2px 0 0",
  },
  cardBody: {
    padding: "24px",
  },

  // Grid
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 16,
  },
  span2: {
    gridColumn: "span 2",
  },

  // Field
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
  },
  required: {
    color: "#EF4444",
    marginLeft: 2,
  },
  input: (hasError) => ({
    height: 42,
    border: `1.5px solid ${hasError ? "#EF4444" : "#E5E7EB"}`,
    borderRadius: 10,
    padding: "0 14px",
    fontSize: 14,
    color: "#111827",
    background: "#FAFAFA",
    outline: "none",
    transition: "border 0.2s, box-shadow 0.2s",
    width: "100%",
    boxSizing: "border-box",
  }),
  select: (hasError) => ({
    height: 42,
    border: `1.5px solid ${hasError ? "#EF4444" : "#E5E7EB"}`,
    borderRadius: 10,
    padding: "0 14px",
    fontSize: 14,
    color: "#111827",
    background: "#FAFAFA",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    cursor: "pointer",
  }),
  fieldError: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 2,
  },
  fieldHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },

  // Day picker
  daysGrid: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },
  dayChip: (selected) => ({
    width: 54,
    height: 38,
    borderRadius: 8,
    border: `1.5px solid ${selected ? "#4F46E5" : "#E5E7EB"}`,
    background: selected ? "#4F46E5" : "#FAFAFA",
    color: selected ? "#FFFFFF" : "#6B7280",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
    userSelect: "none",
  }),

  // Slot buttons
  slotGrid: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 4,
  },
  slotBtn: (selected) => ({
    padding: "8px 16px",
    borderRadius: 8,
    border: `1.5px solid ${selected ? "#4F46E5" : "#E5E7EB"}`,
    background: selected ? "#E0E7FF" : "#FAFAFA",
    color: selected ? "#4F46E5" : "#6B7280",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  }),

  // Alert
  alert: (type) => ({
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 13,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: type === "success" ? "#F0FDF4" : "#FEF2F2",
    border: `1px solid ${type === "success" ? "#BBF7D0" : "#FECACA"}`,
    color: type === "success" ? "#166534" : "#991B1B",
  }),

  // Submit button
  submitBtn: (loading) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    height: 48,
    background: loading ? "#A5B4FC" : "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    transition: "opacity 0.2s, transform 0.1s",
    boxShadow: "0 4px 14px rgba(79,70,229,0.35)",
    marginTop: 8,
  }),

  // Status badge
  statusBadge: (status) => {
    const map = {
      pending: { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
      approved: { bg: "#F0FDF4", color: "#166534", dot: "#22C55E" },
      rejected: { bg: "#FEF2F2", color: "#991B1B", dot: "#EF4444" },
    };
    const s = map[status] || map.pending;
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 12px",
      borderRadius: 20,
      background: s.bg,
      color: s.color,
      fontSize: 13,
      fontWeight: 600,
    };
  },
  statusDot: (status) => {
    const colors = { pending: "#F59E0B", approved: "#22C55E", rejected: "#EF4444" };
    return {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: colors[status] || "#F59E0B",
    };
  },

  // Info row
  infoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 24px",
    borderBottom: "1px solid #F3F4F6",
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: 500,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: 600,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function DoctorProfile() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [alert, setAlert] = useState(null); // { type, msg }
  const [isUpdate, setIsUpdate] = useState(false);
  const [existingDoctor, setExistingDoctor] = useState(null);
  const [activeSection, setActiveSection] = useState(0); // 0=personal, 1=professional, 2=availability

  // Focus styles via CSS injection
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
      input:focus, select:focus { 
        border-color: #4F46E5 !important; 
        box-shadow: 0 0 0 3px rgba(79,70,229,0.1) !important;
        background: #FFFFFF !important;
      }
      button:active { transform: scale(0.98); }
      .day-chip:hover { opacity: 0.85; }
      .slot-btn:hover { opacity: 0.85; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/api/doctors/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExistingDoctor(data);
        setIsUpdate(true);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          specialization: data.specialization || "",
          licenseNumber: data.licenseNumber || "",
          yearsOfExperience: data.yearsOfExperience ?? "",
          consultationFee: data.consultationFee ?? "",
          hospitalOrClinic: data.hospitalOrClinic || "",
          workingDays: data.workingDays || ["MON", "TUE", "WED", "THU", "FRI"],
          availabilityStartTime: data.availabilityStartTime || "08:00",
          availabilityEndTime: data.availabilityEndTime || "18:00",
          slotMinutes: data.slotMinutes || 30,
        });
      } catch {
        // No profile yet — create mode
      } finally {
        setFetchLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: null }));
  };

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.specialization) e.specialization = "Specialization is required";
    if (!form.licenseNumber.trim()) e.licenseNumber = "License number is required";
    if (form.yearsOfExperience === "" || isNaN(form.yearsOfExperience) || Number(form.yearsOfExperience) < 0)
      e.yearsOfExperience = "Enter valid years (≥ 0)";
    if (form.consultationFee === "" || isNaN(form.consultationFee) || Number(form.consultationFee) < 0)
      e.consultationFee = "Enter valid fee (≥ 0)";
    if (form.workingDays.length === 0) e.workingDays = "Select at least one working day";
    if (!form.availabilityStartTime) e.availabilityStartTime = "Required";
    if (!form.availabilityEndTime) e.availabilityEndTime = "Required";
    if (form.availabilityStartTime >= form.availabilityEndTime)
      e.availabilityEndTime = "End time must be after start time";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      // Scroll to first error
      const sections = { firstName: 0, lastName: 0, specialization: 1, licenseNumber: 1,
        yearsOfExperience: 1, consultationFee: 1, workingDays: 2, availabilityStartTime: 2, availabilityEndTime: 2 };
      const firstErr = Object.keys(e)[0];
      if (sections[firstErr] !== undefined) setActiveSection(sections[firstErr]);
      return;
    }

    setLoading(true);
    setAlert(null);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...form,
        yearsOfExperience: Number(form.yearsOfExperience),
        consultationFee: Number(form.consultationFee),
        slotMinutes: Number(form.slotMinutes),
      };
      const { data } = await axios.post(`${API_BASE}/api/doctors/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ type: "success", msg: data.message || (isUpdate ? "Profile updated!" : "Profile created!") });
      setExistingDoctor(data.doctor);
      setIsUpdate(true);
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.message || "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            border: "3px solid #E0E7FF", borderTop: "3px solid #4F46E5",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#6B7280", fontSize: 14 }}>Loading your profile…</p>
        </div>
      </div>
    );
  }

  const sections = [
    { label: "Personal", icon: "👤" },
    { label: "Professional", icon: "🩺" },
    { label: "Availability", icon: "📅" },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ── Header ── */}
        <div style={styles.header}>
          <div style={styles.headerBadge}>
            <span>🩺</span>
            {isUpdate ? "Edit Profile" : "New Profile"}
          </div>
          <h1 style={styles.headerTitle}>
            {isUpdate ? "Update Your Profile" : "Create Doctor Profile"}
          </h1>
          <p style={styles.headerSub}>
            {isUpdate
              ? "Keep your information accurate to maintain patient trust."
              : "Complete your profile to start receiving appointment requests."}
          </p>
        </div>

        {/* ── Verification Status (if profile exists) ── */}
        {existingDoctor && (
          <div style={{ ...styles.card, marginBottom: 20 }}>
            {[
              { label: "Verification Status", value: (
                <div style={styles.statusBadge(existingDoctor.verificationStatus)}>
                  <div style={styles.statusDot(existingDoctor.verificationStatus)} />
                  {existingDoctor.verificationStatus?.charAt(0).toUpperCase() +
                    existingDoctor.verificationStatus?.slice(1)}
                </div>
              )},
              {
                label: "Member Since",
                value: existingDoctor.createdAt
                  ? new Date(existingDoctor.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                  : "—",
              },
            ].map((row, i) => (
              <div key={i} style={{ ...styles.infoRow, borderBottom: i === 0 ? "1px solid #F3F4F6" : "none" }}>
                <span style={styles.infoLabel}>{row.label}</span>
                <span style={styles.infoValue}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Alert ── */}
        {alert && (
          <div style={styles.alert(alert.type)}>
            <span>{alert.type === "success" ? "✅" : "⚠️"}</span>
            {alert.msg}
          </div>
        )}

        {/* ── Section Tabs ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {sections.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                border: "1.5px solid",
                borderColor: activeSection === i ? "#4F46E5" : "#E5E7EB",
                background: activeSection === i ? "#E0E7FF" : "#FFFFFF",
                color: activeSection === i ? "#4F46E5" : "#6B7280",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Progress ── */}
        <div style={styles.progressWrap}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={styles.progressStep(activeSection === i, activeSection > i)} />
          ))}
        </div>

        {/* ══════════ SECTION 0: Personal ══════════ */}
        {activeSection === 0 && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>👤</div>
              <div>
                <p style={styles.cardTitle}>Personal Information</p>
                <p style={styles.cardSub}>Your name as it appears to patients</p>
              </div>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.grid2}>
                {[
                  { field: "firstName", label: "First Name", placeholder: "e.g. Amara", required: true },
                  { field: "lastName", label: "Last Name", placeholder: "e.g. Perera", required: true },
                ].map(({ field, label, placeholder, required }) => (
                  <div key={field} style={styles.fieldWrap}>
                    <label style={styles.label}>
                      {label}{required && <span style={styles.required}>*</span>}
                    </label>
                    <input
                      style={styles.input(!!errors[field])}
                      placeholder={placeholder}
                      value={form[field]}
                      onChange={set(field)}
                    />
                    {errors[field] && <p style={styles.fieldError}>{errors[field]}</p>}
                  </div>
                ))}

                <div style={{ ...styles.fieldWrap, ...styles.span2 }}>
                  <label style={styles.label}>Hospital / Clinic</label>
                  <input
                    style={styles.input(false)}
                    placeholder="e.g. City General Hospital or Online"
                    value={form.hospitalOrClinic}
                    onChange={set("hospitalOrClinic")}
                  />
                  <p style={styles.fieldHint}>Leave blank if you primarily work online.</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  onClick={() => setActiveSection(1)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    background: "#4F46E5",
                    color: "#FFF",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  Next: Professional →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SECTION 1: Professional ══════════ */}
        {activeSection === 1 && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>🩺</div>
              <div>
                <p style={styles.cardTitle}>Professional Details</p>
                <p style={styles.cardSub}>Your credentials and specialization</p>
              </div>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.grid2}>

                <div style={{ ...styles.fieldWrap, ...styles.span2 }}>
                  <label style={styles.label}>
                    Specialization<span style={styles.required}>*</span>
                  </label>
                  <select
                    style={styles.select(!!errors.specialization)}
                    value={form.specialization}
                    onChange={set("specialization")}
                  >
                    <option value="">— Select specialization —</option>
                    {SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.specialization && <p style={styles.fieldError}>{errors.specialization}</p>}
                </div>

                <div style={styles.fieldWrap}>
                  <label style={styles.label}>
                    License Number<span style={styles.required}>*</span>
                  </label>
                  <input
                    style={styles.input(!!errors.licenseNumber)}
                    placeholder="e.g. SLMC-12345"
                    value={form.licenseNumber}
                    onChange={set("licenseNumber")}
                  />
                  {errors.licenseNumber && <p style={styles.fieldError}>{errors.licenseNumber}</p>}
                </div>

                <div style={styles.fieldWrap}>
                  <label style={styles.label}>
                    Years of Experience<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    style={styles.input(!!errors.yearsOfExperience)}
                    placeholder="e.g. 8"
                    value={form.yearsOfExperience}
                    onChange={set("yearsOfExperience")}
                  />
                  {errors.yearsOfExperience && <p style={styles.fieldError}>{errors.yearsOfExperience}</p>}
                </div>

                <div style={styles.fieldWrap}>
                  <label style={styles.label}>
                    Consultation Fee (LKR)<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    style={styles.input(!!errors.consultationFee)}
                    placeholder="e.g. 2500"
                    value={form.consultationFee}
                    onChange={set("consultationFee")}
                  />
                  {errors.consultationFee && <p style={styles.fieldError}>{errors.consultationFee}</p>}
                </div>

              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                <button
                  onClick={() => setActiveSection(0)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    background: "#F3F4F6",
                    color: "#374151",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={() => setActiveSection(2)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    background: "#4F46E5",
                    color: "#FFF",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Next: Availability →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ SECTION 2: Availability ══════════ */}
        {activeSection === 2 && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>📅</div>
              <div>
                <p style={styles.cardTitle}>Availability Settings</p>
                <p style={styles.cardSub}>When are you available for appointments?</p>
              </div>
            </div>
            <div style={styles.cardBody}>

              {/* Working Days */}
              <div style={{ ...styles.fieldWrap, marginBottom: 20 }}>
                <label style={styles.label}>
                  Working Days<span style={styles.required}>*</span>
                </label>
                <div style={styles.daysGrid}>
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      className="day-chip"
                      onClick={() => toggleDay(day)}
                      style={styles.dayChip(form.workingDays.includes(day))}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  ))}
                </div>
                {errors.workingDays && <p style={styles.fieldError}>{errors.workingDays}</p>}
                <p style={styles.fieldHint}>
                  {form.workingDays.length} day{form.workingDays.length !== 1 ? "s" : ""} selected
                </p>
              </div>

              {/* Time Range */}
              <div style={{ ...styles.grid2, marginBottom: 20 }}>
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>
                    Start Time<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="time"
                    style={styles.input(!!errors.availabilityStartTime)}
                    value={form.availabilityStartTime}
                    onChange={set("availabilityStartTime")}
                  />
                  {errors.availabilityStartTime && <p style={styles.fieldError}>{errors.availabilityStartTime}</p>}
                </div>
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>
                    End Time<span style={styles.required}>*</span>
                  </label>
                  <input
                    type="time"
                    style={styles.input(!!errors.availabilityEndTime)}
                    value={form.availabilityEndTime}
                    onChange={set("availabilityEndTime")}
                  />
                  {errors.availabilityEndTime && <p style={styles.fieldError}>{errors.availabilityEndTime}</p>}
                </div>
              </div>

              {/* Slot Duration */}
              <div style={{ ...styles.fieldWrap, marginBottom: 24 }}>
                <label style={styles.label}>Appointment Slot Duration</label>
                <div style={styles.slotGrid}>
                  {[15, 20, 30, 45, 60].map((min) => (
                    <button
                      key={min}
                      className="slot-btn"
                      onClick={() => setForm((f) => ({ ...f, slotMinutes: min }))}
                      style={styles.slotBtn(form.slotMinutes === min)}
                    >
                      {min} min
                    </button>
                  ))}
                </div>
                <p style={styles.fieldHint}>
                  With {form.slotMinutes}-min slots, you can see ~
                  {Math.floor(
                    (parseInt(form.availabilityEndTime?.split(":")[0] || 18) * 60 +
                      parseInt(form.availabilityEndTime?.split(":")[1] || 0) -
                      parseInt(form.availabilityStartTime?.split(":")[0] || 8) * 60 -
                      parseInt(form.availabilityStartTime?.split(":")[1] || 0)) /
                    form.slotMinutes
                  )}{" "}
                  patients per day.
                </p>
              </div>

              {/* Summary Card */}
              <div style={{
                background: "#F5F3FF",
                border: "1px solid #DDD6FE",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 24,
              }}>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: "#4F46E5" }}>
                  📋 Schedule Summary
                </p>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "#374151" }}>
                  <strong>Days:</strong>{" "}
                  {form.workingDays.length > 0
                    ? form.workingDays.map((d) => DAY_LABELS[d]).join(", ")
                    : "—"}
                </p>
                <p style={{ margin: "0 0 4px", fontSize: 13, color: "#374151" }}>
                  <strong>Hours:</strong> {form.availabilityStartTime} – {form.availabilityEndTime}
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "#374151" }}>
                  <strong>Slot:</strong> {form.slotMinutes} minutes
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => setActiveSection(1)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 10,
                    background: "#F3F4F6",
                    color: "#374151",
                    border: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={styles.submitBtn(loading)}
                >
                  {loading ? (
                    <>
                      <span style={{
                        width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)",
                        borderTop: "2px solid #fff", borderRadius: "50%",
                        animation: "spin 0.8s linear infinite", display: "inline-block",
                      }} />
                      {isUpdate ? "Updating…" : "Creating…"}
                    </>
                  ) : (
                    <>{isUpdate ? "✅ Update Profile" : "🚀 Create Profile"}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}