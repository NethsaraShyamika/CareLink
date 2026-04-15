import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import VideoCall from "./pages/shared/VideoCall";
import AdminDashboard from "./pages/admin/AdminDashboard";

import PaymentSuccess from "./pages/patient/Paymentsuccess";
import PaymentFail from "./pages/patient/Paymentfail";
import PaymentHistory from "./pages/patient/PaymentHistory";

import LoginPage from "./pages/shared/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboard from "./pages/patient/PatientDashboard";
import SymptomCheck from "./pages/patient/Symptomcheck";
import SymptomHistory from "./pages/patient/Symptomhistory";

function App() {
  const getQueryParam = (param) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param) || "";
  };

  return (
    <Router>
      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
              <h1 className="text-4xl font-bold text-blue-400">
                CareLink 🚀
              </h1>
            </div>
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

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Video Call */}
        <Route
          path="/video"
          element={
            <VideoCall
              appointmentId={getQueryParam("appointmentId")}
              role={getQueryParam("role") || "patient"}
            />
          }
        />

        {/* Payment */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />

        {/* Redirect old route */}
        <Route
          path="/join-consultation"
          element={
            <Navigate
              to={`/video?appointmentId=${getQueryParam("appointmentId")}&role=${getQueryParam("role")}`}
              replace
            />
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;