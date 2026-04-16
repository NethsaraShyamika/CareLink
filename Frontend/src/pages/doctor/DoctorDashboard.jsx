import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ─── Color Palette (Doctor – Indigo Accent) ──────────────────────────────────
// Primary:       #2563EB   Accent:        #4F46E5
// Accent Dark:   #3730A3   Accent Light:  #E0E7FF
// Background:    #F9FAFB   Surface:       #FFFFFF
// Border:        #E5E7EB   Text Primary:  #111827
// Text Secondary:#6B7280   Text Muted:    #9CA3AF
// Success:       #22C55E   Warning:       #F59E0B
// Error:         #EF4444   Info:          #3B82F6

// ─── Mock Data (replace with real API calls) ─────────────────────────────────
const MOCK_STATS = {
  todayAppointments: 12,
  activePatients: 48,
  videoSessions: 3,
  completedToday: 4,
};

const MOCK_APPOINTMENTS = [
  { id: "a1", patientName: "Nimal Kumara",    initials: "NK", age: 34, gender: "M", reason: "Chest pain follow-up",       type: "video",     time: "11:00 AM", status: "confirmed" },
  { id: "a2", patientName: "Sandali Perera",  initials: "SP", age: 52, gender: "F", reason: "Annual cardiac checkup",     type: "in-person", time: "12:30 PM", status: "confirmed" },
  { id: "a3", patientName: "Ashen Rajapaksa", initials: "AR", age: 27, gender: "M", reason: "Palpitations · New patient", type: "in-person", time: "2:00 PM",  status: "pending"   },
  { id: "a4", patientName: "Fathima Mansoor", initials: "FM", age: 45, gender: "F", reason: "Hypertension management",    type: "video",     time: "3:30 PM",  status: "confirmed" },
  { id: "a5", patientName: "Kamal Silva",     initials: "KS", age: 61, gender: "M", reason: "Post-surgery review",        type: "in-person", time: "4:45 PM",  status: "pending"   },
];

const MOCK_PATIENTS = [
  { id: "p1", name: "Nimal Kumara",    initials: "NK", age: 34, condition: "Coronary Artery Disease",  lastVisit: "Apr 15" },
  { id: "p2", name: "Sandali Perera",  initials: "SP", age: 52, condition: "Hypertension",             lastVisit: "Apr 14" },
  { id: "p3", name: "Fathima Mansoor", initials: "FM", age: 45, condition: "Arrhythmia",               lastVisit: "Apr 10" },
  { id: "p4", name: "Kamal Silva",     initials: "KS", age: 61, condition: "Post-bypass recovery",     lastVisit: "Apr 8"  },
];

const MOCK_REPORTS = [
  { id: "r1", patientName: "Nimal Kumara",    title: "ECG Report",          date: "Apr 15", type: "PDF", isNew: true  },
  { id: "r2", patientName: "Sandali Perera",  title: "Blood panel results", date: "Apr 14", type: "PDF", isNew: true  },
  { id: "r3", patientName: "Kamal Silva",     title: "Chest X-ray",         date: "Apr 12", type: "IMG", isNew: false },
  { id: "r4", patientName: "Fathima Mansoor", title: "Echocardiogram",      date: "Apr 10", type: "PDF", isNew: false },
];

const SCHEDULE = [
  { day: "Mon", slots: [{ time: "9:00", booked: false }, { time: "10:00", booked: true  }, { time: "11:00", booked: false }] },
  { day: "Tue", slots: [{ time: "9:00", booked: true  }, { time: "10:00", booked: true  }, { time: "2:00",  booked: false }, { time: "3:00",  booked: false }] },
  { day: "Wed", slots: [{ time: "11:00", booked: false }, { time: "12:30", booked: false }, { time: "2:00", booked: false }, { time: "3:30", booked: false }, { time: "4:45", booked: false }], today: true },
  { day: "Thu", slots: [{ time: "9:00", booked: false }, { time: "10:30", booked: false }, { time: "2:00",  booked: true  }] },
  { day: "Fri", slots: [{ time: "9:00", booked: true  }, { time: "11:00", booked: false }, { time: "3:00",  booked: false }] },
  { day: "Sat", slots: [{ time: "9:00", booked: false }, { time: "10:00", booked: false }] },
  { day: "Sun", slots: [], dayOff: true },
];

// ─── Avatar palette (Indigo-first for Doctor) ─────────────────────────────────
const AV = [
  { bg: "#E0E7FF", color: "#3730A3" },
  { bg: "#D1FAE5", color: "#065F46" },
  { bg: "#FEF3C7", color: "#92400E" },
  { bg: "#FCE7F3", color: "#9D174D" },
  { bg: "#FEE2E2", color: "#991B1B" },
];
const av = (i) => AV[i % AV.length];

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  home:     <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>,
  cal:      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/></svg>,
  users:    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>,
  video:    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>,
  rx:       <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/></svg>,
  logout:   <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 100-2H4V5h6a1 1 0 100-2H3zm10.293 4.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L14.586 11H8a1 1 0 110-2h6.586l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>,
  bell:     <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>,
  doc:      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/></svg>,
  img:      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 5 2-3 3 6z" clipRule="evenodd"/></svg>,
  check:    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>,
  cross:    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>,
  clock:    <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>,
  warn:     <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>,
};

// ─── Global styles ────────────────────────────────────────────────────────────
const CSS = `
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
    --success-text:   #15803d;
    --warning:        #F59E0B;
    --warning-bg:     #FEF3C7;
    --warning-text:   #b45309;
    --error:          #EF4444;
    --error-bg:       #FEE2E2;
    --error-text:     #991B1B;
    --info:           #3B82F6;
    --info-bg:        #DBEAFE;
    --info-text:      #1d4ed8;
    --r-sm:           6px;
    --r-md:           10px;
    --r-lg:           14px;
    --shadow:         0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md:      0 4px 16px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04);
  }

  body {
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    background: var(--bg); color: var(--text);
    font-size: 14px; line-height: 1.5; -webkit-font-smoothing: antialiased;
  }

  /* ── Layout ── */
  .dash   { display: flex; height: 100vh; overflow: hidden; }
  .main   { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .content{ flex: 1; overflow-y: auto; padding: 24px 28px; background: var(--bg); }

  /* ─────────── SIDEBAR ─────────── */
  .sidebar {
    width: 248px; flex-shrink: 0;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    overflow-y: auto;
  }

  .sb-brand {
    padding: 18px 20px 16px;
    display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid var(--border);
  }
  .sb-logo {
    width: 38px; height: 38px; border-radius: var(--r-md); flex-shrink: 0;
    background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
    display: flex; align-items: center; justify-content: center;
  }
  .sb-app  { font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: -.3px; }
  .sb-role { font-size: 11px; color: var(--text-muted); font-weight: 500; margin-top: 1px; }

  .sb-nav      { padding: 14px 10px 0; flex: 1; }
  .sb-section  { margin-bottom: 22px; }
  .sb-section-label {
    font-size: 10px; font-weight: 600; color: var(--text-muted);
    letter-spacing: .08em; text-transform: uppercase;
    padding: 0 10px 7px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: var(--r-md);
    cursor: pointer; color: var(--text-sec);
    font-size: 13.5px; font-weight: 500;
    transition: background .15s, color .15s;
    user-select: none;
  }
  .nav-item:hover  { background: var(--bg); color: var(--text); }
  .nav-item.active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
  .nav-item.active svg { color: var(--accent); }
  .nav-badge {
    margin-left: auto; background: var(--accent); color: #fff;
    font-size: 10px; font-weight: 700; border-radius: 99px;
    padding: 1px 7px; min-width: 20px; text-align: center;
  }

  .sb-bottom { border-top: 1px solid var(--border); padding: 14px 12px 16px; }
  .sb-user-card {
    display: flex; align-items: center; gap: 10px;
    background: var(--bg); border-radius: var(--r-md);
    padding: 10px 12px; margin-bottom: 10px;
  }
  .sb-av {
    width: 38px; height: 38px; border-radius: 50%;
    background: var(--accent-light); color: var(--accent);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700; flex-shrink: 0;
  }
  .sb-uname { font-size: 13.5px; font-weight: 700; line-height: 1.3; }
  .sb-uspec { font-size: 11px; color: var(--text-muted); }
  .online-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--success); flex-shrink: 0; margin-left: auto;
    box-shadow: 0 0 0 2px #fff;
  }

  .btn-logout {
    display: flex; align-items: center; gap: 8px;
    width: 100%; padding: 9px 12px; border-radius: var(--r-md);
    background: var(--error-bg); color: var(--error-text);
    border: none; cursor: pointer;
    font-size: 13px; font-weight: 600;
    transition: background .15s;
  }
  .btn-logout:hover { background: #fecaca; }

  /* ─────────── TOPBAR ─────────── */
  .topbar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 14px 28px;
    display: flex; align-items: center; gap: 16px;
    flex-shrink: 0;
  }
  .tb-title  { font-size: 17px; font-weight: 700; letter-spacing: -.3px; }
  .tb-date   { font-size: 12px; color: var(--text-sec); margin-top: 2px; }
  .tb-right  { margin-left: auto; display: flex; align-items: center; gap: 10px; }

  .avail-pill {
    display: flex; align-items: center; gap: 8px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--r-md); padding: 7px 12px;
  }
  .avail-label { font-size: 12px; font-weight: 600; }
  .avail-on    { color: var(--success-text); }
  .avail-off   { color: var(--text-muted); }

  .toggle {
    width: 34px; height: 18px; border-radius: 99px;
    position: relative; cursor: pointer; transition: background .2s; flex-shrink: 0;
  }
  .toggle::after {
    content: ''; width: 14px; height: 14px; border-radius: 50%;
    background: #fff; position: absolute; top: 2px;
    transition: left .2s; box-shadow: 0 1px 3px rgba(0,0,0,.2);
  }
  .t-on  { background: var(--success); }
  .t-on::after  { left: 18px; }
  .t-off { background: var(--border); }
  .t-off::after { left: 2px; }

  .icon-btn {
    width: 36px; height: 36px; border-radius: var(--r-md);
    background: var(--bg); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-sec);
    position: relative; transition: all .15s;
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
    gap: 14px; margin-bottom: 22px;
  }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); padding: 18px 20px;
    box-shadow: var(--shadow); position: relative; overflow: hidden;
    transition: box-shadow .2s;
  }
  .stat-card:hover { box-shadow: var(--shadow-md); }
  .stat-card::before {
    content: ''; position: absolute; top: 0; right: 0;
    width: 4px; height: 100%; border-radius: 0 var(--r-lg) var(--r-lg) 0;
  }
  .sc-indigo::before { background: var(--accent); }
  .sc-green::before  { background: var(--success); }
  .sc-amber::before  { background: var(--warning); }
  .sc-blue::before   { background: var(--primary); }

  .stat-icon {
    width: 40px; height: 40px; border-radius: var(--r-md);
    display: flex; align-items: center; justify-content: center; margin-bottom: 14px;
  }
  .stat-val  { font-size: 28px; font-weight: 800; letter-spacing: -.5px; line-height: 1; margin-bottom: 4px; }
  .stat-lbl  { font-size: 12px; color: var(--text-sec); font-weight: 500; }
  .stat-sub  { font-size: 11px; margin-top: 7px; font-weight: 500; display: flex; align-items: center; gap: 3px; }
  .up   { color: var(--success-text); }
  .down { color: var(--error-text); }
  .neu  { color: var(--text-muted); }

  /* ─────────── PANEL ─────────── */
  .two-col  { display: grid; grid-template-columns: 1fr 320px; gap: 16px; margin-bottom: 16px; }
  .bot-row  { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .panel    {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r-lg); box-shadow: var(--shadow); overflow: hidden;
  }
  .panel-hdr  { padding: 18px 20px 0; }
  .panel-body { padding: 12px 20px 20px; }
  .sec-hdr    { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .sec-title  { font-size: 15px; font-weight: 700; }
  .sec-link   { font-size: 12px; color: var(--accent); font-weight: 600; cursor: pointer; }
  .sec-link:hover { text-decoration: underline; }

  /* ─────────── APPOINTMENTS ─────────── */
  .appt-list { display: flex; flex-direction: column; gap: 8px; }
  .appt-item {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 14px; border-radius: var(--r-md);
    border: 1px solid var(--border); background: var(--bg);
    transition: border-color .15s, box-shadow .15s;
  }
  .appt-item:hover { border-color: #c7d2fe; box-shadow: 0 2px 10px rgba(79,70,229,.08); }
  .appt-av {
    width: 38px; height: 38px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; flex-shrink: 0;
  }
  .appt-info  { flex: 1; min-width: 0; }
  .appt-name  { font-size: 13.5px; font-weight: 600; }
  .appt-detail{ font-size: 11.5px; color: var(--text-muted); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .appt-time  { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: var(--text-sec); flex-shrink: 0; font-weight: 500; }
  .appt-btns  { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

  /* ─────────── BADGES ─────────── */
  .badge      { font-size: 10.5px; font-weight: 600; padding: 3px 9px; border-radius: 99px; flex-shrink: 0; }
  .b-video    { background: var(--accent-light); color: var(--accent); }
  .b-inperson { background: var(--success-bg); color: var(--success-text); }
  .b-pending  { background: var(--warning-bg); color: var(--warning-text); }
  .b-new      { background: var(--error-bg); color: var(--error-text); font-size: 9.5px; padding: 2px 6px; }

  /* ─────────── BUTTONS ─────────── */
  .btn {
    border: none; border-radius: var(--r-sm);
    padding: 6px 13px; font-size: 12px; font-weight: 600;
    cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
    transition: background .15s, box-shadow .15s;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-dark); }
  .btn-ghost   { background: transparent; color: var(--text-sec); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--bg); color: var(--text); }
  .btn-success { background: var(--success-bg); color: var(--success-text); }
  .btn-success:hover { background: #bbf7d0; }
  .btn-danger  { background: var(--error-bg); color: var(--error-text); }
  .btn-danger:hover { background: #fecaca; }

  /* ─────────── SCHEDULE ─────────── */
  .sched-wrap { display: flex; flex-direction: column; gap: 1px; margin-top: 8px; }
  .sched-row  {
    display: flex; align-items: center; gap: 10px;
    padding: 7px 8px; border-radius: var(--r-sm);
  }
  .sched-today { background: var(--accent-light); }
  .day-lbl    { font-size: 12px; font-weight: 600; color: var(--text-muted); width: 34px; flex-shrink: 0; }
  .day-today  { color: var(--accent); }
  .slot-row   { display: flex; flex-wrap: wrap; gap: 4px; }
  .slot       { font-size: 10.5px; padding: 2px 8px; border-radius: 4px; background: var(--primary-light); color: var(--primary); font-weight: 500; }
  .slot.booked{ background: var(--bg); color: var(--text-muted); text-decoration: line-through; border: 1px solid var(--border); }
  .slot.off   { background: transparent; color: var(--text-muted); font-style: italic; }
  .sched-sep  { height: 1px; background: var(--border); margin: 0 8px; }

  /* ─────────── PATIENTS ─────────── */
  .pat-row {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 0;
  }
  .pat-sep { height: 1px; background: var(--border); }
  .pat-av {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; flex-shrink: 0;
  }
  .pat-name  { font-size: 13px; font-weight: 600; }
  .pat-meta  { font-size: 11px; color: var(--text-muted); margin-top: 1px; }
  .pat-visit { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }

  /* ─────────── REPORTS ─────────── */
  .rep-row {
    display: flex; align-items: center; gap: 11px;
    padding: 11px 0;
  }
  .rep-sep  { height: 1px; background: var(--border); }
  .rep-icon {
    width: 36px; height: 36px; border-radius: var(--r-md);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .rep-name { font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px; }
  .rep-meta { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

  /* ─────────── ALERT BANNER ─────────── */
  .alert-warn {
    display: flex; align-items: center; gap: 8px;
    background: var(--warning-bg); border: 1px solid #fde68a;
    border-radius: var(--r-md); padding: 9px 13px; margin-bottom: 12px;
    font-size: 12.5px; font-weight: 600; color: var(--warning-text);
  }

  /* ─────────── RESPONSIVE ─────────── */
  @media (max-width: 1100px) {
    .two-col { grid-template-columns: 1fr; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 700px) {
    .sidebar { display: none; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .bot-row { grid-template-columns: 1fr; }
    .content { padding: 16px; }
  }
`;

// ─── NavItem component ────────────────────────────────────────────────────────
function NavItem({ icon, label, active, badge, onClick }) {
  return (
    <div className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      {label}
      {badge != null && <span className="nav-badge">{badge}</span>}
    </div>
  );
}

// ─── StatCard component ───────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, val, label, sub, subCls, cls }) {
  return (
    <div className={`stat-card ${cls}`}>
      <div className="stat-icon" style={{ background: iconBg }}>
        <span style={{ color: iconColor }}>{icon}</span>
      </div>
      <div className="stat-val">{val}</div>
      <div className="stat-lbl">{label}</div>
      {sub && <div className={`stat-sub ${subCls}`}>{sub}</div>}
    </div>
  );
}

// ─── AppointmentItem component ────────────────────────────────────────────────
function ApptItem({ appt, idx, onAccept, onReject, onJoin }) {
  const { bg, color } = av(idx);
  return (
    <div className="appt-item">
      <div className="appt-av" style={{ background: bg, color }}>{appt.initials}</div>
      <div className="appt-info">
        <div className="appt-name">{appt.patientName}</div>
        <div className="appt-detail">{appt.reason} · {appt.age}{appt.gender}</div>
      </div>
      <span className={`badge ${appt.type === "video" ? "b-video" : "b-inperson"}`}>
        {appt.type === "video" ? "Video" : "In-person"}
      </span>
      {appt.status === "pending" && <span className="badge b-pending">Pending</span>}
      <div className="appt-time">{Icons.clock} {appt.time}</div>
      <div className="appt-btns">
        {appt.status === "pending" ? (
          <>
            <button className="btn btn-success" onClick={() => onAccept(appt.id)}>{Icons.check} Accept</button>
            <button className="btn btn-danger"  onClick={() => onReject(appt.id)}>{Icons.cross} Reject</button>
          </>
        ) : appt.type === "video" ? (
          <button className="btn btn-primary" onClick={() => onJoin(appt.id)}>Join now</button>
        ) : (
          <button className="btn btn-ghost">View</button>
        )}
      </div>
    </div>
  );
}

// ─── SchedulePanel component ──────────────────────────────────────────────────
function SchedulePanel() {
  return (
    <div className="sched-wrap">
      {SCHEDULE.map(({ day, slots, dayOff, today }, i) => (
        <div key={day}>
          <div className={`sched-row ${today ? "sched-today" : ""}`}>
            <span className={`day-lbl ${today ? "day-today" : ""}`}>{day}</span>
            <div className="slot-row">
              {dayOff
                ? <span className="slot off">Day off</span>
                : slots.map((s) => (
                    <span key={s.time} className={`slot ${s.booked ? "booked" : ""}`}>{s.time}</span>
                  ))}
            </div>
          </div>
          {i < SCHEDULE.length - 1 && <div className="sched-sep" />}
        </div>
      ))}
    </div>
  );
}

// ─── PatientList component ────────────────────────────────────────────────────
function PatientList() {
  return (
    <div>
      {MOCK_PATIENTS.map((p, i) => {
        const { bg, color } = av(i);
        return (
          <div key={p.id}>
            <div className="pat-row">
              <div className="pat-av" style={{ background: bg, color }}>{p.initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pat-name">{p.name}</div>
                <div className="pat-meta">{p.condition} · Age {p.age}</div>
              </div>
              <span className="pat-visit">Last: {p.lastVisit}</span>
              <button className="btn btn-ghost" style={{ marginLeft: 8 }}>View</button>
            </div>
            {i < MOCK_PATIENTS.length - 1 && <div className="pat-sep" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── ReportList component ─────────────────────────────────────────────────────
function ReportList() {
  return (
    <div>
      {MOCK_REPORTS.map((r, i) => {
        const isImg = r.type === "IMG";
        return (
          <div key={r.id}>
            <div className="rep-row">
              <div className="rep-icon" style={{ background: isImg ? "var(--info-bg)" : "var(--warning-bg)" }}>
                <span style={{ color: isImg ? "var(--info-text)" : "var(--warning-text)" }}>
                  {isImg ? Icons.img : Icons.doc}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="rep-name">
                  {r.title}
                  {r.isNew && <span className="badge b-new">New</span>}
                </div>
                <div className="rep-meta">{r.patientName} · {r.date} · {r.type}</div>
              </div>
              <button className="btn btn-ghost">View</button>
            </div>
            {i < MOCK_REPORTS.length - 1 && <div className="rep-sep" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main DoctorDashboard ─────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [nav,         setNav]   = useState("dashboard");
  const [available,   setAvail] = useState(true);
  const [appointments, setAppts] = useState(MOCK_APPOINTMENTS);

  // ── Real API calls go here ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    // Example:
    // axios.get("/api/appointments/today", { headers: { Authorization: `Bearer ${token}` } })
    //   .then(res => setAppts(res.data))
    //   .catch(console.error);
  }, [navigate]);

  const handleAccept = (id) =>
    setAppts((prev) => prev.map((a) => a.id === id ? { ...a, status: "confirmed" } : a));

  const handleReject = (id) =>
    setAppts((prev) => prev.filter((a) => a.id !== id));

  const handleJoin = (id) => {
    // navigate(`/video-session/${id}`);
    alert(`Launching video session for appointment ${id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const pending    = appointments.filter((a) => a.status === "pending").length;
  const videoReady = appointments.filter((a) => a.type === "video" && a.status === "confirmed").length;
  const today      = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <>
      <style>{CSS}</style>

      <div className="dash">

        {/* ════════════ SIDEBAR ════════════ */}
        <aside className="sidebar">

          {/* Brand */}
          <div className="sb-brand">
            <div className="sb-logo">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v14M3 10h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <div className="sb-app">MediConnect</div>
              <div className="sb-role">Doctor Portal</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sb-nav">
            <div className="sb-section">
              <div className="sb-section-label">Overview</div>
              <NavItem icon={Icons.home}  label="Dashboard"    active={nav==="dashboard"}    onClick={()=>setNav("dashboard")} />
              <NavItem icon={Icons.cal}   label="Appointments" active={nav==="appointments"} onClick={()=>setNav("appointments")} badge={pending||undefined} />
              <NavItem icon={Icons.users} label="My Patients"  active={nav==="patients"}     onClick={()=>setNav("patients")} />
            </div>

            <div className="sb-section">
              <div className="sb-section-label">Consultations</div>
              <NavItem icon={Icons.video} label="Video Sessions" active={nav==="video"} onClick={()=>setNav("video")} badge={videoReady||undefined} />
              <NavItem icon={Icons.rx}    label="Prescriptions"  active={nav==="rx"}    onClick={()=>setNav("rx")} />
            </div>

            <div className="sb-section">
              <div className="sb-section-label">Account</div>
              <NavItem icon={Icons.settings} label="Settings" active={nav==="settings"} onClick={()=>setNav("settings")} />
            </div>
          </nav>

          {/* User card + Logout */}
          <div className="sb-bottom">
            <div className="sb-user-card">
              <div className="sb-av">DS</div>
              <div>
                <div className="sb-uname">Dr. Saman</div>
                <div className="sb-uspec">Cardiologist</div>
              </div>
              <div className="online-dot" />
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              {Icons.logout} Log out
            </button>
          </div>
        </aside>

        {/* ════════════ MAIN ════════════ */}
        <div className="main">

          {/* Topbar */}
          <header className="topbar">
            <div>
              <div className="tb-title">Good morning, Dr. Saman 👋</div>
              <div className="tb-date">{today}</div>
            </div>
            <div className="tb-right">
              <div className="avail-pill">
                <span className={`avail-label ${available ? "avail-on" : "avail-off"}`}>
                  {available ? "● Available" : "○ Unavailable"}
                </span>
                <div
                  className={`toggle ${available ? "t-on" : "t-off"}`}
                  onClick={() => setAvail((v) => !v)}
                />
              </div>
              <div className="icon-btn">
                {Icons.bell}
                <div className="notif-dot" />
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="content">

            {/* Stats row */}
            <div className="stats-row">
              <StatCard
                icon={<svg width="19" height="19" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/></svg>}
                iconBg="var(--accent-light)" iconColor="var(--accent)"
                val={MOCK_STATS.todayAppointments} label="Today's appointments"
                sub="↑ 3 more than yesterday" subCls="up" cls="sc-indigo"
              />
              <StatCard
                icon={<svg width="19" height="19" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>}
                iconBg="var(--success-bg)" iconColor="var(--success-text)"
                val={MOCK_STATS.activePatients} label="Active patients"
                sub="↑ 5 this week" subCls="up" cls="sc-green"
              />
              <StatCard
                icon={<svg width="19" height="19" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>}
                iconBg="var(--warning-bg)" iconColor="var(--warning-text)"
                val={MOCK_STATS.videoSessions} label="Video sessions today"
                sub="Next at 11:00 AM" subCls="neu" cls="sc-amber"
              />
              <StatCard
                icon={<svg width="19" height="19" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                iconBg="var(--info-bg)" iconColor="var(--info-text)"
                val={MOCK_STATS.completedToday} label="Completed today"
                sub="On track" subCls="up" cls="sc-blue"
              />
            </div>

            {/* Two-column: Appointments + Schedule */}
            <div className="two-col">

              <div className="panel">
                <div className="panel-hdr">
                  <div className="sec-hdr">
                    <span className="sec-title">Today's appointments</span>
                    <span className="sec-link">View all →</span>
                  </div>
                  {pending > 0 && (
                    <div className="alert-warn">
                      {Icons.warn}
                      {pending} appointment{pending > 1 ? "s" : ""} awaiting your response
                    </div>
                  )}
                </div>
                <div className="panel-body">
                  <div className="appt-list">
                    {appointments.map((a, i) => (
                      <ApptItem
                        key={a.id} appt={a} idx={i}
                        onAccept={handleAccept}
                        onReject={handleReject}
                        onJoin={handleJoin}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-hdr">
                  <div className="sec-hdr">
                    <span className="sec-title">Weekly schedule</span>
                    <span className="sec-link">Edit →</span>
                  </div>
                </div>
                <div className="panel-body">
                  <SchedulePanel />
                </div>
              </div>
            </div>

            {/* Bottom: Patients + Reports */}
            <div className="bot-row">

              <div className="panel">
                <div className="panel-hdr">
                  <div className="sec-hdr">
                    <span className="sec-title">Recent patients</span>
                    <span className="sec-link">View all →</span>
                  </div>
                </div>
                <div className="panel-body">
                  <PatientList />
                </div>
              </div>

              <div className="panel">
                <div className="panel-hdr">
                  <div className="sec-hdr">
                    <span className="sec-title">Patient-uploaded reports</span>
                    <span className="sec-link">View all →</span>
                  </div>
                </div>
                <div className="panel-body">
                  <ReportList />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
