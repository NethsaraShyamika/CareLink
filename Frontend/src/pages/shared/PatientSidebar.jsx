import logo from '../../assets/logo.png';
import { useState } from "react";
import { useUser } from "../../contextUser.jsx";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Folder,
  Pill,
  Bot,
  Activity,
  Clock,
  ChevronDown,
  User,
  LogOut,
} from "lucide-react";

/**
 * Shared Patient Sidebar — based on PatientDashboard design
 *
 * Props:
 *   activePage — "dashboard" | "appointments" | "symptom-check" | "symptom-history"
 */
const PatientSidebar = ({ activePage }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [chatbotOpen, setChatbotOpen] = useState(
    ["symptom-check", "symptom-history"].includes(activePage)
  );

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="w-64 bg-[#FFFFFF] border-[#E5E7EB] border-r flex flex-col min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6 border-b border-[#E5E7EB]">
        <img
          src={logo}
          alt="CareLink Logo"
          className="w-44 h-auto object-contain mx-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">

          {/* Dashboard */}
          <li
            onClick={() => navigate("/patient/dashboard")}
            className={`flex items-center gap-3 px-3 py-2 cursor-pointer font-medium transition-colors ${
              activePage === "dashboard"
                ? "text-[#14B8A6] bg-[#D1FAE5] rounded-full shadow-sm"
                : "text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
            }`}
          >
            <LayoutDashboard size={18} className={activePage === "dashboard" ? "text-[#14B8A6]" : ""} />
            Dashboard
          </li>

          {/* Appointments */}
          <li
            onClick={() => navigate("/patient/appointments")}
            className={`flex items-center gap-3 px-3 py-2 cursor-pointer font-medium transition-colors ${
              activePage === "appointments"
                ? "text-[#14B8A6] bg-[#D1FAE5] rounded-full shadow-sm"
                : "text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
            }`}
          >
            <Calendar size={18} className={activePage === "appointments" ? "text-[#14B8A6]" : ""} />
            Appointments
          </li>

          {/* Medical Records */}
          <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
            <Folder size={18} className="text-[#6B7280]" />
            Medical Records
          </li>

          {/* Prescriptions */}
          <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
            <Pill size={18} className="text-[#6B7280]" />
            Prescriptions
          </li>

          {/* Chatbot Dropdown */}
          <ul>
            <li
              onClick={() => setChatbotOpen((v) => !v)}
              className="flex items-center justify-between gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bot size={18} />
                Chatbot
              </div>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${chatbotOpen ? "rotate-180" : ""}`}
              />
            </li>

            {chatbotOpen && (
              <>
                {/* Symptom Checker */}
                <li
                  onClick={() => navigate("/patient/symptom-check")}
                  className={`flex items-center gap-3 pl-10 pr-3 py-2 cursor-pointer font-medium transition-colors ${
                    activePage === "symptom-check"
                      ? "text-[#14B8A6] bg-[#D1FAE5] rounded-full shadow-sm"
                      : "text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
                  }`}
                >
                  <Activity size={18} className={activePage === "symptom-check" ? "text-[#14B8A6]" : ""} />
                  Symptom Checker
                </li>

                {/* Symptom History */}
                <li
                  onClick={() => navigate("/patient/symptom-history")}
                  className={`flex items-center gap-3 pl-10 pr-3 py-2 cursor-pointer font-medium transition-colors ${
                    activePage === "symptom-history"
                      ? "text-[#14B8A6] bg-[#D1FAE5] rounded-full shadow-sm"
                      : "text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg"
                  }`}
                >
                  <Clock size={18} className={activePage === "symptom-history" ? "text-[#14B8A6]" : ""} />
                  Symptom History
                </li>
              </>
            )}
          </ul>
        </ul>

        {/* Care Section */}
        <div className="mt-8">
          <div className="text-xs text-[#9CA3AF] uppercase mb-2">Care</div>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
              <span className="material-icons text-[18px]">groups</span>
              My Doctors
            </li>
            <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
              <span className="material-icons text-[18px]">mail</span>
              Messages
            </li>
            <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
              <span className="material-icons text-[18px]">verified_user</span>
              Insurance
            </li>
          </ul>
        </div>

        {/* Account Section */}
        <div className="mt-8">
          <div className="text-xs text-[#9CA3AF] uppercase mb-2">Account</div>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
              <span className="material-icons text-[18px]">settings</span>
              Settings
            </li>
            {/* Logout */}
            <li
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg cursor-pointer transition-colors"
            >
              <LogOut size={18} />
              Logout
            </li>
          </ul>
        </div>
      </nav>

      {/* User card — identical to PatientDashboard */}
      <div className="mt-auto px-6 py-4 bg-[#CCFBF1] rounded-lg m-4 flex items-center gap-3">
        <div className="bg-[#0D9488] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
          <User size={24} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[#0D9488] truncate">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="text-xs text-[#14B8A6]">Patient</div>
        </div>
      </div>
    </div>
  );
};

export default PatientSidebar;