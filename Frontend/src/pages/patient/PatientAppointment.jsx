import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../../contextUser.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  Calendar,
  Bot,
  ChevronDown,
  Activity,
  Clock,
  Bell,
  Search,
  X,
  LogOut,
  Plus,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Eye,
  MoreVertical,
  Stethoscope,
  CalendarCheck,
  CalendarX,
  Loader2,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

// ─── API base URL (ensure it includes /api) ───────────────────────────────────
const RAW_API = import.meta.env.VITE_APPOINTMENT_SERVICE_URL || "http://localhost:5002";
const API_BASE = RAW_API.replace(/\/$/, "") + (RAW_API.endsWith("/api") ? "" : "/api");

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:     { color: "#F59E0B", bg: "#FEF3C7", label: "Pending",     icon: AlertCircle },
  accepted:    { color: "#06B6D4", bg: "#E0F2FE", label: "Accepted",    icon: Clock },
  confirmed:   { color: "#22C55E", bg: "#DCFCE7", label: "Confirmed",   icon: CheckCircle },
  cancelled:   { color: "#EF4444", bg: "#FEE2E2", label: "Cancelled",   icon: XCircle },
  completed:   { color: "#3B82F6", bg: "#EFF6FF", label: "Completed",   icon: CheckCircle },
  rescheduled: { color: "#8B5CF6", bg: "#F3E8FF", label: "Rescheduled", icon: RefreshCw },
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const Sidebar = ({ user, chatbotOpen, setChatbotOpen, navigate, activePage }) => {
  const initials = `${user?.firstName?.[0] || "?"}${user?.lastName?.[0] || ""}`;
  const { logout } = useUser();

  return (
    <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-6 border-b border-[#E5E7EB]">
        <div className="bg-[#14B8A6] rounded-full w-10 h-10 flex items-center justify-center text-white text-2xl font-bold">+</div>
        <div>
          <div className="font-bold text-lg text-[#111827]">CareLink</div>
          <div className="text-xs text-[#6B7280]">Patient Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          <li
            onClick={() => navigate("/patient/dashboard")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer font-medium transition-colors ${
              activePage === "dashboard"
                ? "bg-[#CCFBF1] text-[#14B8A6]"
                : "text-[#6B7280] hover:bg-[#CCFBF1] hover:text-[#14B8A6]"
            }`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </li>
          <li
            onClick={() => navigate("/patient/appointments")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer font-medium transition-colors ${
              activePage === "appointments"
                ? "bg-[#CCFBF1] text-[#14B8A6]"
                : "text-[#6B7280] hover:bg-[#CCFBF1] hover:text-[#14B8A6]"
            }`}
          >
            <Calendar size={18} /> Appointments
          </li>
          <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
            <span className="material-icons text-[18px]">folder</span> Medical Records
          </li>
          <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
            <span className="material-icons text-[18px]">medication</span>
            Prescriptions
            <span className="ml-auto bg-[#CCFBF1] text-[#0D9488] text-xs px-2 py-0.5 rounded-full">2</span>
          </li>

          {/* Chatbot dropdown */}
          <li
            onClick={() => setChatbotOpen(!chatbotOpen)}
            className="flex items-center justify-between gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3"><Bot size={18} /> Chatbot</div>
            <ChevronDown size={16} className={`transition-transform ${chatbotOpen ? "rotate-180" : ""}`} />
          </li>
          {chatbotOpen && (
            <>
              <li onClick={() => navigate("/patient/symptom-check")}
                className="flex items-center gap-3 pl-10 pr-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
                <Activity size={18} /> Symptom Checker
              </li>
              <li onClick={() => navigate("/patient/symptom-history")}
                className="flex items-center gap-3 pl-10 pr-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
                <Clock size={18} /> Symptom History
              </li>
            </>
          )}
        </ul>

        <div className="mt-8">
          <div className="text-xs text-[#9CA3AF] uppercase mb-2 px-3">Care</div>
          <ul className="space-y-1">
            <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
              <span className="material-icons text-[18px]">groups</span> My Doctors
            </li>
            <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
              <span className="material-icons text-[18px]">mail</span> Messages
              <span className="ml-auto bg-[#EFF6FF] text-[#2563EB] text-xs px-2 py-0.5 rounded-full">1</span>
            </li>
            <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
              <span className="material-icons text-[18px]">verified_user</span> Insurance
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <div className="text-xs text-[#9CA3AF] uppercase mb-2 px-3">Account</div>
          <ul className="space-y-1">
            <li className="flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#CCFBF1] rounded-lg cursor-pointer transition-colors">
              <span className="material-icons text-[18px]">settings</span> Settings
            </li>
            <li
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-3 px-3 py-2 text-[#EF4444] hover:bg-[#FEE2E2] rounded-lg cursor-pointer transition-colors"
            >
              <LogOut size={18} /> Logout
            </li>
          </ul>
        </div>
      </nav>

      {/* User card */}
      <div className="mt-auto px-4 py-4">
        <div className="bg-[#CCFBF1] rounded-xl p-3 flex items-center gap-3">
          <div className="bg-[#0D9488] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[#0D9488] text-sm truncate">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-[#14B8A6]">Patient</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ─── Book Appointment Modal ───────────────────────────────────────────────────
const BookModal = ({ onClose, onBook, patientId, token }) => {
  const [form, setForm] = useState({ doctorId: "", date: "", timeSlot: "", reason: "" });
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchSpec, setSearchSpec] = useState("");

  const timeSlots = [
    "08:00 AM - 08:30 AM", "08:30 AM - 09:00 AM",
    "09:00 AM - 09:30 AM", "09:30 AM - 10:00 AM",
    "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM",
    "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
    "02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM",
    "03:00 PM - 03:30 PM", "03:30 PM - 04:00 PM",
    "04:00 PM - 04:30 PM",
  ];

  const searchDoctors = async () => {
    try {
      // Use doctor-service (port 3002) for doctor search
      const DOCTOR_API = import.meta.env.VITE_DOCTOR_SERVICE_URL || "http://localhost:3002/api";
      const DOCTOR_BASE = DOCTOR_API.replace(/\/$/, "");
      const res = await axios.get(`${DOCTOR_BASE}/doctors/search`, {
        params: { specialty: searchSpec },
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data || []);
    } catch {
      setDoctors([]);
    }
  };

  useEffect(() => { searchDoctors(); }, []);

  const handleSubmit = async () => {
    if (!form.doctorId || !form.date || !form.timeSlot) {
      setError("Please fill all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onBook({ ...form, patientId });
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to book appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" style={{ maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#14B8A6] to-[#2563EB] p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-xl">Book Appointment</h2>
              <p className="text-[#CCFBF1] text-sm mt-0.5">Find a doctor and schedule your visit</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 rounded-full p-2 transition">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Doctor search */}
          <div>
            <label className="text-sm font-semibold text-[#111827] mb-1.5 block">Search Doctors</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Cardiology"
                value={searchSpec}
                onChange={e => setSearchSpec(e.target.value)}
                className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
              />
              <button
                onClick={searchDoctors}
                className="bg-[#14B8A6] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0D9488] transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Doctor select */}
          <div>
            <label className="text-sm font-semibold text-[#111827] mb-1.5 block">Select Doctor <span className="text-[#EF4444]">*</span></label>
            <select
              value={form.doctorId}
              onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
            >
              <option value="">-- Select a doctor --</option>
              {doctors.map(d => (
                <option key={d._id} value={d._id}>
                  Dr. {d.firstName} {d.lastName} {d.specialty ? `· ${d.specialty}` : ""}
                </option>
              ))}
            </select>
            {doctors.length === 0 && (
              <p className="text-xs text-[#9CA3AF] mt-1">Search by specialty to find doctors</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-semibold text-[#111827] mb-1.5 block">Date <span className="text-[#EF4444]">*</span></label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
            />
          </div>

          {/* Time slot */}
          <div>
            <label className="text-sm font-semibold text-[#111827] mb-1.5 block">Time Slot <span className="text-[#EF4444]">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setForm(f => ({ ...f, timeSlot: slot }))}
                  className={`text-xs py-2 px-3 rounded-lg border transition font-medium ${
                    form.timeSlot === slot
                      ? "bg-[#14B8A6] text-white border-[#14B8A6]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#14B8A6] hover:text-[#14B8A6]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-semibold text-[#111827] mb-1.5 block">Reason for Visit</label>
            <textarea
              rows={3}
              placeholder="Describe your symptoms or reason..."
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <div className="bg-[#FEE2E2] text-[#EF4444] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 border border-[#E5E7EB] text-[#6B7280] py-2.5 rounded-lg font-medium hover:bg-[#F9FAFB] transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[#14B8A6] text-white py-2.5 rounded-lg font-medium hover:bg-[#0D9488] transition text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Pay Modal ───────────────────────────────────────────────────────────────
const PayModal = ({ appointment, onClose, token, onPaid }) => {
  const [method, setMethod] = useState("card");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setPaying(true);
    setError("");
    try {
      // Call appointment-service to mark payment/confirm
      await axios.put(`${API_BASE}/appointments/${appointment._id}/confirm-payment`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaid(true);
      if (onPaid) onPaid();
    } catch (e) {
      setError(e.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {paid ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-[#22C55E]" />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-1">Payment Successful!</h3>
            <p className="text-[#6B7280] text-sm mb-6">Your appointment fee has been processed.</p>
            <button onClick={onClose} className="bg-[#14B8A6] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-[#0D9488] transition">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-r from-[#14B8A6] to-[#2563EB] p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-xl">Pay for Appointment</h2>
                <p className="text-[#CCFBF1] text-sm mt-0.5">Secure payment portal</p>
              </div>
              <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 rounded-full p-2 transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Appointment summary */}
              <div className="bg-[#F9FAFB] rounded-xl p-4 border border-[#E5E7EB]">
                <div className="text-xs text-[#9CA3AF] mb-2">Appointment Summary</div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Date</span>
                  <span className="font-medium text-[#111827]">{new Date(appointment.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-[#6B7280]">Time Slot</span>
                  <span className="font-medium text-[#111827]">{appointment.timeSlot}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-[#6B7280]">Status</span>
                  <span className="font-medium text-[#14B8A6] capitalize">{appointment.status}</span>
                </div>
                <div className="border-t border-[#E5E7EB] mt-3 pt-3 flex justify-between">
                  <span className="font-semibold text-[#111827]">Consultation Fee</span>
                  <span className="font-bold text-[#14B8A6] text-lg">LKR 2,500</span>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="text-sm font-semibold text-[#111827] mb-2 block">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "card", label: "Credit Card", icon: "💳" },
                    { id: "bank", label: "Bank Transfer", icon: "🏦" },
                    { id: "cash", label: "Cash on Visit", icon: "💵" },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition text-xs font-medium ${
                        method === m.id ? "border-[#14B8A6] bg-[#CCFBF1] text-[#0D9488]" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#14B8A6]"
                      }`}
                    >
                      <span className="text-xl mb-1">{m.icon}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card details (only for card method) */}
              {method === "card" && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Card number"
                    maxLength={19}
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      className="border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      maxLength={3}
                      className="border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Cardholder name"
                    className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
                  />
                </div>
              )}

              {method === "bank" && (
                <div className="bg-[#EFF6FF] rounded-xl p-4 text-sm text-[#2563EB]">
                  <p className="font-semibold mb-1">Bank Transfer Details</p>
                  <p>Bank: People's Bank · Account: 123-456-789</p>
                  <p>Reference: Your Appointment ID</p>
                </div>
              )}

              {method === "cash" && (
                <div className="bg-[#FEF3C7] rounded-xl p-4 text-sm text-[#92400E]">
                  Please arrive 10 minutes early and pay at the reception desk.
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 border border-[#E5E7EB] text-[#6B7280] py-2.5 rounded-lg font-medium hover:bg-[#F9FAFB] transition text-sm">
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="flex-1 bg-gradient-to-r from-[#14B8A6] to-[#2563EB] text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {paying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  {paying ? "Processing..." : "Pay LKR 2,500"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Appointment Card ─────────────────────────────────────────────────────────
const AppointmentCard = ({ appt, onCancel, onReschedule, onPay }) => {
  const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const dateStr = new Date(appt.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  const canPay = appt.status === "accepted"; // only after doctor accepts
const canCancel = ["pending", "rescheduled", "accepted"].includes(appt.status);
const canReschedule = ["pending", "rescheduled"].includes(appt.status);

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow p-5 relative group">
      {/* Status strip */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
        style={{ background: cfg.color }}
      />

      <div className="flex items-start justify-between pl-3">
        <div className="flex-1 min-w-0">
          {/* Doctor */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              <Stethoscope size={16} />
            </div>
            <div>
              <div className="font-semibold text-[#111827] text-sm">Doctor ID: {appt.doctorId.slice(-8)}</div>
              <div className="text-xs text-[#9CA3AF]">Appointment</div>
            </div>
          </div>

          {/* Date & time */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <Calendar size={13} className="text-[#14B8A6]" />
              {dateStr}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <Clock size={13} className="text-[#14B8A6]" />
              {appt.timeSlot}
            </div>
          </div>

          {/* Reason */}
          {appt.reason && (
            <div className="mt-2 text-xs text-[#9CA3AF] bg-[#F9FAFB] rounded-lg px-3 py-1.5 inline-block max-w-full truncate">
              {appt.reason}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-2 ml-3">
          {/* Status badge */}
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            <StatusIcon size={11} />
            {cfg.label}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 mt-1">
            {canPay && (
              <button
                onClick={() => onPay(appt)}
                className="flex items-center gap-1 bg-gradient-to-r from-[#14B8A6] to-[#2563EB] text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 transition shadow-sm"
              >
                <CreditCard size={12} /> Pay
              </button>
            )}

            {/* 3-dot menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="p-1.5 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg transition"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 bg-white border border-[#E5E7EB] rounded-xl shadow-lg z-10 py-1 min-w-[140px]">
                  {canReschedule && (
                    <button
                      onClick={() => { onReschedule(appt); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#6B7280] hover:bg-[#CCFBF1] hover:text-[#14B8A6] transition"
                    >
                      <RefreshCw size={13} /> Reschedule
                    </button>
                  )}
                  {canCancel && (
                    <button
                      onClick={() => { onCancel(appt._id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#EF4444] hover:bg-[#FEE2E2] transition"
                    >
                      <XCircle size={13} /> Cancel
                    </button>
                  )}
                  {!canCancel && !canReschedule && (
                    <div className="px-4 py-2 text-xs text-[#9CA3AF]">No actions available</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Reschedule Modal ────────────────────────────────────────────────────────
const RescheduleModal = ({ appointment, onClose, onReschedule }) => {
  const [newDate, setNewDate] = useState("");
  const [newTimeSlot, setNewTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const timeSlots = [
    "08:00 AM - 08:30 AM", "09:00 AM - 09:30 AM",
    "10:00 AM - 10:30 AM", "11:00 AM - 11:30 AM",
    "02:00 PM - 02:30 PM", "03:00 PM - 03:30 PM",
    "04:00 PM - 04:30 PM",
  ];

  const handleSubmit = async () => {
    if (!newDate || !newTimeSlot) { setError("Please select a new date and time slot."); return; }
    setLoading(true);
    setError("");
    try {
      await onReschedule(appointment._id, newDate, newTimeSlot);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Failed to reschedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-[#14B8A6] to-[#2563EB] p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-white font-bold text-xl">Reschedule Appointment</h2>
            <p className="text-[#CCFBF1] text-sm mt-0.5">Pick a new date and time</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 rounded-full p-2 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-[#111827] mb-1.5 block">New Date <span className="text-[#EF4444]">*</span></label>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14B8A6] focus:border-transparent"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[#111827] mb-2 block">New Time Slot <span className="text-[#EF4444]">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map(slot => (
                <button
                  key={slot}
                  onClick={() => setNewTimeSlot(slot)}
                  className={`text-xs py-2 px-3 rounded-lg border transition font-medium ${
                    newTimeSlot === slot
                      ? "bg-[#14B8A6] text-white border-[#14B8A6]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#14B8A6] hover:text-[#14B8A6]"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-[#FEE2E2] text-[#EF4444] text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 border border-[#E5E7EB] text-[#6B7280] py-2.5 rounded-lg font-medium hover:bg-[#F9FAFB] transition text-sm">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[#14B8A6] text-white py-2.5 rounded-lg font-medium hover:bg-[#0D9488] transition text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Reschedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const PatientAppointment = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showBookModal, setShowBookModal] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const patientId = user?.id || user?._id;

  // ── Fetch appointments ──────────────────────────────────────────────────────
  const fetchAppointments = async () => {
    if (!patientId) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API_BASE}/appointments/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [patientId]);

  // ── Book ────────────────────────────────────────────────────────────────────
  const handleBook = async (form) => {
    await axios.post(
      `${API_BASE}/appointments`,
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAppointments();
  };

  // ── Cancel ──────────────────────────────────────────────────────────────────
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.put(
        `${API_BASE}/appointments/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (e) {
      alert(e.response?.data?.message || "Failed to cancel.");
    }
  };

  // ── Reschedule ──────────────────────────────────────────────────────────────
  const handleReschedule = async (id, newDate, newTimeSlot) => {
    await axios.put(
      `${API_BASE}/appointments/${id}/reschedule`,
      { newDate, newTimeSlot },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAppointments();
  };

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = appointments.filter(a =>
    filterStatus === "all" ? true : a.status === filterStatus
  );

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = {
    total:     appointments.length,
    upcoming:  appointments.filter(a => ["pending", "confirmed"].includes(a.status)).length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  const initials = `${user?.firstName?.[0] || "?"}${user?.lastName?.[0] || ""}`;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <Sidebar
        user={user}
        chatbotOpen={chatbotOpen}
        setChatbotOpen={setChatbotOpen}
        navigate={navigate}
        activePage="appointments"
      />

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E5E7EB] px-8 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-0.5">
              <span
                className="cursor-pointer hover:text-[#14B8A6] transition"
                onClick={() => navigate("/patient/dashboard")}
              >Dashboard</span>
              <ChevronRight size={12} />
              <span className="text-[#14B8A6] font-medium">Appointments</span>
            </div>
            <h1 className="text-xl font-bold text-[#111827]">My Appointments</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAppointments}
              className="p-2 text-[#6B7280] hover:text-[#14B8A6] hover:bg-[#CCFBF1] rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button className="p-2 text-[#6B7280] hover:text-[#14B8A6] hover:bg-[#CCFBF1] rounded-lg transition">
              <Bell size={18} />
            </button>
            <div className="w-9 h-9 bg-[#0D9488] text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-[#0f766e] transition">
              {initials}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 max-w-6xl mx-auto space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total",     value: stats.total,     color: "#2563EB", bg: "#EFF6FF" },
              { label: "Upcoming",  value: stats.upcoming,  color: "#14B8A6", bg: "#CCFBF1" },
              { label: "Completed", value: stats.completed, color: "#22C55E", bg: "#DCFCE7" },
              { label: "Cancelled", value: stats.cancelled, color: "#EF4444", bg: "#FEE2E2" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4">
                <div className="text-xs text-[#9CA3AF] mb-1">{s.label} Appointments</div>
                <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="mt-2 h-1 rounded-full" style={{ background: s.bg }}>
                  <div className="h-1 rounded-full" style={{ background: s.color, width: stats.total > 0 ? `${(s.value / stats.total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Status filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={16} className="text-[#9CA3AF]" />
              {["all", "pending", "confirmed", "rescheduled", "completed", "cancelled"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition capitalize ${
                    filterStatus === s
                      ? "bg-[#14B8A6] text-white"
                      : "bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#14B8A6] hover:text-[#14B8A6]"
                  }`}
                >
                  {s === "all" ? "All" : STATUS_CONFIG[s]?.label || s}
                </button>
              ))}
            </div>

            {/* Book button */}
            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#14B8A6] to-[#2563EB] text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition shadow-md text-sm"
            >
              <Plus size={18} /> Book Appointment
            </button>
          </div>

          {/* Appointment list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 size={36} className="text-[#14B8A6] animate-spin mb-3" />
              <p className="text-[#9CA3AF] text-sm">Loading your appointments…</p>
            </div>
          ) : error ? (
            <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-2xl p-6 text-center">
              <AlertCircle size={28} className="text-[#EF4444] mx-auto mb-2" />
              <p className="text-[#EF4444] font-medium">{error}</p>
              <button onClick={fetchAppointments} className="mt-3 text-sm text-[#EF4444] underline hover:no-underline">
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-[#CCFBF1] rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarX size={28} className="text-[#14B8A6]" />
              </div>
              <h3 className="text-[#111827] font-semibold text-lg mb-1">
                {filterStatus === "all" ? "No appointments yet" : `No ${filterStatus} appointments`}
              </h3>
              <p className="text-[#9CA3AF] text-sm mb-6">
                {filterStatus === "all"
                  ? "Book your first appointment to get started."
                  : "Try a different filter or book a new appointment."}
              </p>
              <button
                onClick={() => setShowBookModal(true)}
                className="bg-[#14B8A6] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#0D9488] transition text-sm inline-flex items-center gap-2"
              >
                <Plus size={16} /> Book Appointment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map(appt => (
                <AppointmentCard
                  key={appt._id}
                  appt={appt}
                  onCancel={handleCancel}
                  onReschedule={(a) => setRescheduleTarget(a)}
                  onPay={(a) => setPayTarget(a)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showBookModal && (
        <BookModal
          onClose={() => setShowBookModal(false)}
          onBook={handleBook}
          patientId={patientId}
          token={token}
        />
      )}
      {payTarget && (
        <PayModal
          appointment={payTarget}
          onClose={() => setPayTarget(null)}
          token={token}
          onPaid={fetchAppointments}
        />
      )}
      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onReschedule={handleReschedule}
        />
      )}
    </div>
  );
};

export default PatientAppointment;
