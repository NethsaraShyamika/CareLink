import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import VideoCall from "./pages/shared/VideoCall";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  // Helper to get query params from URL
  const getQueryParam = (param) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param) || "";
  };

  return (
    <Router>
      <Routes>
        {/* Homepage */}
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
              <h1 className="text-4xl font-bold text-blue-400">CareLink 🚀</h1>
            </div>
          }
        />

        {/* Redirect old /join-consultation to /video */}
        <Route
          path="/join-consultation"
          element={
            <Navigate
              to={`/video?appointmentId=${getQueryParam("appointmentId")}&role=${getQueryParam("role")}`}
              replace
            />
          }
        />

        {/* Video Call Route */}
        <Route
          path="/video"
          element={
            <VideoCall
              appointmentId={getQueryParam("appointmentId")}
              role={getQueryParam("role") || "patient"}
            />
          }
        />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;