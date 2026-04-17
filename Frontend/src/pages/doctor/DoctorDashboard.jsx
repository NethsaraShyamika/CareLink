import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// ─── API Base URL ─────────────────────────────────────────────────────────────
const APPT_API = import.meta.env.VITE_APPOINTMENT_API_URL || "http://localhost:5002/api";
const AUTH_API = import.meta.env.VITE_AUTH_API_URL || "http://localhost:3001/api";

// ─── Color Palette (Doctor – Indigo Accent) ───────────────────────────────────
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
    --r-sm: 6px;
    --r-md: 10px;
    --r-lg: 14px;
    --r-xl: 18px;
    --shadow: 0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04);
    --shadow-lg: 0 10px 40px rgba(79,70,229,.12);
  }

  body {
    font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  .dash { display: flex; height: 100vh; overflow: hidden; }
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .content { flex: 1; overflow-y: auto; padding: 28px 32px; background: var(--bg); }

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
  .sb-app { font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -.4px; }
  .sb-role { font-size: 11px; color: var(--text-muted); font-weight: 500; margin-top: 1px; }

  .sb-nav { padding: 16px 12px 0; flex: 1; }
  .sb-section { margin-bottom: 24px; }
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
  .nav-item:hover { background: var(--bg); color: var(--text); }
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
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }
  .sb-user-card:hover {
    background: var(--accent-light);
    border-color: var(--accent);
  }
  .sb-user-card:active {
    transform: scale(0.98);
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

  .topbar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 16px 32px;
    display: flex; align-items: center; gap: 16px;
    flex-shrink: 0;
  }
  .tb-title { font-size: 18px; font-weight: 800; letter-spacing: -.4px; }
  .tb-date { font-size: 12px; color: var(--text-sec); margin-top: 2px; }
  .tb-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
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
  .sc-amber::after { background: linear-gradient(90deg, #F59E0B, #D97706); }
  .sc-green::after { background: linear-gradient(90deg, #22C55E, #16A34A); }
  .sc-blue::after { background: linear-gradient(90deg, #3B82F6, #2563EB); }
  .sc-red::after { background: linear-gradient(90deg, #EF4444, #DC2626); }

  .stat-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .stat-icon {
    width: 44px; height: 44px; border-radius: var(--r-md);
    display: flex; align-items: center; justify-content: center;
  }
  .stat-val { font-size: 30px; font-weight: 800; letter-spacing: -.8px; line-height: 1; margin-bottom: 4px; }
  .stat-lbl { font-size: 12.5px; color: var(--text-sec); font-weight: 500; }
  .stat-trend { font-size: 11px; font-weight: 600; margin-top: 8px; display: flex; align-items: center; gap: 3px; }
  .trend-up { color: var(--success-text); }
  .trend-neu { color: var(--text-muted); }

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

  .select-filter {
    padding: 10px 14px; border: 1px solid var(--border);
    border-radius: var(--r-md); background: var(--surface);
    font-size: 13px; color: var(--text); font-family: inherit;
    cursor: pointer; outline: none;
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

  .appt-list { display: flex; flex-direction: column; gap: 10px; }
  .appt-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl); padding: 0;
    box-shadow: var(--shadow); overflow: hidden;
    transition: border-color .15s, box-shadow .2s, transform .15s;
    animation: slideIn .25s ease both;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .appt-card-inner { display: flex; align-items: stretch; gap: 0; }
  .appt-accent-bar {
    width: 4px; flex-shrink: 0; border-radius: var(--r-xl) 0 0 var(--r-xl);
  }
  .bar-pending { background: var(--warning); }
  .bar-accepted { background: var(--primary); }
  .bar-confirmed { background: var(--success); }
  .bar-completed { background: var(--info); }
  .bar-cancelled { background: var(--error); }
  .bar-rescheduled { background: var(--warning); }

  .appt-body { flex: 1; padding: 18px 20px; display: flex; align-items: center; gap: 16px; min-width: 0; }
  .patient-av {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 800; flex-shrink: 0;
  }
  .appt-info { flex: 1; min-width: 0; }
  .appt-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
  .appt-reason { font-size: 12.5px; color: var(--text-muted); margin-bottom: 6px; }
  .appt-meta { display: flex; gap: 12px; font-size: 11.5px; color: var(--text-sec); }
  .appt-date { display: flex; align-items: center; gap: 4px; }
  .appt-actions { display: flex; align-items: center; gap: 8px; padding-right: 20px; }

  .badge {
    font-size: 10.5px; font-weight: 700; padding: 3px 10px;
    border-radius: 99px; flex-shrink: 0;
  }
  .b-pending { background: var(--warning-bg); color: var(--warning-text); }
  .b-accepted { background: var(--info-bg); color: var(--info-text); }
  .b-confirmed { background: var(--success-bg); color: var(--success-text); }
  .b-completed { background: var(--primary-light); color: var(--primary); }
  .b-cancelled { background: var(--error-bg); color: var(--error-text); }
  .b-rescheduled { background: var(--warning-bg); color: var(--warning-text); }

  .btn {
    border: none; border-radius: var(--r-md);
    padding: 8px 16px; font-size: 12.5px; font-weight: 700;
    cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    transition: all .15s; font-family: inherit;
  }
  .btn:active { transform: scale(.97); }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-dark); }
  .btn-success { background: var(--success-bg); color: var(--success-text); }
  .btn-success:hover { background: #bbf7d0; }
  .btn-danger { background: var(--error-bg); color: var(--error-text); }
  .btn-danger:hover { background: #fecaca; }
  .btn-ghost { background: var(--bg); color: var(--text-sec); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--accent-light); color: var(--accent); border-color: #c7d2fe; }

  .empty-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 72px 24px; text-align: center;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl);
  }
  .empty-icon {
    width: 72px; height: 72px; border-radius: 50%;
    background: var(--accent-light); display: flex; align-items: center;
    justify-content: center; margin-bottom: 18px;
    color: var(--accent);
  }
  .empty-title { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
  .empty-sub { font-size: 13.5px; color: var(--text-sec); max-width: 320px; }

  .skeleton {
    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--r-md);
  }
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .sk-card { height: 96px; border-radius: var(--r-xl); margin-bottom: 10px; }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px;
  }
  .modal {
    background: var(--surface); border-radius: var(--r-xl);
    width: 100%; max-width: 540px; max-height: 90vh; overflow: auto;
  }
  .modal-hdr {
    padding: 22px 24px; border-bottom: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
  }
  .modal-title { font-size: 16px; font-weight: 800; }
  .modal-close {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--bg); border: 1px solid var(--border);
    cursor: pointer; font-size: 18px;
  }
  .modal-body { padding: 22px 24px; }
  .modal-row { display: flex; gap: 16px; margin-bottom: 16px; }
  .modal-field { flex: 1; }
  .modal-label { font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; }
  .modal-val { font-size: 14px; font-weight: 600; }
  .modal-divider { height: 1px; background: var(--border); margin: 16px 0; }
  .modal-footer {
    padding: 16px 24px; border-top: 1px solid var(--border);
    display: flex; justify-content: flex-end; gap: 12px;
  }

  .toast-wrap {
    position: fixed; bottom: 28px; right: 28px; z-index: 2000;
    display: flex; flex-direction: column; gap: 10px;
  }
  .toast {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px; border-radius: var(--r-lg);
    box-shadow: 0 8px 32px rgba(0,0,0,.15);
    font-size: 13.5px; font-weight: 600;
  }
  .toast-success { background: var(--success-bg); color: var(--success-text); }
  .toast-error { background: var(--error-bg); color: var(--error-text); }
  .toast-info { background: var(--info-bg); color: var(--info-text); }

  @media (max-width: 1100px) {
    .stats-row { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .content { padding: 16px; }
    .appt-body { flex-wrap: wrap; }
    .appt-actions { padding: 0 20px 20px; }
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  home: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>,
  cal: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/></svg>,
  users: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>,
  video: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>,
  rx: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>,
  logout: <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 100-2H4V5h6a1 1 0 100-2H3zm10.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>,
  bell: <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>,
  cross: <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>,
  clock: <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>,
  refresh: <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/></svg>,
  search: <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>,
  videoSm: <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>,
};

// ─── Avatar Palette ────────────────────────────────────────────────────────────
const AV_PALETTE = [
  { bg: "#E0E7FF", color: "#3730A3" },
  { bg: "#D1FAE5", color: "#065F46" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#DBEAFE", color: "#1D4ED8" },
  { bg: "#FEE2E2", color: "#991B1B" },
];

const getAvatar = (str = "") => {
  let hash = 0;
  for (let c of str) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return AV_PALETTE[hash % AV_PALETTE.length];
};

// ─── Helper Functions ─────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    year: "numeric" 
  });
};

const formatTime = (timeSlot) => timeSlot || "—";

const getStatusMeta = (status) => {
  const meta = {
    pending: { label: "Pending", class: "b-pending", bar: "bar-pending" },
    accepted: { label: "Accepted", class: "b-accepted", bar: "bar-accepted" },
    confirmed: { label: "Confirmed", class: "b-confirmed", bar: "bar-confirmed" },
    completed: { label: "Completed", class: "b-completed", bar: "bar-completed" },
    cancelled: { label: "Cancelled", class: "b-cancelled", bar: "bar-cancelled" },
    rescheduled: { label: "Rescheduled", class: "b-rescheduled", bar: "bar-rescheduled" },
  };
  return meta[status] || meta.pending;
};

// ─── Components ───────────────────────────────────────────────────────────────
function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <div className={`nav-item${active ? " active" : ""}`} onClick={onClick}>
      {icon}{label}
      {badge != null && <span className="nav-badge">{badge}</span>}
    </div>
  );
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === "success" && Icon.check}
          {t.type === "error" && Icon.cross}
          {t.type === "info" && Icon.clock}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function SkeletonList() {
  return (
    <>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="skeleton sk-card" style={{ animationDelay: `${n * 0.1}s` }} />
      ))}
    </>
  );
}

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

function AppointmentCard({ appt, patientName, onAccept, onReject, onComplete, onView }) {
  const statusMeta = getStatusMeta(appt.status);
  const { bg, color } = getAvatar(patientName);
  const initials = patientName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="appt-card">
      <div className="appt-card-inner">
        <div className={`appt-accent-bar ${statusMeta.bar}`} />
        <div className="appt-body">
          <div className="patient-av" style={{ background: bg, color }}>
            {initials}
          </div>
          <div className="appt-info">
            <div className="appt-name">{patientName}</div>
            <div className="appt-reason">{appt.reason || "No reason provided"}</div>
            <div className="appt-meta">
              <span className="appt-date">{Icon.clock} {formatDate(appt.date)} at {formatTime(appt.timeSlot)}</span>
            </div>
          </div>
          <div className={`badge ${statusMeta.class}`} style={{ marginRight: "12px" }}>
            {statusMeta.label}
          </div>
          <div className="appt-actions">
            {appt.status === "pending" && (
              <>
                <button className="btn btn-success" onClick={() => onAccept(appt)}>
                  {Icon.check} Accept
                </button>
                <button className="btn btn-danger" onClick={() => onReject(appt)}>
                  {Icon.cross} Reject
                </button>
              </>
            )}
            {appt.status === "accepted" && (
              <button className="btn btn-primary" onClick={() => onComplete(appt)}>
                Start Consultation
              </button>
            )}
            {(appt.status === "confirmed" || appt.status === "completed") && (
              <button className="btn btn-ghost" onClick={() => onView(appt)}>
                View Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ appt, patientName, onClose, onAccept, onReject }) {
  if (!appt) return null;
  const statusMeta = getStatusMeta(appt.status);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-hdr">
          <div className="modal-title">Appointment Details</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="modal-row">
            <div className="modal-field">
              <div className="modal-label">Patient</div>
              <div className="modal-val">{patientName}</div>
            </div>
            <div className="modal-field">
              <div className="modal-label">Status</div>
              <span className={`badge ${statusMeta.class}`}>{statusMeta.label}</span>
            </div>
          </div>
          <div className="modal-row">
            <div className="modal-field">
              <div className="modal-label">Date</div>
              <div className="modal-val">{formatDate(appt.date)}</div>
            </div>
            <div className="modal-field">
              <div className="modal-label">Time</div>
              <div className="modal-val">{formatTime(appt.timeSlot)}</div>
            </div>
          </div>
          <div className="modal-divider" />
          <div className="modal-field">
            <div className="modal-label">Reason / Notes</div>
            <div className="modal-val" style={{ color: "var(--text-sec)" }}>
              {appt.reason || "No reason provided"}
            </div>
          </div>
          {appt.doctorNotes && (
            <>
              <div className="modal-divider" />
              <div className="modal-field">
                <div className="modal-label">Doctor's Notes</div>
                <div className="modal-val" style={{ color: "var(--text-sec)" }}>
                  {appt.doctorNotes}
                </div>
              </div>
            </>
          )}
        </div>
        {appt.status === "pending" && (
          <div className="modal-footer">
            <button className="btn btn-danger" onClick={() => { onReject(appt); onClose(); }}>
              {Icon.cross} Reject
            </button>
            <button className="btn btn-success" onClick={() => { onAccept(appt); onClose(); }}>
              {Icon.check} Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DoctorAppointments() {
  const navigate = useNavigate();
  const location = useLocation();

  const [appointments, setAppointments] = useState([]);
  const [patientCache, setPatientCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);

  const toast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  // Fetch doctor profile
  const fetchDoctorProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return null;
    }
    try {
      const response = await axios.get("http://localhost:3002/api/doctors/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctorProfile(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      return null;
    }
  };

  // Fetch patient name from auth service
  const fetchPatientName = async (patientId) => {
    if (patientCache[patientId]) return patientCache[patientId];
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:3001/api/users/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const name = response.data.firstName + " " + response.data.lastName;
      setPatientCache(prev => ({ ...prev, [patientId]: name }));
      return name;
    } catch (error) {
      console.error("Error fetching patient:", error);
      return `Patient ${patientId.slice(-6)}`;
    }
  };

  // Fetch appointments for this doctor
  const fetchAppointments = useCallback(async (showLoader = true) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const doctor = doctorProfile || await fetchDoctorProfile();
    if (!doctor || !doctor.userId) {
      console.error("No doctor profile found");
      return;
    }

    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await axios.get(`${APPT_API}/appointments/doctor/${doctor.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const appointmentsData = response.data;
      setAppointments(appointmentsData);
      
      // Fetch patient names for all appointments
      const patientIds = [...new Set(appointmentsData.map(a => a.patientId))];
      for (const pid of patientIds) {
        await fetchPatientName(pid);
      }
      
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast("Failed to load appointments", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, doctorProfile, toast]);

  useEffect(() => {
    const init = async () => {
      await fetchDoctorProfile();
      await fetchAppointments();
    };
    init();
  }, []);

  // Actions
  const handleAccept = async (appt) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${APPT_API}/appointments/${appt._id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAppointments(prev => 
        prev.map(a => a._id === appt._id ? { ...a, status: "confirmed" } : a)
      );
      toast("Appointment confirmed", "success");
    } catch (error) {
      console.error("Error accepting:", error);
      toast(error.response?.data?.message || error.message || "Failed to confirm appointment", "error");
    }
  };

  const handleReject = async (appt) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`${APPT_API}/appointments/${appt._id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAppointments(prev => 
        prev.map(a => a._id === appt._id ? { ...a, status: "cancelled" } : a)
      );
      toast("Appointment rejected", "error");
    } catch (error) {
      console.error("Error rejecting:", error);
      toast("Failed to reject appointment", "error");
    }
  };

  const handleComplete = (appt) => {
    navigate(`/video?appointmentId=${appt._id}&role=doctor`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Navigation handlers
  const navigateToDashboard = () => navigate("/doctor/dashboard");
  const navigateToAppointments = () => navigate("/doctor/appointments");
  const navigateToPatients = () => navigate("/doctor/patients");
  const navigateToVideo = () => window.open("/video?role=doctor", "_blank");
  const navigateToPrescriptions = () => navigate("/doctor/prescriptions");
  const navigateToSettings = () => navigate("/doctor/profile");

  // Filtering
  const filteredAppointments = appointments.filter((appt) => {
    const patientName = patientCache[appt.patientId] || "";
    const matchesSearch = search === "" || 
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      (appt.reason || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesTab = activeTab === "all" || appt.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const counts = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === "pending").length,
    accepted: appointments.filter(a => a.status === "accepted").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  const getActiveNav = () => {
    const path = location.pathname;
    if (path === "/doctor/dashboard") return "dashboard";
    if (path === "/doctor/appointments") return "appointments";
    return "appointments";
  };

  const activeNav = getActiveNav();
  const doctorName = doctorProfile 
    ? `Dr. ${doctorProfile.firstName} ${doctorProfile.lastName}`
    : "Dr. Saman";
  const doctorInitials = doctorProfile
    ? `${doctorProfile.firstName?.[0] || ""}${doctorProfile.lastName?.[0] || ""}`
    : "DS";
  const doctorSpec = doctorProfile?.specialization || "Cardiologist";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "accepted", label: "Accepted" },
    { key: "confirmed", label: "Confirmed" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <>
      <style>{CSS}</style>

      <div className="dash">
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
              <NavItem icon={Icon.home} label="Dashboard" active={activeNav === "dashboard"} onClick={navigateToDashboard} />
              <NavItem icon={Icon.cal} label="Appointments" active={activeNav === "appointments"} onClick={navigateToAppointments} badge={counts.pending || undefined} />
              <NavItem icon={Icon.users} label="My Patients" active={false} onClick={navigateToPatients} />
            </div>
            <div className="sb-section">
              <div className="sb-section-label">Consultations</div>
              <NavItem icon={Icon.video} label="Video Sessions" active={false} onClick={navigateToVideo} />
              <NavItem icon={Icon.rx} label="Prescriptions" active={false} onClick={navigateToPrescriptions} />
            </div>
            <div className="sb-section">
              <div className="sb-section-label">Account</div>
              <NavItem icon={Icon.settings} label="Settings" active={false} onClick={navigateToSettings} />
            </div>
          </nav>

          <div className="sb-bottom">
            <div className="sb-user-card" onClick={navigateToSettings}>
              <div className="sb-av">{doctorInitials}</div>
              <div>
                <div className="sb-uname">{doctorName}</div>
                <div className="sb-uspec">{doctorSpec}</div>
              </div>
              <div className="online-dot" />
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              {Icon.logout} Log out
            </button>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <div>
              <div className="tb-title">Appointments</div>
              <div className="tb-date">{today}</div>
            </div>
            <div className="tb-right">
              <div className="icon-btn">
                {Icon.bell}
                {counts.pending > 0 && <div className="notif-dot" />}
              </div>
            </div>
          </header>

          <div className="content">
            <div className="stats-row">
              <StatCard
                icon={Icon.cal} iconBg="var(--accent-light)" iconColor="var(--accent)"
                val={counts.all} label="Total Appointments"
                trend={`${counts.confirmed} confirmed`} trendCls="trend-up" cls="sc-indigo"
              />
              <StatCard
                icon={Icon.clock} iconBg="var(--warning-bg)" iconColor="var(--warning-text)"
                val={counts.pending} label="Awaiting Response"
                trend={counts.pending > 0 ? "Action required" : "All cleared"} 
                trendCls={counts.pending > 0 ? "trend-up" : "trend-neu"} cls="sc-amber"
              />
              <StatCard
                icon={Icon.check} iconBg="var(--success-bg)" iconColor="var(--success-text)"
                val={counts.completed} label="Completed"
                trend="Successfully done" trendCls="trend-up" cls="sc-green"
              />
              <StatCard
                icon={Icon.users} iconBg="var(--info-bg)" iconColor="var(--info-text)"
                val={counts.accepted} label="Awaiting Payment"
                trend="Pending confirmation" trendCls="trend-neu" cls="sc-blue"
              />
            </div>

            <div className="tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  className={`tab${activeTab === tab.key ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                  <span className="tab-count">{counts[tab.key]}</span>
                </button>
              ))}
            </div>

            <div className="filter-bar">
              <div className="search-wrap">
                <span className="search-icon">{Icon.search}</span>
                <input
                  className="search-input"
                  placeholder="Search by patient name or reason..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button
                className={`btn-refresh${refreshing ? " loading" : ""}`}
                onClick={() => fetchAppointments(false)}
              >
                <span style={{ display: "inline-flex", animation: refreshing ? "spin 1s linear infinite" : "none" }}>
                  {Icon.refresh}
                </span>
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <div className="appt-list">
              {loading ? (
                <SkeletonList />
              ) : filteredAppointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{Icon.cal}</div>
                  <div className="empty-title">No appointments found</div>
                  <div className="empty-sub">
                    {search ? "Try adjusting your search" : "You have no appointments in this category"}
                  </div>
                </div>
              ) : (
                filteredAppointments.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appt={appt}
                    patientName={patientCache[appt.patientId] || `Patient ${appt.patientId?.slice(-6)}`}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onComplete={handleComplete}
                    onView={(appt) => setSelectedAppt(appt)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedAppt && (
        <DetailModal
          appt={selectedAppt}
          patientName={patientCache[selectedAppt.patientId] || "Unknown"}
          onClose={() => setSelectedAppt(null)}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}

      <ToastContainer toasts={toasts} />
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}