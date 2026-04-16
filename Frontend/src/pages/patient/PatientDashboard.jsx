import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../../contextUser.jsx";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Folder,
  Pill,
  Bot,
  Users,
  Mail,
  ShieldCheck,
  Settings,
  Bell,
  Search,
  User,
  X,
  LogOut,
  Stethoscope,
  FileText,
  Activity,
  MessageSquare,
  Clock,
  ChevronDown,
} from "lucide-react";

const PatientDashboard = () => {
  const { user, logout } = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef();
  const navigate = useNavigate();
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = `${user?.firstName?.[0] || "?"}${user?.lastName?.[0] || ""}`;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex relative">
      {/* Sidebar */}
      <aside className="w-64 bg-[#FFFFFF] border-[#E5E7EB] border-r flex flex-col min-h-screen">
        <div className="flex items-center gap-2 px-6 py-6 border-b border-[#E5E7EB]">
          <div className="bg-[#14B8A6] rounded-full w-10 h-10 flex items-center justify-center text-white text-2xl font-bold">
            +
          </div>
          <div>
            <div className="font-bold text-lg text-[#111827]">CareLink</div>
            <div className="text-xs text-[#6B7280]">Patient Portal</div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            <li className="bg-[#CCFBF1] rounded-lg">
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 font-medium text-[#14B8A6]"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </a>
            </li>
            <li
              onClick={() => navigate("/patient/appointments")}
              className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer"
            >
              <Calendar size={18} />
              Appointments
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
              >
                <span className="material-icons">folder</span>
                Medical Records
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
              >
                <span className="material-icons">medication</span>
                Prescriptions
                <span className="ml-auto bg-[#CCFBF1] text-[#0D9488] text-xs px-2 py-0.5 rounded-full">
                  2
                </span>
              </a>
            </li>

            <ul>
              {/* Chatbot Dropdown Header */}
              <li
                onClick={() => setChatbotOpen(!chatbotOpen)}
                className="flex items-center justify-between gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Bot size={18} />
                  Chatbot
                </div>

                <ChevronDown
                  size={16}
                  className={`transition-transform ${chatbotOpen ? "rotate-180" : ""}`}
                />
              </li>

              {/* Dropdown Items */}
              {chatbotOpen && (
                <>
                  <li
                    onClick={() => navigate("/patient/symptom-check")}
                    className="flex items-center gap-3 pl-10 pr-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer"
                  >
                    <Activity size={18} />
                    Symptom Checker
                  </li>

                  <li
                    onClick={() => navigate("/patient/symptom-history")}
                    className="flex items-center gap-3 pl-10 pr-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer"
                  >
                    <Clock size={18} />
                    Symptom History
                  </li>
                </>
              )}
            </ul>
          </ul>
          <div className="mt-8">
            <div className="text-xs text-[#9CA3AF] uppercase mb-2">Care</div>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
                >
                  <span className="material-icons">groups</span>
                  My Doctors
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
                >
                  <span className="material-icons">mail</span>
                  Messages
                  <span className="ml-auto bg-[#EFF6FF] text-[#2563EB] text-xs px-2 py-0.5 rounded-full">
                    1
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
                >
                  <span className="material-icons">verified_user</span>
                  Insurance
                </a>
              </li>
            </ul>
          </div>
          <div className="mt-8">
            <div className="text-xs text-[#9CA3AF] uppercase mb-2">Account</div>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
                >
                  <span className="material-icons">settings</span>
                  Settings
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Sidebar user card */}
        <div className="mt-auto px-6 py-4 bg-[#CCFBF1] rounded-lg m-4 flex items-center gap-3">
          <div className="bg-[#0D9488] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
            {initials}
          </div>
          <div>
            <div className="font-semibold text-[#0D9488]">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-[#14B8A6]">Patient</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">
                Good morning
                {user?.firstName ? `, ${user.firstName}` : ", Guest"}
              </h1>
              <div className="text-[#6B7280] text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Top right icons + profile */}
            <div
              className="flex items-center gap-2 mt-2 md:mt-0 relative"
              ref={profileRef}
            >
              <button className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-full p-2 hover:bg-[#CCFBF1]">
                <span className="material-icons text-[#0D9488]">
                  notifications
                </span>
              </button>
              <button className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-full p-2 hover:bg-[#CCFBF1]">
                <span className="material-icons text-[#0D9488]">search</span>
              </button>

              {/* Profile icon button */}
              <button
                className="bg-[#0D9488] text-white rounded-full w-9 h-9 flex items-center justify-center font-bold focus:outline-none hover:bg-[#0f766e] transition"
                onClick={() => setShowProfile((v) => !v)}
                aria-label="Profile"
              >
                {initials}
              </button>

              {/* Profile dropdown */}
              {showProfile && (
                <div
                  className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-2xl border-l border-[#E5E7EB] z-50 transition-transform duration-300 ${showProfile ? "translate-x-0" : "translate-x-full"}`}
                  style={{ minWidth: "320px" }}
                >
                  {/* Close button */}
                  <button
                    className="absolute top-4 right-4 text-[#0D9488] bg-[#F3F4F6] rounded-full p-2 shadow hover:bg-[#CCFBF1] focus:outline-none"
                    onClick={() => setShowProfile(false)}
                    aria-label="Close profile sidebar"
                  >
                    <span className="material-icons">close</span>
                  </button>

                  {/* Header */}
                  <div className="bg-linear-to-r from-[#14B8A6] to-[#2563EB] px-5 py-4 flex items-center gap-3">
                    <div className="bg-white text-[#0D9488] rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold shadow">
                      {initials}
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-[#CCFBF1] text-xs capitalize">
                        {user?.role || "patient"}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-icons text-[#14B8A6] text-base">
                        email
                      </span>
                      <div>
                        <div className="text-[#9CA3AF] text-xs">Email</div>
                        <div className="text-[#111827] font-medium">
                          {user?.email || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-icons text-[#14B8A6] text-base">
                        phone
                      </span>
                      <div>
                        <div className="text-[#9CA3AF] text-xs">Phone</div>
                        <div className="text-[#111827] font-medium">
                          {user?.phone || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-icons text-[#14B8A6] text-base">
                        badge
                      </span>
                      <div>
                        <div className="text-[#9CA3AF] text-xs">Role</div>
                        <div className="text-[#111827] font-medium capitalize">
                          {user?.role || "patient"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-icons text-[#14B8A6] text-base">
                        verified
                      </span>
                      <div>
                        <div className="text-[#9CA3AF] text-xs">
                          Email Verified
                        </div>
                        <div
                          className={`font-medium ${user?.isEmailVerified ? "text-[#22C55E]" : "text-[#F59E0B]"}`}
                        >
                          {user?.isEmailVerified ? "Verified" : "Not Verified"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="material-icons text-[#14B8A6] text-base">
                        toggle_on
                      </span>
                      <div>
                        <div className="text-[#9CA3AF] text-xs">
                          Account Status
                        </div>
                        <div
                          className={`font-medium ${user?.isActive ? "text-[#22C55E]" : "text-[#EF4444]"}`}
                        >
                          {user?.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#E5E7EB] mx-4" />

                  {/* Actions */}
                  <div className="px-5 py-3 flex flex-col gap-2">
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#374151] hover:bg-[#F3F4F6] rounded-lg transition"
                      onClick={() => {
                        setShowProfile(false);
                      }}
                    >
                      <span className="material-icons text-[#14B8A6] text-base">
                        manage_accounts
                      </span>
                      Edit Profile
                    </button>

                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition font-semibold"
                      onClick={handleLogout}
                    >
                      <span className="material-icons text-[#EF4444] text-base">
                        logout
                      </span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow p-4 flex flex-col items-start">
              <div className="text-xs text-[#9CA3AF]">
                Upcoming appointments
              </div>
              <div className="text-2xl font-bold text-[#14B8A6]">3</div>
              <div className="text-xs text-[#14B8A6] mt-1">Next: Apr 17</div>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow p-4 flex flex-col items-start">
              <div className="text-xs text-[#9CA3AF]">Active prescriptions</div>
              <div className="text-2xl font-bold text-[#22C55E]">5</div>
              <div className="text-xs text-[#22C55E] mt-1">2 refills due</div>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow p-4 flex flex-col items-start">
              <div className="text-xs text-[#9CA3AF]">Lab results pending</div>
              <div className="text-2xl font-bold text-[#F59E0B]">2</div>
              <div className="text-xs text-[#EF4444] mt-1">1 needs review</div>
            </div>
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow p-4 flex flex-col items-start">
              <div className="text-xs text-[#9CA3AF]">Unread messages</div>
              <div className="text-2xl font-bold text-[#14B8A6]">1</div>
              <div className="text-xs text-[#14B8A6] mt-1">From Dr. Perera</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-[#14B8A6] text-white rounded-xl shadow p-4 flex flex-col items-center hover:bg-[#0D9488]">
              <span className="material-icons text-white mb-2">
                event_available
              </span>
              <span className="font-medium">Book appointment</span>
            </button>
            <button className="bg-[#14B8A6] text-white rounded-xl shadow p-4 flex flex-col items-center hover:bg-[#0D9488]">
              <span className="material-icons text-white mb-2">medication</span>
              <span className="font-medium">Refill prescription</span>
            </button>
            <button className="bg-[#14B8A6] text-white rounded-xl shadow p-4 flex flex-col items-center hover:bg-[#0D9488]">
              <span className="material-icons text-white mb-2">science</span>
              <span className="font-medium">View lab results</span>
            </button>
            <button className="bg-[#14B8A6] text-white rounded-xl shadow p-4 flex flex-col items-center hover:bg-[#0D9488]">
              <span className="material-icons text-white mb-2">mail</span>
              <span className="font-medium">Message doctor</span>
            </button>
          </div>

          {/* Main Dashboard Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-6">
              <section className="bg-[#FFFFFF] rounded-xl shadow p-6 border border-[#E5E7EB]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-lg text-[#111827]">
                    Upcoming appointments
                  </h2>
                  <a
                    href="#"
                    className="text-[#14B8A6] text-sm hover:underline"
                  >
                    View all
                  </a>
                </div>
                <ul className="divide-y divide-[#E5E7EB]">
                  <li className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-[#111827]">
                        Dr. Samantha …
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        Cardiologist · City General Hospital
                      </div>
                    </div>
                    <div className="text-xs text-[#22C55E] font-semibold">
                      Confirmed
                    </div>
                    <div className="text-xs text-[#9CA3AF]">Apr 17 · 10:30</div>
                  </li>
                  <li className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-[#111827]">
                        Dr. Rohan Silva
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        General Practitioner · CareLink Clinic
                      </div>
                    </div>
                    <div className="text-xs text-[#F59E0B] font-semibold">
                      Pending
                    </div>
                    <div className="text-xs text-[#9CA3AF]">
                      Apr 22 · 2:00 PM
                    </div>
                  </li>
                  <li className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-[#111827]">
                        Dr. Priya Nair
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        Endocrinologist · North Wing Clinic
                      </div>
                    </div>
                    <div className="text-xs text-[#22C55E] font-semibold">
                      Confirmed
                    </div>
                    <div className="text-xs text-[#9CA3AF]">
                      May 3 · 9:00 AM
                    </div>
                  </li>
                </ul>
              </section>

              <section className="bg-[#FFFFFF] rounded-xl shadow p-6 border border-[#E5E7EB]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-lg text-[#111827]">
                    Recent lab results
                  </h2>
                  <a
                    href="#"
                    className="text-[#14B8A6] text-sm hover:underline"
                  >
                    View all
                  </a>
                </div>
                <ul className="divide-y divide-[#E5E7EB]">
                  <li className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-[#111827]">
                        Complete Blood Count
                      </div>
                      <div className="text-xs text-[#6B7280]">Apr 10, 2026</div>
                    </div>
                    <span className="bg-[#22C55E] bg-opacity-10 text-[#22C55E] text-xs px-2 py-0.5 rounded-full">
                      Normal
                    </span>
                  </li>
                  <li className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-[#111827]">
                        HbA1c (Glycated Hemoglobin)
                      </div>
                      <div className="text-xs text-[#6B7280]">Apr 10, 2026</div>
                    </div>
                    <span className="bg-[#F59E0B] bg-opacity-10 text-[#F59E0B] text-xs px-2 py-0.5 rounded-full">
                      Review
                    </span>
                  </li>
                  <li className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-[#111827]">
                        Lipid Panel
                      </div>
                      <div className="text-xs text-[#6B7280]">Mar 28, 2026</div>
                    </div>
                    <span className="bg-[#22C55E] bg-opacity-10 text-[#22C55E] text-xs px-2 py-0.5 rounded-full">
                      Normal
                    </span>
                  </li>
                  <li className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-[#111827]">
                        TSH (Thyroid)
                      </div>
                      <div className="text-xs text-[#6B7280]">Mar 28, 2026</div>
                    </div>
                    <span className="bg-[#EF4444] bg-opacity-10 text-[#EF4444] text-xs px-2 py-0.5 rounded-full">
                      High
                    </span>
                  </li>
                </ul>
              </section>
            </div>

            <div className="flex flex-col gap-6">
              <section className="bg-[#FFFFFF] rounded-xl shadow p-6 border border-[#E5E7EB]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-lg text-[#111827]">
                    Vitals overview
                  </h2>
                  <a
                    href="#"
                    className="text-[#14B8A6] text-sm hover:underline"
                  >
                    Details
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F9FAFB] rounded-lg p-3 flex flex-col items-center">
                    <div className="text-xs text-[#6B7280]">Blood pressure</div>
                    <div className="font-bold text-lg text-[#111827]">
                      118/76
                    </div>
                    <div className="text-xs text-[#6B7280]">mmHg</div>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-lg p-3 flex flex-col items-center">
                    <div className="text-xs text-[#6B7280]">Heart rate</div>
                    <div className="font-bold text-lg text-[#111827]">
                      72 <span className="text-xs">bpm</span>
                    </div>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-lg p-3 flex flex-col items-center">
                    <div className="text-xs text-[#6B7280]">Blood glucose</div>
                    <div className="font-bold text-lg text-[#111827]">108</div>
                    <div className="text-xs text-[#6B7280]">mg/dL</div>
                  </div>
                  <div className="bg-[#F9FAFB] rounded-lg p-3 flex flex-col items-center">
                    <div className="text-xs text-[#6B7280]">SpO₂</div>
                    <div className="font-bold text-lg text-[#111827]">98%</div>
                  </div>
                </div>
              </section>

              <section className="bg-[#FFFFFF] rounded-xl shadow p-6 border border-[#E5E7EB]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-lg text-[#111827]">
                    Active prescriptions
                  </h2>
                  <a
                    href="#"
                    className="text-[#14B8A6] text-sm hover:underline"
                  >
                    Refill
                  </a>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="bg-[#CCFBF1] text-[#14B8A6] rounded-full px-2 py-0.5 text-xs font-semibold">
                      Metformin 500mg
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      1 tablet · Twice daily
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-[#CCFBF1] text-[#14B8A6] rounded-full px-2 py-0.5 text-xs font-semibold">
                      Atorvastatin 10mg
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      1 tablet · Once daily
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-[#CCFBF1] text-[#14B8A6] rounded-full px-2 py-0.5 text-xs font-semibold">
                      Amlodipine 5mg
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      1 tablet · Once daily
                    </span>
                  </li>
                </ul>
              </section>

              <section className="bg-[#FFFFFF] rounded-xl shadow p-6 border border-[#E5E7EB]">
                <div className="font-semibold text-lg text-[#111827] mb-2">
                  Visits this year
                </div>
                <div className="flex items-end gap-2 h-20">
                  <div
                    className="w-6 bg-[#14B8A6] bg-opacity-30 rounded-t-lg"
                    style={{ height: "60%" }}
                  ></div>
                  <div
                    className="w-6 bg-[#14B8A6] bg-opacity-50 rounded-t-lg"
                    style={{ height: "80%" }}
                  ></div>
                  <div
                    className="w-6 bg-[#14B8A6] bg-opacity-70 rounded-t-lg"
                    style={{ height: "70%" }}
                  ></div>
                  <div
                    className="w-6 bg-[#14B8A6] rounded-t-lg"
                    style={{ height: "90%" }}
                  ></div>
                  <div
                    className="w-6 bg-[#14B8A6] bg-opacity-30 rounded-t-lg"
                    style={{ height: "60%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[#9CA3AF] mt-2">
                  <span>J</span>
                  <span>F</span>
                  <span>M</span>
                  <span>A</span>
                  <span>M</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
