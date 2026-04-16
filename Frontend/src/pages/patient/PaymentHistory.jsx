import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * PaymentHistory.jsx
 * ─────────────────────────────────────────────────────────────────
 * Patient role — Accent: #14B8A6 (Teal)
 *
 * GET /api/payments/history  (requires JWT)
 *
 * Usage (React Router v6):
 *   <Route path="/payments/history" element={<PaymentHistory />} />
 */

const PAYMENT_API = import.meta.env.VITE_PAYMENT_URL || "http://localhost:3005";
const API_BASE    = PAYMENT_API.replace(/\/$/, "") + "/api";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── ROOT ── */
  .ph-root {
    min-height: 100vh;
    background: #F9FAFB;
    font-family: 'DM Sans', sans-serif;
    color: #111827;
    padding: 40px 24px;
    position: relative;
    overflow: hidden;
  }

  /* ── BG BLOBS ── */
  .ph-blob {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(90px);
    opacity: 0.22;
    z-index: 0;
  }
  .ph-blob-1 { width: 420px; height: 420px; background: #CCFBF1; top: -120px; right: -100px; }
  .ph-blob-2 { width: 320px; height: 320px; background: #EFF6FF; bottom: -100px; left: -80px;  }

  /* ── PAGE WRAPPER ── */
  .ph-page {
    max-width: 1100px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    animation: fadeUp 0.35s ease-out both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── HEADER ── */
  .ph-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 28px;
  }

  .ph-eyebrow {
    font-size: 0.68rem;
    font-weight: 600;
    color: #14B8A6;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }

  .ph-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.4px;
  }

  .ph-sub {
    font-size: 0.875rem;
    color: #6B7280;
    margin-top: 5px;
  }

  /* ── BACK BTN (top-right) ── */
  .ph-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: #374151;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .ph-back-btn:hover {
    border-color: #14B8A6;
    color: #0D9488;
    background: #F0FDFA;
  }

  /* ── SUMMARY CARDS ── */
  .ph-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 24px;
  }

  .ph-stat {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    padding: 18px 20px;
    position: relative;
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .ph-stat:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
    transform: translateY(-2px);
  }

  .ph-stat-accent {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 16px 16px 0 0;
  }

  .ph-stat-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 12px;
  }
  .ph-stat-icon svg { width: 18px; height: 18px; }

  .ph-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    color: #111827;
    letter-spacing: -0.3px;
    margin-bottom: 3px;
  }

  .ph-stat-label {
    font-size: 0.75rem;
    color: #6B7280;
    font-weight: 500;
  }

  /* ── PANEL ── */
  .ph-panel {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }

  .ph-panel-header {
    padding: 16px 22px;
    border-bottom: 1px solid #F3F4F6;
    background: #F9FAFB;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .ph-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    color: #111827;
  }

  .ph-count-badge {
    padding: 3px 10px;
    background: #CCFBF1;
    border: 1px solid #99F6E4;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #0D9488;
  }

  /* ── TABLE ── */
  .ph-table {
    width: 100%;
    border-collapse: collapse;
  }

  .ph-table thead th {
    text-align: left;
    font-size: 0.69rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #9CA3AF;
    font-weight: 600;
    padding: 10px 20px;
    border-bottom: 1px solid #F3F4F6;
    background: #FAFAFA;
    white-space: nowrap;
  }

  .ph-table tbody td {
    padding: 14px 20px;
    font-size: 0.84rem;
    border-bottom: 1px solid #F9FAFB;
    vertical-align: middle;
    color: #374151;
  }

  .ph-table tbody tr:last-child td { border-bottom: none; }

  .ph-table tbody tr {
    transition: background 0.15s;
  }
  .ph-table tbody tr:hover td { background: #F0FDFA; }

  /* ── ID MONO ── */
  .ph-mono {
    font-family: 'DM Mono', 'Fira Code', monospace;
    font-size: 0.78rem;
    color: #6B7280;
    background: #F3F4F6;
    padding: 2px 7px;
    border-radius: 6px;
  }

  /* ── GATEWAY PILL ── */
  .ph-gateway {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #4F46E5;
    background: #EEF2FF;
    border: 1px solid #C7D2FE;
    padding: 3px 10px;
    border-radius: 20px;
    text-transform: capitalize;
  }

  /* ── STATUS BADGES ── */
  .ph-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: capitalize;
    border: 1px solid;
  }

  .ph-badge-completed {
    background: #DCFCE7;
    color: #15803D;
    border-color: #86EFAC;
  }
  .ph-badge-pending {
    background: #FFFBEB;
    color: #92400E;
    border-color: #FDE68A;
  }
  .ph-badge-failed {
    background: #FEF2F2;
    color: #B91C1C;
    border-color: #FECACA;
  }
  .ph-badge-cancelled {
    background: #F9FAFB;
    color: #6B7280;
    border-color: #E5E7EB;
  }
  .ph-badge-refunded {
    background: #F5F3FF;
    color: #5B21B6;
    border-color: #DDD6FE;
  }

  /* ── AMOUNT ── */
  .ph-amount {
    font-weight: 700;
    color: #111827;
    font-size: 0.88rem;
  }

  /* ── EMPTY / ERROR / LOADING ── */
  .ph-state {
    padding: 64px 32px;
    text-align: center;
  }

  .ph-state-icon {
    width: 56px; height: 56px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 16px;
  }
  .ph-state-icon svg { width: 26px; height: 26px; }

  .ph-state h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 6px;
  }

  .ph-state p {
    font-size: 0.85rem;
    color: #6B7280;
    max-width: 380px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .ph-loader-ring {
    width: 40px; height: 40px;
    border: 3px solid #E5E7EB;
    border-top-color: #14B8A6;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
    margin: 0 auto 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── FOOTER ── */
  .ph-footer {
    padding: 16px 22px;
    border-top: 1px solid #F3F4F6;
    background: #FAFAFA;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .ph-footer-note {
    font-size: 0.75rem;
    color: #9CA3AF;
  }

  .ph-footer-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 20px;
    background: #14B8A6;
    color: #FFFFFF;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 3px 10px rgba(20,184,166,0.2);
  }
  .ph-footer-btn:hover {
    background: #0D9488;
    box-shadow: 0 4px 14px rgba(20,184,166,0.3);
    transform: translateY(-1px);
  }
  .ph-footer-btn:active { transform: translateY(0); }

  @media (max-width: 768px) {
    .ph-summary { grid-template-columns: repeat(2, 1fr); }
    .ph-table thead th:nth-child(2),
    .ph-table tbody td:nth-child(2) { display: none; }
  }

  @media (max-width: 480px) {
    .ph-summary { grid-template-columns: 1fr 1fr; }
    .ph-root { padding: 24px 14px; }
  }
`;

/* ── Status badge helper ── */
function Badge({ status }) {
  const map = {
    completed: "ph-badge-completed",
    pending:   "ph-badge-pending",
    failed:    "ph-badge-failed",
    cancelled: "ph-badge-cancelled",
    refunded:  "ph-badge-refunded",
  };
  const dotColor = {
    completed: "#22C55E",
    pending:   "#F59E0B",
    failed:    "#EF4444",
    cancelled: "#9CA3AF",
    refunded:  "#8B5CF6",
  };
  return (
    <span className={`ph-badge ${map[status] || "ph-badge-cancelled"}`}>
      <svg width="6" height="6" viewBox="0 0 6 6">
        <circle cx="3" cy="3" r="3" fill={dotColor[status] || "#9CA3AF"} />
      </svg>
      {status}
    </span>
  );
}

/* ── Stat icons ── */
const IconTotal = () => (
  <svg viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="16" height="16" rx="4" stroke="#14B8A6" strokeWidth="1.6"/>
    <path d="M5 9h8M5 6h8M5 12h5" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconSuccess = () => (
  <svg viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7.5" stroke="#22C55E" strokeWidth="1.6"/>
    <path d="M5.5 9.5L7.8 11.8L12.5 6.5" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPending = () => (
  <svg viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7.5" stroke="#F59E0B" strokeWidth="1.6"/>
    <path d="M9 5v4l2.5 2.5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IconAmount = () => (
  <svg viewBox="0 0 18 18" fill="none">
    <path d="M9 1.5v15M12.5 4.5H7.25A2.75 2.75 0 0 0 7.25 10H10.75A2.75 2.75 0 0 1 10.75 15.5H4.5" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view payment history.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/payments/history`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to load payment history.");
        }
        const data = await res.json();
        setPayments(data.payments || []);
      } catch (err) {
        setError(err.message || "Failed to load payment history.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Derived stats ── */
  const totalSpent   = payments.filter(p => p.status === "completed").reduce((s, p) => s + (p.amount || 0), 0);
  const completedCnt = payments.filter(p => p.status === "completed").length;
  const pendingCnt   = payments.filter(p => p.status === "pending").length;

  const STATS = [
    { icon: <IconTotal />,   iconBg: "#F0FDFA", accent: "#14B8A6", label: "Total Payments",   value: payments.length },
    { icon: <IconSuccess />, iconBg: "#F0FDF4", accent: "#22C55E", label: "Completed",        value: completedCnt },
    { icon: <IconPending />, iconBg: "#FFFBEB", accent: "#F59E0B", label: "Pending",          value: pendingCnt },
    { icon: <IconAmount />,  iconBg: "#EFF6FF", accent: "#2563EB", label: "Total Spent",      value: `LKR ${totalSpent.toLocaleString()}` },
  ];

  return (
    <>
      <style>{css}</style>
      <div className="ph-root">
        {/* Background blobs */}
        <div className="ph-blob ph-blob-1" />
        <div className="ph-blob ph-blob-2" />

        <div className="ph-page">

          {/* ── HEADER ── */}
          <div className="ph-header">
            <div>
              <p className="ph-eyebrow">Patient Portal</p>
              <h1 className="ph-title">Payment History</h1>
              <p className="ph-sub">Review your appointment payments and transaction records.</p>
            </div>
            <button className="ph-back-btn" onClick={() => navigate("/patient/dashboard")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Dashboard
            </button>
          </div>

          {/* ── SUMMARY CARDS ── */}
          {!loading && !error && (
            <div className="ph-summary">
              {STATS.map((s, i) => (
                <div className="ph-stat" key={i}>
                  <div className="ph-stat-accent" style={{ background: s.accent }} />
                  <div className="ph-stat-icon" style={{ background: s.iconBg }}>
                    {s.icon}
                  </div>
                  <div className="ph-stat-value">{s.value}</div>
                  <div className="ph-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── PANEL ── */}
          <div className="ph-panel">
            <div className="ph-panel-header">
              <div className="ph-panel-title">
                Transaction Records
              </div>
              {!loading && !error && payments.length > 0 && (
                <span className="ph-count-badge">{payments.length} records</span>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="ph-state">
                <div className="ph-loader-ring" />
                <p style={{ color: "#6B7280", fontSize: "0.875rem" }}>Loading payment history…</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="ph-state">
                <div className="ph-state-icon" style={{ background: "#FEF2F2" }}>
                  <svg viewBox="0 0 26 26" fill="none">
                    <circle cx="13" cy="13" r="11.5" stroke="#EF4444" strokeWidth="1.6"/>
                    <path d="M13 8v5" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="13" cy="17.5" r="1.2" fill="#EF4444"/>
                  </svg>
                </div>
                <h3>Unable to load history</h3>
                <p>{error}</p>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && payments.length === 0 && (
              <div className="ph-state">
                <div className="ph-state-icon" style={{ background: "#F0FDFA" }}>
                  <svg viewBox="0 0 26 26" fill="none">
                    <rect x="4" y="5" width="18" height="16" rx="3" stroke="#14B8A6" strokeWidth="1.6"/>
                    <path d="M8 10h10M8 13.5h7M8 17h5" stroke="#14B8A6" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>No payments yet</h3>
                <p>Once you complete a payment for an appointment, your transaction records will appear here.</p>
              </div>
            )}

            {/* Table */}
            {!loading && !error && payments.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table className="ph-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Appointment</th>
                      <th>Gateway</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: "#111827", fontSize: "0.83rem" }}>
                            {fmtDate(p.createdAt)}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "2px" }}>
                            {fmtTime(p.createdAt)}
                          </div>
                        </td>
                        <td>
                          <span className="ph-mono">
                            #{p.appointmentId ? String(p.appointmentId).slice(-8).toUpperCase() : "—"}
                          </span>
                        </td>
                        <td>
                          <span className="ph-gateway">{p.gateway || "—"}</span>
                        </td>
                        <td>
                          <span className="ph-amount">
                            {p.currency === "USD" ? "$" : "LKR "}
                            {p.amount?.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <Badge status={p.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div className="ph-footer">
              <span className="ph-footer-note">
                All times shown in your local timezone
              </span>
              <button className="ph-footer-btn" onClick={() => navigate("/patient/dashboard")}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M8.5 2.5L4 7l4.5 4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}