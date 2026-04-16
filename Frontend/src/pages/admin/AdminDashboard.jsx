import { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .cl-admin {
    min-height: 100vh;
    background: #070b12;
    color: #e8edf5;
    font-family: 'DM Sans', sans-serif;
    display: flex;
  }

  /* ── SIDEBAR ── */
  .cl-sidebar {
    width: 260px;
    min-height: 100vh;
    background: rgba(255,255,255,0.02);
    border-right: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    padding: 28px 0;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
  }

  .cl-brand {
    padding: 0 24px 32px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 16px;
  }

  .cl-brand-logo {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    box-shadow: 0 0 20px rgba(14,165,233,0.3);
    margin-bottom: 12px;
  }

  .cl-brand-name {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 800;
    letter-spacing: -0.5px;
  }

  .cl-brand-name span { color: #0ea5e9; }

  .cl-brand-badge {
    display: inline-block;
    margin-top: 4px;
    padding: 2px 8px;
    background: rgba(14,165,233,0.1);
    border: 1px solid rgba(14,165,233,0.2);
    border-radius: 20px;
    font-size: 10px;
    color: #0ea5e9;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .cl-nav { flex: 1; padding: 0 12px; }

  .cl-nav-section {
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
    font-weight: 600;
    padding: 0 12px;
    margin: 20px 0 8px;
  }

  .cl-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 14px;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    color: rgba(255,255,255,0.45);
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 2px;
    position: relative;
  }

  .cl-nav-item:hover {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.85);
  }

  .cl-nav-item.active {
    background: rgba(14,165,233,0.12);
    color: #fff;
    border: 1px solid rgba(14,165,233,0.2);
  }

  .cl-nav-item.active .cl-nav-icon {
    color: #0ea5e9;
  }

  .cl-nav-icon { font-size: 16px; width: 20px; text-align: center; }

  .cl-nav-badge {
    margin-left: auto;
    padding: 1px 7px;
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 20px;
    font-size: 10px;
    color: #f87171;
    font-weight: 700;
  }

  .cl-nav-badge.green {
    background: rgba(34,197,94,0.12);
    border-color: rgba(34,197,94,0.2);
    color: #4ade80;
  }

  .cl-sidebar-footer {
    padding: 16px 24px;
    border-top: 1px solid rgba(255,255,255,0.06);
    margin-top: 16px;
  }

  .cl-admin-user {
    display: flex; align-items: center; gap: 10px;
  }

  .cl-admin-avatar {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700;
  }

  .cl-admin-info { flex: 1; }
  .cl-admin-name { font-size: 13px; font-weight: 600; }
  .cl-admin-role { font-size: 11px; color: rgba(255,255,255,0.35); }

  /* ── MAIN ── */
  .cl-main {
    margin-left: 260px;
    flex: 1;
    padding: 32px;
    min-height: 100vh;
  }

  .cl-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
  }

  .cl-page-title {
    font-family: 'Syne', sans-serif;
    font-size: 24px; font-weight: 800;
    letter-spacing: -0.5px;
  }

  .cl-page-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    margin-top: 2px;
  }

  .cl-topbar-right {
    display: flex; align-items: center; gap: 12px;
  }

  .cl-search {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 14px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: rgba(255,255,255,0.4);
    font-size: 13px;
  }

  .cl-topbar-btn {
    width: 38px; height: 38px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px;
    transition: all 0.2s;
    position: relative;
  }

  .cl-topbar-btn:hover { background: rgba(255,255,255,0.08); }

  .cl-notif-dot {
    position: absolute; top: 6px; right: 6px;
    width: 7px; height: 7px;
    background: #ef4444; border-radius: 50%;
    border: 2px solid #070b12;
  }

  /* ── STATS ── */
  .cl-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
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
    font-size: 28px; font-weight: 800;
    letter-spacing: -1px;
    margin-bottom: 4px;
  }

  .cl-stat-label {
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    font-weight: 500;
  }

  .cl-stat-change {
    display: flex; align-items: center; gap: 4px;
    margin-top: 10px;
    font-size: 12px; font-weight: 600;
  }

  /* ── GRID ── */
  .cl-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .cl-grid-3 {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 20px;
  }

  /* ── PANEL ── */
  .cl-panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
  }

  .cl-panel-header {
    padding: 18px 22px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: space-between;
  }

  .cl-panel-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700;
  }

  .cl-panel-action {
    font-size: 12px;
    color: #0ea5e9;
    cursor: pointer;
    font-weight: 500;
  }

  .cl-panel-body { padding: 18px 22px; }

  /* ── TABLE ── */
  .cl-table { width: 100%; border-collapse: collapse; }

  .cl-table th {
    text-align: left;
    font-size: 11px;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    font-weight: 600;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  .cl-table td {
    padding: 13px 12px;
    font-size: 13px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    vertical-align: middle;
  }

  .cl-table tr:last-child td { border-bottom: none; }
  .cl-table tr:hover td { background: rgba(255,255,255,0.02); }

  /* ── BADGES ── */
  .cl-badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    display: inline-flex; align-items: center; gap: 4px;
  }

  .cl-badge-green { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
  .cl-badge-yellow { background: rgba(234,179,8,0.12); color: #facc15; border: 1px solid rgba(234,179,8,0.2); }
  .cl-badge-red { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
  .cl-badge-blue { background: rgba(14,165,233,0.12); color: #38bdf8; border: 1px solid rgba(14,165,233,0.2); }
  .cl-badge-gray { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.4); border: 1px solid rgba(255,255,255,0.1); }

  /* ── VERIFY BTN ── */
  .cl-verify-btn {
    padding: 5px 12px;
    border-radius: 8px;
    font-size: 11px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    border: none;
  }

  .cl-verify-btn.approve {
    background: rgba(34,197,94,0.15);
    color: #4ade80;
    border: 1px solid rgba(34,197,94,0.25);
  }

  .cl-verify-btn.approve:hover { background: rgba(34,197,94,0.25); }

  .cl-verify-btn.reject {
    background: rgba(239,68,68,0.1);
    color: #f87171;
    border: 1px solid rgba(239,68,68,0.2);
    margin-left: 6px;
  }

  .cl-verify-btn.reject:hover { background: rgba(239,68,68,0.2); }

  /* ── AVATAR ── */
  .cl-avatar {
    width: 32px; height: 32px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 700;
    flex-shrink: 0;
  }

  .cl-user-cell {
    display: flex; align-items: center; gap: 10px;
  }

  .cl-user-name { font-size: 13px; font-weight: 500; }
  .cl-user-email { font-size: 11px; color: rgba(255,255,255,0.35); }

  /* ── NOTIFICATION ── */
  .cl-notif-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }

  .cl-notif-item:last-child { border-bottom: none; }

  .cl-notif-dot-lg {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }

  .cl-notif-text { font-size: 13px; line-height: 1.5; }
  .cl-notif-time { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px; }

  /* ── PAYMENT ── */
  .cl-payment-bar {
    height: 6px;
    background: rgba(255,255,255,0.06);
    border-radius: 10px;
    overflow: hidden;
    margin-top: 6px;
  }

  .cl-payment-fill {
    height: 100%;
    border-radius: 10px;
    background: linear-gradient(90deg, #0ea5e9, #2563eb);
  }

  /* ── CHART BARS ── */
  .cl-chart {
    display: flex; align-items: flex-end; gap: 8px;
    height: 80px; padding: 0 4px;
  }

  .cl-bar-wrap {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; gap: 4px;
  }

  .cl-bar {
    width: 100%;
    background: linear-gradient(180deg, #0ea5e9, rgba(14,165,233,0.3));
    border-radius: 4px 4px 0 0;
    transition: all 0.3s;
  }

  .cl-bar:hover { background: linear-gradient(180deg, #38bdf8, rgba(56,189,248,0.4)); }

  .cl-bar-label {
    font-size: 10px;
    color: rgba(255,255,255,0.3);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .cl-panel { animation: fadeIn 0.3s ease forwards; }
`;

const TABS = [
  { id: "overview", icon: "⚡", label: "Overview" },
  { id: "users", icon: "👥", label: "User Management" },
  { id: "doctors", icon: "🩺", label: "Doctor Verification", badge: "3" },
  { id: "appointments", icon: "📅", label: "Appointments" },
  { id: "payments", icon: "💳", label: "Payments" },
  { id: "notifications", icon: "🔔", label: "Notifications", badge: "5", badgeGreen: false },
];

const STATS = [
  { label: "Total Users", value: "2,847", change: "+12%", up: true, icon: "👥", color: "#0ea5e9", glow: "#0ea5e9" },
  { label: "Active Doctors", value: "143", change: "+4%", up: true, icon: "🩺", color: "#22c55e", glow: "#22c55e" },
  { label: "Appointments Today", value: "89", change: "+23%", up: true, icon: "📅", color: "#a855f7", glow: "#a855f7" },
  { label: "Revenue (LKR)", value: "184K", change: "-3%", up: false, icon: "💰", color: "#f59e0b", glow: "#f59e0b" },
];

const USERS = [
  { name: "Kavindu Perera", email: "kavindu@gmail.com", role: "Patient", status: "Active", joined: "Jan 12, 2026", avatar: "KP", color: "#0ea5e9" },
  { name: "Dr. Amali Silva", email: "amali@gmail.com", role: "Doctor", status: "Active", joined: "Feb 3, 2026", avatar: "AS", color: "#22c55e" },
  { name: "Nimal Fernando", email: "nimal@gmail.com", role: "Patient", status: "Inactive", joined: "Mar 1, 2026", avatar: "NF", color: "#a855f7" },
  { name: "Dr. Ruwan Jayasinghe", email: "ruwan@gmail.com", role: "Doctor", status: "Pending", joined: "Apr 5, 2026", avatar: "RJ", color: "#f59e0b" },
  { name: "Sachini Bandara", email: "sachini@gmail.com", role: "Patient", status: "Active", joined: "Apr 8, 2026", avatar: "SB", color: "#ec4899" },
];

const DOCTORS = [
  { name: "Dr. Ruwan Jayasinghe", specialty: "Cardiologist", hospital: "Colombo National Hospital", docs: "Uploaded", avatar: "RJ", color: "#f59e0b" },
  { name: "Dr. Priya Mendis", specialty: "Dermatologist", hospital: "Asiri Medical Centre", docs: "Uploaded", avatar: "PM", color: "#a855f7" },
  { name: "Dr. Chamara Wijesinghe", specialty: "Neurologist", hospital: "Lanka Hospital", docs: "Pending", avatar: "CW", color: "#0ea5e9" },
];

const APPOINTMENTS = [
  { id: "APT-089", doctor: "Dr. Amali Silva", patient: "Kavindu Perera", date: "Apr 14, 2026", time: "10:00 AM", status: "Confirmed", type: "Video" },
  { id: "APT-090", doctor: "Dr. Ruwan J.", patient: "Nimal Fernando", date: "Apr 14, 2026", time: "11:30 AM", status: "Pending", type: "Video" },
  { id: "APT-091", doctor: "Dr. Priya M.", patient: "Sachini Bandara", date: "Apr 14, 2026", time: "02:00 PM", status: "Confirmed", type: "Video" },
  { id: "APT-088", doctor: "Dr. Amali Silva", patient: "Tharushi K.", date: "Apr 13, 2026", time: "09:00 AM", status: "Completed", type: "Video" },
  { id: "APT-087", doctor: "Dr. Chamara W.", patient: "Lasith P.", date: "Apr 13, 2026", time: "03:30 PM", status: "Cancelled", type: "Video" },
];

const NOTIFICATIONS = [
  { icon: "🩺", bg: "rgba(34,197,94,0.12)", text: "Dr. Ruwan Jayasinghe submitted verification documents for review.", time: "2 mins ago" },
  { icon: "📅", bg: "rgba(14,165,233,0.12)", text: "New appointment APT-091 booked between Dr. Priya M. and Sachini Bandara.", time: "15 mins ago" },
  { icon: "💳", bg: "rgba(239,68,68,0.12)", text: "Payment PAY-004 failed for Tharushi K. — LKR 2,500.", time: "1 hour ago" },
  { icon: "👤", bg: "rgba(168,85,247,0.12)", text: "New user Chaminda Rathnayake registered as a patient.", time: "2 hours ago" },
  { icon: "⚠️", bg: "rgba(245,158,11,0.12)", text: "Dr. Chamara Wijesinghe's verification documents are still pending.", time: "5 hours ago" },
];

const CHART_DATA = [65, 80, 45, 90, 70, 85, 60, 95, 75, 88, 72, 91];
const CHART_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [doctorList, setDoctorList] = useState(DOCTORS);
  const [userList] = useState(USERS);
  const navigate = useNavigate();

  const handleVerify = (name, action) => {
    setDoctorList(prev => prev.filter(d => d.name !== name));
    alert(`Dr. ${name} has been ${action === "approve" ? "✅ approved" : "❌ rejected"}`);
  };

  const statusBadge = (status) => {
    const map = {
      Active: "cl-badge-green", Inactive: "cl-badge-gray",
      Pending: "cl-badge-yellow", Completed: "cl-badge-blue",
      Confirmed: "cl-badge-green", Cancelled: "cl-badge-red",
      Success: "cl-badge-green", Failed: "cl-badge-red",
      Uploaded: "cl-badge-green",
    };
    return map[status] || "cl-badge-gray";
  };

  const maxBar = Math.max(...CHART_DATA);

  return (
    <>
      <style>{styles}</style>
      <div className="cl-admin">

        {/* ── SIDEBAR ── */}
        <aside className="cl-sidebar">
          <div className="cl-brand">
            <div className="cl-brand-logo">🏥</div>
            <div className="cl-brand-name">Care<span>Link</span></div>
            <div className="cl-brand-badge">Admin Portal</div>
          </div>

          <nav className="cl-nav">
            <div className="cl-nav-section">Main</div>
            {TABS.map(tab => (
              <div
                key={tab.id}
                className={`cl-nav-item ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => tab.id === "payments" ? navigate('/admin/payments') : setActiveTab(tab.id)}
              >
                <span className="cl-nav-icon">{tab.icon}</span>
                {tab.label}
                {tab.badge && (
                  <span className={`cl-nav-badge ${tab.badgeGreen ? "green" : ""}`}>
                    {tab.badge}
                  </span>
                )}
              </div>
            ))}

            <div className="cl-nav-section">System</div>
            <div className="cl-nav-item">
              <span className="cl-nav-icon">⚙️</span> Settings
            </div>
            <div className="cl-nav-item">
              <span className="cl-nav-icon">📊</span> Reports
            </div>
          </nav>

          <div className="cl-sidebar-footer">
            <div className="cl-admin-user">
              <div className="cl-admin-avatar">A</div>
              <div className="cl-admin-info">
                <div className="cl-admin-name">Admin</div>
                <div className="cl-admin-role">Super Administrator</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="cl-main">

          {/* Topbar */}
          <div className="cl-topbar">
            <div>
              <div className="cl-page-title">
                {TABS.find(t => t.id === activeTab)?.icon}{" "}
                {TABS.find(t => t.id === activeTab)?.label || "Overview"}
              </div>
              <div className="cl-page-sub">
                CareLink Admin — {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
            <div className="cl-topbar-right">
              <div className="cl-search">🔍 Search...</div>
              <div className="cl-topbar-btn">
                🔔
                <span className="cl-notif-dot" />
              </div>
              <div className="cl-topbar-btn">👤</div>
            </div>
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <>
              {/* Stats */}
              <div className="cl-stats">
                {STATS.map((s, i) => (
                  <div className="cl-stat-card" key={i}>
                    <div className="cl-stat-glow" style={{ background: s.glow }} />
                    <div className="cl-stat-icon" style={{ background: `${s.color}18` }}>
                      {s.icon}
                    </div>
                    <div className="cl-stat-value">{s.value}</div>
                    <div className="cl-stat-label">{s.label}</div>
                    <div className="cl-stat-change" style={{ color: s.up ? "#4ade80" : "#f87171" }}>
                      {s.up ? "↑" : "↓"} {s.change} vs last month
                    </div>
                  </div>
                ))}
              </div>

              <div className="cl-grid-3">
                {/* Appointments Chart */}
                <div className="cl-panel">
                  <div className="cl-panel-header">
                    <div className="cl-panel-title">📈 Appointments This Year</div>
                    <div className="cl-panel-action">View all</div>
                  </div>
                  <div className="cl-panel-body">
                    <div className="cl-chart">
                      {CHART_DATA.map((val, i) => (
                        <div className="cl-bar-wrap" key={i}>
                          <div
                            className="cl-bar"
                            style={{ height: `${(val / maxBar) * 100}%` }}
                            title={`${CHART_LABELS[i]}: ${val}`}
                          />
                          <div className="cl-bar-label">{CHART_LABELS[i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Notifications */}
                <div className="cl-panel">
                  <div className="cl-panel-header">
                    <div className="cl-panel-title">🔔 Recent Activity</div>
                    <div className="cl-panel-action" onClick={() => setActiveTab("notifications")}>See all</div>
                  </div>
                  <div className="cl-panel-body" style={{ padding: "8px 22px" }}>
                    {NOTIFICATIONS.slice(0, 3).map((n, i) => (
                      <div className="cl-notif-item" key={i}>
                        <div className="cl-notif-dot-lg" style={{ background: n.bg }}>{n.icon}</div>
                        <div>
                          <div className="cl-notif-text">{n.text}</div>
                          <div className="cl-notif-time">{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── USERS ── */}
          {activeTab === "users" && (
            <div className="cl-panel">
              <div className="cl-panel-header">
                <div className="cl-panel-title">👥 All Users ({userList.length})</div>
                <div className="cl-panel-action">+ Add User</div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="cl-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((u, i) => (
                      <tr key={i}>
                        <td>
                          <div className="cl-user-cell">
                            <div className="cl-avatar" style={{ background: `${u.color}22`, color: u.color }}>{u.avatar}</div>
                            <div>
                              <div className="cl-user-name">{u.name}</div>
                              <div className="cl-user-email">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className={`cl-badge ${u.role === "Doctor" ? "cl-badge-blue" : "cl-badge-gray"}`}>{u.role}</span></td>
                        <td><span className={`cl-badge ${statusBadge(u.status)}`}>● {u.status}</span></td>
                        <td style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>{u.joined}</td>
                        <td>
                          <button className="cl-verify-btn approve">Edit</button>
                          <button className="cl-verify-btn reject">Block</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── DOCTOR VERIFICATION ── */}
          {activeTab === "doctors" && (
            <div className="cl-panel">
              <div className="cl-panel-header">
                <div className="cl-panel-title">🩺 Doctor Verification Queue ({doctorList.length})</div>
                <span className="cl-badge cl-badge-yellow">⚠️ {doctorList.length} Pending</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="cl-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Specialty</th>
                      <th>Hospital</th>
                      <th>Documents</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorList.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>
                          ✅ All doctors have been verified!
                        </td>
                      </tr>
                    ) : (
                      doctorList.map((d, i) => (
                        <tr key={i}>
                          <td>
                            <div className="cl-user-cell">
                              <div className="cl-avatar" style={{ background: `${d.color}22`, color: d.color }}>{d.avatar}</div>
                              <div className="cl-user-name">{d.name}</div>
                            </div>
                          </td>
                          <td style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>{d.specialty}</td>
                          <td style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>{d.hospital}</td>
                          <td><span className={`cl-badge ${statusBadge(d.docs)}`}>{d.docs === "Uploaded" ? "📎 Uploaded" : "⏳ Pending"}</span></td>
                          <td>
                            <button className="cl-verify-btn approve" onClick={() => handleVerify(d.name, "approve")}>✓ Approve</button>
                            <button className="cl-verify-btn reject" onClick={() => handleVerify(d.name, "reject")}>✕ Reject</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── APPOINTMENTS ── */}
          {activeTab === "appointments" && (
            <div className="cl-panel">
              <div className="cl-panel-header">
                <div className="cl-panel-title">📅 Appointment Overview</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["All", "Today", "Pending", "Completed"].map(f => (
                    <button key={f} style={{
                      padding: "4px 12px", borderRadius: "8px", fontSize: "12px",
                      background: f === "All" ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                      border: f === "All" ? "1px solid rgba(14,165,233,0.3)" : "1px solid rgba(255,255,255,0.08)",
                      color: f === "All" ? "#38bdf8" : "rgba(255,255,255,0.45)",
                      cursor: "pointer"
                    }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="cl-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Doctor</th>
                      <th>Patient</th>
                      <th>Date & Time</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {APPOINTMENTS.map((a, i) => (
                      <tr key={i}>
                        <td style={{ color: "#38bdf8", fontWeight: "600", fontSize: "12px" }}>{a.id}</td>
                        <td style={{ fontSize: "13px" }}>{a.doctor}</td>
                        <td style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>{a.patient}</td>
                        <td style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>{a.date} · {a.time}</td>
                        <td><span className="cl-badge cl-badge-blue">🎥 {a.type}</span></td>
                        <td><span className={`cl-badge ${statusBadge(a.status)}`}>● {a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "notifications" && (
            <div className="cl-panel">
              <div className="cl-panel-header">
                <div className="cl-panel-title">🔔 All Notifications</div>
                <div className="cl-panel-action">Mark all read</div>
              </div>
              <div className="cl-panel-body" style={{ padding: "8px 22px" }}>
                {NOTIFICATIONS.map((n, i) => (
                  <div className="cl-notif-item" key={i}>
                    <div className="cl-notif-dot-lg" style={{ background: n.bg }}>{n.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div className="cl-notif-text">{n.text}</div>
                      <div className="cl-notif-time">{n.time}</div>
                    </div>
                    <button style={{
                      padding: "4px 10px", fontSize: "11px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px", color: "rgba(255,255,255,0.4)",
                      cursor: "pointer"
                    }}>Dismiss</button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}

export default AdminDashboard;