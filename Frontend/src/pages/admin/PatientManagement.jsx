import React, { useEffect, useState } from "react";
import axios from "axios";

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ Use "token" — same key set during login
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5002/api/patients/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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

  // Live search filter
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

  return (
    <div className="cl-panel">
      <div className="cl-panel-header">
        <div className="cl-panel-title">🧑‍🤝‍🧑 Patient Management</div>
      </div>
      <div className="cl-panel-body">
        {/* Search bar */}
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #334155",
              background: "#1e293b",
              color: "#f1f5f9",
              width: "100%",
              maxWidth: "400px",
              fontSize: "14px",
            }}
          />
          <span style={{ marginLeft: "12px", color: "#94a3b8", fontSize: "13px" }}>
            {filtered.length} patient{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {loading ? (
          <p style={{ color: "#94a3b8" }}>Loading patients...</p>
        ) : error ? (
          <p style={{ color: "#f87171" }}>⚠ {error}</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#94a3b8" }}>No patients found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="cl-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Address</th>
                  <th>Blood Type</th>
                  <th>Medical History</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={p._id}>
                    <td>{idx + 1}</td>
                    <td>{p.firstName || "-"}</td>
                    <td>{p.lastName || "-"}</td>
                    <td>{p.email || "-"}</td>
                    <td>{p.phone || "-"}</td>
                    <td>
                      {p.dateOfBirth
                        ? new Date(p.dateOfBirth).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>{p.gender || "-"}</td>
                    <td>{p.address || "-"}</td>
                    <td>{p.bloodType || "-"}</td>
                    <td
                      style={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={p.medicalHistory}
                    >
                      {p.medicalHistory || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientManagement;