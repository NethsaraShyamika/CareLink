import logo from '../../assets/logo.png';
import React, { useState, useRef, useEffect } from "react";
import { FadeIn, ScaleIn, SlideInRight, SlideInLeft } from "./DashboardAnimations.jsx";
import { useUser } from "../../contextUser.jsx";
import { deleteOwnAccount, updatePatientProfile, createPatientProfile, fetchPatientProfile } from "../../utils/api.js";
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
    gender: user?.gender || "",
    address: user?.address || "",
    medicalHistory: user?.medicalHistory || "",
    bloodType: user?.bloodType || ""
  });
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

  // const initials = `${user?.firstName?.[0] || "?"}${user?.lastName?.[0] || ""}`;

  // Handle edit profile open
  const openEditModal = (create = false) => {
    setEditData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "",
      gender: user?.gender || "",
      address: user?.address || "",
      medicalHistory: user?.medicalHistory || "",
      bloodType: user?.bloodType || ""
    });
    setIsCreate(create);
    setEditModalOpen(true);
  };

  // Handle edit profile save
  const { login } = useUser();
  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      let updated;
      if (isCreate) {
        updated = await createPatientProfile(token, editData);
      } else {
        updated = await updatePatientProfile(token, editData);
      }
      // Update user context with new data
      login({ ...user, ...updated.patient });
      setEditModalOpen(false);
      setShowProfile(false);
    } catch (err) {
      alert(`Failed to ${isCreate ? "create" : "update"} profile. Please try again.`);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      await deleteOwnAccount(token);
    } catch (err) {
      alert("Failed to delete account. Please try again.");
      return;
    }
    setDeleteModalOpen(false);
    setShowProfile(false);
    logout();
    navigate("/login");
  };

  // Show create profile modal if no profile exists
  useEffect(() => {
    async function checkProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const profile = await fetchPatientProfile(token);
        if (!profile || profile.message === 'Patient profile not found') {
          setIsCreate(true);
          setEditModalOpen(true);
        }
      } catch (err) {
        setIsCreate(true);
        setEditModalOpen(true);
      }
    }
    checkProfile();
    // eslint-disable-next-line
  }, []);

  return (
    <FadeIn className="min-h-screen bg-[#F9FAFB] flex relative">
      {/* Sidebar */}
      <SlideInLeft className="w-64 bg-[#FFFFFF] border-[#E5E7EB] border-r flex flex-col min-h-screen">
        <div className="flex items-center gap-2 px-6 py-6 border-b border-[#E5E7EB]">
          <img src={logo} alt="CareLink Logo" className="w-44 h-auto object-contain mx-auto" />
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {/* Active nav item: Dashboard */}
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 font-medium text-[#14B8A6] bg-[#D1FAE5] rounded-full shadow-sm"
              >
                <LayoutDashboard size={18} className="text-[#14B8A6]" />
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
                className="flex items-center gap-3 px-3 py-2 text-[#6B7280]"
              >
                <Folder size={18} className="text-[#6B7280]" />
                Medical Records
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 text-[#6B7280]"
              >
                <Pill size={18} className="text-[#6B7280]" />
                Prescriptions
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
            <User size={28} />
          </div>
          <div>
            <div className="font-semibold text-[#0D9488]">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-xs text-[#14B8A6]">Patient</div>
          </div>
        </div>
      </SlideInLeft>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <FadeIn className="flex flex-col gap-6 max-w-6xl mx-auto">
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
                <User size={24} />
              </button>

              {/* Profile dropdown */}
              {showProfile && (
                <div
                  className={`fixed top-0 right-0 h-full w-[480px] max-w-full z-50 transition-transform duration-500 ease-in-out ${showProfile ? "translate-x-0" : "translate-x-full"}`}
                  style={{ minWidth: "400px" }}
                >
                  {/* Close button */}
                  <button
                    className="absolute top-5 right-5 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 transition"
                    onClick={() => setShowProfile(false)}
                    aria-label="Close profile sidebar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>

                  {/* Glassmorphism Panel */}
                  <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl shadow-2xl border-l border-[#E5E7EB]">
                    {/* Header */}
                    <div className="relative flex flex-col items-center pt-10 pb-6 px-6 bg-gradient-to-b from-[#EFF6FF] to-[#F9FAFB] rounded-b-3xl border-b border-[#E5E7EB]">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#14B8A6] to-[#2563EB] flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-[#CCFBF1] mb-3">
                        <User size={44} />
                      </div>
                      <div className="text-[#111827] font-bold text-xl mb-1 text-center">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <span className="inline-block px-3 py-0.5 rounded-full border border-[#14B8A6] text-[#14B8A6] text-xs font-semibold bg-[#CCFBF1] mb-2">
                        {user?.role || "patient"}
                      </span>
                    </div>

                    {/* Gradient Divider */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#EFF6FF] via-[#CCFBF1] to-[#EFF6FF] my-2" />

                    {/* Details Section */}
                    <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
                      {/* Email */}
                      <div className="flex items-center bg-[#FFFFFF] rounded-xl border-l-4 border-[#14B8A6] p-3 gap-3 shadow-sm border border-[#E5E7EB]">
                        <div className="bg-[#CCFBF1] text-[#14B8A6] rounded-full p-2">
                          <span className="material-icons text-base">email</span>
                        </div>
                        <div>
                          <div className="text-[#9CA3AF] text-xs">Email</div>
                          <div className="text-[#111827] font-bold text-sm">{user?.email || "—"}</div>
                        </div>
                      </div>
                      {/* Phone */}
                      <div className="flex items-center bg-[#FFFFFF] rounded-xl border-l-4 border-[#2563EB] p-3 gap-3 shadow-sm border border-[#E5E7EB]">
                        <div className="bg-[#EFF6FF] text-[#2563EB] rounded-full p-2">
                          <span className="material-icons text-base">phone</span>
                        </div>
                        <div>
                          <div className="text-[#9CA3AF] text-xs">Phone</div>
                          <div className="text-[#111827] font-bold text-sm">{user?.phone || "—"}</div>
                        </div>
                      </div>
                      {/* Role */}
                      <div className="flex items-center bg-[#FFFFFF] rounded-xl border-l-4 border-[#14B8A6] p-3 gap-3 shadow-sm border border-[#E5E7EB]">
                        <div className="bg-[#CCFBF1] text-[#14B8A6] rounded-full p-2">
                          <span className="material-icons text-base">badge</span>
                        </div>
                        <div>
                          <div className="text-[#9CA3AF] text-xs">Role</div>
                          <div className="text-[#111827] font-bold text-sm capitalize">{user?.role || "patient"}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="px-5 py-4 flex flex-col gap-3">
                      <button
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#CCFBF1] hover:bg-[#14B8A6]/10 rounded-xl shadow transition group border border-[#E5E7EB]"
                        onClick={() => openEditModal(false)}
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-icons text-[#14B8A6] bg-[#CCFBF1] rounded-full p-2">manage_accounts</span>
                          <span className="text-[#14B8A6] font-semibold">Edit Profile</span>
                        </span>
                        <span className="material-icons text-[#9CA3AF] group-hover:text-[#14B8A6]">chevron_right</span>
                      </button>
                      <button
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#FEE2E2] hover:bg-[#EF4444]/10 rounded-xl shadow transition group border border-[#E5E7EB]"
                        onClick={() => setDeleteModalOpen(true)}
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-icons text-[#EF4444] bg-[#FEE2E2] rounded-full p-2">delete</span>
                          <span className="text-[#EF4444] font-semibold">Delete Account</span>
                        </span>
                        <span className="material-icons text-[#9CA3AF] group-hover:text-[#EF4444]">chevron_right</span>
                      </button>
                      <button
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#FEF9C3] hover:bg-[#F59E0B]/10 rounded-xl shadow transition group border border-[#E5E7EB]"
                        onClick={handleLogout}
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-icons text-[#F59E0B] bg-[#FEF9C3] rounded-full p-2">logout</span>
                          <span className="text-[#F59E0B] font-semibold">Logout</span>
                        </span>
                        <span className="material-icons text-[#9CA3AF] group-hover:text-[#F59E0B]">chevron_right</span>
                      </button>
                    </div>

                    {/* Modals (Edit Profile, Delete Account) - unchanged */}
                    {editModalOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40">
                        <form
                          className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
                          onSubmit={handleEditSave}
                        >
                          <button
                            type="button"
                            className="absolute top-3 right-3 text-gray-400 hover:text-[#0D9488] text-2xl"
                            onClick={() => setEditModalOpen(false)}
                            aria-label="Close edit modal"
                          >
                            &times;
                          </button>
                          <h2 className="text-xl font-bold mb-6 text-[#0D9488]">Edit Profile</h2>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">First Name</label>
                              <input
                                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                                type="text"
                                value={editData.firstName}
                                onChange={e => setEditData({ ...editData, firstName: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Last Name</label>
                              <input
                                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                                type="text"
                                value={editData.lastName}
                                onChange={e => setEditData({ ...editData, lastName: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Email</label>
                              <input
                                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                                type="email"
                                value={editData.email}
                                onChange={e => setEditData({ ...editData, email: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Phone</label>
                              <input
                                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                                type="text"
                                value={editData.phone}
                                onChange={e => setEditData({ ...editData, phone: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                              <input
                                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                                type="date"
                                value={editData.dateOfBirth}
                                onChange={e => setEditData({ ...editData, dateOfBirth: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Gender</label>
                              <select
                                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                                value={editData.gender}
                                onChange={e => setEditData({ ...editData, gender: e.target.value })}
                                required
                              >
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Address</label>
                              <input
                                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                                type="text"
                                value={editData.address}
                                onChange={e => setEditData({ ...editData, address: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Medical History</label>
                              <textarea
                                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                                value={editData.medicalHistory}
                                onChange={e => setEditData({ ...editData, medicalHistory: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Blood Type</label>
                              <input
                                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
                                type="text"
                                value={editData.bloodType}
                                onChange={e => setEditData({ ...editData, bloodType: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 mt-8">
                            <button
                              type="button"
                              className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                              onClick={() => setEditModalOpen(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-2 rounded-lg bg-[#14B8A6] text-white font-semibold hover:bg-[#0D9488]"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                    {deleteModalOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-40">
                        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
                          <button
                            type="button"
                            className="absolute top-3 right-3 text-gray-400 hover:text-[#DC2626] text-2xl"
                            onClick={() => setDeleteModalOpen(false)}
                            aria-label="Close delete modal"
                          >
                            &times;
                          </button>
                          <h2 className="text-xl font-bold mb-6 text-[#DC2626]">Delete Account</h2>
                          <p className="mb-6 text-[#374151]">Are you sure you want to delete your account? This action cannot be undone.</p>
                          <div className="flex gap-3 mt-8">
                            <button
                              type="button"
                              className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                              onClick={() => setDeleteModalOpen(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="flex-1 py-2 rounded-lg bg-[#DC2626] text-white font-semibold hover:bg-[#B91C1C]"
                              onClick={handleDeleteAccount}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Top Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Appointments Stat Card */}
            <ScaleIn>
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow p-4 flex flex-col items-start relative overflow-hidden">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 m-2 w-7 h-7 rounded-full bg-[#D1FAE5] opacity-80 z-0"></div>
                <div className="text-xs text-[#9CA3AF] z-10">Upcoming appointments</div>
                <div className="text-2xl font-bold text-[#14B8A6] z-10">3</div>
                <div className="text-xs text-[#14B8A6] mt-1 z-10">Next: Apr 17</div>
              </div>
            </ScaleIn>
            {/* Prescriptions Stat Card */}
            <ScaleIn delay={0.1}>
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow p-4 flex flex-col items-start relative overflow-hidden">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 m-2 w-7 h-7 rounded-full bg-[#FEF3C7] opacity-80 z-0"></div>
                <div className="text-xs text-[#9CA3AF] z-10">Active prescriptions</div>
                <div className="text-2xl font-bold text-[#22C55E] z-10">5</div>
                <div className="text-xs text-[#22C55E] mt-1 z-10">2 refills due</div>
              </div>
            </ScaleIn>
            {/* Messages Stat Card */}
            <ScaleIn delay={0.3}>
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow p-4 flex flex-col items-start relative overflow-hidden">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 m-2 w-7 h-7 rounded-full bg-[#E0E7FF] opacity-80 z-0"></div>
                <div className="text-xs text-[#9CA3AF] z-10">Unread messages</div>
                <div className="text-2xl font-bold text-[#6366F1] z-10">1</div>
                <div className="text-xs text-[#6366F1] mt-1 z-10">From Dr. Perera</div>
              </div>
            </ScaleIn>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Book appointment */}
            <SlideInRight>
              <button className="bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white rounded-xl shadow p-4 flex flex-col items-center hover:from-[#0D9488] hover:to-[#14B8A6] transition">
                <span className="mb-2 flex items-center justify-center">
                  <span className="bg-white/40 backdrop-blur-md rounded-lg p-2 flex items-center justify-center">
                    <span className="material-icons text-white text-lg">event_available</span>
                  </span>
                </span>
                <span className="font-medium">Book appointment</span>
                <span className="text-xs text-white/80 mt-1">Schedule a visit</span>
              </button>
            </SlideInRight>
            {/* Refill prescription */}
            <SlideInRight delay={0.1}>
              <button className="bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white rounded-xl shadow p-4 flex flex-col items-center hover:from-[#0D9488] hover:to-[#14B8A6] transition">
                <span className="mb-2 flex items-center justify-center">
                  <span className="bg-white/40 backdrop-blur-md rounded-lg p-2 flex items-center justify-center">
                    <span className="material-icons text-white text-lg">medication</span>
                  </span>
                </span>
                <span className="font-medium">Refill prescription</span>
                <span className="text-xs text-white/80 mt-1">Request a refill</span>
              </button>
            </SlideInRight>
            {/* Message doctor */}
            <SlideInRight delay={0.3}>
              <button className="bg-gradient-to-r from-[#14B8A6] to-[#0D9488] text-white rounded-xl shadow p-4 flex flex-col items-center hover:from-[#0D9488] hover:to-[#14B8A6] transition">
                <span className="mb-2 flex items-center justify-center">
                  <span className="bg-white/40 backdrop-blur-md rounded-lg p-2 flex items-center justify-center">
                    <span className="material-icons text-white text-lg">mail</span>
                  </span>
                </span>
                <span className="font-medium">Message doctor</span>
                <span className="text-xs text-white/80 mt-1">Start a chat</span>
              </button>
            </SlideInRight>
          </div>

          {/* Main Dashboard Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeIn className="md:col-span-2 flex flex-col gap-6">
              <ScaleIn>
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
                  {/* 1st appointment - Confirmed, green */}
                  <li className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#22C55E] bg-[#D1FAE5] text-lg">
                        SN
                      </div>
                      <div>
                        <div className="font-medium text-[#111827]">Dr. Samantha …</div>
                        <div className="text-xs text-[#6B7280]">Cardiologist · City General Hospital</div>
                      </div>
                    </div>
                    <div className="text-xs text-[#22C55E] font-semibold">Confirmed</div>
                    <div className="text-xs text-[#9CA3AF]">Apr 17 · 10:30</div>
                  </li>
                  {/* 2nd appointment - Pending, amber */}
                  <li className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#F59E0B] bg-[#FEF3C7] text-lg">
                        RS
                      </div>
                      <div>
                        <div className="font-medium text-[#111827]">Dr. Rohan Silva</div>
                        <div className="text-xs text-[#6B7280]">General Practitioner · CareLink Clinic</div>
                      </div>
                    </div>
                    <div className="text-xs text-[#F59E0B] font-semibold">Pending</div>
                    <div className="text-xs text-[#9CA3AF]">Apr 22 · 2:00 PM</div>
                  </li>
                  {/* 3rd appointment - Confirmed, indigo */}
                  <li className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#6366F1] bg-[#E0E7FF] text-lg">
                        PN
                      </div>
                      <div>
                        <div className="font-medium text-[#111827]">Dr. Priya Nair</div>
                        <div className="text-xs text-[#6B7280]">Endocrinologist · North Wing Clinic</div>
                      </div>
                    </div>
                    <div className="text-xs text-[#6366F1] font-semibold">Confirmed</div>
                    <div className="text-xs text-[#9CA3AF]">May 3 · 9:00 AM</div>
                  </li>
                </ul>
                </section>
              </ScaleIn>

              // ...existing code...
            </FadeIn>

            <FadeIn className="flex flex-col gap-6">
              <ScaleIn>
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
                  {/* Blood pressure - normal (green) */}
                  <div className="bg-[#F3F4F6] rounded-xl p-4 flex flex-col items-center shadow-sm">
                    <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Blood Pressure</div>
                    <div className="font-bold text-xl text-[#22C55E]">118/76</div>
                    <div className="text-xs text-[#6B7280]">mmHg</div>
                  </div>
                  {/* Heart rate - normal (green) */}
                  <div className="bg-[#F3F4F6] rounded-xl p-4 flex flex-col items-center shadow-sm">
                    <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Heart Rate</div>
                    <div className="font-bold text-xl text-[#22C55E]">72 <span className="text-xs">bpm</span></div>
                  </div>
                  {/* Blood glucose - slightly elevated (amber) */}
                  <div className="bg-[#F3F4F6] rounded-xl p-4 flex flex-col items-center shadow-sm">
                    <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Blood Glucose</div>
                    <div className="font-bold text-xl text-[#F59E0B]">108</div>
                    <div className="text-xs text-[#6B7280]">mg/dL</div>
                  </div>
                  {/* SpO2 - normal (green) */}
                  <div className="bg-[#F3F4F6] rounded-xl p-4 flex flex-col items-center shadow-sm">
                    <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">SpO₂</div>
                    <div className="font-bold text-xl text-[#22C55E]">98%</div>
                  </div>
                </div>
                </section>
              </ScaleIn>

              <ScaleIn delay={0.1}>
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
                  {/* Metformin - active/ok (green) */}
                  <li className="flex items-center gap-3 justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block"></span>
                      <span className="font-semibold text-[#111827]">Metformin</span>
                      <span className="text-xs text-[#6B7280]">500mg · 1 tablet · Twice daily</span>
                    </div>
                    <span className="text-xs text-[#22C55E] font-medium bg-[#D1FAE5] rounded px-2 py-0.5">Active</span>
                  </li>
                  {/* Atorvastatin - refill due (amber) */}
                  <li className="flex items-center gap-3 justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] inline-block"></span>
                      <span className="font-semibold text-[#111827]">Atorvastatin</span>
                      <span className="text-xs text-[#6B7280]">10mg · 1 tablet · Once daily</span>
                    </div>
                    <span className="text-xs text-[#F59E0B] font-medium bg-[#FEF3C7] rounded px-2 py-0.5">Refill Due</span>
                  </li>
                  {/* Amlodipine - active/ok (green) */}
                  <li className="flex items-center gap-3 justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block"></span>
                      <span className="font-semibold text-[#111827]">Amlodipine</span>
                      <span className="text-xs text-[#6B7280]">5mg · 1 tablet · Once daily</span>
                    </div>
                    <span className="text-xs text-[#22C55E] font-medium bg-[#D1FAE5] rounded px-2 py-0.5">Active</span>
                  </li>
                </ul>
                </section>
              </ScaleIn>

              <ScaleIn delay={0.2}>
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
              </ScaleIn>
            </FadeIn>
          </div>
        </FadeIn>
      </main>
    </FadeIn>
  );
};

export default PatientDashboard;
