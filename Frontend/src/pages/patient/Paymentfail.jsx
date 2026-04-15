import { useState } from "react";

/**
 * PaymentFail.jsx
 * ─────────────────────────────────────────────────────────────────
 * Stripe redirects here when user cancels or payment fails.
 * cancel_url in create-checkout must be:
 *   http://localhost:3000/payment/fail
 *
 * Usage (React Router v6):
 *   <Route path="/payment/fail" element={<PaymentFail />} />
 */

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .pf-root {
    min-height: 100vh;
    background: #fff7f7;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
  }

  .pf-card {
    background: #fff;
    border-radius: 28px;
    padding: 56px 48px;
    max-width: 480px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04);
    animation: rise 0.5s ease-out both;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .pf-icon-wrap {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, #fecaca, #fca5a5);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    font-size: 2.4rem;
    animation: shake 0.5s 0.3s ease both;
    box-shadow: 0 8px 24px rgba(239,68,68,0.25);
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }

  .pf-card h1 {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 1.8rem;
    font-weight: 800;
    color: #7f1d1d;
    margin-bottom: 10px;
  }

  .pf-card p.sub {
    font-size: 0.87rem;
    color: #64748b;
    line-height: 1.65;
    margin-bottom: 28px;
  }

  .pf-reason-box {
    background: #fff7f7;
    border: 1.5px solid #fecaca;
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 26px;
    text-align: left;
  }
  .pf-reason-box p.title {
    font-size: 0.72rem;
    font-weight: 700;
    color: #dc2626;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }
  .pf-reason-list {
    list-style: none;
  }
  .pf-reason-list li {
    font-size: 0.82rem;
    color: #6b7280;
    padding: 5px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #fee2e2;
  }
  .pf-reason-list li:last-child { border-bottom: none; }
  .pf-reason-list li::before {
    content: '•';
    color: #fca5a5;
    font-size: 1rem;
    flex-shrink: 0;
  }

  .pf-actions { display: flex; flex-direction: column; gap: 10px; }

  .pf-btn-retry {
    padding: 13px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: #fff;
    border: none;
    border-radius: 11px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 14px rgba(239,68,68,0.3);
  }
  .pf-btn-retry:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(239,68,68,0.4); }

  .pf-btn-home {
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
  .pf-btn-home:hover { border-color: #94a3b8; color: #1e293b; }

  .pf-support {
    margin-top: 20px;
    font-size: 0.75rem;
    color: #94a3b8;
    line-height: 1.6;
  }
  .pf-support a {
    color: #ef4444;
    text-decoration: none;
    font-weight: 600;
  }
  .pf-support a:hover { text-decoration: underline; }
`;

export default function PaymentFail({ onRetry, onGoHome }) {
  const [retryLoading, setRetryLoading] = useState(false);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default: go back in history to the payment page
      window.history.back();
    }
  };

  const handleHome = () => {
    if (onGoHome) onGoHome();
    else window.location.href = "/";
  };

  // Parse reason from URL if present
  const params = new URLSearchParams(window.location.search);
  const reason = params.get("reason") || "cancelled";
  const isCancelled = reason === "cancelled" || reason === "";

  return (
    <>
      <style>{css}</style>
      <div className="pf-root">
        <div className="pf-card">
          <div className="pf-icon-wrap">✕</div>
          <h1>{isCancelled ? "Payment Cancelled" : "Payment Failed"}</h1>
          <p className="sub">
            {isCancelled
              ? "You cancelled the payment process. No charges were made to your account."
              : "We couldn't process your payment. No charges were made. Please try again."}
          </p>

          <div className="pf-reason-box">
            <p className="title">Common Reasons</p>
            <ul className="pf-reason-list">
              <li>Card declined by your bank</li>
              <li>Insufficient funds in account</li>
              <li>Incorrect card details entered</li>
              <li>Network timeout during checkout</li>
            </ul>
          </div>

          <div className="pf-actions">
            <button className="pf-btn-retry" onClick={handleRetry} disabled={retryLoading}>
              {retryLoading ? "Redirecting…" : "↩ Try Again"}
            </button>
            <button className="pf-btn-home" onClick={handleHome}>
              Return to Home
            </button>
          </div>

          <p className="pf-support">
            Need help? Contact{" "}
            <a href="mailto:support@hospital.lk">support@hospital.lk</a>
            {" "}or call{" "}
            <a href="tel:+94112345678">+94 11 234 5678</a>
          </p>
        </div>
      </div>
    </>
  );
}