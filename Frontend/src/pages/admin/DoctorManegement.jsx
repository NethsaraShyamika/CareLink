import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:3002";

const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const TABS = { PENDING: "pending", APPROVED: "approved" };

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS.PENDING);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "";
      if (activeTab === TABS.PENDING) {
        // Matches: router.get("/admin/pending", ...)
        url = `${API_BASE}/api/doctors/admin/pending`;
      } else if (activeTab === TABS.APPROVED) {
        // Matches: router.get("/", ...)
        url = `${API_BASE}/api/doctors`;
      }

      console.log("Fetching from:", url);
      const res = await axios.get(url, authHeaders());
      console.log("Fetched doctors:", res.data);
      setDoctors(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleApprove = async (doctorId) => {
    setActionLoading(doctorId);
    try {
      // FIXED: Matches router.put("/admin/verify/:id", ...)
      const response = await axios.put(
        `${API_BASE}/api/doctors/admin/verify/${doctorId}`,
        {},
        authHeaders()
      );
      
      console.log("Approve response:", response.data);
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
      showToast("Doctor approved successfully.");
    } catch (err) {
      console.error("Approve error:", err);
      showToast(
        err.response?.data?.message || "Approval failed.", 
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (doctorId) => {
    if (!window.confirm("Are you sure you want to reject this doctor?")) return;
    setActionLoading(doctorId);
    try {
      // FIXED: Matches router.put("/admin/reject/:id", ...)
      const response = await axios.put(
        `${API_BASE}/api/doctors/admin/reject/${doctorId}`,
        {},
        authHeaders()
      );
      
      console.log("Reject response:", response.data);
      setDoctors((prev) => prev.filter((d) => d._id !== doctorId));
      showToast("Doctor rejected.", "error");
    } catch (err) {
      console.error("Reject error:", err);
      showToast(
        err.response?.data?.message || "Rejection failed.", 
        "error"
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Helper function to get full name
  const getFullName = (doctor) => {
    const firstName = doctor.firstName || "";
    const lastName = doctor.lastName || "";
    if (!firstName && !lastName) return "-";
    return `${firstName} ${lastName}`.trim();
  };

  const q = search.toLowerCase();
  const filtered = doctors.filter((d) => {
    const fullName = getFullName(d).toLowerCase();
    const matchesSearch =
      !q ||
      fullName.includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.licenseNumber?.toLowerCase().includes(q);

    return matchesSearch;
  });

  const pendingCount = activeTab === TABS.PENDING ? doctors.length : 0;
  const approvedCount = activeTab === TABS.APPROVED ? doctors.length : 0;

  const safeValue = (value, defaultValue = "-") => {
    return value && value !== "" && value !== null && value !== undefined
      ? value
      : defaultValue;
  };

  const getTabButtonStyle = (isActive) => ({
    padding: "6px 16px",
    borderRadius: "6px",
    backgroundColor: isActive ? "#0ea5e920" : "#1e293b",
    color: isActive ? "#0ea5e9" : "#94a3b8",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s",
    border: isActive ? "1px solid #0ea5e9" : "1px solid #334155",
  });

  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.panelTitle}>🩺 Doctor Management</div>
      </div>

      <div style={styles.panelBody}>
        <div style={styles.controlsContainer}>
          <div style={styles.tabsContainer}>
            {[
              { key: TABS.PENDING, label: "Pending", count: pendingCount },
              { key: TABS.APPROVED, label: "Approved", count: approvedCount },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={getTabButtonStyle(activeTab === key)}
              >
                {label}
                <span
                  style={{
                    backgroundColor: activeTab === key ? "#0ea5e9" : "#334155",
                    color: "#fff",
                    borderRadius: "50px",
                    padding: "1px 8px",
                    fontSize: "11px",
                  }}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by name, email, specialization or license..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            <span style={styles.resultCount}>
              {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
            </span>
            <button onClick={fetchDoctors} title="Refresh" style={styles.refreshBtn}>
              ↻
            </button>
          </div>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Loading doctors...</p>
        ) : error ? (
          <p style={styles.errorText}>⚠ {error}</p>
        ) : filtered.length === 0 ? (
          <p style={styles.emptyText}>
            {activeTab === TABS.PENDING
              ? "No pending doctors."
              : "No approved doctors."}
          </p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>Doctor Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Specialization</th>
                  <th style={styles.th}>License Number</th>
                  <th style={styles.th}>Experience</th>
                  <th style={styles.th}>Consultation Fee</th>
                  <th style={styles.th}>Clinic/Hospital</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Joined</th>
                  {activeTab === TABS.PENDING && <th style={styles.th}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((doctor, idx) => (
                  <tr key={doctor._id} style={styles.tr}>
                    <td style={styles.td}>{idx + 1}</td>
                    <td style={styles.td}>
                      <strong>Dr. {getFullName(doctor)}</strong>
                    </td>
                    <td style={styles.td}>{doctor.email || "-"}</td>
                    <td style={styles.td}>{safeValue(doctor.specialization)}</td>
                    <td style={styles.td}>{safeValue(doctor.licenseNumber)}</td>
                    <td style={styles.td}>
                      {doctor.yearsOfExperience ? `${doctor.yearsOfExperience} yrs` : "-"}
                    </td>
                    <td style={styles.td}>
                      {doctor.consultationFee ? `$${doctor.consultationFee}` : "-"}
                    </td>
                    <td style={styles.td}>{safeValue(doctor.hospitalOrClinic)}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "50px",
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "inline-block",
                          whiteSpace: "nowrap",
                          backgroundColor: doctor.verificationStatus === "approved"
                            ? "#10b98120"
                            : doctor.verificationStatus === "rejected"
                            ? "#ef444420"
                            : "#f59e0b20",
                          color: doctor.verificationStatus === "approved"
                            ? "#10b981"
                            : doctor.verificationStatus === "rejected"
                            ? "#ef4444"
                            : "#f59e0b",
                        }}
                      >
                        {safeValue(doctor.verificationStatus?.toUpperCase(), "PENDING")}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {doctor.createdAt
                        ? new Date(doctor.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    {activeTab === TABS.PENDING && (
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleApprove(doctor._id)}
                            disabled={actionLoading === doctor._id}
                            style={{
                              ...styles.approveBtn,
                              opacity: actionLoading === doctor._id ? 0.5 : 1,
                            }}
                          >
                            {actionLoading === doctor._id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleReject(doctor._id)}
                            disabled={actionLoading === doctor._id}
                            style={{
                              ...styles.rejectBtn,
                              opacity: actionLoading === doctor._id ? 0.5 : 1,
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "32px",
            right: "32px",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            zIndex: 9999,
            backgroundColor: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "#fff",
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}

const styles = {
  panel: {
    background: "#0f172a",
    borderRadius: "12px",
    border: "1px solid #334155",
    overflow: "hidden",
  },
  panelHeader: {
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #334155",
    background: "#1e293b",
  },
  panelTitle: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#f1f5f9",
  },
  panelBody: {
    padding: "1.5rem",
  },
  controlsContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "1rem",
  },
  tabsContainer: {
    display: "flex",
    gap: "8px",
  },
  searchContainer: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#f1f5f9",
    width: "280px",
    fontSize: "14px",
  },
  resultCount: {
    color: "#94a3b8",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  refreshBtn: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "16px",
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid #334155",
    marginTop: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
    minWidth: "1000px",
  },
  th: {
    background: "#1e293b",
    color: "#94a3b8",
    padding: "12px",
    textAlign: "left",
    fontWeight: 600,
    borderBottom: "1px solid #334155",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #334155",
  },
  td: {
    padding: "12px",
    color: "#f1f5f9",
    borderBottom: "1px solid #334155",
    whiteSpace: "nowrap",
  },
  actionButtons: {
    display: "flex",
    gap: "6px",
  },
  approveBtn: {
    padding: "5px 12px",
    borderRadius: "6px",
    border: "none",
    background: "#10b981",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  rejectBtn: {
    padding: "5px 12px",
    borderRadius: "6px",
    border: "1px solid #ef444450",
    background: "transparent",
    color: "#ef4444",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  loadingText: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "40px",
  },
  errorText: {
    color: "#f87171",
    textAlign: "center",
    padding: "40px",
  },
  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    padding: "40px",
  },
};