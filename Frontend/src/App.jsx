import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import VideoCall from "./pages/shared/VideoCall";
import AdminDashboard from "./pages/admin/AdminDashboard";

import PaymentSuccess from "./pages/patient/Paymentsuccess";
import PaymentFail from "./pages/patient/Paymentfail";

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

        {/* Redirect consultation → video */}
        <Route
          path="/join-consultation"
          element={
            <Navigate
              to={`/video?appointmentId=${getQueryParam("appointmentId")}&role=${getQueryParam("role")}`}
              replace
            />
          }
        />

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

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Payments */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;