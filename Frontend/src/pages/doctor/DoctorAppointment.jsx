import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DoctorSidebar from "./Doctorsidebar";

// ─── API Base URLs ─────────────────────────────────────────────────────────────
import { API_GATEWAY } from "../../utils/api";
const APPT_API = import.meta.env.VITE_API_GATEWAY_URL || API_GATEWAY;
const DR_API   = import.meta.env.VITE_API_GATEWAY_URL || API_GATEWAY;

// ─── Scoped CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary: #2563EB;
    --primary-light: #EFF6FF;
    --accent: #4F46E5;
    --accent-dark: #3730A3;
    --accent-light: #E0E7FF;
    --bg: #F9FAFB;
    --surface: #FFFFFF;
    --border: #E5E7EB;
    --border-soft: #F3F4F6;
    --text: #111827;
    --text-sec: #6B7280;
    --text-muted: #9CA3AF;
    --success: #22C55E;
    --success-bg: #DCFCE7;
    --success-text: #15803D;
    --warning: #F59E0B;
    --warning-bg: #FEF3C7;
    --warning-text: #B45309;
    --error: #EF4444;
    --error-bg: #FEE2E2;
    --error-text: #991B1B;
    --info: #3B82F6;
    --info-bg: #DBEAFE;
    --info-text: #1D4ED8;
    --r-md: 10px;
    --r-lg: 14px;
    --r-xl: 18px;
    --shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,.08);
  }

  body {
    font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  /* Layout */
  .appt-dash { display: flex; height: 100vh; overflow: hidden; }
  .appt-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .appt-content { flex: 1; overflow-y: auto; padding: 28px 32px; background: var(--bg); }

  /* Topbar */
  .appt-topbar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 16px 32px;
    display: flex; align-items: center; gap: 16px;
    flex-shrink: 0;
  }
  .appt-tb-title { font-size: 18px; font-weight: 800; letter-spacing: -0.4px; }
  .appt-tb-date { font-size: 12px; color: var(--text-sec); margin-top: 2px; }
  .appt-tb-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .appt-icon-btn {
    width: 38px; height: 38px; border-radius: var(--r-md);
    background: var(--bg); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-sec); position: relative;
    transition: all .15s;
  }
  .appt-icon-btn:hover { background: var(--accent-light); color: var(--accent); border-color: #c7d2fe; }
  .notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--error); border: 1.5px solid #fff;
  }

  /* Stats */
  .appt-stats-row {
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px; margin-bottom: 26px;
  }
  .appt-stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl); padding: 20px 22px;
    box-shadow: var(--shadow); position: relative; overflow: hidden;
    transition: box-shadow .2s, transform .2s;
  }
  .appt-stat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
  .appt-stat-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px;
  }
  .sc-indigo::after { background: linear-gradient(90deg, #4F46E5, #3730A3); }
  .sc-amber::after  { background: linear-gradient(90deg, #F59E0B, #D97706); }
  .sc-green::after  { background: linear-gradient(90deg, #22C55E, #16A34A); }
  .sc-blue::after   { background: linear-gradient(90deg, #3B82F6, #2563EB); }
  .sc-red::after    { background: linear-gradient(90deg, #EF4444, #DC2626); }

  .appt-stat-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
  .appt-stat-icon {
    width: 44px; height: 44px; border-radius: var(--r-md);
    display: flex; align-items: center; justify-content: center;
  }
  .appt-stat-val { font-size: 30px; font-weight: 800; letter-spacing: -0.8px; line-height: 1; margin-bottom: 4px; }
  .appt-stat-lbl { font-size: 12.5px; color: var(--text-sec); font-weight: 500; }
  .appt-stat-trend { font-size: 11px; font-weight: 600; margin-top: 6px; }
  .trend-up  { color: var(--success-text); }
  .trend-neu { color: var(--text-muted); }

  /* Tabs */
  .appt-tabs {
    display: flex; gap: 4px; margin-bottom: 20px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 4px;
    width: fit-content; flex-wrap: wrap;
  }
  .appt-tab {
    padding: 8px 16px; border-radius: var(--r-md);
    font-size: 13px; font-weight: 600; cursor: pointer;
    color: var(--text-sec); transition: all .18s; white-space: nowrap;
    border: none; background: none; font-family: inherit;
    display: flex; align-items: center; gap: 6px;
  }
  .appt-tab:hover { color: var(--text); background: var(--bg); }
  .appt-tab.active { background: var(--accent); color: #fff; box-shadow: 0 2px 8px rgba(79,70,229,.3); }
  .appt-tab-count {
    font-size: 10.5px; font-weight: 700; padding: 1px 7px;
    border-radius: 99px; background: rgba(255,255,255,.25);
  }
  .appt-tab:not(.active) .appt-tab-count { background: var(--bg); color: var(--text-sec); }

  /* Filter bar */
  .appt-filter-bar {
    display: flex; align-items: center; gap: 12px; margin-bottom: 22px; flex-wrap: wrap;
  }
  .appt-search-wrap { position: relative; flex: 1; min-width: 240px; }
  .appt-search-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none;
  }
  .appt-search-input {
    width: 100%; padding: 10px 14px 10px 38px;
    border: 1px solid var(--border); border-radius: var(--r-md);
    background: var(--surface); font-size: 13.5px;
    color: var(--text); font-family: inherit;
    transition: border-color .15s, box-shadow .15s; outline: none;
  }
  .appt-search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }

  .appt-select {
    padding: 10px 14px; border: 1px solid var(--border);
    border-radius: var(--r-md); background: var(--surface);
    font-size: 13px; color: var(--text); font-family: inherit;
    cursor: pointer; outline: none;
  }
  .appt-select:focus { border-color: var(--accent); }

  .appt-date-input {
    padding: 10px 14px; border: 1px solid var(--border);
    border-radius: var(--r-md); background: var(--surface);
    font-size: 13px; color: var(--text); font-family: inherit;
    outline: none;
  }
  .appt-date-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }

  .appt-btn-refresh {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 16px; border-radius: var(--r-md);
    background: var(--accent); color: #fff;
    border: none; cursor: pointer;
    font-size: 13px; font-weight: 600; font-family: inherit;
    transition: background .15s, transform .1s;
  }
  .appt-btn-refresh:hover { background: var(--accent-dark); }
  .appt-btn-refresh:active { transform: scale(.97); }
  .appt-btn-refresh:disabled { opacity: .7; pointer-events: none; }

  /* Cards */
  .appt-list { display: flex; flex-direction: column; gap: 10px; }
  .appt-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl);
    box-shadow: var(--shadow); overflow: hidden;
    transition: border-color .15s, box-shadow .2s, transform .15s;
    animation: apptSlideIn .25s ease both;
  }
  .appt-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); border-color: #D1D5DB; }
  @keyframes apptSlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .appt-card-inner { display: flex; align-items: stretch; }
  .appt-accent-bar { width: 4px; flex-shrink: 0; }
  .bar-pending    { background: var(--warning); }
  .bar-accepted   { background: var(--primary); }
  .bar-confirmed  { background: var(--success); }
  .bar-completed  { background: var(--info); }
  .bar-cancelled  { background: var(--error); }
  .bar-rejected   { background: var(--error); }
  .bar-rescheduled { background: var(--warning); }

  .appt-body { flex: 1; padding: 16px 20px; display: flex; align-items: center; gap: 16px; min-width: 0; flex-wrap: wrap; }
  .appt-av {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 800; flex-shrink: 0;
  }
  .appt-info { flex: 1; min-width: 0; }
  .appt-name { font-size: 15px; font-weight: 700; margin-bottom: 3px; }
  .appt-reason { font-size: 12.5px; color: var(--text-muted); margin-bottom: 6px; }
  .appt-meta { display: flex; gap: 12px; font-size: 11.5px; color: var(--text-sec); flex-wrap: wrap; }
  .appt-time-meta { display: flex; align-items: center; gap: 4px; }
  .appt-badge-wrap { display: flex; align-items: center; }
  .appt-actions { display: flex; align-items: center; gap: 8px; padding-right: 16px; }

  /* Badges */
  .badge {
    font-size: 10.5px; font-weight: 700; padding: 3px 10px;
    border-radius: 99px; flex-shrink: 0;
  }
  .b-pending    { background: var(--warning-bg); color: var(--warning-text); }
  .b-accepted   { background: var(--info-bg); color: var(--info-text); }
  .b-confirmed  { background: var(--success-bg); color: var(--success-text); }
  .b-completed  { background: var(--primary-light); color: var(--primary); }
  .b-cancelled  { background: var(--error-bg); color: var(--error-text); }
  .b-rejected   { background: var(--error-bg); color: var(--error-text); }
  .b-rescheduled { background: var(--warning-bg); color: var(--warning-text); }

  /* Buttons */
  .btn {
    border: none; border-radius: var(--r-md);
    padding: 8px 14px; font-size: 12.5px; font-weight: 700;
    cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    transition: all .15s; font-family: inherit;
  }
  .btn:active { transform: scale(.97); }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-dark); }
  .btn-success { background: var(--success-bg); color: var(--success-text); }
  .btn-success:hover { background: #bbf7d0; }
  .btn-danger  { background: var(--error-bg); color: var(--error-text); }
  .btn-danger:hover { background: #fecaca; }
  .btn-ghost   { background: var(--bg); color: var(--text-sec); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--accent-light); color: var(--accent); border-color: #c7d2fe; }

  /* Empty state */
  .appt-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 72px 24px; text-align: center;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl);
  }
  .appt-empty-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: var(--accent-light); display: flex; align-items: center;
    justify-content: center; margin-bottom: 18px; color: var(--accent);
  }
  .appt-empty-title { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
  .appt-empty-sub { font-size: 13.5px; color: var(--text-sec); max-width: 320px; }

  /* Skeleton */
  .skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--r-xl);
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .sk-card { height: 96px; margin-bottom: 10px; }

  /* Modal */
  .appt-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.45);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px;
  }
  .appt-modal {
    background: var(--surface); border-radius: var(--r-xl);
    width: 100%; max-width: 560px; max-height: 90vh; overflow: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,.18);
    animation: apptSlideIn .2s ease;
  }
  .appt-modal-hdr {
    padding: 22px 24px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .appt-modal-title { font-size: 17px; font-weight: 800; }
  .appt-modal-close {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--bg); border: 1px solid var(--border);
    cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center;
    transition: background .15s;
  }
  .appt-modal-close:hover { background: var(--error-bg); color: var(--error-text); }
  .appt-modal-body { padding: 22px 24px; }
  .appt-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 16px; }
  .appt-modal-field {}
  .appt-modal-label { font-size: 10.5px; font-weight: 700; color: var(--text-muted); margin-bottom: 5px; text-transform: uppercase; letter-spacing: .05em; }
  .appt-modal-val { font-size: 14px; font-weight: 600; color: var(--text); }
  .appt-modal-divider { height: 1px; background: var(--border); margin: 18px 0; }
  .appt-modal-footer {
    padding: 16px 24px; border-top: 1px solid var(--border);
    display: flex; justify-content: flex-end; gap: 12px;
  }

  /* Toast */
  .appt-toast-wrap {
    position: fixed; bottom: 28px; right: 28px; z-index: 2000;
    display: flex; flex-direction: column; gap: 10px;
  }
  .appt-toast {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px; border-radius: var(--r-lg);
    box-shadow: 0 8px 32px rgba(0,0,0,.15);
    font-size: 13.5px; font-weight: 600; animation: apptSlideIn .25s ease;
  }
  .toast-success { background: var(--success-bg); color: var(--success-text); }
  .toast-error   { background: var(--error-bg);   color: var(--error-text); }
  .toast-info    { background: var(--info-bg);    color: var(--info-text); }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  @media (max-width: 1100px) {
    .appt-stats-row { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    .appt-content { padding: 16px; }
  }
`;

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
const Icon = {
  cal:     <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/></svg>,
  clock:   <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>,
  check:   <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>,
  cross:   <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/></svg>,
  search:  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>,
  bell:    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>,
  users:   <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>,
  video:   <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>,
  eye:     <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const AV_PALETTE = [
  { bg: "#E0E7FF", color: "#3730A3" },
  { bg: "#D1FAE5", color: "#065F46" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#DBEAFE", color: "#1D4ED8" },
  { bg: "#FEE2E2", color: "#991B1B" },
];
const getAvColor = (str = "") => {
  let h = 0;
  for (let c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AV_PALETTE[h % AV_PALETTE.length];
};
const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const STATUS_META = {
  pending:     { label: "Pending",     cls: "b-pending",    bar: "bar-pending" },
  accepted:    { label: "Accepted",    cls: "b-accepted",   bar: "bar-accepted" },
  confirmed:   { label: "Confirmed",   cls: "b-confirmed",  bar: "bar-confirmed" },
  completed:   { label: "Completed",   cls: "b-completed",  bar: "bar-completed" },
  cancelled:   { label: "Cancelled",   cls: "b-cancelled",  bar: "bar-cancelled" },
  rejected:    { label: "Rejected",    cls: "b-rejected",   bar: "bar-rejected" },
  rescheduled: { label: "Rescheduled", cls: "b-rescheduled",bar: "bar-rescheduled" },
};
const getMeta = (s) => STATUS_META[s] || STATUS_META.pending;

// ─── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, val, label, trend, trendCls, cls }) {
  return (
    <div className={`appt-stat-card ${cls}`}>
      <div className="appt-stat-top">
        <div>
          <div className="appt-stat-val">{val}</div>
          <div className="appt-stat-lbl">{label}</div>
          {trend && <div className={`appt-stat-trend ${trendCls}`}>{trend}</div>}
        </div>
        <div className="appt-stat-icon" style={{ background: iconBg }}>
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ appt, patientName, onAccept, onReject, onComplete, onView }) {
  const meta = getMeta(appt.status);
  const { bg, color } = getAvColor(patientName);
  return (
    <div className="appt-card">
      <div className="appt-card-inner">
        <div className={`appt-accent-bar ${meta.bar}`} />
        <div className="appt-body">
          <div className="appt-av" style={{ background: bg, color }}>{getInitials(patientName)}</div>
          <div className="appt-info">
            <div className="appt-name">{patientName}</div>
            <div className="appt-reason">{appt.reason || "No reason provided"}</div>
            <div className="appt-meta">
              <span className="appt-time-meta">{Icon.clock} {fmtDate(appt.date)} · {appt.timeSlot || "—"}</span>
              {(appt.type || appt.consultationType) && (
                <span className="appt-time-meta">{Icon.video} {appt.type || appt.consultationType}</span>
              )}
            </div>
          </div>
          <div className="appt-badge-wrap">
            <span className={`badge ${meta.cls}`}>{meta.label}</span>
          </div>
          <div className="appt-actions">
            {appt.status === "pending" && (
              <>
                <button className="btn btn-success" onClick={() => onAccept(appt)}>{Icon.check} Accept</button>
                <button className="btn btn-danger"  onClick={() => onReject(appt)}>{Icon.cross} Reject</button>
              </>
            )}
            {appt.status === "accepted" && (
              <button className="btn btn-primary" onClick={() => onComplete(appt)}>{Icon.video} Start</button>
            )}
            {(appt.status === "confirmed" || appt.status === "completed") && (
              <button className="btn btn-ghost" onClick={() => onView(appt)}>{Icon.eye} View</button>
            )}
            {(appt.status === "cancelled" || appt.status === "rejected") && (
              <button className="btn btn-ghost" onClick={() => onView(appt)}>{Icon.eye} Details</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ appt, patientName, onClose, onAccept, onReject }) {
  if (!appt) return null;
  const meta = getMeta(appt.status);
  return (
    <div className="appt-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="appt-modal">
        <div className="appt-modal-hdr">
          <div className="appt-modal-title">Appointment Details</div>
          <button className="appt-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="appt-modal-body">
          <div className="appt-modal-grid">
            <div className="appt-modal-field">
              <div className="appt-modal-label">Patient</div>
              <div className="appt-modal-val">{patientName}</div>
            </div>
            <div className="appt-modal-field">
              <div className="appt-modal-label">Status</div>
              <span className={`badge ${meta.cls}`}>{meta.label}</span>
            </div>
          </div>
          <div className="appt-modal-grid">
            <div className="appt-modal-field">
              <div className="appt-modal-label">Date</div>
              <div className="appt-modal-val">{fmtDate(appt.date)}</div>
            </div>
            <div className="appt-modal-field">
              <div className="appt-modal-label">Time Slot</div>
              <div className="appt-modal-val">{appt.timeSlot || "—"}</div>
            </div>
          </div>
          <div className="appt-modal-grid">
            <div className="appt-modal-field">
              <div className="appt-modal-label">Type</div>
              <div className="appt-modal-val">{appt.type || appt.consultationType || "—"}</div>
            </div>
            <div className="appt-modal-field">
              <div className="appt-modal-label">Booked</div>
              <div className="appt-modal-val">{fmtDate(appt.createdAt)}</div>
            </div>
          </div>
          <div className="appt-modal-divider" />
          <div className="appt-modal-field">
            <div className="appt-modal-label">Reason / Notes</div>
            <div className="appt-modal-val" style={{ color: "var(--text-sec)", fontWeight: 400, lineHeight: 1.6 }}>
              {appt.reason || "No reason provided"}
            </div>
          </div>
          {appt.doctorNotes && (
            <>
              <div className="appt-modal-divider" />
              <div className="appt-modal-field">
                <div className="appt-modal-label">Doctor's Notes</div>
                <div className="appt-modal-val" style={{ color: "var(--text-sec)", fontWeight: 400 }}>
                  {appt.doctorNotes}
                </div>
              </div>
            </>
          )}
        </div>
        {appt.status === "pending" && (
          <div className="appt-modal-footer">
            <button className="btn btn-danger" onClick={() => { onReject(appt); onClose(); }}>{Icon.cross} Reject</button>
            <button className="btn btn-success" onClick={() => { onAccept(appt); onClose(); }}>{Icon.check} Accept</button>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonList() {
  return <>{[1, 2, 3, 4].map((n) => <div key={n} className="skeleton sk-card" style={{ animationDelay: `${n * 0.08}s` }} />)}</>;
}

function ToastContainer({ toasts }) {
  return (
    <div className="appt-toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`appt-toast toast-${t.type}`}>
          {t.type === "success" && Icon.check}
          {t.type === "error"   && Icon.cross}
          {t.type === "info"    && Icon.clock}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DoctorAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments]   = useState([]);
  const [patientCache, setPatientCache]   = useState({});
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [activeTab, setActiveTab]         = useState("all");
  const [search, setSearch]               = useState("");
  const [typeFilter, setTypeFilter]       = useState("all");
  const [dateFilter, setDateFilter]       = useState("");
  const [selectedAppt, setSelectedAppt]   = useState(null);
  const [toasts, setToasts]               = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [doctorId, setDoctorId]           = useState(null);

  const toast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  // Fetch doctor profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    axios.get(`${DR_API}/doctors/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { setDoctorProfile(res.data); setDoctorId(res.data._id || res.data.id || res.data.userId); })
      .catch(() => toast("Could not load doctor profile", "error"));
  }, [navigate]);

  // Fetch patient name
  const fetchPatientName = useCallback(async (patientId) => {
    if (patientCache[patientId]) return patientCache[patientId];
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_GATEWAY}/auth/internal/users/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const name = `${res.data.firstName} ${res.data.lastName}`;
      setPatientCache((p) => ({ ...p, [patientId]: name }));
      return name;
    } catch {
      return `Patient …${patientId?.slice(-6)}`;
    }
  }, [patientCache]);

  // Fetch appointments
  const fetchAppointments = useCallback(async (showLoader = true) => {
    const token = localStorage.getItem("token");
    if (!token || !doctorId) return;
    if (showLoader) setLoading(true); else setRefreshing(true);
    try {
      const res = await axios.get(`${APPT_API}/appointments/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : res.data.appointments || [];

      // Enrich with patient names
      const enriched = data.map((a) => ({
        ...a,
        patientName: `${a.firstName || ""} ${a.lastName || ""}`.trim() || null,
      }));
      setAppointments(enriched);

      // Also fill cache from patientId if patientName missing
      const missing = enriched.filter((a) => !a.patientName && a.patientId);
      for (const a of missing) await fetchPatientName(a.patientId);
    } catch (err) {
      if (err.response?.status === 401) navigate("/login");
      else toast("Failed to load appointments", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [doctorId, navigate, toast, fetchPatientName]);

  useEffect(() => { if (doctorId) fetchAppointments(); }, [doctorId]);

  const getPatientName = (appt) =>
    appt.patientName || patientCache[appt.patientId] || `Patient …${appt.patientId?.slice(-6)}`;

  // Actions
  const handleAccept = async (appt) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${APPT_API}/appointments/${appt._id}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAppointments((p) => p.map((a) => a._id === appt._id ? { ...a, status: "confirmed" } : a));
      toast("Appointment confirmed", "success");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to confirm", "error");
    }
  };

  const handleReject = async (appt) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${APPT_API}/appointments/${appt._id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAppointments((p) => p.map((a) => a._id === appt._id ? { ...a, status: "rejected" } : a));
      toast("Appointment rejected", "error");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to reject", "error");
    }
  };

  const handleComplete = (appt) => navigate(`/video?appointmentId=${appt._id}&role=doctor`);

  // Filtering
  const filtered = appointments.filter((a) => {
    const name = getPatientName(a).toLowerCase();
    const reason = (a.reason || "").toLowerCase();
    const q = search.toLowerCase();
    const searchOk = !search || name.includes(q) || reason.includes(q);
    const tabOk = activeTab === "all" || a.status === activeTab;
    const typeOk = typeFilter === "all" || (a.type || a.consultationType) === typeFilter;
    const dateOk = !dateFilter || (a.date || "").startsWith(dateFilter);
    return searchOk && tabOk && typeOk && dateOk;
  });

  const counts = {
    all:         appointments.length,
    pending:     appointments.filter((a) => a.status === "pending").length,
    accepted:    appointments.filter((a) => a.status === "accepted").length,
    confirmed:   appointments.filter((a) => a.status === "confirmed").length,
    completed:   appointments.filter((a) => a.status === "completed").length,
    cancelled:   appointments.filter((a) => a.status === "cancelled").length,
    rejected:    appointments.filter((a) => a.status === "rejected").length,
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const TABS = [
    { key: "all", label: "All" },
    { key: "pending",   label: "Pending" },
    { key: "accepted",  label: "Accepted" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "rejected",  label: "Rejected" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="appt-dash">
        {/* ── Shared Sidebar ── */}
        <DoctorSidebar
          activeNav="appointments"
          doctorProfile={doctorProfile}
          pendingCount={counts.pending}
          confirmedCount={counts.confirmed}
        />

        {/* ── Main ── */}
        <div className="appt-main">
          <header className="appt-topbar">
            <div>
              <div className="appt-tb-title">Appointments</div>
              <div className="appt-tb-date">{today}</div>
            </div>
            <div className="appt-tb-right">
              <div className="appt-icon-btn">
                {Icon.bell}
                {counts.pending > 0 && <div className="notif-dot" />}
              </div>
            </div>
          </header>

          <div className="appt-content">
            {/* Stats */}
            <div className="appt-stats-row">
              <StatCard icon={Icon.cal}   iconBg="var(--accent-light)"  iconColor="var(--accent)"        val={counts.all}       label="Total Appointments"   trend={`${counts.confirmed} confirmed`}                  trendCls="trend-up"  cls="sc-indigo" />
              <StatCard icon={Icon.clock} iconBg="var(--warning-bg)"    iconColor="var(--warning-text)"  val={counts.pending}   label="Awaiting Response"    trend={counts.pending > 0 ? "Action required" : "All cleared"} trendCls={counts.pending > 0 ? "trend-up" : "trend-neu"} cls="sc-amber" />
              <StatCard icon={Icon.check} iconBg="var(--success-bg)"    iconColor="var(--success-text)"  val={counts.completed} label="Completed"             trend="Successfully done"                                trendCls="trend-up"  cls="sc-green" />
              <StatCard icon={Icon.users} iconBg="var(--info-bg)"       iconColor="var(--info-text)"     val={counts.accepted}  label="Accepted (Pending Pay)" trend="Awaiting confirmation"                           trendCls="trend-neu" cls="sc-blue" />
            </div>

            {/* Tabs */}
            <div className="appt-tabs">
              {TABS.map((t) => (
                <button key={t.key} className={`appt-tab${activeTab === t.key ? " active" : ""}`} onClick={() => setActiveTab(t.key)}>
                  {t.label}
                  <span className="appt-tab-count">{counts[t.key] ?? 0}</span>
                </button>
              ))}
            </div>

            {/* Filter Bar */}
            <div className="appt-filter-bar">
              <div className="appt-search-wrap">
                <span className="appt-search-icon">{Icon.search}</span>
                <input className="appt-search-input" placeholder="Search by patient name or reason…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="appt-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All types</option>
                <option value="video">Video</option>
                <option value="in-person">In-person</option>
              </select>
              <input type="date" className="appt-date-input" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
              <button className="appt-btn-refresh" onClick={() => fetchAppointments(false)} disabled={refreshing}>
                <span style={{ display: "inline-flex", animation: refreshing ? "spin 1s linear infinite" : "none" }}>{Icon.refresh}</span>
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {/* List */}
            <div className="appt-list">
              {loading ? <SkeletonList /> : filtered.length === 0 ? (
                <div className="appt-empty">
                  <div className="appt-empty-icon">{Icon.cal}</div>
                  <div className="appt-empty-title">No appointments found</div>
                  <div className="appt-empty-sub">{search || typeFilter !== "all" || dateFilter ? "Try adjusting your filters." : "You have no appointments in this category."}</div>
                </div>
              ) : filtered.map((appt) => (
                <AppointmentCard
                  key={appt._id || appt.id}
                  appt={appt}
                  patientName={getPatientName(appt)}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onComplete={handleComplete}
                  onView={(a) => setSelectedAppt(a)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedAppt && (
        <DetailModal
          appt={selectedAppt}
          patientName={getPatientName(selectedAppt)}
          onClose={() => setSelectedAppt(null)}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
      <ToastContainer toasts={toasts} />
    </>
  );
}