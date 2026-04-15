import { useNavigate } from "react-router-dom";

export default function PaymentHistory() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="max-w-4xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl shadow-black/30">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-300">Payment History</h1>
          <p className="mt-3 text-slate-400">Your recent payment activity will appear here.</p>
        </header>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-8">
          <p className="text-slate-400">No payment history is available yet. Once you complete a payment, the records will appear here.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/patient/dashboard")}
              className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
