import { useState, useEffect, useCallback } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  .cl-stats {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .cl-stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 22px;
    position: relative;
    overflow: hidden;
    transition: all 0.2s;
  }

  .cl-stat-card:hover {
    border-color: rgba(255,255,255,0.12);
    transform: translateY(-2px);
  }

  .cl-stat-glow {
    position: absolute;
    top: -30px; right: -30px;
    width: 100px; height: 100px;
    border-radius: 50%;
    opacity: 0.12;
    filter: blur(30px);
  }

  .cl-stat-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    margin-bottom: 14px;
  }

  .cl-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
  }

  .cl-stat-label {
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    font-weight: 500;
  }

  .cl-stat-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.25);
    margin-top: 4px;
  }

  .cl-breakdown {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 16px 22px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .cl-breakdown-title {
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    font-weight: 600;
    white-space: nowrap;
  }

  .cl-bar-track {
    flex: 1;
    height: 6px;
    border-radius: 6px;
    background: rgba(255,255,255,0.06);
    overflow: hidden;
    display: flex;
    min-width: 180px;
  }

  .cl-bar-seg { height: 100%; transition: width 0.5s ease; }

  .cl-legend { display: flex; gap: 14px; flex-wrap: wrap; }

  .cl-leg-item {
    display: flex; align-items: center; gap: 5px;
    font-size: 12px;
    color: rgba(255,255,255,0.45);
  }

  .cl-leg-dot { width: 7px; height: 7px; border-radius: 50%; }

  .cl-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
    animation: pmFadeIn 0.3s ease forwards;
  }

  @keyframes pmFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .cl-panel-header {
    padding: 18px 22px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 10px;
  }

  .cl-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
  }

  .cl-panel-toolbar {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }

  .cl-select {
    padding: 7px 12px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #e8edf5;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
  }

  .cl-select:focus { border-color: rgba(139,92,246,0.5); }

  .cl-search-input {
    padding: 7px 13px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #e8edf5;
    width: 220px;
    outline: none;
    transition: border-color 0.2s;
  }

  .cl-search-input::placeholder { color: rgba(255,255,255,0.25); }
  .cl-search-input:focus { border-color: rgba(139,92,246,0.5); }

  .cl-refresh-btn {
    padding: 7px 16px;
    background: rgba(139,92,246,0.12);
    border: 1px solid rgba(139,92,246,0.25);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    color: #a78bfa;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cl-refresh-btn:hover { background: rgba(139,92,246,0.22); }

  .cl-table { width: 100%; border-collapse: collapse; }

  .cl-table th {
    text-align: left;
    font-size: 11px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    font-weight: 600;
    padding: 8px 14px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .cl-table td {
    padding: 13px 14px;
    font-size: 13px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: middle;
  }

  .cl-table tr:last-child td { border-bottom: none; }
  .cl-table tbody tr { cursor: pointer; transition: background 0.15s; }
  .cl-table tbody tr:hover td { background: rgba(139,92,246,0.06); }
  .cl-table tbody tr.row-selected td { background: rgba(139,92,246,0.1); }

  .cl-badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    display: inline-flex; align-items: center; gap: 4px;
  }

  .cl-badge-green  { background: rgba(34,197,94,0.12);  color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
  .cl-badge-yellow { background: rgba(234,179,8,0.12);  color: #facc15; border: 1px solid rgba(234,179,8,0.2); }
  .cl-badge-red    { background: rgba(239,68,68,0.12);  color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
  .cl-badge-blue   { background: rgba(14,165,233,0.12); color: #38bdf8; border: 1px solid rgba(14,165,233,0.2); }
  .cl-badge-gray   { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); }
  .cl-badge-purple { background: rgba(139,92,246,0.12); color: #a78bfa; border: 1px solid rgba(139,92,246,0.25); }

  .cl-mono {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    color: rgba(255,255,255,0.5);
  }

  .cl-pg {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 22px;
    border-top: 1px solid rgba(255,255,255,0.06);
    flex-wrap: wrap; gap: 10px;
  }

  .cl-pg-info { font-size: 12px; color: rgba(255,255,255,0.3); }
  .cl-pg-btns { display: flex; gap: 5px; }

  .cl-pg-btn {
    width: 30px; height: 30px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 600;
    color: rgba(255,255,255,0.4);
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }

  .cl-pg-btn:hover:not(:disabled):not(.active) {
    border-color: rgba(139,92,246,0.4);
    color: #a78bfa;
  }

  .cl-pg-btn.active {
    background: rgba(139,92,246,0.2);
    border-color: rgba(139,92,246,0.4);
    color: #a78bfa;
  }

  .cl-pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .cl-drawer-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 200;
    backdrop-filter: blur(3px);
    animation: pmFadeIn 0.2s ease;
  }

  .cl-drawer {
    position: fixed; right: 0; top: 0; bottom: 0;
    width: 400px;
    background: #0d1117;
    border-left: 1px solid rgba(255,255,255,0.08);
    z-index: 201;
    overflow-y: auto;
    display: flex; flex-direction: column;
    box-shadow: -8px 0 32px rgba(0,0,0,0.3);
    animation: pmSlideIn 0.25s ease;
  }

  @keyframes pmSlideIn {
    from { transform: translateX(100%); }
    to   { transform: translateX(0); }
  }

  .cl-dhead {
    padding: 20px 22px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0;
    background: #0d1117;
    z-index: 1;
  }

  .cl-dhead-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; }
  .cl-dhead-sub { font-size: 11px; color: rgba(255,255,255,0.3); font-family: monospace; margin-top: 2px; }

  .cl-dclose {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    cursor: pointer;
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }

  .cl-dclose:hover { background: rgba(255,255,255,0.12); }

  .cl-dbody { padding: 22px; flex: 1; }

  .cl-amt-hero {
    text-align: center;
    padding: 16px 0 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 20px;
  }

  .cl-amt-hero .amt {
    font-family: 'Syne', sans-serif;
    font-size: 30px; font-weight: 800;
    letter-spacing: -1px;
  }

  .cl-amt-hero .dt { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 4px; }

  .cl-dgroup { margin-bottom: 18px; }

  .cl-dgroup h4 {
    font-size: 10px; font-weight: 600;
    color: #7c3aed;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .cl-drow {
    display: flex; justify-content: space-between;
    align-items: flex-start;
    padding: 8px 10px;
    border-radius: 8px;
    gap: 10px;
  }

  .cl-drow:nth-child(odd) { background: rgba(255,255,255,0.03); }
  .cl-drow .k { font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 500; flex-shrink: 0; }
  .cl-drow .v { font-size: 12px; color: #e8edf5; font-weight: 600; text-align: right; word-break: break-all; font-family: monospace; }
`;

const API = (import.meta.env.VITE_API_BASE || "http://localhost:3005") + "/api/payments";
const getToken = () => localStorage.getItem("token");

const STATUS_MAP = {
  completed: { label: "Completed", badge: "cl-badge-green" },
  pending:   { label: "Pending",   badge: "cl-badge-yellow" },
  failed:    { label: "Failed",    badge: "cl-badge-red" },
  cancelled: { label: "Cancelled", badge: "cl-badge-gray" },
  refunded:  { label: "Refunded",  badge: "cl-badge-purple" },
};

const STATUS_COLORS = {
  completed: "#22c55e",
  pending:   "#facc15",
  failed:    "#f87171",
  cancelled: "rgba(255,255,255,0.25)",
  refunded:  "#a78bfa",
};

const fmt   = (n) => "LKR " + Number(n).toLocaleString("en-US");
const fmtD  = (d) => new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
const fmtDT = (d) => new Date(d).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/* ── Detail Drawer ── */
function Drawer({ payment, onClose }) {
  if (!payment) return null;
  const s = STATUS_MAP[payment.status] || STATUS_MAP.pending;

  const rows = [
    ["Payment ID",         payment._id],
    ["Patient ID",         String(payment.patientId)],
    ["Doctor ID",          String(payment.doctorId)],
    ["Appointment ID",     String(payment.appointmentId)],
    ["Amount",             fmt(payment.amount)],
    ["Currency",           payment.currency],
    ["Gateway",            payment.gateway?.charAt(0).toUpperCase() + payment.gateway?.slice(1)],
    ["Gateway Order ID",   payment.gatewayOrderId || "—"],
    ["Gateway Payment ID", payment.gatewayPaymentId || "—"],
    ["Created",            fmtDT(payment.createdAt)],
    ["Updated",            fmtDT(payment.updatedAt)],
    ...(payment.refundedAt ? [
      ["Refunded At",   fmtDT(payment.refundedAt)],
      ["Refund Reason", payment.refundReason || "—"],
    ] : []),
  ];

  return (
    <>
      <div className="cl-drawer-overlay" onClick={onClose} />
      <div className="cl-drawer">
        <div className="cl-dhead">
          <div>
            <div className="cl-dhead-title">Payment Record</div>
            <div className="cl-dhead-sub">#{payment._id?.slice(-10).toUpperCase()}</div>
          </div>
          <button className="cl-dclose" onClick={onClose}>✕</button>
        </div>
        <div className="cl-dbody">
          <div className="cl-amt-hero">
            <div className="amt">{fmt(payment.amount)}</div>
            <div className="dt">{fmtDT(payment.createdAt)}</div>
            <div style={{ marginTop: "10px" }}>
              <span className={`cl-badge ${s.badge}`}>● {s.label}</span>
            </div>
          </div>
          <div className="cl-dgroup">
            <h4>All Fields</h4>
            {rows.map(([k, v]) => (
              <div key={k} className="cl-drow">
                <span className="k">{k}</span>
                <span className="v">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Main Component ── */
function AdminPaymentsManager() {
  const [payments, setPayments] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ status: "", gateway: "" });
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);
  const limit = 15;

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams({ page, limit });
    if (filters.status)  q.set("status",  filters.status);
    if (filters.gateway) q.set("gateway", filters.gateway);
    fetch(`${API}/admin/all?${q}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) { setPayments(d.payments); setTotal(d.total); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const setFilter = (k, v) => { setFilters((f) => ({ ...f, [k]: v })); setPage(1); };
  const totalPages = Math.ceil(total / limit) || 1;

  const displayed = search.trim()
    ? payments.filter((p) =>
        p._id.includes(search) ||
        String(p.patientId).includes(search) ||
        String(p.doctorId).includes(search) ||
        (p.gatewayOrderId || "").toLowerCase().includes(search.toLowerCase())
      )
    : payments;

  /* ── Metrics ── */
  const revenue  = payments.filter(p => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const pending  = payments.filter(p => p.status === "pending").length;
  const failed   = payments.filter(p => p.status === "failed").length;
  const refunded = payments.filter(p => p.status === "refunded").reduce((s, p) => s + p.amount, 0);

  const METRICS = [
    { icon: "💰", label: "Platform Revenue", value: fmt(revenue),  sub: "Completed txns",   color: "#7c3aed", glow: "#7c3aed" },
    { icon: "⏳", label: "Pending",          value: pending,        sub: "Awaiting gateway", color: "#f59e0b", glow: "#f59e0b" },
    { icon: "✕",  label: "Failed",           value: failed,         sub: "Needs attention",  color: "#ef4444", glow: "#ef4444" },
    { icon: "↩",  label: "Refunded",         value: fmt(refunded),  sub: "Total refunds",    color: "#8b5cf6", glow: "#8b5cf6" },
    { icon: "📋", label: "Total Records",    value: total,           sub: "All time",         color: "#0ea5e9", glow: "#0ea5e9" },
  ];

  /* ── Status breakdown ── */
  const statusBreakdown = Object.keys(STATUS_MAP).map((k) => ({
    key: k,
    count: payments.filter(p => p.status === k).length,
    color: STATUS_COLORS[k],
    label: STATUS_MAP[k].label,
  }));
  const totalCount = payments.length || 1;

  /* ── Pagination buttons ── */
  const paginationPages = Array.from(
    { length: Math.min(5, totalPages) },
    (_, i) => Math.max(1, Math.min(page - 2, totalPages - 4)) + i
  ).filter(n => n >= 1 && n <= totalPages);

  return (
    <>
      <style>{styles}</style>
      <Drawer payment={selected} onClose={() => setSelected(null)} />

      {/* Stats */}
      <div className="cl-stats">
        {METRICS.map((m, i) => (
          <div className="cl-stat-card" key={i}>
            <div className="cl-stat-glow" style={{ background: m.glow }} />
            <div className="cl-stat-icon" style={{ background: `${m.color}18` }}>{m.icon}</div>
            <div className="cl-stat-value">{m.value}</div>
            <div className="cl-stat-label">{m.label}</div>
            <div className="cl-stat-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="cl-breakdown">
        <span className="cl-breakdown-title">Status Distribution</span>
        <div className="cl-bar-track">
          {statusBreakdown.map(s => (
            <div
              key={s.key}
              className="cl-bar-seg"
              style={{ width: `${(s.count / totalCount) * 100}%`, background: s.color }}
              title={`${s.label}: ${s.count}`}
            />
          ))}
        </div>
        <div className="cl-legend">
          {statusBreakdown.filter(s => s.count > 0).map(s => (
            <div key={s.key} className="cl-leg-item">
              <span className="cl-leg-dot" style={{ background: s.color }} />
              {s.label} ({s.count})
            </div>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div className="cl-panel">
        <div className="cl-panel-header">
          <div className="cl-panel-title">💳 All Payments</div>
          <div className="cl-panel-toolbar">
            <select
              className="cl-select"
              value={filters.status}
              onChange={e => setFilter("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <select
              className="cl-select"
              value={filters.gateway}
              onChange={e => setFilter("gateway", e.target.value)}
            >
              <option value="">All Gateways</option>
              <option value="stripe">Stripe</option>
              <option value="payhere">PayHere</option>
            </select>

            <input
              className="cl-search-input"
              placeholder="Search by ID, patient, order…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />

            <button className="cl-refresh-btn" onClick={load}>⟳ Refresh</button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="cl-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Gateway</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>
                    Loading payments…
                  </td>
                </tr>
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>
                    No records match the current filters
                  </td>
                </tr>
              ) : (
                displayed.map((p) => {
                  const s = STATUS_MAP[p.status] || STATUS_MAP.pending;
                  return (
                    <tr
                      key={p._id}
                      className={selected?._id === p._id ? "row-selected" : ""}
                      onClick={() => setSelected(p)}
                    >
                      <td>
                        <span className="cl-mono" style={{ color: "#a78bfa", fontWeight: 700 }}>
                          #{p._id.slice(-7).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>{fmtD(p.createdAt)}</td>
                      <td className="cl-mono" title={p.patientId}>{String(p.patientId).slice(-6).toUpperCase()}</td>
                      <td className="cl-mono" title={p.doctorId}>{String(p.doctorId).slice(-6).toUpperCase()}</td>
                      <td style={{ fontSize: "13px", textTransform: "capitalize", color: "rgba(255,255,255,0.5)" }}>
                        {p.gateway}
                      </td>
                      <td style={{ fontWeight: 600 }}>{fmt(p.amount)}</td>
                      <td><span className={`cl-badge ${s.badge}`}>● {s.label}</span></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="cl-pg">
            <div className="cl-pg-info">
              Page {page} of {totalPages} · {total} total
            </div>
            <div className="cl-pg-btns">
              <button className="cl-pg-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
              <button className="cl-pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {paginationPages.map(n => (
                <button
                  key={n}
                  className={`cl-pg-btn${page === n ? " active" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button className="cl-pg-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
              <button className="cl-pg-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
            </div>
          </div>
        )}
      </div>

      <p style={{ marginTop: "12px", fontSize: "12px", color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
        Click any row to view full record · Admin access only · All times in local timezone
      </p>
    </>
  );
}

export default AdminPaymentsManager;