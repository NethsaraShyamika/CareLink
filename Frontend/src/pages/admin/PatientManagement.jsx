import React, { useEffect, useState } from "react";
import axios from "axios";

const AVATAR_COLORS = [
  { bg: "#E6F1FB", text: "#185FA5" },
  { bg: "#E1F5EE", text: "#0F6E56" },
  { bg: "#FBEAF0", text: "#993556" },
  { bg: "#FAEEDA", text: "#854F0B" },
  { bg: "#EEEDFE", text: "#534AB7" },
  { bg: "#FAECE7", text: "#993C1D" },
];

const getInitials = (p) =>
  ((p.firstName?.[0] || "") + (p.lastName?.[0] || "")).toUpperCase();

const getAge = (dob) =>
  dob
    ? Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000))
    : null;

const GenderBadge = ({ gender }) => {
  const styles = {
    Male: { background: "#E6F1FB", color: "#185FA5" },
    Female: { background: "#FBEAF0", color: "#993556" },
  };
  const s = styles[gender] || { background: "#F1EFE8", color: "#5F5E5A" };
  return (
    <span
      style={{
        ...s,
        display: "inline-flex",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 500,
      }}
    >
      {gender || "—"}
    </span>
  );
};

const BloodBadge = ({ type }) =>
  type ? (
    <span
      style={{
        background: "#FCEBEB",
        color: "#A32D2D",
        display: "inline-flex",
        padding: "2px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 500,
      }}
    >
      {type}
    </span>
  ) : (
    <span style={{ color: "#94a3b8" }}>—</span>
  );

const Avatar = ({ patient, index }) => {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: color.bg,
        color: color.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {getInitials(patient)}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div
    style={{
      background: "#1e293b",
      borderRadius: 10,
      padding: "10px 18px",
      flex: 1,
      minWidth: 90,
    }}
  >
    <div
      style={{
        fontSize: 10,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 4,
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 22, fontWeight: 500, color: "#f1f5f9" }}>
      {value}
    </div>
  </div>
);

const SearchIcon = () => (
  <svg
    style={{
      position: "absolute",
      left: 10,
      top: "50%",
      transform: "translateY(-50%)",
      width: 14,
      height: 14,
      stroke: "#64748b",
      fill: "none",
      strokeWidth: 2,
      strokeLinecap: "round",
    }}
    viewBox="0 0 24 24"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UsersIcon = () => (
  <svg
    style={{
      width: 16,
      height: 16,
      stroke: "#60a5fa",
      fill: "none",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }}
    viewBox="0 0 24 24"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3001/api/patients/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatients(res.data);
        setFiltered(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      patients.filter(
        (p) =>
          p.firstName?.toLowerCase().includes(q) ||
          p.lastName?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phone?.includes(q)
      )
    );
  }, [search, patients]);

  const maleCount = patients.filter((p) => p.gender === "Male").length;
  const femaleCount = patients.filter((p) => p.gender === "Female").length;
  const avgAge = patients.length
    ? Math.round(
        patients.reduce((sum, p) => sum + (getAge(p.dateOfBirth) || 0), 0) /
          patients.length
      )
    : "—";

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#f1f5f9",
        padding: "24px",
        background: "#0f172a",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#1e3a5f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UsersIcon />
          </div>
          <span style={{ fontSize: 18, fontWeight: 500, color: "#f1f5f9" }}>
            Patient Management
          </span>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px 8px 34px",
              borderRadius: 8,
              border: "0.5px solid #334155",
              background: "#1e293b",
              color: "#f1f5f9",
              width: 280,
              fontSize: 13,
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Stat cards */}
      {!loading && !error && (
        <div
          style={{ display: "flex", gap: 10, marginBottom: "1.25rem", flexWrap: "wrap" }}
        >
          <StatCard label="Total patients" value={patients.length} />
          <StatCard label="Male" value={maleCount} />
          <StatCard label="Female" value={femaleCount} />
          <StatCard label="Avg age" value={avgAge} />
          <StatCard label="Showing" value={filtered.length} />
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p style={{ color: "#64748b", padding: "2rem 0" }}>Loading patients…</p>
      ) : error ? (
        <p style={{ color: "#f87171", padding: "2rem 0" }}>⚠ {error}</p>
      ) : (
        <div
          style={{
            border: "0.5px solid #1e293b",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr style={{ background: "#1e293b" }}>
                  {[
                    "#",
                    "Patient",
                    "Email",
                    "Phone",
                    "Date of Birth",
                    "Gender",
                    "Address",
                    "Blood Type",
                    "Medical History",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 10,
                        fontWeight: 500,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        borderBottom: "0.5px solid #334155",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        color: "#475569",
                        fontSize: 14,
                      }}
                    >
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, idx) => {
                    const age = getAge(p.dateOfBirth);
                    const originalIdx = patients.indexOf(p);
                    const isHovered = hoveredRow === idx;
                    return (
                      <tr
                        key={p._id}
                        onMouseEnter={() => setHoveredRow(idx)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          background: isHovered ? "#1e293b" : "#0f172a",
                          transition: "background 0.15s",
                        }}
                      >
                        {/* # */}
                        <td
                          style={{
                            padding: "11px 14px",
                            borderBottom: "0.5px solid #1e293b",
                            color: "#475569",
                            fontSize: 12,
                          }}
                        >
                          {idx + 1}
                        </td>

                        {/* Patient name + avatar */}
                        <td
                          style={{
                            padding: "11px 14px",
                            borderBottom: "0.5px solid #1e293b",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <Avatar patient={p} index={originalIdx} />
                            <span style={{ fontWeight: 500, color: "#f1f5f9" }}>
                              {p.firstName || ""} {p.lastName || ""}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td
                          style={{
                            padding: "11px 14px",
                            borderBottom: "0.5px solid #1e293b",
                            color: "#60a5fa",
                          }}
                        >
                          {p.email || "—"}
                        </td>

                        {/* Phone */}
                        <td
                          style={{
                            padding: "11px 14px",
                            borderBottom: "0.5px solid #1e293b",
                            color: "#cbd5e1",
                          }}
                        >
                          {p.phone || "—"}
                        </td>

                        {/* DOB + age */}
                        <td
                          style={{
                            padding: "11px 14px",
                            borderBottom: "0.5px solid #1e293b",
                            whiteSpace: "nowrap",
                            color: "#cbd5e1",
                          }}
                        >
                          {p.dateOfBirth
                            ? new Date(p.dateOfBirth).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                          {age !== null && (
                            <span style={{ color: "#475569", marginLeft: 6 }}>
                              ({age}y)
                            </span>
                          )}
                        </td>

                        {/* Gender */}
                        <td
                          style={{
                            padding: "11px 14px",
                            borderBottom: "0.5px solid #1e293b",
                          }}
                        >
                          <GenderBadge gender={p.gender} />
                        </td>

                        {/* Address */}
                        <td
                          style={{
                            padding: "11px 14px",
                            borderBottom: "0.5px solid #1e293b",
                            color: "#94a3b8",
                            maxWidth: 160,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={p.address}
                        >
                          {p.address || "—"}
                        </td>

                        {/* Blood type */}
                        <td
                          style={{
                            padding: "11px 14px",
                            borderBottom: "0.5px solid #1e293b",
                          }}
                        >
                          <BloodBadge type={p.bloodType} />
                        </td>

                        {/* Medical history */}
                        <td
                          style={{
                            padding: "11px 14px",
                            borderBottom: "0.5px solid #1e293b",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "#64748b",
                            fontSize: 12,
                          }}
                          title={p.medicalHistory}
                        >
                          {p.medicalHistory || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer count */}
      {!loading && !error && (
        <p style={{ marginTop: "0.75rem", fontSize: 12, color: "#475569" }}>
          Showing {filtered.length} of {patients.length} patient
          {patients.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
};

export default PatientManagement;