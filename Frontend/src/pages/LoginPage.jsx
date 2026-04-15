import React, { useState } from "react";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white bg-opacity-90 shadow-xl rounded-xl p-10 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-blue-900 mb-8 tracking-wide">
          HOSPITAL PORTAL LOGIN
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">Email Address</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg"
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
  );
};

export default LoginPage;  // ✅ THIS LINE IS CRITICAL