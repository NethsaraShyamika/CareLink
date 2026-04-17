import { useEffect, useState } from "react";

/**
 * PaymentSuccess.jsx
 * ─────────────────────────────────────────────────────────────────
 * Stripe redirects here after successful payment.
 * success_url in create-checkout must be:
 *   http://localhost:3000/payment/success
 *
 * On mount: calls POST /api/payments/stripe/confirm with sessionId
 * from URL query params (?session_id=cs_xxx).
 *
 * Usage (React Router v6):
 *   <Route path="/payment/success" element={<PaymentSuccess />} />
 */

const API            = "http://localhost:3005/api";
const APPOINTMENT_API = "http://localhost:5002/api";
const token          = () => localStorage.getItem("token");

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── ROOT ── */
  .ps-root {
    min-height: 100vh;
    background: #F9FAFB;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 16px;
    position: relative;
    overflow: hidden;
  }

  /* ── SUBTLE BG BLOBS ── */
  .ps-blob {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(80px);
    opacity: 0.25;
  }
  .ps-blob-1 {
    width: 400px; height: 400px;
    background: #CCFBF1;
    top: -100px; right: -80px;
  }
  .ps-blob-2 {
    width: 300px; height: 300px;
    background: #EFF6FF;
    bottom: -80px; left: -60px;
  }

  /* ── CONFETTI ── */
  .ps-confetti {
    position: fixed;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }
  .ps-dot {
    position: absolute;
    border-radius: 50%;
    opacity: 0;
    animation: fall linear forwards;
  }
  @keyframes fall {
    0%   { opacity: 1; transform: translateY(-20px) rotate(0deg); }
    100% { opacity: 0; transform: translateY(110vh) rotate(720deg); }
  }

  /* ── CARD ── */
  .ps-card {
    background: #FFFFFF;
    border: 1px solid #E5E7EB;
    border-radius: 24px;
    padding: 52px 44px;
    max-width: 480px;
    width: 100%;
    text-align: center;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    position: relative;
    z-index: 1;
    animation: rise 0.45s ease-out both;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(24px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }

  /* ── ICON ── */
  .ps-icon-wrap {
    width: 80px; height: 80px;
    border-radius: 50%;
    background: #CCFBF1;
    border: 2px solid #99F6E4;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 22px;
    animation: pop 0.4s 0.25s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  .ps-icon-wrap svg { width: 36px; height: 36px; }
  @keyframes pop {
    from { transform: scale(0); }
    to   { transform: scale(1); }
  }

  .ps-icon-error {
    background: #FEF2F2;
    border-color: #FECACA;
  }

  /* ── TYPOGRAPHY ── */
  .ps-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.75rem;
    font-weight: 800;
    color: #111827;
    margin-bottom: 10px;
    letter-spacing: -0.4px;
  }

  .ps-sub {
    font-size: 0.875rem;
    color: #6B7280;
    line-height: 1.65;
    margin-bottom: 28px;
  }

  /* ── VERIFIED BADGE ── */
  .ps-verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #CCFBF1;
    border: 1px solid #99F6E4;
    color: #0D9488;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 5px 13px;
    border-radius: 20px;
    margin-bottom: 22px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* ── STATUS BOX ── */
  .ps-status-box {
    background: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 14px;
    padding: 4px 0;
    text-align: left;
    margin-bottom: 28px;
    overflow: hidden;
  }

  .ps-status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 11px 18px;
    border-bottom: 1px solid #F3F4F6;
    transition: background 0.15s;
  }
  .ps-status-row:last-child { border-bottom: none; }
  .ps-status-row:hover { background: #F0FDFA; }

  .ps-status-row .k {
    font-size: 0.76rem;
    color: #6B7280;
    font-weight: 500;
  }
  .ps-status-row .v {
    font-size: 0.8rem;
    color: #111827;
    font-weight: 600;
    font-family: 'DM Mono', 'Fira Code', monospace;
  }

  .ps-status-ok {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #DCFCE7;
    border: 1px solid #86EFAC;
    color: #15803D;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 20px;
  }

  /* ── DIVIDER ── */
  .ps-divider {
    border: none;
    border-top: 1px solid #E5E7EB;
    margin: 0 0 24px;
  }

  /* ── ACTIONS ── */
  .ps-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ps-btn-primary {
    padding: 13px 20px;
    background: #14B8A6;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(20,184,166,0.25);
  }
  .ps-btn-primary:hover {
    background: #0D9488;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(20,184,166,0.35);
  }
  .ps-btn-primary:active { transform: translateY(0); }

  .ps-btn-secondary {
    padding: 12px 20px;
    background: #F3F4F6;
    color: #374151;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .ps-btn-secondary:hover {
    background: #CCFBF1;
    border-color: #14B8A6;
    color: #0D9488;
  }

  /* ── LOADING ── */
  .ps-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 16px 0 8px;
  }

  .ps-loader-ring {
    width: 44px; height: 44px;
    border: 3px solid #E5E7EB;
    border-top-color: #14B8A6;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .ps-loading p {
    font-size: 0.875rem;
    color: #6B7280;
    font-weight: 500;
  }

  /* ── STEP DOTS ── */
  .ps-steps {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 10px;
  }
  .ps-step-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #E5E7EB;
  }
  .ps-step-dot.active { background: #14B8A6; }
  .ps-step-dot.done   { background: #22C55E; }
`;

/* ── Confetti ── */
const confettiColors = [
  "#99F6E4","#14B8A6","#6EE7B7","#A7F3D0",
  "#FDE68A","#FCA5A5","#93C5FD","#C4B5FD",
];

function Confetti() {
  const dots = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${5 + Math.random() * 8}px`,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    delay: `${Math.random() * 1.4}s`,
    duration: `${2.2 + Math.random() * 2}s`,
  }));
  return (
    <div className="ps-confetti">
      {dots.map((d) => (
        <div
          key={d.id}
          className="ps-dot"
          style={{
            left: d.left,
            width: d.size,
            height: d.size,
            background: d.color,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
    </div>
  );
}

/* ── Check Icon ── */
function IconCheck() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#14B8A6" fillOpacity="0.15"/>
      <path d="M10 18.5L15.5 24L26 13" stroke="#0D9488" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Warning Icon ── */
function IconWarning() {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#EF4444" fillOpacity="0.12"/>
      <path d="M18 11v8" stroke="#EF4444" strokeWidth="2.4" strokeLinecap="round"/>
      <circle cx="18" cy="24.5" r="1.4" fill="#EF4444"/>
    </svg>
  );
}

/* ── Main Component ── */
export default function PaymentSuccess({ onGoHome, onViewHistory }) {
  const [status, setStatus]           = useState("confirming"); // confirming | confirmed | error
  const [paymentData, setPaymentData] = useState(null);
  const [step, setStep]               = useState(0); // 0=payment, 1=appointment

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      confirmPayment(sessionId);
    } else {
      console.error("Missing Stripe session_id on success redirect.");
      setStatus("error");
    }
  }, []);

  const confirmPayment = async (sessionId) => {
    try {
      /* Step 1 — confirm Stripe payment */
      setStep(0);
      const confirmPaymentRes  = await fetch(`${API}/payments/stripe/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      });
      const confirmPaymentJson = await confirmPaymentRes.json();

      if (!confirmPaymentRes.ok || !confirmPaymentJson.success) {
        console.error("Failed to confirm stripe payment:", confirmPaymentJson.message);
        setStatus("error");
        return;
      }

      const payment = confirmPaymentJson.payment;
      setPaymentData(payment);

      /* Step 2 — confirm appointment (best-effort, non-blocking) */
      setStep(1);
      try {
        await fetch(
          `${APPOINTMENT_API}/appointments/${payment.appointmentId}/confirm-payment`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token()}`,
            },
            credentials: "include",
          }
        );
      } catch (apptErr) {
        // Log but don't block — payment already succeeded
        console.warn("Appointment confirm call failed (non-fatal):", apptErr);
      }

      // Payment was confirmed — always show success
      setStatus("confirmed");

    } catch (err) {
      console.error("Confirm payment error:", err);
      setStatus("error");
    }
  };

  const goHome      = () => onGoHome      ? onGoHome()      : (window.location.href = "/patient/dashboard");
  const viewHistory = () => onViewHistory ? onViewHistory() : (window.location.href = "/payments/history");

  return (
    <>
      <style>{css}</style>
      <div className="ps-root">
        {/* Background blobs */}
        <div className="ps-blob ps-blob-1" />
        <div className="ps-blob ps-blob-2" />

        {/* Confetti only on success */}
        {status === "confirmed" && <Confetti />}

        <div className="ps-card">

          {/* ── CONFIRMING ── */}
          {status === "confirming" && (
            <div className="ps-loading">
              <div className="ps-loader-ring" />
              <p>{step === 0 ? "Verifying your payment…" : "Confirming your appointment…"}</p>
              <div className="ps-steps">
                <div className={`ps-step-dot ${step > 0 ? "done" : "active"}`} />
                <div className={`ps-step-dot ${step > 0 ? "active" : ""}`} />
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === "error" && (
            <>
              <div className="ps-icon-wrap ps-icon-error">
                <IconWarning />
              </div>
              <h1 className="ps-title">Something went wrong</h1>
              <p className="ps-sub">
                Your payment was processed but we couldn't confirm your appointment.
                Please contact support with your payment reference.
              </p>
              <hr className="ps-divider" />
              <div className="ps-actions">
                <button className="ps-btn-primary" onClick={goHome}>
                  Go to Dashboard
                </button>
              </div>
            </>
          )}

          {/* ── SUCCESS ── */}
          {status === "confirmed" && (
            <>
              <div className="ps-icon-wrap">
                <IconCheck />
              </div>

              <h1 className="ps-title">Payment Confirmed!</h1>
              <p className="ps-sub">
                Your appointment is booked and payment is complete.
                A confirmation email is on its way to you.
              </p>

              <div className="ps-verified-badge">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5.5L3.8 7.8L8.5 2.5" stroke="#0D9488" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Verified by Stripe
              </div>

              {paymentData && (
                <div className="ps-status-box">
                  {paymentData._id && (
                    <div className="ps-status-row">
                      <span className="k">Payment ID</span>
                      <span className="v">#{paymentData._id.slice(-8).toUpperCase()}</span>
                    </div>
                  )}
                  {paymentData.gatewayOrderId && (
                    <div className="ps-status-row">
                      <span className="k">Stripe Ref</span>
                      <span className="v">{paymentData.gatewayOrderId.slice(0, 22)}…</span>
                    </div>
                  )}
                  {paymentData.amount && (
                    <div className="ps-status-row">
                      <span className="k">Amount Paid</span>
                      <span className="v">LKR {parseFloat(paymentData.amount).toLocaleString("en-US")}</span>
                    </div>
                  )}
                  {paymentData.appointmentId && (
                    <div className="ps-status-row">
                      <span className="k">Appointment</span>
                      <span className="v">#{String(paymentData.appointmentId).slice(-8).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="ps-status-row">
                    <span className="k">Status</span>
                    <span className="v">
                      <span className="ps-status-ok">
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <path d="M1 4.5L3.3 6.8L8 1.5" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Completed
                      </span>
                    </span>
                  </div>
                  {paymentData.sessionId && (
                    <div className="ps-status-row">
                      <span className="k">Session</span>
                      <span className="v">{paymentData.sessionId.slice(0, 20)}…</span>
                    </div>
                  )}
                </div>
              )}

              <div className="ps-actions">
                <button className="ps-btn-primary" onClick={goHome}>
                  Go to Dashboard
                </button>
                <button className="ps-btn-secondary" onClick={viewHistory}>
                  View Payment History
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}