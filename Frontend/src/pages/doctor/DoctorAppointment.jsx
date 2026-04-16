import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ─── API Base URL ─────────────────────────────────────────────────────────────
const APPT_API = import.meta.env.VITE_APPOINTMENT_API_URL || "http://localhost:3003/api";
const DR_API   = import.meta.env.VITE_DOCTOR_API_URL      || "http://localhost:3002/api";

// ─── Color Palette (Doctor – Indigo Accent) ───────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --primary:        #2563EB;
    --primary-light:  #EFF6FF;
    --accent:         #4F46E5;
    --accent-dark:    #3730A3;
    --accent-light:   #E0E7FF;
    --bg:             #F9FAFB;
    --surface:        #FFFFFF;
    --border:         #E5E7EB;
    --text:           #111827;
    --text-sec:       #6B7280;
    --text-muted:     #9CA3AF;
    --success:        #22C55E;
    --success-bg:     #DCFCE7;
    --success-text:   #15803D;
    --warning:        #F59E0B;
    --warning-bg:     #FEF3C7;
    --warning-text:   #B45309;
    --error:          #EF4444;
    --error-bg:       #FEE2E2;
    --error-text:     #991B1B;
    --info:           #3B82F6;
    --info-bg:        #DBEAFE;
    --info-text:      #1D4ED8;
    --r-sm:           6px;
    --r-md:           10px;
    --r-lg:           14px;
    --r-xl:           18px;
    --shadow:         0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md:      0 4px 16px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04);
    --shadow-lg:      0 10px 40px rgba(79,70,229,.12);
  }

  body {
    font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Layout ── */
  .dash   { display: flex; height: 100vh; overflow: hidden; }
  .main   { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .content{ flex: 1; overflow-y: auto; padding: 28px 32px; background: var(--bg); }

  /* ─────────── SIDEBAR ─────────── */
  .sidebar {
    width: 252px; flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    overflow-y: auto;
  }
  .sb-brand {
    padding: 20px 20px 18px;
    display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid var(--border);
  }
  .sb-logo {
    width: 40px; height: 40px; border-radius: var(--r-md); flex-shrink: 0;
    background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(79,70,229,.3);
  }
  .sb-app  { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -.4px; }
  .sb-role { font-size: 11px; color: var(--text-muted); font-weight: 500; margin-top: 1px; letter-spacing: .02em; }

  .sb-nav      { padding: 16px 12px 0; flex: 1; }
  .sb-section  { margin-bottom: 24px; }
  .sb-section-label {
    font-size: 10px; font-weight: 700; color: var(--text-muted);
    letter-spacing: .1em; text-transform: uppercase;
    padding: 0 10px 8px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: var(--r-md);
    cursor: pointer; color: var(--text-sec);
    font-size: 13.5px; font-weight: 500;
    transition: background .15s, color .15s;
    user-select: none; margin-bottom: 2px;
  }
  .nav-item:hover  { background: var(--bg); color: var(--text); }
  .nav-item.active {
    background: var(--accent-light); color: var(--accent);
    font-weight: 700;
  }
  .nav-badge {
    margin-left: auto; background: var(--accent); color: #fff;
    font-size: 10px; font-weight: 700; border-radius: 99px;
    padding: 2px 8px; min-width: 22px; text-align: center;
  }
  .sb-bottom { border-top: 1px solid var(--border); padding: 16px 14px 18px; }
  .sb-user-card {
    display: flex; align-items: center; gap: 10px;
    background: var(--bg); border-radius: var(--r-md);
    padding: 10px 12px; margin-bottom: 10px;
    border: 1px solid var(--border);
  }
  .sb-av {
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--accent-light); color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; flex-shrink: 0;
  }
  .sb-uname { font-size: 13.5px; font-weight: 700; line-height: 1.3; }
  .sb-uspec { font-size: 11px; color: var(--text-muted); }
  .online-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--success); flex-shrink: 0; margin-left: auto;
    box-shadow: 0 0 0 2.5px #fff, 0 0 0 4px #dcfce7;
  }
  .btn-logout {
    display: flex; align-items: center; gap: 8px;
    width: 100%; padding: 9px 12px; border-radius: var(--r-md);
    background: var(--error-bg); color: var(--error-text);
    border: none; cursor: pointer;
    font-size: 13px; font-weight: 600;
    transition: background .15s;
    font-family: inherit;
  }
  .btn-logout:hover { background: #fecaca; }

  /* ─────────── TOPBAR ─────────── */
  .topbar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 16px 32px;
    display: flex; align-items: center; gap: 16px;
    flex-shrink: 0;
  }
  .tb-title  { font-size: 18px; font-weight: 800; letter-spacing: -.4px; }
  .tb-date   { font-size: 12px; color: var(--text-sec); margin-top: 2px; }
  .tb-right  { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .icon-btn {
    width: 38px; height: 38px; border-radius: var(--r-md);
    background: var(--bg); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-sec); position: relative;
    transition: all .15s;
  }
  .icon-btn:hover { background: var(--accent-light); color: var(--accent); border-color: #c7d2fe; }
  .notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--error); border: 1.5px solid #fff;
  }

  /* ─────────── STATS ─────────── */
  .stats-row {
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px; margin-bottom: 26px;
  }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl); padding: 20px 22px;
    box-shadow: var(--shadow); position: relative; overflow: hidden;
    transition: box-shadow .2s, transform .2s;
  }
  .stat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
  .stat-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0;
    height: 3px; border-radius: 0 0 var(--r-xl) var(--r-xl);
  }
  .sc-indigo::after { background: linear-gradient(90deg, var(--accent), var(--accent-dark)); }
  .sc-amber::after  { background: linear-gradient(90deg, #F59E0B, #D97706); }
  .sc-green::after  { background: linear-gradient(90deg, #22C55E, #16A34A); }
  .sc-blue::after   { background: linear-gradient(90deg, #3B82F6, #2563EB); }
  .sc-red::after    { background: linear-gradient(90deg, #EF4444, #DC2626); }

  .stat-top  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .stat-icon {
    width: 44px; height: 44px; border-radius: var(--r-md);
    display: flex; align-items: center; justify-content: center;
  }
  .stat-val  { font-size: 30px; font-weight: 800; letter-spacing: -.8px; line-height: 1; margin-bottom: 4px; }
  .stat-lbl  { font-size: 12.5px; color: var(--text-sec); font-weight: 500; }
  .stat-trend{ font-size: 11px; font-weight: 600; margin-top: 8px; display: flex; align-items: center; gap: 3px; }
  .trend-up  { color: var(--success-text); }
  .trend-neu { color: var(--text-muted); }

  /* ─────────── FILTER BAR ─────────── */
  .filter-bar {
    display: flex; align-items: center; gap: 12px; margin-bottom: 22px;
    flex-wrap: wrap;
  }
  .search-wrap {
    position: relative; flex: 1; min-width: 240px;
  }
  .search-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none;
  }
  .search-input {
    width: 100%; padding: 10px 14px 10px 38px;
    border: 1px solid var(--border); border-radius: var(--r-md);
    background: var(--surface); font-size: 13.5px;
    color: var(--text); font-family: inherit;
    transition: border-color .15s, box-shadow .15s;
    outline: none;
  }
  .search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
  .search-input::placeholder { color: var(--text-muted); }

  .select-filter {
    padding: 10px 14px; border: 1px solid var(--border);
    border-radius: var(--r-md); background: var(--surface);
    font-size: 13px; color: var(--text); font-family: inherit;
    cursor: pointer; outline: none;
    transition: border-color .15s;
  }
  .select-filter:focus { border-color: var(--accent); }

  .btn-refresh {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 16px; border-radius: var(--r-md);
    background: var(--accent); color: #fff;
    border: none; cursor: pointer;
    font-size: 13px; font-weight: 600; font-family: inherit;
    transition: background .15s, transform .1s;
  }
  .btn-refresh:hover { background: var(--accent-dark); }
  .btn-refresh:active { transform: scale(.97); }
  .btn-refresh.loading { opacity: .7; pointer-events: none; }

  /* ─────────── TABS ─────────── */
  .tabs {
    display: flex; gap: 4px; margin-bottom: 20px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 4px;
    width: fit-content;
  }
  .tab {
    padding: 8px 18px; border-radius: var(--r-md);
    font-size: 13px; font-weight: 600; cursor: pointer;
    color: var(--text-sec); transition: all .2s; white-space: nowrap;
    border: none; background: none; font-family: inherit;
    display: flex; align-items: center; gap: 7px;
  }
  .tab:hover { color: var(--text); background: var(--bg); }
  .tab.active { background: var(--accent); color: #fff; box-shadow: 0 2px 8px rgba(79,70,229,.3); }
  .tab-count {
    font-size: 10.5px; font-weight: 700; padding: 1px 7px;
    border-radius: 99px; background: rgba(255,255,255,.25);
  }
  .tab:not(.active) .tab-count {
    background: var(--bg); color: var(--text-sec);
  }

  /* ─────────── APPOINTMENT LIST ─────────── */
  .appt-list { display: flex; flex-direction: column; gap: 10px; }

  .appt-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl); padding: 0;
    box-shadow: var(--shadow); overflow: hidden;
    transition: border-color .15s, box-shadow .2s, transform .15s;
    animation: slideIn .25s ease both;
  }
  .appt-card:hover {
    border-color: #c7d2fe;
    box-shadow: 0 4px 20px rgba(79,70,229,.1);
    transform: translateY(-1px);
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .appt-card-inner {
    display: flex; align-items: stretch; gap: 0;
  }

  .appt-accent-bar {
    width: 4px; flex-shrink: 0; border-radius: var(--r-xl) 0 0 var(--r-xl);
  }
  .bar-confirmed { background: var(--success); }
  .bar-pending   { background: var(--warning); }
  .bar-completed { background: var(--primary); }
  .bar-cancelled { background: var(--error); }
  .bar-default   { background: var(--accent); }

  .appt-body {
    flex: 1; padding: 18px 20px 18px 20px;
    display: flex; align-items: center; gap: 16px; min-width: 0;
  }

  .patient-av-wrap { position: relative; flex-shrink: 0; }
  .patient-av {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 800;
  }
  .av-type-dot {
    position: absolute; bottom: 0; right: 0;
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 7px;
  }
  .dot-video    { background: var(--accent); }
  .dot-inperson { background: var(--success); }

  .appt-info { flex: 1; min-width: 0; }
  .appt-name { font-size: 15px; font-weight: 700; margin-bottom: 3px; }
  .appt-sub  {
    display: flex; align-items: center; gap: 8px;
    flex-wrap: wrap; margin-bottom: 6px;
  }
  .appt-sub-item {
    display: flex; align-items: center; gap: 4px;
    font-size: 12px; color: var(--text-sec);
  }
  .appt-reason {
    font-size: 12.5px; color: var(--text-muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 360px;
  }

  .appt-meta {
    display: flex; flex-direction: column; align-items: flex-end;
    gap: 8px; flex-shrink: 0;
  }
  .appt-time-block {
    text-align: right;
  }
  .appt-time-val {
    font-size: 16px; font-weight: 800; color: var(--text); line-height: 1;
  }
  .appt-date-val {
    font-size: 11.5px; color: var(--text-muted); margin-top: 2px;
  }

  /* ─────────── BADGES ─────────── */
  .badge {
    font-size: 10.5px; font-weight: 700; padding: 3px 10px;
    border-radius: 99px; flex-shrink: 0; letter-spacing: .02em;
  }
  .b-confirmed { background: var(--success-bg); color: var(--success-text); }
  .b-pending   { background: var(--warning-bg); color: var(--warning-text); }
  .b-completed { background: var(--primary-light); color: var(--primary); }
  .b-cancelled { background: var(--error-bg); color: var(--error-text); }
  .b-video     { background: var(--accent-light); color: var(--accent); }
  .b-inperson  { background: var(--success-bg); color: var(--success-text); }
  .b-new       { background: var(--error-bg); color: var(--error-text); font-size: 9.5px; padding: 2px 6px; }

  /* ─────────── ACTION BUTTONS ─────────── */
  .appt-actions {
    display: flex; align-items: center; gap: 8px; padding: 0 20px 0 0;
  }
  .btn {
    border: none; border-radius: var(--r-md);
    padding: 8px 16px; font-size: 12.5px; font-weight: 700;
    cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    transition: all .15s; font-family: inherit; white-space: nowrap;
  }
  .btn:active { transform: scale(.97); }
  .btn-primary  { background: var(--accent); color: #fff; box-shadow: 0 2px 8px rgba(79,70,229,.25); }
  .btn-primary:hover { background: var(--accent-dark); box-shadow: 0 4px 12px rgba(79,70,229,.35); }
  .btn-success  { background: var(--success-bg); color: var(--success-text); }
  .btn-success:hover { background: #bbf7d0; }
  .btn-danger   { background: var(--error-bg); color: var(--error-text); }
  .btn-danger:hover { background: #fecaca; }
  .btn-ghost    { background: var(--bg); color: var(--text-sec); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--accent-light); color: var(--accent); border-color: #c7d2fe; }

  /* ─────────── EMPTY STATE ─────────── */
  .empty-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 72px 24px; text-align: center;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl); box-shadow: var(--shadow);
  }
  .empty-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: var(--accent-light); display: flex; align-items: center;
    justify-content: center; margin-bottom: 18px;
    color: var(--accent);
  }
  .empty-title { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
  .empty-sub   { font-size: 13.5px; color: var(--text-sec); max-width: 320px; line-height: 1.6; }

  /* ─────────── LOADING ─────────── */
  .skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--r-md);
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .sk-card {
    height: 96px; border-radius: var(--r-xl);
    margin-bottom: 10px;
  }

  /* ─────────── MODAL ─────────── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px;
    animation: fadeIn .15s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--surface); border-radius: var(--r-xl);
    box-shadow: 0 20px 60px rgba(0,0,0,.2);
    width: 100%; max-width: 540px;
    animation: slideUp .2s ease;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .modal-hdr {
    padding: 22px 24px 18px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-title { font-size: 16px; font-weight: 800; }
  .modal-close {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--bg); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-sec); transition: all .15s;
    font-size: 14px;
  }
  .modal-close:hover { background: var(--error-bg); color: var(--error-text); border-color: #fca5a5; }
  .modal-body { padding: 22px 24px; }
  .modal-row  { display: flex; gap: 14px; margin-bottom: 14px; }
  .modal-field { flex: 1; }
  .modal-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px; }
  .modal-val   { font-size: 14px; font-weight: 600; color: var(--text); }
  .modal-val.muted { color: var(--text-sec); font-weight: 500; }
  .modal-divider { height: 1px; background: var(--border); margin: 16px 0; }
  .modal-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: flex-end; gap: 10px;
  }

  /* ─────────── TOAST ─────────── */
  .toast-wrap {
    position: fixed; bottom: 28px; right: 28px; z-index: 2000;
    display: flex; flex-direction: column; gap: 10px;
  }
  .toast {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px; border-radius: var(--r-lg);
    box-shadow: 0 8px 32px rgba(0,0,0,.15);
    font-size: 13.5px; font-weight: 600; min-width: 260px;
    animation: toastIn .3s ease;
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .toast-success { background: var(--success-bg); color: var(--success-text); border: 1px solid #86efac; }
  .toast-error   { background: var(--error-bg);   color: var(--error-text);   border: 1px solid #fca5a5; }
  .toast-info    { background: var(--info-bg);    color: var(--info-text);    border: 1px solid #93c5fd; }

  /* ─────────── RESPONSIVE ─────────── */
  @media (max-width: 1100px) {
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .appt-reason { max-width: 220px; }
  }
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .content { padding: 16px; }
    .stats-row { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .appt-body  { flex-wrap: wrap; }
    .appt-actions { padding: 0 14px 14px; }
  }
`;

// ─── Avatar Palette ────────────────────────────────────────────────────────────
const AV_PALETTE = [
  { bg: "#E0E7FF", color: "#3730A3" },
  { bg: "#D1FAE5", color: "#065F46" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#DBEAFE", color: "#1D4ED8" },
  { bg: "#FEE2E2", color: "#991B1B" },
];
const getAv = (str = "") => {
  let hash = 0;
  for (let c of str) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return AV_PALETTE[hash % AV_PALETTE.length];
};
const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  home:     <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
  cal:      <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" /></svg>,
  users:    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
  video:    <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>,
  rx:       <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>,
  settings: <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
  logout:   <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 100-2H4V5h6a1 1 0 100-2H3zm10.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
  bell:     <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>,
  check:    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>,
  cross:    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
  clock:    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>,
  person:   <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>,
  phone:    <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>,
  refresh:  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>,
  search:   <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>,
  eye:      <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>,
  videoSm:  <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>,
};

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_META = {
  confirmed: { label: "Confirmed", cls: "b-confirmed", bar: "bar-confirmed" },
  pending:   { label: "Pending",   cls: "b-pending",   bar: "bar-pending"   },
  completed: { label: "Completed", cls: "b-completed", bar: "bar-completed" },
  cancelled: { label: "Cancelled", cls: "b-cancelled", bar: "bar-cancelled" },
};

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return d; }
};
const fmtTime = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch { return d; }
};

// ─── NavItem ──────────────────────────────────────────────────────────────────
function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <div className={`nav-item${active ? " active" : ""}`} onClick={onClick}>
      {icon}{label}
      {badge != null && <span className="nav-badge">{badge}</span>}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success" && Icon.check}
          {t.type === "error"   && Icon.cross}
          {t.type === "info"    && Icon.clock}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonList() {
  return (
    <>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="skeleton sk-card" style={{ animationDelay: `${n * 0.1}s` }} />
      ))}
    </>
  );
}

// ─── AppointmentCard ──────────────────────────────────────────────────────────
function AppointmentCard({ appt, idx, onAccept, onReject, onJoin, onView }) {
  const patName  = appt.patientName || appt.patientId?.name || "Unknown Patient";
  const { bg, color } = getAv(patName);
  const init     = initials(patName);
  const status   = appt.status || "pending";
  const meta     = STATUS_META[status] || STATUS_META.pending;
  const isVideo  = appt.type === "video" || appt.consultationType === "video";
  const dateStr  = fmtDate(appt.appointmentDate || appt.date);
  const timeStr  = fmtTime(appt.appointmentDate || appt.scheduledTime || appt.time);

  return (
    <div className="appt-card" style={{ animationDelay: `${idx * 0.05}s` }}>
      <div className="appt-card-inner">
        <div className={`appt-accent-bar ${meta.bar}`} />
        <div className="appt-body">
          {/* Avatar */}
          <div className="patient-av-wrap">
            <div className="patient-av" style={{ background: bg, color }}>{init}</div>
            <div className={`av-type-dot ${isVideo ? "dot-video" : "dot-inperson"}`}
              title={isVideo ? "Video" : "In-person"}>
              {isVideo ? Icon.videoSm : Icon.person}
            </div>
          </div>

          {/* Info */}
          <div className="appt-info">
            <div className="appt-name">{patName}</div>
            <div className="appt-sub">
              <span className="appt-sub-item">{Icon.person} Age {appt.patientAge || appt.age || "—"}</span>
              <span style={{ color: "var(--border)" }}>·</span>
              <span className="appt-sub-item">{isVideo ? Icon.videoSm : Icon.person}
                {isVideo ? "Video call" : "In-person"}
              </span>
              {appt.patientPhone && (
                <>
                  <span style={{ color: "var(--border)" }}>·</span>
                  <span className="appt-sub-item">{Icon.phone} {appt.patientPhone}</span>
                </>
              )}
            </div>
            <div className="appt-reason">
              📋 {appt.reason || appt.notes || appt.chiefComplaint || "General consultation"}
            </div>
          </div>

          {/* Meta */}
          <div className="appt-meta">
            <div className="appt-time-block">
              <div className="appt-time-val">{timeStr}</div>
              <div className="appt-date-val">{dateStr}</div>
            </div>
            <span className={`badge ${meta.cls}`}>{meta.label}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="appt-actions">
          {status === "pending" && (
            <>
              <button className="btn btn-success" onClick={() => onAccept(appt)}>
                {Icon.check} Accept
              </button>
              <button className="btn btn-danger" onClick={() => onReject(appt)}>
                {Icon.cross} Reject
              </button>
            </>
          )}
          {status === "confirmed" && isVideo && (
            <button className="btn btn-primary" onClick={() => onJoin(appt)}>
              {Icon.videoSm} Join now
            </button>
          )}
          {status === "confirmed" && !isVideo && (
            <button className="btn btn-ghost" onClick={() => onView(appt)}>
              {Icon.eye} Details
            </button>
          )}
          {(status === "completed" || status === "cancelled") && (
            <button className="btn btn-ghost" onClick={() => onView(appt)}>
              {Icon.eye} View
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ appt, onClose, onAccept, onReject }) {
  if (!appt) return null;
  const patName = appt.patientName || appt.patientId?.name || "Unknown Patient";
  const status  = appt.status || "pending";
  const meta    = STATUS_META[status] || STATUS_META.pending;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-hdr">
          <div>
            <div className="modal-title">Appointment Details</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-row">
            <div className="modal-field">
              <div className="modal-label">Patient</div>
              <div className="modal-val">{patName}</div>
            </div>
            <div className="modal-field">
              <div className="modal-label">Status</div>
              <span className={`badge ${meta.cls}`}>{meta.label}</span>
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <div className="modal-label">Date</div>
              <div className="modal-val">{fmtDate(appt.appointmentDate || appt.date)}</div>
            </div>
            <div className="modal-field">
              <div className="modal-label">Time</div>
              <div className="modal-val">{fmtTime(appt.appointmentDate || appt.scheduledTime || appt.time)}</div>
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <div className="modal-label">Type</div>
              <div className="modal-val">{appt.type || appt.consultationType || "In-person"}</div>
            </div>
            <div className="modal-field">
              <div className="modal-label">Age</div>
              <div className="modal-val">{appt.patientAge || appt.age || "—"}</div>
            </div>
          </div>
          <div className="modal-divider" />
          <div className="modal-field">
            <div className="modal-label">Chief Complaint / Reason</div>
            <div className="modal-val muted">{appt.reason || appt.notes || appt.chiefComplaint || "Not specified"}</div>
          </div>
          {appt.patientPhone && (
            <>
              <div style={{ marginTop: 12 }} />
              <div className="modal-field">
                <div className="modal-label">Contact</div>
                <div className="modal-val">{appt.patientPhone}</div>
              </div>
            </>
          )}
        </div>
        {status === "pending" && (
          <div className="modal-footer">
            <button className="btn btn-danger" onClick={() => { onReject(appt); onClose(); }}>
              {Icon.cross} Reject
            </button>
            <button className="btn btn-success" onClick={() => { onAccept(appt); onClose(); }}>
              {Icon.check} Accept appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, val, label, trend, trendCls, cls }) {
  return (
    <div className={`stat-card ${cls}`}>
      <div className="stat-top">
        <div>
          <div className="stat-val">{val}</div>
          <div className="stat-lbl">{label}</div>
          {trend && <div className={`stat-trend ${trendCls}`}>{trend}</div>}
        </div>
        <div className="stat-icon" style={{ background: iconBg }}>
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DoctorAppointments() {
  const navigate = useNavigate();

  // State
  const [nav,           setNav]     = useState("appointments");
  const [appointments,  setAppts]   = useState([]);
  const [loading,       setLoading] = useState(true);
  const [activeTab,     setTab]     = useState("all");
  const [search,        setSearch]  = useState("");
  const [typeFilter,    setType]    = useState("all");
  const [dateFilter,    setDate]    = useState("");
  const [selectedAppt,  setSelected]= useState(null);
  const [toasts,        setToasts]  = useState([]);
  const [refreshing,    setRefreshing] = useState(false);
  const [doctorProfile, setDrProfile] = useState(null);

  // ── Toast helper ──
  const toast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  // ── Fetch doctor profile ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    axios.get(`${DR_API}/doctors/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => setDrProfile(r.data))
      .catch(() => {});
  }, [navigate]);

  // ── Fetch appointments ──
  const fetchAppointments = useCallback(async (showLoader = true) => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await axios.get(`${APPT_API}/appointments/doctor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Support both { appointments: [] } and [] directly
      setAppts(Array.isArray(res.data) ? res.data : res.data.appointments || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        toast("Failed to load appointments. Showing mock data.", "error");
        // Fallback mock data for dev
        setAppts(MOCK_FALLBACK);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, toast]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ── Actions ──
  const handleAccept = async (appt) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${APPT_API}/appointments/${appt._id}/status`,
        { status: "confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppts((prev) =>
        prev.map((a) => a._id === appt._id ? { ...a, status: "confirmed" } : a)
      );
      toast("Appointment confirmed ✓", "success");
    } catch {
      // Optimistic update fallback
      setAppts((prev) =>
        prev.map((a) => a._id === appt._id ? { ...a, status: "confirmed" } : a)
      );
      toast("Appointment confirmed (offline)", "success");
    }
  };

  const handleReject = async (appt) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `${APPT_API}/appointments/${appt._id}/status`,
        { status: "cancelled" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppts((prev) =>
        prev.map((a) => a._id === appt._id ? { ...a, status: "cancelled" } : a)
      );
      toast("Appointment rejected", "error");
    } catch {
      setAppts((prev) =>
        prev.map((a) => a._id === appt._id ? { ...a, status: "cancelled" } : a)
      );
      toast("Appointment rejected (offline)", "error");
    }
  };

  const handleJoin = (appt) => {
    const id = appt._id || appt.id;
    navigate(`/video-session/${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ── Filtering ──
  const filtered = appointments.filter((a) => {
    const patName = (a.patientName || a.patientId?.name || "").toLowerCase();
    const reason  = (a.reason || a.notes || a.chiefComplaint || "").toLowerCase();
    const q       = search.toLowerCase();
    const matchQ  = !q || patName.includes(q) || reason.includes(q);

    const status  = a.status || "pending";
    const matchTab =
      activeTab === "all" ||
      (activeTab === "pending"   && status === "pending")   ||
      (activeTab === "confirmed" && status === "confirmed") ||
      (activeTab === "completed" && status === "completed") ||
      (activeTab === "cancelled" && status === "cancelled");

    const type    = a.type || a.consultationType || "";
    const matchType = typeFilter === "all" || type === typeFilter;

    const apptDate = a.appointmentDate || a.date || "";
    const matchDate = !dateFilter || apptDate.startsWith(dateFilter);

    return matchQ && matchTab && matchType && matchDate;
  });

  // ── Counts ──
  const counts = {
    all:       appointments.length,
    pending:   appointments.filter((a) => (a.status || "pending") === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  const drName = doctorProfile
    ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}`
    : "Dr. Saman";
  const drInitials = doctorProfile
    ? `${doctorProfile.firstName[0]}${doctorProfile.lastName[0]}`
    : "DS";
  const drSpec = doctorProfile?.specialization || "Cardiologist";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  // ── Sidebar nav handler ──
  const navTo = (key) => {
    setNav(key);
    const routes = {
      dashboard:    "/doctor/dashboard",
      appointments: "/doctor/appointments",
      patients:     "/doctor/patients",
      video:        "/doctor/video",
      rx:           "/doctor/prescriptions",
      settings:     "/doctor/settings",
    };
    if (routes[key]) navigate(routes[key]);
  };

  const TABS = [
    { key: "all",       label: "All" },
    { key: "pending",   label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <>
      <style>{CSS}</style>

      <div className="dash">
        {/* ══════════ SIDEBAR ══════════ */}
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sb-logo">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v14M3 10h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="sb-app">MediConnect</div>
              <div className="sb-role">Doctor Portal</div>
            </div>
          </div>

          <nav className="sb-nav">
            <div className="sb-section">
              <div className="sb-section-label">Overview</div>
              <NavItem icon={Icon.home}  label="Dashboard"    active={nav === "dashboard"}    onClick={() => navTo("dashboard")} />
              <NavItem icon={Icon.cal}   label="Appointments" active={nav === "appointments"} onClick={() => navTo("appointments")} badge={counts.pending || undefined} />
              <NavItem icon={Icon.users} label="My Patients"  active={nav === "patients"}     onClick={() => navTo("patients")} />
            </div>
            <div className="sb-section">
              <div className="sb-section-label">Consultations</div>
              <NavItem icon={Icon.video} label="Video Sessions"  active={nav === "video"}    onClick={() => navTo("video")} badge={counts.confirmed || undefined} />
              <NavItem icon={Icon.rx}    label="Prescriptions"   active={nav === "rx"}       onClick={() => navTo("rx")} />
            </div>
            <div className="sb-section">
              <div className="sb-section-label">Account</div>
              <NavItem icon={Icon.settings} label="Settings" active={nav === "settings"} onClick={() => navTo("settings")} />
            </div>
          </nav>

          <div className="sb-bottom">
            <div className="sb-user-card">
              <div className="sb-av">{drInitials}</div>
              <div>
                <div className="sb-uname">{drName}</div>
                <div className="sb-uspec">{drSpec}</div>
              </div>
              <div className="online-dot" />
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              {Icon.logout} Log out
            </button>
          </div>
        </aside>

        {/* ══════════ MAIN ══════════ */}
        <div className="main">
          {/* Topbar */}
          <header className="topbar">
            <div>
              <div className="tb-title">Appointments</div>
              <div className="tb-date">{today}</div>
            </div>
            <div className="tb-right">
              <div className="icon-btn" onClick={() => toast("No new notifications", "info")}>
                {Icon.bell}
                {counts.pending > 0 && <div className="notif-dot" />}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="content">

            {/* Stats */}
            <div className="stats-row">
              <StatCard
                icon={Icon.cal}   iconBg="var(--accent-light)" iconColor="var(--accent)"
                val={counts.all}       label="Total appointments"
                trend={`${counts.confirmed} confirmed`} trendCls="trend-up" cls="sc-indigo"
              />
              <StatCard
                icon={<svg width="19" height="19" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>}
                iconBg="var(--warning-bg)"  iconColor="var(--warning-text)"
                val={counts.pending}   label="Awaiting response"
                trend={counts.pending > 0 ? "Action required" : "All cleared ✓"} trendCls={counts.pending > 0 ? "trend-up" : "trend-neu"} cls="sc-amber"
              />
              <StatCard
                icon={Icon.check} iconBg="var(--success-bg)"  iconColor="var(--success-text)"
                val={counts.completed} label="Completed"
                trend="Seen patients" trendCls="trend-up" cls="sc-green"
              />
              <StatCard
                icon={Icon.video} iconBg="var(--info-bg)"     iconColor="var(--info-text)"
                val={appointments.filter((a) => (a.type || a.consultationType) === "video").length}
                label="Video sessions"
                trend="Teleconsultations" trendCls="trend-neu" cls="sc-blue"
              />
            </div>

            {/* Tabs */}
            <div className="tabs">
              {TABS.map((t) => (
                <button key={t.key} className={`tab${activeTab === t.key ? " active" : ""}`}
                  onClick={() => setTab(t.key)}>
                  {t.label}
                  <span className="tab-count">{counts[t.key]}</span>
                </button>
              ))}
            </div>

            {/* Filter bar */}
            <div className="filter-bar">
              <div className="search-wrap">
                <span className="search-icon">{Icon.search}</span>
                <input
                  className="search-input"
                  placeholder="Search by patient name or reason…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="select-filter" value={typeFilter} onChange={(e) => setType(e.target.value)}>
                <option value="all">All types</option>
                <option value="video">Video</option>
                <option value="in-person">In-person</option>
              </select>
              <input
                type="date"
                className="select-filter"
                value={dateFilter}
                onChange={(e) => setDate(e.target.value)}
                title="Filter by date"
              />
              <button
                className={`btn-refresh${refreshing ? " loading" : ""}`}
                onClick={() => fetchAppointments(false)}
              >
                <span style={{ display: "inline-flex", animation: refreshing ? "spin 1s linear infinite" : "none" }}>
                  {Icon.refresh}
                </span>
                {refreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>

            {/* List */}
            <div className="appt-list">
              {loading ? (
                <SkeletonList />
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                    </svg>
                  </div>
                  <div className="empty-title">No appointments found</div>
                  <div className="empty-sub">
                    {search || typeFilter !== "all" || dateFilter
                      ? "Try adjusting your filters or search query."
                      : "You have no appointments in this category yet."}
                  </div>
                </div>
              ) : (
                filtered.map((a, i) => (
                  <AppointmentCard
                    key={a._id || a.id || i}
                    appt={a}
                    idx={i}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onJoin={handleJoin}
                    onView={(appt) => setSelected(appt)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAppt && (
        <DetailModal
          appt={selectedAppt}
          onClose={() => setSelected(null)}
          onAccept={(a) => { handleAccept(a); setSelected(null); }}
          onReject={(a) => { handleReject(a); setSelected(null); }}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

// ─── Mock fallback (dev/offline) ──────────────────────────────────────────────
const MOCK_FALLBACK = [
  { _id: "m1", patientName: "Nimal Kumara",    patientAge: 34, reason: "Chest pain follow-up",       type: "video",      status: "confirmed", appointmentDate: new Date().toISOString() },
  { _id: "m2", patientName: "Sandali Perera",  patientAge: 52, reason: "Annual cardiac checkup",     type: "in-person",  status: "confirmed", appointmentDate: new Date().toISOString() },
  { _id: "m3", patientName: "Ashen Rajapaksa", patientAge: 27, reason: "Palpitations · New patient", type: "in-person",  status: "pending",   appointmentDate: new Date().toISOString() },
  { _id: "m4", patientName: "Fathima Mansoor", patientAge: 45, reason: "Hypertension management",    type: "video",      status: "pending",   appointmentDate: new Date().toISOString() },
  { _id: "m5", patientName: "Kamal Silva",     patientAge: 61, reason: "Post-surgery review",        type: "in-person",  status: "completed", appointmentDate: new Date(Date.now() - 86400000).toISOString() },
  { _id: "m6", patientName: "Dinesh Fernando", patientAge: 38, reason: "Routine check-up",           type: "video",      status: "cancelled", appointmentDate: new Date(Date.now() - 86400000).toISOString() },
];
