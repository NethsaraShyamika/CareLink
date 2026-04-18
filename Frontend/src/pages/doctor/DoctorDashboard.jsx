import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DoctorSidebar from "./Doctorsidebar";

// ─── API ──────────────────────────────────────────────────────────────────────
import { API_GATEWAY } from "../../utils/api";
const DR_API   = import.meta.env.VITE_API_GATEWAY_URL || API_GATEWAY;
const APPT_API = import.meta.env.VITE_API_GATEWAY_URL || API_GATEWAY;

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --accent:       #4F46E5;
    --accent-dark:  #3730A3;
    --accent-light: #E0E7FF;
    --primary:      #2563EB;
    --primary-light:#EFF6FF;
    --bg:           #F9FAFB;
    --surface:      #FFFFFF;
    --border:       #E5E7EB;
    --border-soft:  #F3F4F6;
    --text:         #111827;
    --text-sec:     #6B7280;
    --text-muted:   #9CA3AF;
    --success:      #22C55E;
    --success-bg:   #DCFCE7;
    --success-text: #15803D;
    --warning:      #F59E0B;
    --warning-bg:   #FEF3C7;
    --warning-text: #B45309;
    --error:        #EF4444;
    --error-bg:     #FEE2E2;
    --error-text:   #991B1B;
    --info:         #3B82F6;
    --info-bg:      #DBEAFE;
    --info-text:    #1D4ED8;
    --r-md:  10px;
    --r-lg:  14px;
    --r-xl:  18px;
    --r-2xl: 22px;
    --shadow:    0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,.08);
    --shadow-lg: 0 10px 40px rgba(79,70,229,.1);
  }

  body {
    font-family: 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif;
    background: var(--bg); color: var(--text); font-size: 14px;
    line-height: 1.5; -webkit-font-smoothing: antialiased;
  }

  /* Layout */
  .dash-root { display: flex; height: 100vh; overflow: hidden; }
  .dash-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .dash-content { flex: 1; overflow-y: auto; padding: 28px 32px; background: var(--bg); }

  /* Topbar */
  .dash-topbar {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 16px 32px; display: flex; align-items: center;
    flex-shrink: 0;
  }
  .dash-tb-left {}
  .dash-tb-title { font-size: 18px; font-weight: 800; letter-spacing: -0.4px; }
  .dash-tb-date  { font-size: 12px; color: var(--text-sec); margin-top: 2px; }
  .dash-tb-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .dash-icon-btn {
    width: 38px; height: 38px; border-radius: var(--r-md);
    background: var(--bg); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-sec); position: relative;
    transition: all .15s;
  }
  .dash-icon-btn:hover { background: var(--accent-light); color: var(--accent); border-color: #c7d2fe; }
  .dash-notif-dot {
    position: absolute; top: 7px; right: 7px;
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--error); border: 1.5px solid #fff;
  }

  /* Welcome banner */
  .dash-welcome {
    background: linear-gradient(135deg, #4338CA 0%, #2563EB 60%, #0EA5E9 100%);
    border-radius: var(--r-2xl); padding: 28px 32px;
    display: flex; align-items: center; gap: 24px;
    margin-bottom: 26px; position: relative; overflow: hidden;
    box-shadow: var(--shadow-lg);
  }
  .dash-welcome::before {
    content: ''; position: absolute; top: -40px; right: -40px;
    width: 200px; height: 200px; border-radius: 50%;
    background: rgba(255,255,255,.07);
  }
  .dash-welcome::after {
    content: ''; position: absolute; bottom: -60px; right: 100px;
    width: 160px; height: 160px; border-radius: 50%;
    background: rgba(255,255,255,.05);
  }
  .dash-welcome-av {
    width: 64px; height: 64px; border-radius: 50%;
    background: rgba(255,255,255,.2); border: 3px solid rgba(255,255,255,.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 800; color: #fff;
    flex-shrink: 0; z-index: 1;
  }
  .dash-welcome-text { z-index: 1; }
  .dash-welcome-greeting { font-size: 13px; color: rgba(255,255,255,.75); font-weight: 500; margin-bottom: 4px; }
  .dash-welcome-name    { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
  .dash-welcome-spec    { font-size: 13px; color: rgba(255,255,255,.8); margin-bottom: 14px; }
  .dash-welcome-chips   { display: flex; gap: 8px; flex-wrap: wrap; }
  .dash-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 99px;
    background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
    color: #fff; font-size: 12px; font-weight: 600;
  }
  .dash-welcome-actions { margin-left: auto; display: flex; flex-direction: column; gap: 10px; z-index:1; flex-shrink:0; }
  .dash-action-btn {
    padding: 10px 20px; border-radius: var(--r-md);
    font-size: 13px; font-weight: 700; cursor: pointer;
    border: none; font-family: inherit; transition: all .15s;
    white-space: nowrap;
  }
  .dash-btn-white   { background: #fff; color: var(--accent); }
  .dash-btn-white:hover { background: #f5f5ff; }
  .dash-btn-outline { background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.3); }
  .dash-btn-outline:hover { background: rgba(255,255,255,.25); }

  /* Stats grid */
  .dash-stats { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; margin-bottom: 26px; }
  .dash-stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl); padding: 20px 22px;
    box-shadow: var(--shadow); overflow: hidden; position: relative;
    transition: box-shadow .2s, transform .2s;
    animation: fadeUp .3s ease both;
  }
  .dash-stat-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .dash-stat-card::after {
    content: ''; position: absolute; bottom:0; left:0; right:0; height:3px;
  }
  .dsc-indigo::after { background: linear-gradient(90deg,#4F46E5,#3730A3); }
  .dsc-green::after  { background: linear-gradient(90deg,#22C55E,#16A34A); }
  .dsc-amber::after  { background: linear-gradient(90deg,#F59E0B,#D97706); }
  .dsc-blue::after   { background: linear-gradient(90deg,#3B82F6,#2563EB); }
  .dsc-pink::after   { background: linear-gradient(90deg,#EC4899,#DB2777); }

  .dash-stat-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom:12px; }
  .dash-stat-icon { width:44px; height:44px; border-radius:var(--r-md); display:flex; align-items:center; justify-content:center; }
  .dash-stat-val  { font-size:30px; font-weight:800; letter-spacing:-0.8px; line-height:1; margin-bottom:4px; }
  .dash-stat-lbl  { font-size:12.5px; color:var(--text-sec); font-weight:500; }
  .dash-stat-sub  { font-size:11px; font-weight:600; margin-top:6px; }
  .sub-green { color:var(--success-text); }
  .sub-amber { color:var(--warning-text); }
  .sub-muted { color:var(--text-muted); }

  /* 2-column grid */
  .dash-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .dash-row-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px; }

  /* Panel */
  .dash-panel {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-xl); overflow: hidden;
    box-shadow: var(--shadow);
    animation: fadeUp .35s ease both;
  }
  .dash-panel-hdr {
    padding: 18px 22px; border-bottom: 1px solid var(--border-soft);
    display: flex; align-items: center; justify-content: space-between;
  }
  .dash-panel-title { font-size: 15px; font-weight: 700; }
  .dash-panel-sub   { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
  .dash-panel-link  {
    font-size: 12.5px; font-weight: 700; color: var(--accent);
    cursor: pointer; border: none; background: none; font-family: inherit;
    transition: color .15s;
  }
  .dash-panel-link:hover { color: var(--accent-dark); }
  .dash-panel-body  { padding: 20px 22px; }

  /* Appointment items */
  .dash-appt-item {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 0; border-bottom: 1px solid var(--border-soft);
    transition: background .12s;
  }
  .dash-appt-item:last-child { border-bottom: none; padding-bottom: 0; }
  .dash-appt-av {
    width: 42px; height: 42px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; flex-shrink: 0;
  }
  .dash-appt-info { flex: 1; min-width: 0; }
  .dash-appt-name { font-size: 13.5px; font-weight: 700; margin-bottom: 2px; }
  .dash-appt-meta { font-size: 11.5px; color: var(--text-muted); display:flex; gap:8px; }
  .dash-appt-badge {
    font-size: 10.5px; font-weight: 700; padding: 2px 10px;
    border-radius: 99px; flex-shrink: 0;
  }
  .b-pending  { background:var(--warning-bg); color:var(--warning-text); }
  .b-confirmed{ background:var(--success-bg); color:var(--success-text); }
  .b-completed{ background:var(--info-bg);    color:var(--info-text); }
  .b-accepted { background:var(--accent-light); color:var(--accent); }
  .b-cancelled{ background:var(--error-bg);   color:var(--error-text); }

  /* Quick actions */
  .dash-quick-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  }
  .dash-quick-btn {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; padding: 18px 12px; border-radius: var(--r-lg);
    border: 1.5px solid var(--border);
    background: var(--bg); cursor: pointer;
    transition: all .18s; font-family: inherit;
    text-align: center;
  }
  .dash-quick-btn:hover { border-color: var(--accent); background: var(--accent-light); }
  .dash-quick-icon {
    width: 44px; height: 44px; border-radius: var(--r-md);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }
  .dash-quick-label { font-size: 12.5px; font-weight: 700; color: var(--text); }
  .dash-quick-sub   { font-size: 11px; color: var(--text-muted); }

  /* Schedule list */
  .dash-schedule-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid var(--border-soft);
  }
  .dash-schedule-item:last-child { border-bottom: none; }
  .dash-sched-time {
    width: 56px; flex-shrink: 0;
    font-size: 12px; font-weight: 700; color: var(--accent);
  }
  .dash-sched-dot {
    width: 8px; height: 8px; border-radius: 50%;
    flex-shrink: 0;
  }
  .dash-sched-info { flex: 1; min-width: 0; }
  .dash-sched-name { font-size: 13px; font-weight: 600; }
  .dash-sched-type { font-size: 11.5px; color: var(--text-muted); }

  /* Patient row */
  .dash-patient-row {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 0; border-bottom: 1px solid var(--border-soft);
  }
  .dash-patient-row:last-child { border-bottom: none; }
  .dash-patient-av {
    width: 38px; height: 38px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; flex-shrink: 0;
  }
  .dash-patient-info { flex: 1; min-width: 0; }
  .dash-patient-name { font-size: 13px; font-weight: 700; }
  .dash-patient-meta { font-size: 11px; color: var(--text-muted); }
  .dash-patient-count { font-size: 12px; font-weight: 700; color: var(--accent); flex-shrink: 0; }

  /* Activity */
  .dash-activity-item {
    display: flex; gap: 12px; padding: 10px 0;
    border-bottom: 1px solid var(--border-soft);
  }
  .dash-activity-item:last-child { border-bottom: none; }
  .dash-activity-dot-wrap {
    display: flex; flex-direction: column; align-items: center;
    flex-shrink: 0;
  }
  .dash-activity-dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    margin-top: 4px;
  }
  .dash-activity-line {
    width: 2px; flex: 1; background: var(--border-soft); margin-top: 4px;
  }
  .dash-activity-text { font-size: 13px; color: var(--text-sec); line-height: 1.5; }
  .dash-activity-bold { font-weight: 700; color: var(--text); }
  .dash-activity-time { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

  /* Earnings card */
  .dash-earnings {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0;
    border-top: 1px solid var(--border-soft);
  }
  .dash-earn-cell {
    padding: 16px 20px;
    border-right: 1px solid var(--border-soft);
  }
  .dash-earn-cell:last-child { border-right: none; }
  .dash-earn-label { font-size: 11.5px; color: var(--text-muted); font-weight: 500; margin-bottom: 5px; }
  .dash-earn-val   { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
  .dash-earn-sub   { font-size: 11px; color: var(--success-text); font-weight: 600; margin-top: 3px; }

  /* Empty */
  .dash-empty { padding: 36px 20px; text-align: center; }
  .dash-empty-icon { font-size: 32px; margin-bottom: 10px; }
  .dash-empty-text { font-size: 13.5px; color: var(--text-muted); }

  /* Skeleton */
  .skel { background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin   { to { transform:rotate(360deg); } }

  @media (max-width: 1200px) {
    .dash-stats  { grid-template-columns: repeat(2, 1fr); }
    .dash-row    { grid-template-columns: 1fr; }
    .dash-row-3  { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .dash-content { padding: 16px; }
    .dash-welcome { flex-wrap: wrap; }
    .dash-welcome-actions { margin-left: 0; flex-direction: row; }
  }
`;

// ─── Icon set ─────────────────────────────────────────────────────────────────
const Ico = {
  bell:   <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>,
  cal:    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/></svg>,
  check:  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>,
  users:  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>,
  video:  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>,
  clock:  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>,
  rx:     <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/></svg>,
  star:   <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>,
  cash:   <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z"/><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/></svg>,
  trend:  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd"/></svg>,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AV_COLORS = [
  {bg:"#E0E7FF",color:"#3730A3"},{bg:"#D1FAE5",color:"#065F46"},
  {bg:"#FEF3C7",color:"#92400E"},{bg:"#FCE7F3",color:"#9D174D"},
  {bg:"#DBEAFE",color:"#1D4ED8"},{bg:"#FEE2E2",color:"#991B1B"},
  {bg:"#FEF9C3",color:"#713F12"},{bg:"#F3E8FF",color:"#6B21A8"},
];
const avColor = (s="") => { let h=0; for(let c of s) h=(h*31+c.charCodeAt(0))&0xffff; return AV_COLORS[h%AV_COLORS.length]; };
const initials = (n="") => n.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase();
const fmtDate  = (d) => { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"}); } catch { return d; } };
const fmtLKR   = (v) => `LKR ${Number(v||0).toLocaleString()}`;

const STATUS_META = {
  pending:   {cls:"b-pending",   dot:"#F59E0B", label:"Pending"},
  accepted:  {cls:"b-accepted",  dot:"#4F46E5", label:"Accepted"},
  confirmed: {cls:"b-confirmed", dot:"#22C55E", label:"Confirmed"},
  completed: {cls:"b-completed", dot:"#3B82F6", label:"Completed"},
  cancelled: {cls:"b-cancelled", dot:"#EF4444", label:"Cancelled"},
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

// ─── Quick action definitions ─────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon:"📅", label:"View Appointments", sub:"Manage schedule",    bg:"#E0E7FF", nav:"/doctor/appointments" },
  { icon:"👥", label:"My Patients",       sub:"Patient records",     bg:"#D1FAE5", nav:"/doctor/patients" },
  { icon:"📋", label:"Prescriptions",     sub:"Write & manage",      bg:"#FEF3C7", nav:"/doctor/prescriptions" },
  { icon:"🎥", label:"Video Session",     sub:"Start teleconsult",   bg:"#DBEAFE", nav:"/video?role=doctor", blank:true },
];

// ─── Skeleton stat card ───────────────────────────────────────────────────────
function SkelStat() {
  return (
    <div className="dash-stat-card dsc-indigo">
      <div className="dash-stat-top">
        <div><div className="skel" style={{width:48,height:36,marginBottom:8}}/><div className="skel" style={{width:80,height:13}}/></div>
        <div className="skel" style={{width:44,height:44,borderRadius:10}}/>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments,  setAppointments]  = useState([]);
  const [loading, setLoading]             = useState(true);
  const [doctorId, setDoctorId]           = useState(null);

  // Fetch doctor profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    axios.get(`${DR_API}/doctors/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { setDoctorProfile(res.data); setDoctorId(res.data._id || res.data.id || res.data.userId); })
      .catch((err) => {
        console.error("Failed to fetch doctor profile:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          navigate("/login");
        } else {
          setLoading(false);
        }
      });
  }, [navigate]);

  // Fetch appointments
  useEffect(() => {
    if (!doctorId) return;
    const token = localStorage.getItem("token");
    axios.get(`${APPT_API}/appointments/doctor/${doctorId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.appointments || [];
        setAppointments(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [doctorId]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const counts = {
    total:     appointments.length,
    pending:   appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
    video:     appointments.filter(a => (a.type||a.consultationType) === "video").length,
  };

  const earnings = {
    total:  (doctorProfile?.consultationFee || 0) * counts.completed,
    today:  (doctorProfile?.consultationFee || 0) * appointments.filter(a => a.status === "completed" && fmtDate(a.date) === fmtDate(new Date())).length,
    pending: (doctorProfile?.consultationFee || 0) * (counts.confirmed + counts.pending),
  };

  // Today's schedule (confirmed/accepted for today)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAppts = appointments
    .filter(a => (a.date || "").startsWith(todayStr) && ["confirmed","accepted","pending"].includes(a.status))
    .sort((a, b) => (a.timeSlot || "").localeCompare(b.timeSlot || ""))
    .slice(0, 6);

  // Recent appointments
  const recent = [...appointments]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  // Recent patients (unique by patientId)
  const recentPatients = [];
  const seen = new Set();
  for (const a of [...appointments].reverse()) {
    if (!seen.has(a.patientId) && a.patientId) {
      seen.add(a.patientId);
      recentPatients.push(a);
    }
    if (recentPatients.length >= 5) break;
  }

  // Activity feed (last 6 actions)
  const activityFeed = [...appointments]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 6)
    .map(a => ({
      status: a.status,
      text: `Appointment ${a.status}`,
      patient: `${a.firstName || ""} ${a.lastName || ""}`.trim() || `Patient …${a.patientId?.slice(-5)}`,
      time: fmtDate(a.updatedAt || a.createdAt),
      dot: STATUS_META[a.status]?.dot || "#9CA3AF",
    }));

  const doctorName = doctorProfile
    ? `Dr. ${doctorProfile.firstName || ""} ${doctorProfile.lastName || ""}`.trim()
    : "Doctor";
  const doctorInitials = doctorProfile?.firstName
    ? `${doctorProfile.firstName[0]}${(doctorProfile.lastName||"")[0]||""}`
    : "DR";
  const today = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

  const getName = (a) => `${a.firstName||""} ${a.lastName||""}`.trim() || `Patient …${a.patientId?.slice(-5)}`;

  return (
    <>
      <style>{CSS}</style>
      <div className="dash-root">
        {/* ── Shared Sidebar ── */}
        <DoctorSidebar
          activeNav="dashboard"
          doctorProfile={doctorProfile}
          pendingCount={counts.pending}
          confirmedCount={counts.confirmed}
        />

        {/* ── Main ── */}
        <div className="dash-main">
          {/* Topbar */}
          <header className="dash-topbar">
            <div className="dash-tb-left">
              <div className="dash-tb-title">Dashboard</div>
              <div className="dash-tb-date">{today}</div>
            </div>
            <div className="dash-tb-right">
              <div className="dash-icon-btn" onClick={() => navigate("/doctor/appointments")}>
                {Ico.bell}
                {counts.pending > 0 && <div className="dash-notif-dot" />}
              </div>
            </div>
          </header>

          <div className="dash-content">
            {/* ── Welcome Banner ── */}
            <div className="dash-welcome">
              <div className="dash-welcome-av">{doctorInitials}</div>
              <div className="dash-welcome-text">
                <div className="dash-welcome-greeting">{getGreeting()},</div>
                <div className="dash-welcome-name">{doctorName}</div>
                <div className="dash-welcome-spec">{doctorProfile?.specialization || "Doctor"} {doctorProfile?.hospitalOrClinic ? `· ${doctorProfile.hospitalOrClinic}` : ""}</div>
                <div className="dash-welcome-chips">
                  <span className="dash-chip">📅 {counts.pending} pending</span>
                  <span className="dash-chip">✅ {counts.confirmed} confirmed today</span>
                  {doctorProfile?.yearsOfExperience && (
                    <span className="dash-chip">⭐ {doctorProfile.yearsOfExperience} yrs exp.</span>
                  )}
                </div>
              </div>
              <div className="dash-welcome-actions">
                <button className="dash-action-btn dash-btn-white" onClick={() => navigate("/doctor/appointments")}>
                  View Appointments
                </button>
                <button className="dash-action-btn dash-btn-outline" onClick={() => navigate("/doctor/profile")}>
                  Edit Profile
                </button>
              </div>
            </div>

            {/* ── Stats ── */}
            <div className="dash-stats">
              {loading ? [1,2,3,4].map(n => <SkelStat key={n}/>) : <>
                <div className="dash-stat-card dsc-indigo" style={{animationDelay:".05s"}}>
                  <div className="dash-stat-top">
                    <div>
                      <div className="dash-stat-val">{counts.total}</div>
                      <div className="dash-stat-lbl">Total Appointments</div>
                      <div className="dash-stat-sub sub-green">↑ All time</div>
                    </div>
                    <div className="dash-stat-icon" style={{background:"var(--accent-light)"}}>
                      <span style={{color:"var(--accent)"}}>{Ico.cal}</span>
                    </div>
                  </div>
                </div>
                <div className="dash-stat-card dsc-amber" style={{animationDelay:".1s"}}>
                  <div className="dash-stat-top">
                    <div>
                      <div className="dash-stat-val">{counts.pending}</div>
                      <div className="dash-stat-lbl">Awaiting Response</div>
                      <div className={`dash-stat-sub ${counts.pending > 0 ? "sub-amber" : "sub-muted"}`}>
                        {counts.pending > 0 ? "⚠ Action required" : "✓ All cleared"}
                      </div>
                    </div>
                    <div className="dash-stat-icon" style={{background:"var(--warning-bg)"}}>
                      <span style={{color:"var(--warning-text)"}}>{Ico.clock}</span>
                    </div>
                  </div>
                </div>
                <div className="dash-stat-card dsc-green" style={{animationDelay:".15s"}}>
                  <div className="dash-stat-top">
                    <div>
                      <div className="dash-stat-val">{counts.completed}</div>
                      <div className="dash-stat-lbl">Completed</div>
                      <div className="dash-stat-sub sub-green">Patients seen</div>
                    </div>
                    <div className="dash-stat-icon" style={{background:"var(--success-bg)"}}>
                      <span style={{color:"var(--success-text)"}}>{Ico.check}</span>
                    </div>
                  </div>
                </div>
                <div className="dash-stat-card dsc-blue" style={{animationDelay:".2s"}}>
                  <div className="dash-stat-top">
                    <div>
                      <div className="dash-stat-val">{counts.video}</div>
                      <div className="dash-stat-lbl">Video Sessions</div>
                      <div className="dash-stat-sub sub-green">Teleconsultations</div>
                    </div>
                    <div className="dash-stat-icon" style={{background:"var(--info-bg)"}}>
                      <span style={{color:"var(--info-text)"}}>{Ico.video}</span>
                    </div>
                  </div>
                </div>
              </>}
            </div>

            {/* ── Row: Recent Appointments + Quick Actions ── */}
            <div className="dash-row-3">
              {/* Recent Appointments */}
              <div className="dash-panel">
                <div className="dash-panel-hdr">
                  <div>
                    <div className="dash-panel-title">Recent Appointments</div>
                    <div className="dash-panel-sub">Latest booking activity</div>
                  </div>
                  <button className="dash-panel-link" onClick={() => navigate("/doctor/appointments")}>View all →</button>
                </div>
                <div className="dash-panel-body">
                  {loading ? (
                    [1,2,3,4].map(n => (
                      <div key={n} style={{display:"flex",gap:12,paddingBottom:14,marginBottom:14,borderBottom:"1px solid var(--border-soft)"}}>
                        <div className="skel" style={{width:42,height:42,borderRadius:"50%",flexShrink:0}}/>
                        <div style={{flex:1}}>
                          <div className="skel" style={{width:"60%",height:13,marginBottom:7}}/>
                          <div className="skel" style={{width:"40%",height:11}}/>
                        </div>
                      </div>
                    ))
                  ) : recent.length === 0 ? (
                    <div className="dash-empty">
                      <div className="dash-empty-icon">📭</div>
                      <div className="dash-empty-text">No appointments yet</div>
                    </div>
                  ) : recent.map((a, i) => {
                    const name = getName(a);
                    const { bg, color } = avColor(name);
                    const meta = STATUS_META[a.status] || STATUS_META.pending;
                    return (
                      <div key={a._id || i} className="dash-appt-item">
                        <div className="dash-appt-av" style={{background:bg,color}}>{initials(name)}</div>
                        <div className="dash-appt-info">
                          <div className="dash-appt-name">{name}</div>
                          <div className="dash-appt-meta">
                            <span>{fmtDate(a.date)}</span>
                            <span>·</span>
                            <span>{a.timeSlot || "—"}</span>
                          </div>
                        </div>
                        <span className={`dash-appt-badge ${meta.cls}`}>{meta.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="dash-panel">
                <div className="dash-panel-hdr">
                  <div>
                    <div className="dash-panel-title">Quick Actions</div>
                    <div className="dash-panel-sub">Frequently used</div>
                  </div>
                </div>
                <div className="dash-panel-body">
                  <div className="dash-quick-grid">
                    {QUICK_ACTIONS.map((q, i) => (
                      <button key={i} className="dash-quick-btn" onClick={() => q.blank ? window.open(q.nav,"_blank") : navigate(q.nav)}>
                        <div className="dash-quick-icon" style={{background:q.bg}}>{q.icon}</div>
                        <div className="dash-quick-label">{q.label}</div>
                        <div className="dash-quick-sub">{q.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row: Today's Schedule + Patients + Activity ── */}
            <div className="dash-row" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
              {/* Today's Schedule */}
              <div className="dash-panel">
                <div className="dash-panel-hdr">
                  <div>
                    <div className="dash-panel-title">Today's Schedule</div>
                    <div className="dash-panel-sub">{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
                  </div>
                  <span style={{fontSize:12,fontWeight:700,background:"var(--accent-light)",color:"var(--accent)",padding:"3px 10px",borderRadius:99}}>
                    {todayAppts.length} appts
                  </span>
                </div>
                <div className="dash-panel-body">
                  {loading ? (
                    [1,2,3].map(n => <div key={n} className="skel" style={{height:40,marginBottom:12,borderRadius:8}}/>)
                  ) : todayAppts.length === 0 ? (
                    <div className="dash-empty">
                      <div className="dash-empty-icon">🌿</div>
                      <div className="dash-empty-text">No appointments scheduled for today</div>
                    </div>
                  ) : todayAppts.map((a, i) => {
                    const name = getName(a);
                    const meta = STATUS_META[a.status] || STATUS_META.pending;
                    const isVideo = (a.type||a.consultationType) === "video";
                    return (
                      <div key={a._id || i} className="dash-schedule-item">
                        <div className="dash-sched-time">{a.timeSlot?.slice(0,5) || "—"}</div>
                        <div className="dash-sched-dot" style={{background:meta.dot}}/>
                        <div className="dash-sched-info">
                          <div className="dash-sched-name">{name}</div>
                          <div className="dash-sched-type">{isVideo ? "🎥 Video" : "🏥 In-person"}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Patients */}
              <div className="dash-panel">
                <div className="dash-panel-hdr">
                  <div>
                    <div className="dash-panel-title">Recent Patients</div>
                    <div className="dash-panel-sub">Unique patients</div>
                  </div>
                  <button className="dash-panel-link" onClick={() => navigate("/doctor/patients")}>All →</button>
                </div>
                <div className="dash-panel-body">
                  {loading ? (
                    [1,2,3,4].map(n => <div key={n} className="skel" style={{height:36,marginBottom:12,borderRadius:8}}/>)
                  ) : recentPatients.length === 0 ? (
                    <div className="dash-empty">
                      <div className="dash-empty-icon">👥</div>
                      <div className="dash-empty-text">No patients yet</div>
                    </div>
                  ) : recentPatients.map((a, i) => {
                    const name = getName(a);
                    const { bg, color } = avColor(name);
                    const patientAppts = appointments.filter(x => x.patientId === a.patientId).length;
                    return (
                      <div key={a.patientId || i} className="dash-patient-row">
                        <div className="dash-patient-av" style={{background:bg,color}}>{initials(name)}</div>
                        <div className="dash-patient-info">
                          <div className="dash-patient-name">{name}</div>
                          <div className="dash-patient-meta">Last: {fmtDate(a.date)}</div>
                        </div>
                        <div className="dash-patient-count">{patientAppts}x</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="dash-panel">
                <div className="dash-panel-hdr">
                  <div>
                    <div className="dash-panel-title">Recent Activity</div>
                    <div className="dash-panel-sub">Status updates</div>
                  </div>
                </div>
                <div className="dash-panel-body">
                  {loading ? (
                    [1,2,3,4].map(n => <div key={n} className="skel" style={{height:36,marginBottom:12,borderRadius:8}}/>)
                  ) : activityFeed.length === 0 ? (
                    <div className="dash-empty">
                      <div className="dash-empty-icon">📋</div>
                      <div className="dash-empty-text">No recent activity</div>
                    </div>
                  ) : activityFeed.map((act, i) => (
                    <div key={i} className="dash-activity-item">
                      <div className="dash-activity-dot-wrap">
                        <div className="dash-activity-dot" style={{background:act.dot}}/>
                        {i < activityFeed.length - 1 && <div className="dash-activity-line"/>}
                      </div>
                      <div style={{flex:1}}>
                        <div className="dash-activity-text">
                          Appointment <span className="dash-activity-bold">{act.status}</span> — {act.patient}
                        </div>
                        <div className="dash-activity-time">{act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Earnings Panel ── */}
            <div className="dash-panel" style={{marginBottom:8}}>
              <div className="dash-panel-hdr">
                <div>
                  <div className="dash-panel-title">Earnings Overview</div>
                  <div className="dash-panel-sub">Based on {fmtLKR(doctorProfile?.consultationFee || 0)} consultation fee</div>
                </div>
                <span style={{fontSize:12,color:"var(--text-muted)"}}>Estimates only</span>
              </div>
              <div className="dash-earnings">
                <div className="dash-earn-cell">
                  <div className="dash-earn-label">Today's Earnings</div>
                  <div className="dash-earn-val">{fmtLKR(earnings.today)}</div>
                  <div className="dash-earn-sub">{appointments.filter(a=>a.status==="completed"&&(a.date||"").startsWith(todayStr)).length} completed today</div>
                </div>
                <div className="dash-earn-cell">
                  <div className="dash-earn-label">Total Earned</div>
                  <div className="dash-earn-val">{fmtLKR(earnings.total)}</div>
                  <div className="dash-earn-sub">{counts.completed} completed sessions</div>
                </div>
                <div className="dash-earn-cell">
                  <div className="dash-earn-label">Pending Revenue</div>
                  <div className="dash-earn-val">{fmtLKR(earnings.pending)}</div>
                  <div className="dash-earn-sub">{counts.confirmed + counts.pending} upcoming sessions</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}