import { useState, useRef, useEffect } from "react";
import { useUser } from "../../contextUser.jsx";
import { useNavigate } from "react-router-dom";
import PatientSidebar from "../shared/PatientSidebar.jsx";

const API_BASE =
  (import.meta.env.VITE_API_BASE || "http://localhost:3007") + "/api/symptoms";

const SYMPTOM_SUGGESTIONS = [
  "Headache","Fever","Cough","Fatigue","Nausea","Dizziness","Chest pain",
  "Shortness of breath","Sore throat","Back pain","Stomach ache","Joint pain",
  "Rash","Vomiting","Chills","Loss of appetite","Muscle aches","Runny nose",
  "Insomnia","Anxiety",
];

const URGENCY_CONFIG = {
  routine:   { label: "Routine",         color: "#22C55E", bg: "#F0FDF4", icon: "✓"  },
  soon:      { label: "See Doctor Soon", color: "#F59E0B", bg: "#FFFBEB", icon: "⏰" },
  urgent:    { label: "Urgent",          color: "#EF4444", bg: "#FEF2F2", icon: "⚠️" },
  emergency: { label: "Emergency",       color: "#DC2626", bg: "#FFF1F2", icon: "🚨" },
};

const SEVERITY_CONFIG = {
  low:      { label: "Low",      color: "#22C55E", bg: "#DCFCE7" },
  moderate: { label: "Moderate", color: "#F59E0B", bg: "#FEF3C7" },
  high:     { label: "High",     color: "#EF4444", bg: "#FEE2E2" },
};

export default function SymptomCheck({ token: propToken, onCheckComplete }) {
  const [symptoms, setSymptoms] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [step, setStep] = useState(1);
  const inputRef = useRef(null);
  const resultRef = useRef(null);

  const { user } = useUser();
  const navigate = useNavigate();
  const token = propToken || localStorage.getItem("token");

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleInputChange = (val) => {
    setInputValue(val);
    if (val.trim().length > 0) {
      setSuggestions(
        SYMPTOM_SUGGESTIONS.filter(
          (s) => s.toLowerCase().includes(val.toLowerCase()) && !symptoms.includes(s)
        ).slice(0, 5)
      );
    } else {
      setSuggestions([]);
    }
  };

  const addSymptom = (symptom) => {
    const trimmed = symptom.trim();
    if (!trimmed || symptoms.includes(trimmed)) return;
    setSymptoms([...symptoms, trimmed]);
    setInputValue("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeSymptom = (s) => setSymptoms(symptoms.filter((x) => x !== s));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) addSymptom(inputValue);
    } else if (e.key === "Backspace" && !inputValue && symptoms.length > 0) {
      setSymptoms(symptoms.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (symptoms.length === 0) { setError("Please add at least one symptom."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${API_BASE}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ symptoms, additionalNotes: notes, age: age ? parseInt(age) : undefined, gender: gender || undefined }),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error("Server returned an invalid response."); }
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      setResult(data); setStep(3); onCheckComplete?.(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const reset = () => { setSymptoms([]); setInputValue(""); setAge(""); setGender(""); setNotes(""); setResult(null); setError(""); setStep(1); };

  const urgency = result ? URGENCY_CONFIG[result.aiResponse?.urgencyLevel] : null;

  return (
    <div style={styles.container}>
      {/* ── Shared Sidebar ── */}
      <PatientSidebar activePage="symptom-check" />

      {/* Main Content */}
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 3H15M12 3V7M12 7C8.13 7 5 10.13 5 14C5 17.87 8.13 21 12 21C15.87 21 19 17.87 19 14C19 10.13 15.87 7 12 7Z" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 11V14M12 14H15M12 14H9" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h2 style={styles.headerTitle}>AI Symptom Checker</h2>
            <p style={styles.headerSub}>Powered by Gemini AI · Sri Lanka Medical Guidelines</p>
          </div>
        </div>

        {/* Step Indicator */}
        {step < 3 && (
          <div style={styles.steps}>
            {[{ n: 1, label: "Symptoms" }, { n: 2, label: "Context" }].map(({ n, label }) => (
              <div key={n} style={styles.stepItem} onClick={() => step > n && setStep(n)}>
                <div style={{ ...styles.stepCircle, background: step >= n ? "#14B8A6" : "#E5E7EB", color: step >= n ? "#fff" : "#9CA3AF", cursor: step > n ? "pointer" : "default" }}>
                  {step > n ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : n}
                </div>
                <span style={{ ...styles.stepLabel, color: step >= n ? "#111827" : "#9CA3AF" }}>{label}</span>
                {n < 2 && <div style={{ ...styles.stepLine, background: step > n ? "#14B8A6" : "#E5E7EB" }} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Symptoms */}
        {step === 1 && (
          <div style={styles.card}>
            <label style={styles.label}><span style={styles.labelDot} />What symptoms are you experiencing?</label>
            <p style={styles.hint}>Type a symptom and press Enter, or pick from suggestions below</p>

            <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-text focus-within:ring-2 focus-within:ring-teal-400 transition" onClick={() => inputRef.current?.focus()}>
              {symptoms.map((s) => (
                <span key={s} className="flex items-center gap-1 bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-sm">
                  {s}
                  <button onClick={(e) => { e.stopPropagation(); removeSymptom(s); }} className="text-teal-600 hover:text-red-500 font-bold">×</button>
                </span>
              ))}
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={symptoms.length === 0 ? "e.g. Headache, Fever..." : "Add more..."}
                className="flex-1 min-w-30 outline-none bg-transparent text-sm"
              />
            </div>

            {suggestions.length > 0 && (
              <div style={styles.suggestions}>
                {suggestions.map((s) => (
                  <button key={s} onClick={() => addSymptom(s)} style={styles.suggestionItem}>{s}</button>
                ))}
              </div>
            )}

            <div style={styles.quickPicks}>
              <span style={styles.quickLabel}>Common:</span>
              {SYMPTOM_SUGGESTIONS.slice(0, 8).filter((s) => !symptoms.includes(s)).map((s) => (
                <button key={s} onClick={() => addSymptom(s)} style={styles.quickPill}>{s}</button>
              ))}
            </div>

            {error && <p style={styles.error}>{error}</p>}
            <button onClick={() => { if (symptoms.length === 0) { setError("Please add at least one symptom."); return; } setError(""); setStep(2); }} style={styles.primaryBtn}>Continue</button>
          </div>
        )}

        {/* Step 2: Context */}
        {step === 2 && (
          <div style={styles.card}>
            <label style={styles.label}><span style={styles.labelDot} />Patient Context <span style={styles.optional}>(Optional but helpful)</span></label>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Age</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 28" min="0" max="120" style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} style={styles.input}>
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={styles.fieldLabel}>Additional Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any relevant medical history, medications, allergies, or duration of symptoms..." style={styles.textarea} rows={3} />
            </div>
            <div style={styles.reviewBox}>
              <p style={styles.reviewLabel}>Your symptoms:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {symptoms.map((s) => <span key={s} style={styles.reviewTag}>{s}</span>)}
              </div>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <div style={styles.btnRow}>
              <button onClick={() => setStep(1)} style={styles.secondaryBtn}>Back</button>
              <button onClick={handleSubmit} disabled={loading} style={{ ...styles.primaryBtn, flex: 1 }}>
                {loading ? <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}><LoadingSpinner /> Analyzing with AI...</span> : "Analyze Symptoms"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <div ref={resultRef}>
            {urgency && (
              <div style={{ ...styles.urgencyBanner, background: urgency.bg, borderColor: urgency.color }}>
                <span style={styles.urgencyIcon}>{urgency.icon}</span>
                <div>
                  <p style={{ ...styles.urgencyLabel, color: urgency.color }}>Urgency Level</p>
                  <p style={{ ...styles.urgencyValue, color: urgency.color }}>{urgency.label}</p>
                </div>
              </div>
            )}

            <div style={styles.resultCard}>
              <h3 style={styles.resultSectionTitle}>Possible Conditions</h3>
              <div style={styles.conditionsList}>
                {result.aiResponse?.possibleConditions?.map((c, i) => {
                  const sev = SEVERITY_CONFIG[c.severity] || SEVERITY_CONFIG.low;
                  return (
                    <div key={i} style={styles.conditionItem}>
                      <div style={styles.conditionHeader}>
                        <span style={styles.conditionName}>{c.name}</span>
                        <span style={{ ...styles.severityBadge, background: sev.bg, color: sev.color }}>{sev.label}</span>
                      </div>
                      <p style={styles.conditionDesc}>{c.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.resultCard}>
              <h3 style={styles.resultSectionTitle}>Recommended Specialists</h3>
              <div style={styles.specialtiesRow}>
                {result.aiResponse?.recommendedSpecialties?.map((s, i) => (
                  <span key={i} style={styles.specialtyChip}>{s}</span>
                ))}
              </div>
            </div>

            <div style={styles.resultCard}>
              <h3 style={styles.resultSectionTitle}>General Advice</h3>
              <p style={styles.adviceText}>{result.aiResponse?.generalAdvice}</p>
            </div>

            <div style={styles.disclaimer}>
              <p style={styles.disclaimerText}>{result.aiResponse?.disclaimer}</p>
            </div>

            <div style={styles.btnRow}>
              <button onClick={reset} style={{ ...styles.secondaryBtn, height: "45px", width: "250px" }}>New Check</button>
              <button onClick={() => navigate("/patient/appointments")} style={{ ...styles.primaryBtn, height: "45px", width: "350px" }}>Book Appointment</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 1s linear infinite" }}>
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
      <path d="M8 2A6 6 0 0 1 14 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif" },
  wrapper: { flex: 1, maxWidth: 640, margin: "0 auto", padding: "24px 16px", fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif" },
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #E5E7EB" },
  headerIcon: { width: 48, height: 48, borderRadius: 12, background: "#CCFBF1", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  headerTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px" },
  headerSub: { margin: "2px 0 0", fontSize: 13, color: "#6B7280" },
  steps: { display: "flex", alignItems: "center", marginBottom: 24 },
  stepItem: { display: "flex", alignItems: "center", gap: 8 },
  stepCircle: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, transition: "all 0.2s" },
  stepLabel: { fontSize: 13, fontWeight: 500, transition: "color 0.2s" },
  stepLine: { width: 40, height: 2, borderRadius: 1, marginLeft: 8, transition: "background 0.2s" },
  card: { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 16, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  label: { display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 4 },
  labelDot: { width: 8, height: 8, borderRadius: "50%", background: "#14B8A6", flexShrink: 0 },
  hint: { fontSize: 13, color: "#9CA3AF", marginBottom: 14, marginTop: 0 },
  suggestions: { background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, marginTop: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", overflow: "hidden" },
  suggestionItem: { display: "block", width: "100%", padding: "10px 14px", textAlign: "left", border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#374151", borderBottom: "1px solid #F3F4F6" },
  quickPicks: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, alignItems: "center" },
  quickLabel: { fontSize: 12, color: "#9CA3AF", fontWeight: 500 },
  quickPill: { background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#6B7280", cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: 500, color: "#374151" },
  input: { border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#111827", background: "#FAFAFA", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
  textarea: { border: "1.5px solid #E5E7EB", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#111827", background: "#FAFAFA", outline: "none", fontFamily: "inherit", width: "100%", resize: "vertical", boxSizing: "border-box" },
  optional: { fontSize: 12, fontWeight: 400, color: "#9CA3AF" },
  reviewBox: { background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "12px 14px", marginTop: 16 },
  reviewLabel: { fontSize: 12, color: "#9CA3AF", fontWeight: 500, margin: 0 },
  reviewTag: { background: "#CCFBF1", color: "#0D9488", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 },
  error: { color: "#EF4444", fontSize: 13, marginTop: 10, marginBottom: 0 },
  primaryBtn: { background: "#14B8A6", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 20, width: "100%", fontFamily: "inherit", transition: "background 0.2s", display: "block", textAlign: "center" },
  secondaryBtn: { background: "#F3F4F6", color: "#374151", border: "1px solid #E5E7EB", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", marginTop: 20, fontFamily: "inherit" },
  btnRow: { display: "flex", gap: 12, alignItems: "flex-end" },
  urgencyBanner: { display: "flex", alignItems: "center", gap: 14, border: "1.5px solid", borderRadius: 12, padding: "14px 18px", marginBottom: 16 },
  urgencyIcon: { fontSize: 28, flexShrink: 0 },
  urgencyLabel: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 },
  urgencyValue: { fontSize: 18, fontWeight: 700, margin: "2px 0 0" },
  resultCard: { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14, padding: 20, marginBottom: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  resultSectionTitle: { fontSize: 14, fontWeight: 600, color: "#111827", margin: "0 0 14px" },
  conditionsList: { display: "flex", flexDirection: "column", gap: 10 },
  conditionItem: { background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", border: "1px solid #F3F4F6" },
  conditionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  conditionName: { fontSize: 14, fontWeight: 600, color: "#111827" },
  severityBadge: { fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.04em" },
  conditionDesc: { fontSize: 13, color: "#6B7280", margin: 0, lineHeight: 1.5 },
  specialtiesRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  specialtyChip: { background: "#EFF6FF", color: "#2563EB", border: "1px solid #DBEAFE", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 500 },
  adviceText: { fontSize: 14, color: "#374151", lineHeight: 1.6, margin: 0 },
  disclaimer: { display: "flex", gap: 10, background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", marginBottom: 20, border: "1px solid #E5E7EB" },
  disclaimerText: { fontSize: 12, color: "#9CA3AF", lineHeight: 1.5, margin: 0 },
};