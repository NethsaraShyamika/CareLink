import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/patient/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4 py-8">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-cyan-300 mb-4">CareLink Login</h1>
        <p className="text-sm text-slate-400 mb-8">Sign in to continue to your patient dashboard.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
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
            Sign In
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-cyan-300 hover:text-cyan-200"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}
