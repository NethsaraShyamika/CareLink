import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import PaymentSuccess from "./pages/patient/Paymentsuccess";
import PaymentFail from "./pages/patient/Paymentfail";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboard from "./pages/patient/PatientDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;