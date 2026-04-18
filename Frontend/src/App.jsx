import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import VideoCall from "./pages/shared/VideoCall";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPaymentManager from "./pages/admin/Adminpaymentmanager";
import DoctorManegement from "./pages/admin/DoctorManegement"; 

import PaymentSuccess from "./pages/patient/Paymentsuccess";
import PaymentFail from "./pages/patient/Paymentfail";
import PaymentHistory from "./pages/patient/PaymentHistory";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import SymptomCheck from "./pages/patient/Symptomcheck";
import SymptomHistory from "./pages/patient/Symptomhistory";
import PatientAppointment from "./pages/patient/PatientAppointment";
import DoctorAppointments from "./pages/doctor/DoctorAppointment";
import DoctorProfile from "./pages/doctor/DoctorProfile";

function App() {
  const getQueryParam = (param) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param) || "";
  };

  const appointmentId = getQueryParam("appointmentId");
  const role = getQueryParam("role") || "patient";
  const autoJoin = getQueryParam("autoJoin");
  const videoUrl = `/video?appointmentId=${appointmentId}&role=${role}&autoJoin=${autoJoin}`;

  return (
    <Router>
      <Routes>

        {/* Redirect root to login or video when appointment query exists */}
        <Route
          path="/"
          element={
            appointmentId ? <Navigate to={videoUrl} replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Patient */}
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/symptom-check" element={<SymptomCheck />} />
        <Route path="/patient/symptom-history" element={<SymptomHistory />} />
        <Route path="/payments/history" element={<PaymentHistory />} />
        <Route path="/patient/appointments" element={<PatientAppointment />} />

        {/* Doctor */}
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/payments" element={<AdminPaymentManager />} />
        <Route path="/admin/doctors" element={<DoctorManegement />} />

        {/* Video Call */}
        <Route
          path="/video"
          element={
            <VideoCall
              initialAppointmentId={getQueryParam("appointmentId")}
              initialRole={role}
              autoJoinEnabled={autoJoin === "1"}
            />
          }
        />

        {/* Payment */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />

        {/* Redirect old route */}
        <Route
          path="/join-consultation"
          element={<Navigate to={videoUrl} replace />}
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;