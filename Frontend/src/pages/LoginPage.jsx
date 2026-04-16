import React, { useState } from "react";
import loginBg from "../assets/loginbg.png";
import logo from "../assets/logo.png";

import { useNavigate } from "react-router-dom";
import { useUser } from "../contextUser.jsx";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3008/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      const { token, role, user } = data;

      if (!token) throw new Error("No token received from server");

      localStorage.setItem("token", token);

      login({ ...user, token, role });

      if (role === "patient") navigate("/patient/dashboard");
      else if (role === "doctor") navigate("/doctor/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else throw new Error("Unknown role");

    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-between w-2/5 min-h-screen p-8 bg-gradient-to-br from-[#0f223a] via-[#174e5e] to-[#2563EB] text-white">
        <div>
          <h1 className="text-4xl font-extrabold mb-8 tracking-tight">Welcome to CareLink</h1>

          {/* Section One: Core Health Management */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold uppercase tracking-wide mb-3 text-[#3A9BD5]">Core Health Management</h2>
            <ul className="space-y-2 pl-1">
              <li className="flex items-start gap-2"><span className="mt-1 text-[#3A9BD5]">—</span> Smart Appointment Scheduling & Reminders</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-[#3A9BD5]">—</span> Integrated Lab Results & Comprehensive History</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-[#3A9BD5]">—</span> Electronic Prescription Management & Renewals</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-[#3A9BD5]">—</span> Secure Messaging with Your Medical Providers</li>
            </ul>
          </div>
          <div className="border-t border-white border-opacity-20 my-6"></div>

          {/* Section Two: Security & Compliance */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold uppercase tracking-wide mb-3 text-[#3A9BD5]">Security & Compliance</h2>
            <ul className="space-y-2 pl-1">
              <li className="flex items-start gap-2"><span className="mt-1 text-[#3A9BD5]">—</span> Enterprise-Grade End-to-End Encryption</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-[#3A9BD5]">—</span> Full HIPAA Compliance for Patient Privacy</li>
            </ul>
          </div>
          <div className="border-t border-white border-opacity-20 my-6"></div>

          {/* Section Three: Insight & Monitoring */}
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-wide mb-3 text-[#3A9BD5]">Insight & Monitoring</h2>
            <ul className="space-y-2 pl-1">
              <li className="flex items-start gap-2"><span className="mt-1 text-[#3A9BD5]">—</span> Real-time Vital Health Metric Monitoring</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-[#3A9BD5]">—</span> Longitudinal Health Trend Analytics</li>
            </ul>
          </div>
        </div>
        {/* Stats Row */}
        <div className="flex justify-between items-end mt-10 pt-8 border-t border-white border-opacity-20">
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold">12,000+</div>
            <div className="text-xs opacity-70">Patients Served</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-xs opacity-70">Uptime SLA</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold">340+</div>
            <div className="text-xs opacity-70">Providers Onboarded</div>
          </div>
        </div>
      </div>
      {/* Right Panel */}
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div
          className="shadow-xl rounded-xl p-10 w-full max-w-md"
          style={{
            background: "rgba(255, 255, 255, 0.75)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1.5px solid rgba(200,200,200,0.18)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)"
          }}
        >
          <img src={logo} alt="CareLink Logo" className="h-28 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-8 tracking-wide">
           Login here
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg bg-white bg-opacity-60 focus:bg-opacity-80 transition"
                style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(2px)" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg bg-white bg-opacity-60 focus:bg-opacity-80 transition"
                style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(2px)" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                <span className="ml-2">Remember Me</span>
              </label>
              <a href="#" className="text-blue-600 text-sm">Forgot Password?</a>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-800 text-white py-2 rounded-lg hover:bg-blue-900 transition"
            >
              LOG IN
            </button>
          </form>
          <div className="mt-6">
            <button
              onClick={() => navigate("/register")}
              className="w-full border border-blue-700 text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition"
            >
              Don't have an account? Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;  // ✅ THIS LINE IS CRITICAL