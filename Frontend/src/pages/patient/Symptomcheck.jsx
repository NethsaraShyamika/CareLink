import { useState, useRef, useEffect } from "react";
import { useUser } from "../../contextUser.jsx";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Folder,
  Pill,
  Bot,
  Users,
  Mail,
  ShieldCheck,
  Settings,
  Bell,
  Search,
  User,
  X,
  LogOut,
  Stethoscope,
  FileText,
  Activity,
  MessageSquare,
  Clock,
  ChevronDown,
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:5000") + "/api/symptoms";

const SYMPTOM_SUGGESTIONS = [
  "Headache",
  "Fever",
  "Cough",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Chest pain",
  "Shortness of breath",
  "Sore throat",
  "Back pain",
  "Stomach ache",
  "Joint pain",
  "Rash",
  "Vomiting",
  "Chills",
  "Loss of appetite",
  "Muscle aches",
  "Runny nose",
  "Insomnia",
  "Anxiety",
];

const URGENCY_CONFIG = {
  routine: { label: "Routine", color: "#22C55E", bg: "#F0FDF4", icon: "✓" },
  soon: {
    label: "See Doctor Soon",
    color: "#F59E0B",
    bg: "#FFFBEB",
    icon: "⏰",
  },
  urgent: { label: "Urgent", color: "#EF4444", bg: "#FEF2F2", icon: "⚠️" },
  emergency: {
    label: "Emergency",
    color: "#DC2626",
    bg: "#FFF1F2",
    icon: "🚨",
  },
};

const SEVERITY_CONFIG = {
  low: { label: "Low", color: "#22C55E", bg: "#DCFCE7" },
  moderate: { label: "Moderate", color: "#F59E0B", bg: "#FEF3C7" },
  high: { label: "High", color: "#EF4444", bg: "#FEE2E2" },
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
  const [step, setStep] = useState(1); // 1=symptoms, 2=context, 3=result
  const inputRef = useRef(null);
  const resultRef = useRef(null);

  const { user } = useUser();
  const navigate = useNavigate();
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Get token from prop or localStorage
  const token = propToken || localStorage.getItem("token");

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  const handleInputChange = (val) => {
    setInputValue(val);
    if (val.trim().length > 0) {
      const filtered = SYMPTOM_SUGGESTIONS.filter(
        (s) =>
          s.toLowerCase().includes(val.toLowerCase()) && !symptoms.includes(s),
      );
      setSuggestions(filtered.slice(0, 5));
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

  const removeSymptom = (s) => {
    setSymptoms(symptoms.filter((x) => x !== s));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) addSymptom(inputValue);
    } else if (e.key === "Backspace" && !inputValue && symptoms.length > 0) {
      setSymptoms(symptoms.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (symptoms.length === 0) {
      setError("Please add at least one symptom.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          symptoms,
          additionalNotes: notes,
          age: age ? parseInt(age) : undefined,
          gender: gender || undefined,
        }),
      });

      console.log("Fetch to:", `${API_BASE}/check`, "Status:", res.status);
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Failed to parse JSON. Server returned:", text.substring(0, 300));
        throw new Error("Server returned an invalid response (Check console).");
      }

      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setResult(data);
      setStep(3);
      onCheckComplete?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSymptoms([]);
    setInputValue("");
    setAge("");
    setGender("");
    setNotes("");
    setResult(null);
    setError("");
    setStep(1);
  };

  const urgency = result
    ? URGENCY_CONFIG[result.aiResponse?.urgencyLevel]
    : null;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside className="w-64 bg-[#FFFFFF] border-[#E5E7EB] border-r flex flex-col min-h-screen">
        <div className="flex items-center gap-2 px-6 py-6 border-b border-[#E5E7EB]">
          <div className="bg-[#14B8A6] rounded-full w-10 h-10 flex items-center justify-center text-white text-2xl font-bold">
            +
          </div>
          <div>
            <div className="font-bold text-lg text-[#111827]">CareLink</div>
            <div className="text-xs text-[#6B7280]">Patient Portal</div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            <li>
              <a
                href="#"
                onClick={() => navigate("/patient/dashboard")}
                className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
              >
                <span className="material-icons">event</span>
                Appointments
                <span className="ml-auto bg-[#CCFBF1] text-[#14B8A6] text-xs px-2 py-0.5 rounded-full">
                  3
                </span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
              >
                <span className="material-icons">folder</span>
                Medical Records
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
              >
                <span className="material-icons">medication</span>
                Prescriptions
                <span className="ml-auto bg-[#CCFBF1] text-[#0D9488] text-xs px-2 py-0.5 rounded-full">
                  2
                </span>
              </a>
            </li>

            <ul>
              {/* Chatbot Dropdown Header */}
              <li
                onClick={() => setChatbotOpen(!chatbotOpen)}
                className="flex items-center justify-between gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bot size={18} />
                  Chatbot
                </div>

                <ChevronDown
                  size={16}
                  className={`transition-transform ${chatbotOpen ? "rotate-180" : ""}`}
                />
              </li>

              {/* Dropdown Items */}
              {chatbotOpen && (
                <>
                  <li className="bg-[#CCFBF1] rounded-lg">
                    <a
                      href="#"
                      className="flex items-center gap-3 pl-10 pr-3 py-2 font-medium text-[#14B8A6]"
                    >
                      <Activity size={18} />
                      Symptom Checker
                    </a>
                  </li>

                  <li
                    onClick={() => navigate("/patient/symptom-history")}
                    className="flex items-center gap-3 pl-10 pr-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer"
                  >
                    <Clock size={18} />
                    Symptom History
                  </li>
                </>
              )}
            </ul>
          </ul>
          <div className="mt-8">
            <div className="text-xs text-[#9CA3AF] uppercase mb-2">Care</div>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
                >
                  <span className="material-icons">groups</span>
                  My Doctors
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
                >
                  <span className="material-icons">mail</span>
                  Messages
                  <span className="ml-auto bg-[#EFF6FF] text-[#2563EB] text-xs px-2 py-0.5 rounded-full">
                    1
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
                >
                  <span className="material-icons">verified_user</span>
                  Insurance
                </a>
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <div className="text-xs text-[#9CA3AF] uppercase mb-2">Account</div>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
                >
                  <span className="material-icons">settings</span>
                  Settings
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Sidebar user card */}
        <div className="mt-auto px-6 py-4 bg-[#CCFBF1] rounded-lg m-4 flex items-center gap-3">
          <div className="bg-[#0D9488] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
            {user?.firstName && user?.lastName ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
          </div>
          <div>
            <div className="font-semibold text-[#0D9488]">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-[#14B8A6]">Patient</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 3H15M12 3V7M12 7C8.13 7 5 10.13 5 14C5 17.87 8.13 21 12 21C15.87 21 19 17.87 19 14C19 10.13 15.87 7 12 7Z"
                stroke="#14B8A6"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12 11V14M12 14H15M12 14H9"
                stroke="#14B8A6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h2 style={styles.headerTitle}>AI Symptom Checker</h2>
            <p style={styles.headerSub}>
              Powered by Gemini AI · Sri Lanka Medical Guidelines
            </p>
          </div>
        </div>

      {/* Step Indicator */}
      {step < 3 && (
        <div style={styles.steps}>
          {[
            { n: 1, label: "Symptoms" },
            { n: 2, label: "Context" },
          ].map(({ n, label }) => (
            <div
              key={n}
              style={styles.stepItem}
              onClick={() => step > n && setStep(n)}
            >
              <div
                style={{
                  ...styles.stepCircle,
                  background: step >= n ? "#14B8A6" : "#E5E7EB",
                  color: step >= n ? "#fff" : "#9CA3AF",
                  cursor: step > n ? "pointer" : "default",
                }}
              >
                {step > n ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  n
                )}
              </div>
              <span
                style={{
                  ...styles.stepLabel,
                  color: step >= n ? "#111827" : "#9CA3AF",
                }}
              >
                {label}
              </span>
              {n < 2 && (
                <div
                  style={{
                    ...styles.stepLine,
                    background: step > n ? "#14B8A6" : "#E5E7EB",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Symptoms */}
      {step === 1 && (
        <div style={styles.card}>
          <label style={styles.label}>
            <span style={styles.labelDot} />
            What symptoms are you experiencing?
          </label>
          <p style={styles.hint}>
            Type a symptom and press Enter, or pick from suggestions below
          </p>

          {/* Tag Input */}
          <div
            className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-text focus-within:ring-2 focus-within:ring-teal-400 transition"
            onClick={() => inputRef.current?.focus()}
          >
            {symptoms.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-sm"
              >
                {s}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSymptom(s);
                  }}
                  className="text-teal-600 hover:text-red-500 font-bold"
                >
                  ×
                </button>
              </span>
            ))}

            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                symptoms.length === 0
                  ? "e.g. Headache, Fever..."
                  : "Add more..."
              }
              className="flex-1 min-w-30 outline-none bg-transparent text-sm"
            />
          </div>

          {/* Autocomplete */}
          {suggestions.length > 0 && (
            <div style={styles.suggestions}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => addSymptom(s)}
                  style={styles.suggestionItem}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Quick picks */}
          <div style={styles.quickPicks}>
            <span style={styles.quickLabel}>Common:</span>
            {SYMPTOM_SUGGESTIONS.slice(0, 8)
              .filter((s) => !symptoms.includes(s))
              .map((s) => (
                <button
                  key={s}
                  onClick={() => addSymptom(s)}
                  style={styles.quickPill}
                >
                  {s}
                </button>
              ))}
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            onClick={() => {
              if (symptoms.length === 0) {
                setError("Please add at least one symptom.");
                return;
              }
              setError("");
              setStep(2);
            }}
            style={styles.primaryBtn}
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Context */}
      {step === 2 && (
        <div style={styles.card}>
          <label style={styles.label}>
            <span style={styles.labelDot} />
            Patient Context{" "}
            <span style={styles.optional}>(Optional but helpful)</span>
          </label>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 28"
                min="0"
                max="120"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={styles.input}
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={styles.fieldLabel}>Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any relevant medical history, medications, allergies, or duration of symptoms..."
              style={styles.textarea}
              rows={3}
            />
          </div>

          {/* Symptom review */}
          <div style={styles.reviewBox}>
            <p style={styles.reviewLabel}>Your symptoms:</p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 6,
              }}
            >
              {symptoms.map((s) => (
                <span key={s} style={styles.reviewTag}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.btnRow}>
            <button onClick={() => setStep(1)} style={styles.secondaryBtn}>
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ ...styles.primaryBtn, flex: 1 }}
            >
              {loading ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    justifyContent: "center",
                  }}
                >
                  <LoadingSpinner /> Analyzing with AI...
                </span>
              ) : (
                "Analyze Symptoms →"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && result && (
        <div ref={resultRef}>
          {/* Urgency Banner */}
          {urgency && (
            <div
              style={{
                ...styles.urgencyBanner,
                background: urgency.bg,
                borderColor: urgency.color,
              }}
            >
              <span style={styles.urgencyIcon}>{urgency.icon}</span>
              <div>
                <p style={{ ...styles.urgencyLabel, color: urgency.color }}>
                  Urgency Level
                </p>
                <p style={{ ...styles.urgencyValue, color: urgency.color }}>
                  {urgency.label}
                </p>
              </div>
            </div>
          )}

          {/* Possible Conditions */}
          <div style={styles.resultCard}>
            <h3 style={styles.resultSectionTitle}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ marginRight: 6 }}
              >
                <circle
                  cx="8"
                  cy="8"
                  r="7"
                  stroke="#14B8A6"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 5V8.5L10 10"
                  stroke="#14B8A6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Possible Conditions
            </h3>
            <div style={styles.conditionsList}>
              {result.aiResponse?.possibleConditions?.map((c, i) => {
                const sev = SEVERITY_CONFIG[c.severity] || SEVERITY_CONFIG.low;
                return (
                  <div key={i} style={styles.conditionItem}>
                    <div style={styles.conditionHeader}>
                      <span style={styles.conditionName}>{c.name}</span>
                      <span
                        style={{
                          ...styles.severityBadge,
                          background: sev.bg,
                          color: sev.color,
                        }}
                      >
                        {sev.label}
                      </span>
                    </div>
                    <p style={styles.conditionDesc}>{c.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Specialties */}
          <div style={styles.resultCard}>
            <h3 style={styles.resultSectionTitle}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ marginRight: 6 }}
              >
                <path
                  d="M8 1L10 5H15L11 8L13 13L8 10L3 13L5 8L1 5H6L8 1Z"
                  stroke="#14B8A6"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              Recommended Specialists
            </h3>
            <div style={styles.specialtiesRow}>
              {result.aiResponse?.recommendedSpecialties?.map((s, i) => (
                <span key={i} style={styles.specialtyChip}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* General Advice */}
          <div style={styles.resultCard}>
            <h3 style={styles.resultSectionTitle}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{ marginRight: 6 }}
              >
                <path
                  d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
                  stroke="#14B8A6"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 7V11M8 5H8.01"
                  stroke="#14B8A6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              General Advice
            </h3>
            <p style={styles.adviceText}>{result.aiResponse?.generalAdvice}</p>
          </div>

          {/* Disclaimer */}
          <div style={styles.disclaimer}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{ flexShrink: 0, marginTop: 2 }}
            >
              <path
                d="M7 13A6 6 0 1 0 7 1a6 6 0 0 0 0 12z"
                stroke="#9CA3AF"
                strokeWidth="1.2"
              />
              <path
                d="M7 6V9M7 4.5H7.01"
                stroke="#9CA3AF"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <p style={styles.disclaimerText}>{result.aiResponse?.disclaimer}</p>
          </div>

          <div style={styles.btnRow}>
            <button onClick={reset} style={styles.secondaryBtn}>
              New Check
            </button>
            <button
              onClick={() => (window.location.href = "/appointments/book")}
              style={styles.primaryBtn}
            >
              Book Appointment →
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
      />
      <path
        d="M8 2A6 6 0 0 1 14 8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif",
  },
  wrapper: {
    flex: 1,
    maxWidth: 640,
    margin: "0 auto",
    padding: "24px 16px",
    fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottom: "1px solid #E5E7EB",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "#CCFBF1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "-0.3px",
  },
  headerSub: {
    margin: "2px 0 0",
    fontSize: 13,
    color: "#6B7280",
  },
  steps: {
    display: "flex",
    alignItems: "center",
    marginBottom: 24,
    gap: 0,
  },
  stepItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    transition: "all 0.2s",
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: 500,
    transition: "color 0.2s",
  },
  stepLine: {
    width: 40,
    height: 2,
    borderRadius: 1,
    marginLeft: 8,
    transition: "background 0.2s",
  },
  card: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 4,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#14B8A6",
    flexShrink: 0,
  },
  hint: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 14,
    marginTop: 0,
  },
  tagInput: {
    minHeight: 52,
    border: "1.5px solid #E5E7EB",
    borderRadius: 10,
    padding: "8px 12px",
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    alignItems: "center",
    cursor: "text",
    background: "#FAFAFA",
    transition: "border-color 0.15s",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: "#CCFBF1",
    color: "#0D9488",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    animation: "fadeIn 0.15s ease",
  },
  tagRemove: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#0D9488",
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
    display: "flex",
    alignItems: "center",
    opacity: 0.7,
  },
  tagInputField: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "#111827",
    minWidth: 120,
    flex: 1,
  },
  suggestions: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    marginTop: 4,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  suggestionItem: {
    display: "block",
    width: "100%",
    padding: "10px 14px",
    textAlign: "left",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: 14,
    color: "#374151",
    borderBottom: "1px solid #F3F4F6",
    transition: "background 0.1s",
  },
  quickPicks: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 14,
    alignItems: "center",
  },
  quickLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: 500,
  },
  quickPill: {
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: 20,
    padding: "4px 12px",
    fontSize: 12,
    color: "#6B7280",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "inherit",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
  },
  input: {
    border: "1.5px solid #E5E7EB",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    color: "#111827",
    background: "#FAFAFA",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
    border: "1.5px solid #E5E7EB",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    color: "#111827",
    background: "#FAFAFA",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    resize: "vertical",
    boxSizing: "border-box",
  },
  optional: {
    fontSize: 12,
    fontWeight: 400,
    color: "#9CA3AF",
  },
  reviewBox: {
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    padding: "12px 14px",
    marginTop: 16,
  },
  reviewLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: 500,
    margin: 0,
  },
  reviewTag: {
    background: "#CCFBF1",
    color: "#0D9488",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },
  error: {
    color: "#EF4444",
    fontSize: 13,
    marginTop: 10,
    marginBottom: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  primaryBtn: {
    background: "#14B8A6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 24px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 20,
    width: "100%",
    fontFamily: "inherit",
    transition: "background 0.2s",
    display: "block",
    textAlign: "center",
  },
  secondaryBtn: {
    background: "#F3F4F6",
    color: "#374151",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    marginTop: 20,
    fontFamily: "inherit",
  },
  btnRow: {
    display: "flex",
    gap: 12,
    alignItems: "flex-end",
  },
  urgencyBanner: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    border: "1.5px solid",
    borderRadius: 12,
    padding: "14px 18px",
    marginBottom: 16,
  },
  urgencyIcon: {
    fontSize: 28,
    flexShrink: 0,
  },
  urgencyLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: 0,
  },
  urgencyValue: {
    fontSize: 18,
    fontWeight: 700,
    margin: "2px 0 0",
  },
  resultCard: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  resultSectionTitle: {
    display: "flex",
    alignItems: "center",
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    margin: "0 0 14px",
  },
  conditionsList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  conditionItem: {
    background: "#F9FAFB",
    borderRadius: 10,
    padding: "12px 14px",
    border: "1px solid #F3F4F6",
  },
  conditionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  conditionName: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
  },
  severityBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  conditionDesc: {
    fontSize: 13,
    color: "#6B7280",
    margin: 0,
    lineHeight: 1.5,
  },
  specialtiesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  specialtyChip: {
    background: "#EFF6FF",
    color: "#2563EB",
    border: "1px solid #DBEAFE",
    borderRadius: 20,
    padding: "6px 14px",
    fontSize: 13,
    fontWeight: 500,
  },
  adviceText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.6,
    margin: 0,
  },
  disclaimer: {
    display: "flex",
    gap: 10,
    background: "#F9FAFB",
    borderRadius: 10,
    padding: "12px 14px",
    marginBottom: 20,
    border: "1px solid #E5E7EB",
  },
  disclaimerText: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 1.5,
    margin: 0,
  },
};
