import { useState, useEffect } from "react";
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

const URGENCY_CONFIG = {
  routine: { label: "Routine", color: "#22C55E", bg: "#F0FDF4", dot: "#22C55E" },
  soon: { label: "See Doctor Soon", color: "#F59E0B", bg: "#FFFBEB", dot: "#F59E0B" },
  urgent: { label: "Urgent", color: "#EF4444", bg: "#FEF2F2", dot: "#EF4444" },
  emergency: { label: "Emergency", color: "#DC2626", bg: "#FFF1F2", dot: "#DC2626" },
};

const SEVERITY_CONFIG = {
  low: { color: "#22C55E", bg: "#DCFCE7" },
  moderate: { color: "#F59E0B", bg: "#FEF3C7" },
  high: { color: "#EF4444", bg: "#FEE2E2" },
};

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today, " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return d.toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" });
  }
}

function UrgencyDot({ level }) {
  const cfg = URGENCY_CONFIG[level] || URGENCY_CONFIG.routine;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: cfg.bg,
      color: cfg.color,
      fontSize: 11,
      fontWeight: 600,
      padding: "3px 8px",
      borderRadius: 20,
      letterSpacing: "0.03em",
      textTransform: "uppercase",
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: cfg.dot,
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}

function HistoryCard({ check, onExpand, expanded }) {
  const conditions = check.aiResponse?.possibleConditions || [];
  const specialties = check.aiResponse?.recommendedSpecialties || [];
  const symptoms = check.symptoms || [];

  return (
    <div
      style={{
        ...styles.histCard,
        borderColor: expanded ? "#14B8A6" : "#E5E7EB",
        boxShadow: expanded
          ? "0 0 0 2px rgba(20,184,166,0.15), 0 4px 16px rgba(0,0,0,0.08)"
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Card Header */}
      <div
        style={styles.histCardHeader}
        onClick={() => onExpand(expanded ? null : check._id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onExpand(expanded ? null : check._id)}
      >
        <div style={styles.histCardLeft}>
          <div style={styles.histCardIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1C4.13 1 1 4.13 1 8C1 11.87 4.13 15 8 15C11.87 15 15 11.87 15 8C15 4.13 11.87 1 8 1Z" stroke="#14B8A6" strokeWidth="1.3"/>
              <path d="M5.5 8H8M8 8H10.5M8 8V5.5M8 8V10.5" stroke="#14B8A6" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={styles.histCardTitle}>
              {symptoms.slice(0, 3).join(", ")}
              {symptoms.length > 3 && <span style={styles.moreTag}>+{symptoms.length - 3} more</span>}
            </div>
            <div style={styles.histCardDate}>{formatDate(check.createdAt)}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <UrgencyDot level={check.aiResponse?.urgencyLevel} />
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              flexShrink: 0,
            }}
          >
            <path d="M4 6L8 10L12 6" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div style={styles.histCardBody}>
          <hr style={styles.divider} />

          {/* All symptoms */}
          <div style={styles.detailSection}>
            <span style={styles.detailLabel}>All Symptoms</span>
            <div style={styles.tagRow}>
              {symptoms.map((s, i) => (
                <span key={i} style={styles.symptomTag}>{s}</span>
              ))}
            </div>
          </div>

          {/* Conditions */}
          {conditions.length > 0 && (
            <div style={styles.detailSection}>
              <span style={styles.detailLabel}>Possible Conditions</span>
              <div style={styles.conditionGrid}>
                {conditions.map((c, i) => {
                  const sev = SEVERITY_CONFIG[c.severity] || SEVERITY_CONFIG.low;
                  return (
                    <div key={i} style={styles.conditionChip}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: sev.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={styles.conditionChipName}>{c.name}</span>
                      <span style={{ ...styles.conditionChipSev, background: sev.bg, color: sev.color }}>
                        {c.severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Specialties */}
          {specialties.length > 0 && (
            <div style={styles.detailSection}>
              <span style={styles.detailLabel}>Recommended Specialists</span>
              <div style={styles.tagRow}>
                {specialties.map((s, i) => (
                  <span key={i} style={styles.specialtyChip}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Advice */}
          {check.aiResponse?.generalAdvice && (
            <div style={styles.detailSection}>
              <span style={styles.detailLabel}>General Advice</span>
              <p style={styles.adviceText}>{check.aiResponse.generalAdvice}</p>
            </div>
          )}

          {/* Context row */}
          {(check.age || check.gender || check.additionalNotes) && (
            <div style={styles.contextRow}>
              {check.age && (
                <span style={styles.contextItem}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="4" r="2.5" stroke="#9CA3AF" strokeWidth="1.2"/>
                    <path d="M1.5 10.5C1.5 8.567 3.567 7 6 7C8.433 7 10.5 8.567 10.5 10.5" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Age {check.age}
                </span>
              )}
              {check.gender && check.gender !== "prefer_not_to_say" && (
                <span style={styles.contextItem}>
                  {check.gender.charAt(0).toUpperCase() + check.gender.slice(1)}
                </span>
              )}
              {check.additionalNotes && (
                <span style={styles.contextItem}>"{check.additionalNotes.slice(0, 50)}{check.additionalNotes.length > 50 ? "..." : ""}"</span>
              )}
            </div>
          )}

          <div style={styles.disclaimerMini}>
            {check.aiResponse?.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SymptomHistory({ token: propToken, onNewCheck }) {
  // Get token from prop or localStorage
  const token = propToken || localStorage.getItem("token");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const { user } = useUser();
  const navigate = useNavigate();
  const [chatbotOpen, setChatbotOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/history`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      console.log("Fetch to:", `${API_BASE}/history`, "Status:", res.status);
      const text = await res.text();
      let data;
      try {
         data = JSON.parse(text);
      } catch (e) {
         console.error("Failed to parse JSON. Server returned:", text.substring(0, 300));
         throw new Error("Server returned an invalid response (Check console).");
      }
      if (!res.ok) throw new Error(data.message || "Failed to load history");
      setHistory(data.checks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = history.filter((check) => {
    const matchSearch =
      !search ||
      check.symptoms.some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      ) ||
      check.aiResponse?.possibleConditions?.some((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );

    const matchUrgency =
      urgencyFilter === "all" ||
      check.aiResponse?.urgencyLevel === urgencyFilter;

    return matchSearch && matchUrgency;
  });

  // Stats
  const stats = {
    total: history.length,
    urgent: history.filter((c) =>
      ["urgent", "emergency"].includes(c.aiResponse?.urgencyLevel)
    ).length,
    thisWeek: history.filter((c) => {
      const d = new Date(c.createdAt);
      return Date.now() - d < 7 * 24 * 60 * 60 * 1000;
    }).length,
  };

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
                  <li
                    onClick={() => navigate("/patient/symptom-check")}
                    className="flex items-center gap-3 pl-10 pr-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer"
                  >
                    <Activity size={18} />
                    Symptom Checker
                  </li>

                  <li className="bg-[#CCFBF1] rounded-lg">
                    <a
                      href="#"
                      className="flex items-center gap-3 pl-10 pr-3 py-2 font-medium text-[#14B8A6]"
                    >
                      <Clock size={18} />
                      Symptom History
                    </a>
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
          <div>
            <h2 style={styles.headerTitle}>Symptom History</h2>
            <p style={styles.headerSub}>Your previous AI health assessments</p>
          </div>
          <button onClick={onNewCheck} style={styles.newCheckBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2V12M2 7H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Check
          </button>
        </div>

      {/* Stats Bar */}
      {!loading && history.length > 0 && (
        <div style={styles.statsBar}>
          {[
            { label: "Total Checks", value: stats.total, color: "#14B8A6" },
            { label: "This Week", value: stats.thisWeek, color: "#2563EB" },
            { label: "Urgent/Emergency", value: stats.urgent, color: "#EF4444" },
          ].map((stat) => (
            <div key={stat.label} style={styles.statItem}>
              <span style={{ ...styles.statValue, color: stat.color }}>{stat.value}</span>
              <span style={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {!loading && history.length > 0 && (
        <div style={styles.filters}>
          <div style={styles.searchBox}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="6.5" cy="6.5" r="5" stroke="#9CA3AF" strokeWidth="1.5"/>
              <path d="M10.5 10.5L13 13" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symptoms or conditions..."
              style={styles.searchInput}
            />
            {search && (
              <button onClick={() => setSearch("")} style={styles.clearSearch}>×</button>
            )}
          </div>

          <div style={styles.filterRow}>
            {["all", "routine", "soon", "urgent", "emergency"].map((u) => (
              <button
                key={u}
                onClick={() => setUrgencyFilter(u)}
                style={{
                  ...styles.filterBtn,
                  background: urgencyFilter === u ? "#14B8A6" : "#F3F4F6",
                  color: urgencyFilter === u ? "#fff" : "#6B7280",
                  border: urgencyFilter === u ? "1px solid #14B8A6" : "1px solid #E5E7EB",
                }}
              >
                {u === "all" ? "All" : URGENCY_CONFIG[u]?.label || u}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={styles.loadingState}>
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/>
            <path d="M8 5V8.5M8 11H8.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>{error}</span>
          <button onClick={fetchHistory} style={styles.retryBtn}>Retry</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && history.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="19" stroke="#E5E7EB" strokeWidth="1.5"/>
              <path d="M13 20C13 16.13 16.13 13 20 13C23.87 13 27 16.13 27 20C27 23.87 23.87 27 20 27C16.13 27 13 23.87 13 20Z" stroke="#D1D5DB" strokeWidth="1.5"/>
              <path d="M17 20H20M20 20H23M20 20V17M20 20V23" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p style={styles.emptyTitle}>No checks yet</p>
          <p style={styles.emptyDesc}>Start your first AI symptom check to see your history here</p>
          <button onClick={onNewCheck} style={styles.emptyBtn}>Start First Check →</button>
        </div>
      )}

      {/* No results */}
      {!loading && !error && history.length > 0 && filtered.length === 0 && (
        <div style={styles.noResults}>
          <p style={{ color: "#9CA3AF", fontSize: 14 }}>No records match your search</p>
          <button
            onClick={() => { setSearch(""); setUrgencyFilter("all"); }}
            style={styles.clearFiltersBtn}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* History List */}
      {!loading && !error && filtered.length > 0 && (
        <div style={styles.list}>
          {filtered.map((check) => (
            <HistoryCard
              key={check._id}
              check={check}
              expanded={expandedId === check._id}
              onExpand={setExpandedId}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      {!loading && filtered.length > 0 && (
        <p style={styles.footer}>
          Showing {filtered.length} of {history.length} records · Last synced just now
        </p>
      )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ ...styles.histCard, padding: 20, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F3F4F6" }} />
          <div>
            <div style={{ width: 180, height: 14, borderRadius: 6, background: "#F3F4F6", marginBottom: 6 }} />
            <div style={{ width: 80, height: 11, borderRadius: 6, background: "#F9FAFB" }} />
          </div>
        </div>
        <div style={{ width: 70, height: 22, borderRadius: 20, background: "#F3F4F6" }} />
      </div>
    </div>
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
    maxWidth: 680,
    margin: "0 auto",
    padding: "24px 16px",
    fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: "1px solid #E5E7EB",
  },
  headerTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    letterSpacing: "-0.3px",
  },
  headerSub: {
    margin: "3px 0 0",
    fontSize: 13,
    color: "#6B7280",
  },
  newCheckBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    background: "#14B8A6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
    transition: "background 0.15s",
  },
  statsBar: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginBottom: 20,
  },
  statItem: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: "-0.5px",
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  filters: {
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
    border: "1.5px solid #E5E7EB",
    borderRadius: 10,
    padding: "0 14px",
    height: 42,
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#111827",
    background: "transparent",
    fontFamily: "inherit",
  },
  clearSearch: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    color: "#9CA3AF",
    lineHeight: 1,
    padding: 0,
  },
  filterRow: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  filterBtn: {
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  histCard: {
    background: "#FFFFFF",
    border: "1.5px solid #E5E7EB",
    borderRadius: 14,
    overflow: "hidden",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  histCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 18px",
    cursor: "pointer",
    userSelect: "none",
  },
  histCardLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  histCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#CCFBF1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  histCardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 280,
  },
  histCardDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  moreTag: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: 500,
    color: "#9CA3AF",
  },
  histCardBody: {
    padding: "0 18px 18px",
  },
  divider: {
    border: "none",
    borderTop: "1px solid #F3F4F6",
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    display: "block",
    marginBottom: 8,
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  symptomTag: {
    background: "#CCFBF1",
    color: "#0D9488",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },
  conditionGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  conditionChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#F9FAFB",
    border: "1px solid #F3F4F6",
    borderRadius: 8,
    padding: "8px 12px",
  },
  conditionChipName: {
    fontSize: 13,
    fontWeight: 500,
    color: "#111827",
    flex: 1,
  },
  conditionChipSev: {
    fontSize: 10,
    fontWeight: 600,
    padding: "2px 7px",
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  specialtyChip: {
    background: "#EFF6FF",
    color: "#2563EB",
    border: "1px solid #DBEAFE",
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 500,
  },
  adviceText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 1.6,
    margin: 0,
    background: "#F9FAFB",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #F3F4F6",
  },
  contextRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  contextItem: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: "#9CA3AF",
    background: "#F3F4F6",
    padding: "3px 8px",
    borderRadius: 6,
  },
  disclaimerMini: {
    fontSize: 11,
    color: "#D1D5DB",
    lineHeight: 1.5,
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #F3F4F6",
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: 12,
    padding: "14px 16px",
    fontSize: 14,
    color: "#EF4444",
  },
  retryBtn: {
    marginLeft: "auto",
    background: "none",
    border: "1px solid #EF4444",
    borderRadius: 6,
    padding: "4px 12px",
    fontSize: 12,
    color: "#EF4444",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  emptyIcon: {
    marginBottom: 16,
    display: "flex",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#374151",
    margin: "0 0 8px",
  },
  emptyDesc: {
    fontSize: 14,
    color: "#9CA3AF",
    margin: "0 0 24px",
  },
  emptyBtn: {
    background: "#14B8A6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "12px 24px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  noResults: {
    textAlign: "center",
    padding: "40px 20px",
  },
  clearFiltersBtn: {
    background: "none",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    color: "#6B7280",
    cursor: "pointer",
    marginTop: 8,
    fontFamily: "inherit",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#D1D5DB",
    marginTop: 20,
  },
};