import { useEffect, useState } from "react";

function JoinRedirect({ appointmentId, role, onComplete }) {
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete?.();
    }
  }, [seconds, onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
      <div className="max-w-3xl w-full bg-slate-900/90 border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="grid gap-6 md:grid-cols-[280px_1fr] items-center">
          <div className="rounded-3xl overflow-hidden bg-black/20 border border-white/10 shadow-inner">
            <img
              src="/redirect-image.svg"
              alt="Preparing your consultation"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/80 mb-4">
              Preparing your appointment
            </p>
            <h1 className="text-4xl font-semibold mb-4">
              Redirecting you to the video call...
            </h1>
            <p className="text-slate-300 leading-7 mb-5">
              Appointment ID <strong>{appointmentId}</strong> is being prepared. You will be redirected to the video session automatically in <strong>{seconds}</strong> seconds.
            </p>
            <p className="text-slate-400 mb-8">
              If the redirect does not happen automatically, click the button below.
            </p>
            <button
              className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              onClick={onComplete}
            >
              Go to Video Call Now
            </button>
            <p className="mt-6 text-xs text-slate-500">
              Role: {role === "doctor" ? "Doctor" : "Patient"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinRedirect;
