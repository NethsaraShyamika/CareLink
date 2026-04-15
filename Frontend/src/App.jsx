import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import PaymentSuccess from "./pages/patient/Paymentsuccess";
import PaymentFail from "./pages/patient/Paymentfail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <h1 className="text-4xl font-bold text-blue-400">CareLink 🚀</h1>
          </div>
        } />

        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;