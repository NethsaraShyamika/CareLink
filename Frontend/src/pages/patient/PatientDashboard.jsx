import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl shadow-black/30">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-cyan-300">Patient Dashboard</h1>
          <p className="mt-3 text-slate-400">Quick links to your CareLink patient tools.</p>
        </header>

        <div className="grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/patient/symptom-check")}
            className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-7 text-left transition hover:border-cyan-400/50 hover:bg-cyan-500/15"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Symptom Checker</p>
            <h2 className="mt-4 text-2xl font-semibold">Start a new symptom check</h2>
            <p className="mt-3 text-slate-400">Use AI-powered symptom guidance to find the best next steps.</p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/patient/symptom-history")}
            className="rounded-3xl border border-slate-700 bg-slate-800/80 p-7 text-left transition hover:border-slate-600"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">History</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">View past symptom reports</h2>
            <p className="mt-3 text-slate-400">Review previous AI symptom checks and outcomes.</p>
          </button>

          <button
            type="button"
            onClick={() => window.location.assign("/video?appointmentId=demo&role=patient")}
            className="rounded-3xl border border-slate-700 bg-slate-800/80 p-7 text-left transition hover:border-slate-600"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Consultation</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Join a video appointment</h2>
            <p className="mt-3 text-slate-400">Connect with your doctor using the telemedicine experience.</p>
          </button>

          <button
            type="button"
            onClick={() => navigate("/payments/history")}
            className="rounded-3xl border border-slate-700 bg-slate-800/80 p-7 text-left transition hover:border-slate-600"
          >
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Payments</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">See payment history</h2>
            <p className="mt-3 text-slate-400">Review completed payments and invoices.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
