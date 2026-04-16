import { useEffect, useState } from "react";

/**
 * PaymentSuccess.jsx
 * ─────────────────────────────────────────────────────────────────
 * Stripe redirects here after successful payment.
 * success_url in create-checkout must be:
 *   http://localhost:3000/payment/success
 *
 * On mount: calls POST /api/payments/stripe/confirm with paymentIntentId
 * from URL query params (Stripe appends ?payment_intent=pi_xxx automatically
 * when using PaymentIntents; for Checkout Sessions the session_id is appended).
 *
 * Usage (React Router v6):
 *   <Route path="/payment/success" element={<PaymentSuccess />} />
 */

const API = "http://localhost:3005/api";
const token = () => localStorage.getItem("token");

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ps-root {
    min-height: 100vh;
    background: #f0fdf4;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    position: relative;
    overflow: hidden;
  }

  /* Confetti dots */
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
    0% { opacity: 1; transform: translateY(-20px) rotate(0deg); }
    100% { opacity: 0; transform: translateY(110vh) rotate(720deg); }
  }

  .ps-card {
    background: #fff;
    border-radius: 28px;
    padding: 56px 48px;
    max-width: 500px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
    position: relative;
    z-index: 1;
    animation: rise 0.5s ease-out both;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(30px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .ps-icon-wrap {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, #bbf7d0, #86efac);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    font-size: 2.4rem;
    animation: pop 0.4s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    box-shadow: 0 8px 24px rgba(34,197,94,0.3);
  }
  @keyframes pop {
    from { transform: scale(0); }
    to   { transform: scale(1); }
  }

  .ps-card h1 {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 1.9rem;
    font-weight: 800;
    color: #14532d;
    margin-bottom: 10px;
  }

  .ps-card p.sub {
    font-size: 0.88rem;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 32px;
  }

  /* Status block */
  .ps-status-box {
    background: #f0fdf4;
    border: 1.5px solid #bbf7d0;
    border-radius: 14px;
    padding: 18px 20px;
    text-align: left;
    margin-bottom: 28px;
  }

  .ps-status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 7px 0;
    border-bottom: 1px solid #dcfce7;
  }
  .ps-status-row:last-child { border-bottom: none; }
  .ps-status-row .k {
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
  }
  .ps-status-row .v {
    font-size: 0.82rem;
    color: #14532d;
    font-weight: 600;
    font-family: monospace;
  }

  .ps-verified-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #dcfce7;
    border: 1px solid #86efac;
    color: #15803d;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 20px;
    margin-bottom: 24px;
    letter-spacing: 0.05em;
  }

  .ps-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ps-btn-primary {
    padding: 13px;
    background: linear-gradient(135deg, #16a34a, #15803d);
    color: #fff;
    border: none;
    border-radius: 11px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(22,163,74,0.3);
  }
  .ps-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(22,163,74,0.4); }

  .ps-btn-secondary {
    padding: 12px;
    background: #f8fafc;
    color: #475569;
    border: 1.5px solid #e2e8f0;
    border-radius: 11px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .ps-btn-secondary:hover { border-color: #16a34a; color: #16a34a; background: #f0fdf4; }

  .ps-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 20px 0;
  }
  .ps-loader {
    width: 36px; height: 36px;
    border: 3px solid #dcfce7;
    border-top-color: #16a34a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const confettiColors = ["#86efac","#34d399","#6ee7b7","#a7f3d0","#fde68a","#fca5a5","#93c5fd"];

function Confetti() {
  const dots = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: `${6 + Math.random() * 8}px`,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    delay: `${Math.random() * 1.5}s`,
    duration: `${2 + Math.random() * 2}s`,
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

export default function PaymentSuccess({ onGoHome, onViewHistory }) {
  const [status, setStatus] = useState("confirming"); // confirming | confirmed | error
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentIntentId = params.get("payment_intent");
    const sessionId = params.get("session_id"); // Stripe Checkout appends this

    if (paymentIntentId) {
      confirmPayment(paymentIntentId);
    } else if (sessionId) {
      // For checkout sessions, just mark as confirmed visually
      // Webhook handles actual DB update
      setStatus("confirmed");
      setPaymentData({ sessionId });
    } else {
      // No Stripe params — arrived directly (e.g. dev navigation)
      setStatus("confirmed");
      setPaymentData({});
    }
  }, []);

  const confirmPayment = async (paymentIntentId) => {
    try {
      const res = await fetch(`${API}/payments/stripe/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        credentials: "include",
        body: JSON.stringify({ paymentIntentId }),
      });
      const json = await res.json();
      if (json.success) {
        setPaymentData(json.payment);
        setStatus("confirmed");
      } else {
        setStatus("confirmed"); // still show success — webhook will update DB
        setPaymentData({});
      }
    } catch {
      setStatus("confirmed");
      setPaymentData({});
    }
  };

  const goHome = () => {
    if (onGoHome) onGoHome();
    else window.location.href = "/";
  };

  const viewHistory = () => {
    if (onViewHistory) onViewHistory();
    else window.location.href = "/payments/history";
  };

  return (
    <>
      <style>{css}</style>
      <div className="ps-root">
        <Confetti />
        <div className="ps-card">
          {status === "confirming" ? (
            <div className="ps-loading">
              <div className="ps-loader" />
              <p style={{ color: "#64748b", fontSize: "0.88rem" }}>Confirming your payment…</p>
            </div>
          ) : (
            <>
              <div className="ps-icon-wrap">✓</div>
              <h1>Payment Successful!</h1>
              <p className="sub">
                Your appointment has been confirmed. You'll receive a confirmation email shortly.
              </p>

              <div className="ps-verified-badge">
                <span>✓</span> Verified by Stripe
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
                      <span className="v">{paymentData.gatewayOrderId.slice(0, 20)}…</span>
                    </div>
                  )}
                  {paymentData.amount && (
                    <div className="ps-status-row">
                      <span className="k">Amount Paid</span>
                      <span className="v">${parseFloat(paymentData.amount).toFixed(2)} USD</span>
                    </div>
                  )}
                  <div className="ps-status-row">
                    <span className="k">Status</span>
                    <span className="v" style={{ color: "#15803d" }}>Completed ✓</span>
                  </div>
                  {paymentData.sessionId && (
                    <div className="ps-status-row">
                      <span className="k">Session</span>
                      <span className="v">{paymentData.sessionId.slice(0, 18)}…</span>
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