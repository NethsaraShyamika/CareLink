import { useState } from "react";
import PatientManagement from "./PatientManagement";
import DoctorManagement from "./DoctorManegement";
import { useNavigate } from "react-router-dom";

const TABS = [
  { id: "overview", icon: "⚡", label: "Overview" },
  { id: "patients", icon: "🧑‍🤝‍🧑", label: "Patient Management" },
  { id: "doctors", icon: "🩺", label: "Doctor Management" },
  { id: "appointments", icon: "📅", label: "Appointments" },
  { id: "payments", icon: "💳", label: "Payment Management" },
  { id: "notifications", icon: "🔔", label: "Notifications", badge: "5" },
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

const PAYMENTS = [
  { id: "PAY-001", patient: "Kavindu Perera", doctor: "Dr. Amali Silva", amount: "LKR 2,500", date: "Apr 14", status: "Success" },
  { id: "PAY-002", patient: "Sachini Bandara", doctor: "Dr. Priya M.", amount: "LKR 3,000", date: "Apr 14", status: "Success" },
  { id: "PAY-003", patient: "Nimal Fernando", doctor: "Dr. Ruwan J.", amount: "LKR 2,000", date: "Apr 13", status: "Pending" },
  { id: "PAY-004", patient: "Tharushi K.", doctor: "Dr. Amali Silva", amount: "LKR 2,500", date: "Apr 13", status: "Failed" },
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
  const [allUsers] = useState(USERS);
  const [userList, setUserList] = useState(USERS.filter((u) => u.role !== "Patient"));
  const [doctorList, setDoctorList] = useState(USERS.filter((u) => u.role === "Doctor"));
  const navigate = useNavigate();

  const handleVerify = (name, action) => {
    setDoctorList((prev) => prev.filter((d) => d.name !== name));
    alert(`Dr. ${name} has been ${action === "approve" ? "✅ approved" : "❌ rejected"}`);
  };

  const statusBadge = (status) => {
    const map = {
      Active: "bg-green-500/10 text-green-400 border-green-500/20",
      Inactive: "bg-white/5 text-white/40 border-white/10",
      Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      Completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
      Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
      Success: "bg-green-500/10 text-green-400 border-green-500/20",
      Failed: "bg-red-500/10 text-red-400 border-red-500/20",
      Uploaded: "bg-green-500/10 text-green-400 border-green-500/20",
    };
    return map[status] || "bg-white/5 text-white/40 border-white/10";
  };

  const maxBar = Math.max(...CHART_DATA);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex">
      {/* SIDEBAR */}
      <aside className="w-64 min-h-screen bg-white/5 border-r border-white/10 fixed left-0 top-0 bottom-0 flex flex-col py-7 z-10">
        {/* Brand */}
        <div className="px-6 pb-8 border-b border-white/10 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-sky-500/30 mb-3">
            🏥
          </div>
          <div className="font-syne text-xl font-extrabold tracking-tight">
            Care<span className="text-sky-500">Link</span>
          </div>
          <div className="inline-block mt-1 px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-full text-[10px] text-sky-400 uppercase font-semibold tracking-wider">
            Admin Portal
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3">
          <div className="text-[10px] tracking-wider uppercase text-white/25 font-semibold px-3 mb-2 mt-5">Main</div>
          {TABS.map((tab) => (
            <div
              key={tab.id}
              onClick={() => (tab.id === "payments" ? navigate("/admin/payments") : setActiveTab(tab.id))}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-sky-500/15 text-white border border-sky-500/20"
                  : "text-white/45 hover:bg-white/5 hover:text-white/85"
              }`}
            >
              <span className="text-base w-5 text-center">{tab.icon}</span>
              {tab.label}
              {tab.badge && (
                <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab.badgeGreen ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-red-500/15 text-red-400 border border-red-500/20"
                }`}>
                  {tab.badge}
                </span>
              )}
            </div>
          ))}
          <div className="text-[10px] tracking-wider uppercase text-white/25 font-semibold px-3 mt-6 mb-2">System</div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/45 hover:bg-white/5 hover:text-white/85 transition-all cursor-pointer">
            <span className="text-base w-5 text-center">⚙️</span> Settings
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/45 hover:bg-white/5 hover:text-white/85 transition-all cursor-pointer">
            <span className="text-base w-5 text-center">📊</span> Reports
          </div>
        </nav>

        {/* Sidebar Footer (Tailwind only) */}
        <div className="px-6 pt-4 pb-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">A</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-100">Admin</div>
              <div className="text-xs text-gray-400">Super Administrator</div>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to logout?")) navigate("/login");
              }}
              title="Logout"
              className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-sm transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/40 flex-shrink-0"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 flex-1 p-8 min-h-screen">
        {/* Topbar */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="font-syne text-2xl font-extrabold tracking-tight">
              {TABS.find((t) => t.id === activeTab)?.icon}{" "}
              {TABS.find((t) => t.id === activeTab)?.label || "Overview"}
            </div>
            <div className="text-sm text-white/35 mt-0.5">
              CareLink Admin — {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white/40 text-sm">🔍 Search...</div>
            <div className="relative w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all">
              🔔
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-gray-950" />
            </div>
            <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all">👤</div>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
              {STATS.map((s, i) => (
                <div key={i} className="relative bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden hover:border-white/20 hover:-translate-y-0.5 transition-all">
                  <div className="absolute -top-7 -right-7 w-24 h-24 rounded-full opacity-10 blur-3xl" style={{ background: s.glow }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3.5" style={{ background: `${s.color}18` }}>{s.icon}</div>
                  <div className="font-syne text-3xl font-extrabold tracking-tight mb-1">{s.value}</div>
                  <div className="text-xs text-white/40 font-medium">{s.label}</div>
                  <div className={`flex items-center gap-1 mt-2.5 text-xs font-semibold ${s.up ? "text-green-400" : "text-red-400"}`}>
                    {s.up ? "↑" : "↓"} {s.change} vs last month
                  </div>
                </div>
              ))}
            </div>

            {/* Charts & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
              {/* Chart Panel */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
                  <div className="font-syne text-sm font-bold">📈 Appointments This Year</div>
                  <div className="text-xs text-sky-400 cursor-pointer">View all</div>
                </div>
                <div className="p-5">
                  <div className="flex items-end gap-2 h-20 px-1">
                    {CHART_DATA.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gradient-to-t from-sky-500 to-sky-500/30 rounded-t transition-all hover:from-sky-400"
                          style={{ height: `${(val / maxBar) * 100}%` }}
                          title={`${CHART_LABELS[i]}: ${val}`}
                        />
                        <div className="text-[10px] text-white/30">{CHART_LABELS[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
                  <div className="font-syne text-sm font-bold">🔔 Recent Activity</div>
                  <div className="text-xs text-sky-400 cursor-pointer" onClick={() => setActiveTab("notifications")}>See all</div>
                </div>
                <div className="p-5 space-y-3">
                  {NOTIFICATIONS.slice(0, 3).map((n, i) => (
                    <div key={i} className="flex gap-3 pb-3 border-b border-white/5 last:border-0">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: n.bg }}>{n.icon}</div>
                      <div>
                        <div className="text-sm leading-relaxed">{n.text}</div>
                        <div className="text-xs text-white/30 mt-0.5">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
              <div className="font-syne text-sm font-bold">👥 Staff & Admins ({userList.length})</div>
              <div className="text-xs text-sky-400 cursor-pointer">+ Add User</div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-left text-[11px] tracking-wide uppercase text-white/30 font-semibold border-b border-white/5">
                  <tr>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((u, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: `${u.color}22`, color: u.color }}>{u.avatar}</div>
                          <div>
                            <div className="text-sm font-medium">{u.name}</div>
                            <div className="text-xs text-white/35">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "Doctor" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-white/5 text-white/40 border border-white/10"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(u.status)}`}>● {u.status}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-white/45">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : u.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PATIENT MANAGEMENT TAB */}
        {activeTab === "patients" && <PatientManagement />}

        {/* DOCTOR VERIFICATION TAB */}
        {activeTab === "doctors" && <DoctorManagement />}

        {/* APPOINTMENTS TAB */}
        {activeTab === "appointments" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
              <div className="font-syne text-sm font-bold">📅 Appointment Overview</div>
              <div className="flex gap-2">
                {["All", "Today", "Pending", "Completed"].map((f) => (
                  <button key={f} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    f === "All" ? "bg-sky-500/15 text-sky-400 border border-sky-500/30" : "bg-white/5 text-white/45 border border-white/10 hover:bg-white/10"
                  }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-left text-[11px] tracking-wide uppercase text-white/30 font-semibold border-b border-white/5">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Doctor</th>
                    <th className="px-3 py-2">Patient</th>
                    <th className="px-3 py-2">Date & Time</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {APPOINTMENTS.map((a, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-3 py-3 text-sky-400 font-semibold text-xs">{a.id}</td>
                      <td className="px-3 py-3 text-sm">{a.doctor}</td>
                      <td className="px-3 py-3 text-white/60 text-sm">{a.patient}</td>
                      <td className="px-3 py-3 text-white/45 text-xs">{a.date} · {a.time}</td>
                      <td className="px-3 py-3"><span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">🎥 {a.type}</span></td>
                      <td className="px-3 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(a.status)}`}>● {a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === "payments" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {[
                { label: "Total Revenue", value: "LKR 184K", icon: "💰", color: "#22c55e" },
                { label: "Successful", value: "342", icon: "✅", color: "#0ea5e9" },
                { label: "Failed/Pending", value: "18", icon: "⚠️", color: "#f59e0b" },
              ].map((s, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3.5" style={{ background: `${s.color}18` }}>{s.icon}</div>
                  <div className="font-syne text-3xl font-extrabold tracking-tight mb-1">{s.value}</div>
                  <div className="text-xs text-white/40 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
                <div className="font-syne text-sm font-bold">💳 Payment Transactions</div>
                <div className="text-xs text-sky-400 cursor-pointer">Export CSV</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left text-[11px] tracking-wide uppercase text-white/30 font-semibold border-b border-white/5">
                    <tr>
                      <th className="px-3 py-2">Payment ID</th>
                      <th className="px-3 py-2">Patient</th>
                      <th className="px-3 py-2">Doctor</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PAYMENTS.map((p, i) => (
                      <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                        <td className="px-3 py-3 text-sky-400 font-semibold text-xs">{p.id}</td>
                        <td className="px-3 py-3 text-sm">{p.patient}</td>
                        <td className="px-3 py-3 text-white/60 text-sm">{p.doctor}</td>
                        <td className="px-3 py-3 text-sm font-semibold">{p.amount}</td>
                        <td className="px-3 py-3 text-white/45 text-xs">{p.date}</td>
                        <td className="px-3 py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusBadge(p.status)}`}>● {p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center">
              <div className="font-syne text-sm font-bold">🔔 All Notifications</div>
              <div className="text-xs text-sky-400 cursor-pointer">Mark all read</div>
            </div>
            <div className="p-5 space-y-4">
              {NOTIFICATIONS.map((n, i) => (
                <div key={i} className="flex gap-3 pb-4 border-b border-white/5 last:border-0">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0" style={{ background: n.bg }}>{n.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm leading-relaxed">{n.text}</div>
                    <div className="text-xs text-white/30 mt-1">{n.time}</div>
                  </div>
                  <button className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded-lg text-white/40 hover:bg-white/10">Dismiss</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;