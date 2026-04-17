import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  Users,
  Video,
  FileText,
  Settings,
  LogOut,
  Bell,
  Check,
  X,
  Clock,
  User,
  Phone,
  RefreshCw,
  Search,
  Eye,
  Home,
  Activity,
  Circle,
} from "lucide-react";

// ─── API Base URL ─────────────────────────────────────────────────────────────
const APPT_API = import.meta.env.VITE_APPOINTMENT_API_URL || "http://localhost:5002/api";
const DR_API   = import.meta.env.VITE_DOCTOR_API_URL      || "http://localhost:3002/api";

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_META = {
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-700", bar: "bg-green-500" },
  pending:   { label: "Pending",   color: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-500" },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-700", bar: "bg-blue-500" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700", bar: "bg-red-500" },
  rejected:  { label: "Rejected",  color: "bg-red-100 text-red-700", bar: "bg-red-500" },
  accepted:  { label: "Accepted",  color: "bg-indigo-100 text-indigo-700", bar: "bg-indigo-500" },
  rescheduled: { label: "Rescheduled", color: "bg-orange-100 text-orange-700", bar: "bg-orange-500" },
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
  } catch { 
    return d;
  }
};

// ─── Avatar color helper ──────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-blue-100 text-blue-700",
  "bg-red-100 text-red-700",
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700",
];

const getAvatarColor = (str = "") => {
  let hash = 0;
  for (let c of str) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// ─── NavItem Component ────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto bg-indigo-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── StatCard Component ───────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, iconColor, value, label, trend, trendColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
          {trend && (
            <p className={`text-xs font-medium mt-2 ${trendColor}`}>{trend}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

// ─── AppointmentCard Component ────────────────────────────────────────────────
function AppointmentCard({ appointment, index, onAccept, onReject, onJoin, onView }) {
  const patientName = appointment.patientName || `${appointment.firstName || ''} ${appointment.lastName || ''}`.trim() || "Unknown Patient";
  const avatarColor = getAvatarColor(patientName);
  const initials = getInitials(patientName);
  const status = appointment.status || "pending";
  const meta = STATUS_META[status] || STATUS_META.pending;
  const isVideo = appointment.type === "video" || appointment.consultationType === "video";
  const dateStr = fmtDate(appointment.date || appointment.appointmentDate);
  const timeStr = appointment.timeSlot || fmtTime(appointment.date || appointment.appointmentDate);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-stretch">
        <div className={`w-1 ${meta.bar}`} />
        
        <div className="flex-1 p-4">
          <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${avatarColor}`}>
                {initials}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${isVideo ? "bg-indigo-500" : "bg-green-500"}`}>
                {isVideo ? <Video size={8} className="text-white" /> : <User size={8} className="text-white" />}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{patientName}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <User size={10} /> ID: {appointment.patientId?.substring(0, 8) || appointment.patientId || "—"}
                </span>
                <span className="text-gray-300">•</span>
                <span className="flex items-center gap-1">
                  {isVideo ? <Video size={10} /> : <User size={10} />}
                  {isVideo ? "Video call" : "In-person"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1.5 truncate max-w-md">
                📋 {appointment.reason || "No reason specified"}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="font-bold text-gray-900">{timeStr}</p>
              <p className="text-xs text-gray-400">{dateStr}</p>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mt-2 ${meta.color}`}>
                {meta.label}
              </span>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {status === "pending" && (
                <>
                  <button
                    onClick={() => onAccept(appointment)}
                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-1"
                  >
                    <Check size={14} /> Accept
                  </button>
                  <button
                    onClick={() => onReject(appointment)}
                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-1"
                  >
                    <X size={14} /> Reject
                  </button>
                </>
              )}
              {status === "confirmed" && isVideo && (
                <button
                  onClick={() => onJoin(appointment)}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1"
                >
                  <Video size={14} /> Join
                </button>
              )}
              {(status === "confirmed" || status === "completed" || status === "cancelled" || status === "accepted") && (
                <button
                  onClick={() => onView(appointment)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                >
                  <Eye size={14} /> View
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DetailModal Component ────────────────────────────────────────────────────
function DetailModal({ appointment, onClose, onAccept, onReject }) {
  if (!appointment) return null;
  const patientName = appointment.patientName || `${appointment.firstName || ''} ${appointment.lastName || ''}`.trim() || "Unknown Patient";
  const status = appointment.status || "pending";
  const meta = STATUS_META[status] || STATUS_META.pending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">Appointment Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Patient</label>
              <p className="font-medium text-gray-900 mt-1">{patientName}</p>
              <p className="text-xs text-gray-500 mt-0.5">ID: {appointment.patientId}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</label>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${meta.color}`}>
                {meta.label}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</label>
              <p className="font-medium text-gray-900 mt-1">{fmtDate(appointment.date || appointment.appointmentDate)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Time Slot</label>
              <p className="font-medium text-gray-900 mt-1">{appointment.timeSlot || "—"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Doctor ID</label>
              <p className="font-medium text-gray-900 mt-1">{appointment.doctorId}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Created</label>
              <p className="font-medium text-gray-900 mt-1">{fmtDate(appointment.createdAt)}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Reason / Complaint</label>
            <p className="text-gray-600 mt-1">{appointment.reason || "Not specified"}</p>
          </div>
          {appointment.doctorNotes && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Doctor Notes</label>
              <p className="text-gray-600 mt-1">{appointment.doctorNotes}</p>
            </div>
          )}
        </div>
        {status === "pending" && (
          <div className="flex justify-end gap-3 p-5 border-t">
            <button onClick={() => { onReject(appointment); onClose(); }} className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors">
              Reject
            </button>
            <button onClick={() => { onAccept(appointment); onClose(); }} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
              Accept Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-48" />
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right duration-300 ${
            toast.type === "success" ? "bg-green-500 text-white" :
            toast.type === "error" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
          }`}
        >
          {toast.type === "success" && <Check size={16} />}
          {toast.type === "error" && <X size={16} />}
          {toast.type === "info" && <Clock size={16} />}
          {toast.message}
        </div>
      ))}
    </div>
  );
}

// ─── Empty State Component ────────────────────────────────────────────────────
function EmptyState({ message, suggestion }) {
  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar size={28} className="text-indigo-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{message}</h3>
      <p className="text-gray-500 text-sm">{suggestion}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DoctorAppointments() {
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState("appointments");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [doctorId, setDoctorId] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // Fetch doctor profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    axios.get(`${DR_API}/doctors/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setDoctorProfile(res.data);
        setDoctorId(res.data._id || res.data.id);
      })
      .catch((err) => {
        console.error("Failed to fetch doctor profile:", err);
        showToast("Could not load doctor profile", "error");
      });
  }, [navigate, showToast]);

  // Fetch appointments - SIMPLIFIED - using firstName and lastName from appointment
  const fetchAppointments = useCallback(async (showLoader = true) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!doctorId) return;

    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await axios.get(`${APPT_API}/appointments/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const appointmentsData = Array.isArray(res.data) ? res.data : res.data.appointments || [];
      
      // Just add patientName using firstName and lastName from the appointment
      const enrichedAppointments = appointmentsData.map(apt => ({
        ...apt,
        patientName: `${apt.firstName || ''} ${apt.lastName || ''}`.trim() || "Unknown Patient"
      }));
      
      setAppointments(enrichedAppointments);
      
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        showToast(err.response?.data?.message || "Failed to load appointments", "error");
        setAppointments([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, showToast, doctorId]);

  useEffect(() => {
    if (doctorId) {
      fetchAppointments();
    }
  }, [fetchAppointments, doctorId]);

  // Accept appointment
  const handleAccept = async (appointment) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${APPT_API}/appointments/${appointment._id}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments((prev) =>
        prev.map((a) => a._id === appointment._id ? { ...a, status: "confirmed" } : a)
      );
      showToast("Appointment confirmed successfully", "success");
    } catch (err) {
      console.error("Accept error:", err);
      showToast(err.response?.data?.message || "Failed to confirm appointment", "error");
    }
  };

  // Reject appointment
  const handleReject = async (appointment) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${APPT_API}/appointments/${appointment._id}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments((prev) =>
        prev.map((a) => a._id === appointment._id ? { ...a, status: "rejected" } : a)
      );
      showToast("Appointment rejected", "error");
    } catch (err) {
      console.error("Reject error:", err);
      showToast(err.response?.data?.message || "Failed to reject appointment", "error");
    }
  };

  const handleJoin = (appointment) => {
    navigate(`/video-session/${appointment._id}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNav = (key) => {
    setActiveNav(key);
    const routes = {
      dashboard: "/doctor/dashboard",
      appointments: "/doctor/appointments",
      patients: "/doctor/patients",
      video: "/doctor/video",
      prescriptions: "/doctor/prescriptions",
      settings: "/doctor/settings",
    };
    if (routes[key]) navigate(routes[key]);
  };

  // Filtering appointments
  const filteredAppointments = appointments.filter((a) => {
    const patientName = (a.patientName || "").toLowerCase();
    const reason = (a.reason || "").toLowerCase();
    const searchMatch = !search || patientName.includes(search.toLowerCase()) || reason.includes(search.toLowerCase());

    const status = a.status || "pending";
    const tabMatch =
      activeTab === "all" ||
      (activeTab === "pending" && status === "pending") ||
      (activeTab === "confirmed" && status === "confirmed") ||
      (activeTab === "completed" && status === "completed") ||
      (activeTab === "cancelled" && status === "cancelled") ||
      (activeTab === "rejected" && status === "rejected") ||
      (activeTab === "accepted" && status === "accepted");

    const type = a.type || a.consultationType || "";
    const typeMatch = typeFilter === "all" || type === typeFilter;

    const appointmentDate = a.date || a.appointmentDate || "";
    const dateMatch = !dateFilter || (appointmentDate && appointmentDate.startsWith(dateFilter));

    return searchMatch && tabMatch && typeMatch && dateMatch;
  });

  // Counts for stats
  const counts = {
    all: appointments.length,
    pending: appointments.filter((a) => (a.status || "pending") === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    rejected: appointments.filter((a) => a.status === "rejected").length,
    accepted: appointments.filter((a) => a.status === "accepted").length,
  };

  const doctorName = doctorProfile
    ? `Dr. ${doctorProfile.firstName || ""} ${doctorProfile.lastName || ""}`.trim()
    : "Loading...";
  const doctorInitials = doctorProfile?.firstName && doctorProfile?.lastName
    ? `${doctorProfile.firstName[0]}${doctorProfile.lastName[0]}`
    : "DR";
  const doctorSpecialty = doctorProfile?.specialization || "Doctor";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "accepted", label: "Accepted" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">MediConnect</h1>
              <p className="text-xs text-gray-500">Doctor Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Overview</p>
            <NavItem icon={Home} label="Dashboard" active={activeNav === "dashboard"} onClick={() => handleNav("dashboard")} />
            <NavItem icon={Calendar} label="Appointments" active={activeNav === "appointments"} onClick={() => handleNav("appointments")} badge={counts.pending} />
            <NavItem icon={Users} label="My Patients" active={activeNav === "patients"} onClick={() => handleNav("patients")} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Consultations</p>
            <NavItem icon={Video} label="Video Sessions" active={activeNav === "video"} onClick={() => handleNav("video")} badge={counts.confirmed} />
            <NavItem icon={FileText} label="Prescriptions" active={activeNav === "prescriptions"} onClick={() => handleNav("prescriptions")} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Account</p>
            <NavItem icon={Settings} label="Settings" active={activeNav === "settings"} onClick={() => handleNav("settings")} />
          </div>
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(doctorName)}`}>
              {doctorInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{doctorName}</p>
              <p className="text-xs text-gray-500 truncate">{doctorSpecialty}</p>
            </div>
            <Circle size={10} className="text-green-500 fill-green-500" />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
              <p className="text-sm text-gray-500 mt-0.5">{today}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell size={20} className="text-gray-600" />
                {counts.pending > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Calendar} iconBg="bg-indigo-50" iconColor="text-indigo-600" value={counts.all} label="Total Appointments" trend={`${counts.confirmed} confirmed`} trendColor="text-green-600" />
            <StatCard icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-600" value={counts.pending} label="Awaiting Response" trend={counts.pending > 0 ? "Action required" : "All cleared"} trendColor={counts.pending > 0 ? "text-amber-600" : "text-gray-500"} />
            <StatCard icon={Check} iconBg="bg-emerald-50" iconColor="text-emerald-600" value={counts.completed} label="Completed" trend="Seen patients" trendColor="text-emerald-600" />
            <StatCard icon={Video} iconBg="bg-blue-50" iconColor="text-blue-600" value={appointments.filter((a) => (a.type || a.consultationType) === "video").length} label="Video Sessions" trend="Teleconsultations" trendColor="text-blue-600" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit mb-5 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                }`}>
                  {counts[tab.key] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex-1 min-w-[200px] relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name or reason..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All types</option>
              <option value="video">Video</option>
              <option value="in-person">In-person</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => fetchAppointments(false)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {loading ? (
              <SkeletonLoader />
            ) : filteredAppointments.length === 0 ? (
              <EmptyState 
                message="No appointments found"
                suggestion={search || typeFilter !== "all" || dateFilter 
                  ? "Try adjusting your filters or search query."
                  : "When patients book appointments, they will appear here."}
              />
            ) : (
              filteredAppointments.map((appointment, idx) => (
                <AppointmentCard
                  key={appointment._id || appointment.id || idx}
                  appointment={appointment}
                  index={idx}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onJoin={handleJoin}
                  onView={setSelectedAppointment}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modals & Toasts */}
      {selectedAppointment && (
        <DetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}