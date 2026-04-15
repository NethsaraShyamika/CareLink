import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-cyan-300 mb-4">Create Account</h1>
        <p className="text-sm text-slate-400 mb-8">Register to access CareLink patient features.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="text-sm text-slate-300">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
              placeholder="Jane Doe"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
              placeholder="you@example.com"
            />
          </label>
          <label className="block">
            <span className="text-sm text-slate-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-slate-100 focus:border-cyan-400 focus:outline-none"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-cyan-300 hover:text-cyan-200"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("patient");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate registration logic (replace with real API call)
    if (firstName && lastName && phone && email && password) {
      // On successful registration, redirect to login
      alert("Registration successful! Please log in.");
      navigate("/login");
    } else {
      alert("Please fill all fields.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white bg-opacity-90 shadow-xl rounded-xl p-10 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-8 tracking-wide">Register Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-2" htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-2" htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <input type="hidden" value={role} readOnly />
          <button
            type="submit"
            className="w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-2 rounded-lg shadow-md transition duration-200"
          >
            Register
          </button>
          <div className="text-center mt-4">
            <span className="text-gray-600">Already have an account? </span>
            <button type="button" className="text-blue-700 hover:underline" onClick={() => navigate('/login')}>Login</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
