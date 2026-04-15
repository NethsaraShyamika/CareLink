import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import VideoCall from "./pages/shared/VideoCall";
import AdminDashboard from "./pages/admin/AdminDashboard";

import PaymentSuccess from "./pages/patient/Paymentsuccess";
import PaymentFail from "./pages/patient/Paymentfail";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import PatientDashboard from "./pages/patient/PatientDashboard";

function App() {
  const getQueryParam = (param) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param) || "";
  };

  return (
    <Router>
      <Routes>

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

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/patient/dashboard" element={<PatientDashboard />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />

        <Route
          path="/video"
          element={
            <VideoCall
              appointmentId={getQueryParam("appointmentId")}
              role={getQueryParam("role") || "patient"}
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;