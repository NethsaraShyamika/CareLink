import { useState, useEffect, useCallback } from "react";

/**
 * AdminPaymentsManager.jsx
 * ─────────────────────────────────────────────────────────────────
 * Admin role — Accent: #7C3AED (Purple)
 *
 * GET /api/payments/admin/all?status=&gateway=&page=&limit=
 * GET /api/payments/:id  (detail drawer)
 *
 * Usage (React Router v6):
 *   <Route path="/admin/payments" element={<AdminPaymentsManager />} />
 *
 * Requires JWT with role = "admin"
 */

const API = "http://localhost:3005/api";
const getToken = () => localStorage.getItem("token");

const T = {
  primary:       "#2563EB",
  primaryLight:  "#EFF6FF",
  bg:            "#F9FAFB",
  surface:       "#FFFFFF",
  border:        "#E5E7EB",
  textPrimary:   "#111827",
  textSecondary: "#6B7280",
  textMuted:     "#9CA3AF",
  accent:        "#7C3AED",
  accentDark:    "#5B21B6",
  accentLight:   "#F3E8FF",
  success:       "#22C55E",
  successLight:  "#F0FDF4",
  successDark:   "#15803D",
  warning:       "#F59E0B",
  warningLight:  "#FFFBEB",
  error:         "#EF4444",
  errorLight:    "#FEF2F2",
  info:          "#3B82F6",
  infoLight:     "#EFF6FF",
  gradient:      "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
};

const STATUS = {
  completed: { label: "Completed", bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
  pending:   { label: "Pending",   bg: "#FFFBEB", color: "#92400E", border: "#FDE68A" },
  failed:    { label: "Failed",    bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
  cancelled: { label: "Cancelled", bg: "#F9FAFB", color: "#475569", border: "#E5E7EB" },
  refunded:  { label: "Refunded",  bg: "#F5F3FF", color: "#5B21B6", border: "#DDD6FE" },
};

const STATUS_BARS = {
  completed: "#22C55E",
  pending:   "#F59E0B",
  failed:    "#EF4444",
  cancelled: "#9CA3AF",
  refunded:  "#8B5CF6",
};

const fmt   = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
const fmtD  = (d) => new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
const fmtDT = (d) => new Date(d).toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .adm-root { min-height: 100vh; background: ${T.bg}; font-family: 'Inter', sans-serif; color: ${T.textPrimary}; padding: 36px 24px; }
  .adm-page { max-width: 1160px; margin: 0 auto; }

  /* Header */
  .adm-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 26px; gap: 12px; flex-wrap: wrap; }
  .adm-header .eyebrow { font-size: 0.68rem; font-weight: 600; color: ${T.accent}; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
  .adm-header h1 { font-size: 1.5rem; font-weight: 700; color: ${T.textPrimary}; }
  .adm-live-chip {
    display: flex; align-items: center; gap: 6px;
    background: ${T.surface}; border: 1.5px solid ${T.border};
    color: ${T.textSecondary}; font-size: 0.72rem; font-weight: 600;
    padding: 6px 14px; border-radius: 20px;
  }
  .adm-live-dot { width: 6px; height: 6px; border-radius: 50%; background: ${T.success}; animation: pulse 1.4s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:.4;} }

  /* Metrics */
  .adm-metrics { display: grid; grid-template-columns: repeat(5,1fr); gap: 12px; margin-bottom: 18px; }
  .adm-metric {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 12px; padding: 16px 18px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    border-top: 3px solid var(--bar);
  }
  .adm-metric .icon { font-size: 1.1rem; margin-bottom: 10px; }
  .adm-metric .lbl  { font-size: 0.67rem; font-weight: 600; color: ${T.textMuted}; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
  .adm-metric .val  { font-size: 1.25rem; font-weight: 700; color: ${T.textPrimary}; }
  .adm-metric .sub  { font-size: 0.69rem; color: ${T.textMuted}; margin-top: 2px; }

  /* Breakdown bar */
  .adm-breakdown {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 12px; padding: 16px 20px;
    margin-bottom: 18px; display: flex; align-items: center;
    gap: 16px; flex-wrap: wrap; box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .adm-breakdown .btitle { font-size: 0.68rem; font-weight: 600; color: ${T.textMuted}; text-transform: uppercase; letter-spacing: 0.08em; white-space: nowrap; }
  .adm-bar-track { flex: 1; height: 7px; border-radius: 4px; background: ${T.bg}; overflow: hidden; display: flex; min-width: 180px; border: 1px solid ${T.border}; }
  .adm-bar-seg   { height: 100%; transition: width .5s ease; }
  .adm-legend    { display: flex; gap: 12px; flex-wrap: wrap; }
  .adm-leg-item  { display: flex; align-items: center; gap: 5px; font-size: 0.72rem; color: ${T.textSecondary}; }
  .adm-leg-dot   { width: 7px; height: 7px; border-radius: 50%; }

  /* Panel */
  .adm-panel { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

  /* Toolbar */
  .adm-toolbar {
    display: flex; align-items: center; gap: 10px;
    padding: 14px 18px; border-bottom: 1px solid ${T.border};
    background: ${T.bg}; flex-wrap: wrap;
  }
  .adm-toolbar label { font-size: 0.68rem; font-weight: 600; color: ${T.textMuted}; text-transform: uppercase; letter-spacing: 0.07em; }
  .adm-select {
    padding: 7px 12px; background: ${T.surface};
    border: 1.5px solid ${T.border}; border-radius: 8px;
    font-family: 'Inter', sans-serif; font-size: 0.8rem;
    color: ${T.textPrimary}; cursor: pointer; outline: none; transition: border-color .15s;
  }
  .adm-select:focus { border-color: ${T.accent}; }
  .adm-search {
    padding: 7px 13px; background: ${T.surface};
    border: 1.5px solid ${T.border}; border-radius: 8px;
    font-family: 'Inter', sans-serif; font-size: 0.8rem;
    color: ${T.textPrimary}; width: 200px; outline: none; transition: border-color .15s;
  }
  .adm-search::placeholder { color: ${T.textMuted}; }
  .adm-search:focus { border-color: ${T.accent}; }
  .adm-refresh {
    margin-left: auto; padding: 7px 14px; background: ${T.surface};
    border: 1.5px solid ${T.border}; border-radius: 8px;
    font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 500;
    cursor: pointer; color: ${T.accent}; transition: all .15s;
  }
  .adm-refresh:hover { background: ${T.accentLight}; border-color: ${T.accent}; }

  /* Table */
  table { width: 100%; border-collapse: collapse; }
  thead th {
    font-size: 0.67rem; font-weight: 600; color: ${T.textMuted};
    text-transform: uppercase; letter-spacing: 0.08em;
    padding: 11px 18px; background: ${T.bg};
    border-bottom: 1px solid ${T.border}; text-align: left; white-space: nowrap;
  }
  .td { padding: 12px 18px; font-size: 0.81rem; border-bottom: 1px solid ${T.bg}; vertical-align: middle; }
  .tr { cursor: pointer; transition: background .1s; }
  .tr:hover td { background: ${T.accentLight} !important; }
  .tr.sel td { background: ${T.accentLight} !important; }
  .tr:last-child td { border-bottom: none; }

  .adm-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 0.71rem; font-weight: 600; border: 1px solid; }
  .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.74rem; color: ${T.textMuted}; }
  .bold { font-weight: 700; }
  .cap  { text-transform: capitalize; }

  /* Pagination */
  .adm-pg {
    display: flex; align-items: center; justify-content: space-between;
    padding: 13px 18px; border-top: 1px solid ${T.border};
    background: ${T.bg}; flex-wrap: wrap; gap: 10px;
  }
  .adm-pg-info { font-size: 0.73rem; color: ${T.textMuted}; }
  .adm-pg-btns { display: flex; gap: 5px; }
  .adm-pg-btn {
    width: 30px; height: 30px; border-radius: 7px;
    border: 1.5px solid ${T.border}; background: ${T.surface};
    cursor: pointer; font-family: 'Inter', sans-serif;
    font-size: 0.78rem; font-weight: 600; color: ${T.textSecondary};
    display: flex; align-items: center; justify-content: center; transition: all .15s;
  }
  .adm-pg-btn:hover:not(:disabled):not(.active) { border-color: ${T.accent}; color: ${T.accent}; }
  .adm-pg-btn.active { background: ${T.accent}; border-color: ${T.accent}; color: #fff; }
  .adm-pg-btn:disabled { opacity: .35; cursor: not-allowed; }

  .adm-empty { padding: 56px; text-align: center; color: ${T.textMuted}; font-size: 0.84rem; }

  /* Drawer */
  .adm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 100; backdrop-filter: blur(3px); animation: fi .2s ease; }
  @keyframes fi { from{opacity:0;}to{opacity:1;} }
  .adm-drawer {
    position: fixed; right: 0; top: 0; bottom: 0; width: 430px;
    background: ${T.surface}; border-left: 1px solid ${T.border};
    z-index: 101; overflow-y: auto;
    box-shadow: -8px 0 32px rgba(0,0,0,0.1);
    animation: si .25s ease; display: flex; flex-direction: column;
  }
  @keyframes si { from{transform:translateX(100%);}to{transform:translateX(0);} }
  .adm-dhead {
    padding: 20px 22px; border-bottom: 1px solid ${T.border};
    background: ${T.bg}; display: flex; align-items: center;
    justify-content: space-between; position: sticky; top: 0; z-index: 1;
  }
  .adm-dhead h3 { font-size: 0.95rem; font-weight: 700; color: ${T.textPrimary}; }
  .adm-dhead p  { font-size: 0.71rem; color: ${T.textMuted}; margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
  .adm-close { background: ${T.bg}; border: 1px solid ${T.border}; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 0.85rem; color: ${T.textSecondary}; display: flex; align-items: center; justify-content: center; transition: background .15s; }
  .adm-close:hover { background: ${T.border}; }
  .adm-dbody { padding: 22px; flex: 1; }

  .adm-amt-hero { text-align: center; padding: 18px 0 20px; border-bottom: 1px solid ${T.border}; margin-bottom: 20px; }
  .adm-amt-hero .amt { font-size: 2.2rem; font-weight: 700; color: ${T.textPrimary}; }
  .adm-amt-hero .dt  { font-size: 0.75rem; color: ${T.textMuted}; margin-top: 4px; }

  .adm-dgroup { margin-bottom: 18px; }
  .adm-dgroup h4 { font-size: 0.67rem; font-weight: 600; color: ${T.accent}; text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 8px; }
  .adm-drow { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 10px; border-radius: 6px; gap: 10px; }
  .adm-drow:nth-child(odd) { background: ${T.bg}; }
  .adm-drow .k { font-size: 0.73rem; color: ${T.textSecondary}; font-weight: 500; flex-shrink: 0; }
  .adm-drow .v { font-size: 0.73rem; color: ${T.textPrimary}; font-weight: 600; text-align: right; word-break: break-all; font-family: 'JetBrains Mono', monospace; }

  @media (max-width: 900px) {
    .adm-metrics { grid-template-columns: repeat(3,1fr); }
    .adm-drawer  { width: 100%; }
    thead th:nth-child(3), thead th:nth-child(4), .td:nth-child(3), .td:nth-child(4) { display: none; }
  }
  @media (max-width: 580px) { .adm-metrics { grid-template-columns: 1fr 1fr; } }
`;

/* ── Detail Drawer ─────────────────────────────────────── */
function Drawer({ payment, onClose }) {
  if (!payment) return null;
  const s = STATUS[payment.status] || STATUS.pending;

  const rows = [
    ["Payment ID",         payment._id],
    ["Patient ID",         String(payment.patientId)],
    ["Doctor ID",          String(payment.doctorId)],
    ["Appointment ID",     String(payment.appointmentId)],
    ["Amount",             fmt(payment.amount)],
    ["Currency",           payment.currency],
    ["Gateway",            payment.gateway?.toUpperCase()],
    ["Gateway Order ID",   payment.gatewayOrderId || "—"],
    ["Gateway Payment ID", payment.gatewayPaymentId || "—"],
    ["Created",            fmtDT(payment.createdAt)],
    ["Updated",            fmtDT(payment.updatedAt)],
    ...(payment.refundedAt ? [
      ["Refunded At",    fmtDT(payment.refundedAt)],
      ["Refund Reason",  payment.refundReason || "—"],
    ] : []),
  ];

  return (
    <>
      <div className="adm-overlay" onClick={onClose} />
      <div className="adm-drawer">
        <div className="adm-dhead">
          <div>
            <h3>Payment Record</h3>
            <p>#{payment._id?.slice(-10).toUpperCase()}</p>
          </div>
          <button className="adm-close" onClick={onClose}>✕</button>
        </div>
        <div className="adm-dbody">
          <div className="adm-amt-hero">
            <p className="amt">{fmt(payment.amount)}</p>
            <p className="dt">{fmtDT(payment.createdAt)}</p>
            <div style={{ marginTop: 10 }}>
              <span className="adm-badge" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
                {s.label}
              </span>
            </div>
          </div>
          <div className="adm-dgroup">
            <h4>All Fields</h4>
            {rows.map(([k, v]) => (
              <div key={k} className="adm-drow">
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

/* ── Payment Row ───────────────────────────────────────── */
function PayRow({ p, idx, isSelected, onSelect }) {
  const s = STATUS[p.status] || STATUS.pending;
  return (
    <tr
      className={`tr${isSelected ? " sel" : ""}`}
      onClick={() => onSelect(p)}
      style={{ background: idx % 2 === 0 ? T.surface : T.bg }}
    >
      <td className="td mono">#{p._id.slice(-7).toUpperCase()}</td>
      <td className="td" style={{ color: T.textSecondary }}>{fmtD(p.createdAt)}</td>
      <td className="td mono" title={p.patientId}>{String(p.patientId).slice(-6).toUpperCase()}</td>
      <td className="td mono" title={p.doctorId}>{String(p.doctorId).slice(-6).toUpperCase()}</td>
      <td className="td cap" style={{ color: T.textSecondary }}>{p.gateway}</td>
      <td className="td bold">{fmt(p.amount)}</td>
      <td className="td">
        <span className="adm-badge" style={{ background: s.bg, color: s.color, borderColor: s.border }}>{s.label}</span>
      </td>
    </tr>
  );
}

/* ── Main ──────────────────────────────────────────────── */
export default function AdminPaymentsManager() {
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
    fetch(`${API}/payments/admin/all?${q}`, {
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
  const totalPages = Math.ceil(total / limit);

  const displayed = search.trim()
    ? payments.filter((p) =>
        p._id.includes(search) ||
        String(p.patientId).includes(search) ||
        String(p.doctorId).includes(search) ||
        (p.gatewayOrderId || "").toLowerCase().includes(search.toLowerCase())
      )
    : payments;

  const revenue = payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === "pending").length;
  const failed  = payments.filter((p) => p.status === "failed").length;
  const refunded = payments.filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount, 0);

  const statusBreakdown = Object.keys(STATUS).map((k) => ({
    key: k, count: payments.filter((p) => p.status === k).length, bar: STATUS_BARS[k],
    label: STATUS[k].label,
  }));
  const totalCount = payments.length || 1;

  const metrics = [
    { icon: "💰", lbl: "Platform Revenue", val: fmt(revenue),   sub: "Completed",       bar: T.accent },
    { icon: "⏳", lbl: "Pending",          val: pending,         sub: "Awaiting",        bar: T.warning },
    { icon: "✕",  lbl: "Failed",           val: failed,          sub: "Needs attention", bar: T.error },
    { icon: "↩",  lbl: "Refunded",         val: fmt(refunded),  sub: "Total refunds",   bar: "#8B5CF6" },
    { icon: "📋", lbl: "Total Records",    val: total,           sub: "All time",        bar: T.info },
  ];

  return (
    <>
      <style>{css}</style>
      <Drawer payment={selected} onClose={() => setSelected(null)} />

      <div className="adm-root">
        <div className="adm-page">

          {/* Header */}
          <div className="adm-header">
            <div>
              <p className="eyebrow">Admin Console</p>
              <h1>Payment Management</h1>
            </div>
            <div className="adm-live-chip">
              <span className="adm-live-dot" /> Live · Stripe Sandbox
            </div>
          </div>

          {/* Metrics */}
          <div className="adm-metrics">
            {metrics.map((m) => (
              <div key={m.lbl} className="adm-metric" style={{ "--bar": m.bar }}>
                <p className="icon">{m.icon}</p>
                <p className="lbl">{m.lbl}</p>
                <p className="val">{m.val}</p>
                <p className="sub">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          <div className="adm-breakdown">
            <span className="btitle">Status Distribution</span>
            <div className="adm-bar-track">
              {statusBreakdown.map((s) => (
                <div
                  key={s.key}
                  className="adm-bar-seg"
                  style={{ width: `${(s.count / totalCount) * 100}%`, background: s.bar }}
                  title={`${s.label}: ${s.count}`}
                />
              ))}
            </div>
            <div className="adm-legend">
              {statusBreakdown.filter((s) => s.count > 0).map((s) => (
                <div key={s.key} className="adm-leg-item">
                  <span className="adm-leg-dot" style={{ background: s.bar }} />
                  {s.label} ({s.count})
                </div>
              ))}
            </div>
          </div>

          {/* Panel */}
          <div className="adm-panel">
            <div className="adm-toolbar">
              <label>Status</label>
              <select className="adm-select" value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
                <option value="">All Statuses</option>
                {Object.entries(STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>

              <label style={{ marginLeft: 6 }}>Gateway</label>
              <select className="adm-select" value={filters.gateway} onChange={(e) => setFilter("gateway", e.target.value)}>
                <option value="">All Gateways</option>
                <option value="stripe">Stripe</option>
                <option value="payhere">PayHere</option>
              </select>

              <input
                className="adm-search"
                placeholder="Search by ID, patient, order…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="adm-refresh" onClick={load}>⟳ Refresh</button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table>
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
                    <tr><td colSpan={7} className="adm-empty">Loading payments…</td></tr>
                  ) : displayed.length === 0 ? (
                    <tr><td colSpan={7} className="adm-empty">No records match the current filters</td></tr>
                  ) : (
                    displayed.map((p, i) => (
                      <PayRow
                        key={p._id}
                        p={p}
                        idx={i}
                        isSelected={selected?._id === p._id}
                        onSelect={setSelected}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="adm-pg">
                <p className="adm-pg-info">
                  Page {page} of {totalPages} · {total} total
                </p>
                <div className="adm-pg-btns">
                  <button className="adm-pg-btn" disabled={page === 1} onClick={() => setPage(1)}>«</button>
                  <button className="adm-pg-btn" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button key={n} onClick={() => setPage(n)} className={`adm-pg-btn${page === n ? " active" : ""}`}>{n}</button>
                    );
                  })}
                  <button className="adm-pg-btn" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
                  <button className="adm-pg-btn" disabled={page === totalPages} onClick={() => setPage(totalPages)}>»</button>
                </div>
              </div>
            )}
          </div>

          <p style={{ marginTop: 12, fontSize: "0.71rem", color: T.textMuted, textAlign: "center" }}>
            Click any row to view full record · Admin access only · All times in local timezone
          </p>
        </div>
      </div>
    </>
  );
}