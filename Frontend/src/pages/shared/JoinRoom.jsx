import { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

function JoinRoom({
  appointmentId,
  setAppointmentId,
  uid,
  setUid,
  role,
  setRole,
  joinCall,
}) {
  const [previewOn, setPreviewOn] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [previewTrack, setPreviewTrack] = useState(null);
  const [aptNumber, setAptNumber] = useState("");

  // Sync aptNumber with appointmentId
  useEffect(() => {
    if (appointmentId.startsWith("APT-")) {
      setAptNumber(appointmentId.replace("APT-", ""));
    } else if (/^\d+$/.test(appointmentId)) {
      setAptNumber(appointmentId);
    }
  }, [appointmentId]);

  const handleAptChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // numbers only
    setAptNumber(val);
    setAppointmentId(val ? `APT-${val}` : "");
  };

  const startPreview = async () => {
    try {
      const track = await AgoraRTC.createCameraVideoTrack();
      setPreviewTrack(track);
      setPreviewOn(true);
      setTimeout(() => track.play("preview-video"), 300);
    } catch (err) {
      console.error("Camera preview error:", err);
    }
  };

  const stopPreview = () => {
    if (previewTrack) {
      previewTrack.stop();
      previewTrack.close();
      setPreviewTrack(null);
    }
    setPreviewOn(false);
  };

  useEffect(() => {
    return () => stopPreview();
  }, []);

  const handleJoin = () => {
    const safeUid = uid || String(Math.floor(Math.random() * 900000 + 100000));
    const safeAptNumber = aptNumber || String(Math.floor(Math.random() * 900000 + 100000));
    const safeAppointmentId = `APT-${safeAptNumber}`;

    if (!uid) {
      setUid(safeUid);
    }
    if (!aptNumber) {
      setAptNumber(safeAptNumber);
      setAppointmentId(safeAppointmentId);
    }

    stopPreview();
    joinCall(micEnabled, cameraEnabled, safeAppointmentId, safeUid);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4"
      style={{ background: "#080c14", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Background glow effects */}
      <div style={{
        position: "fixed", top: "-200px", left: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(0,180,255,0.06) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "fixed", bottom: "-200px", right: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(0,100,255,0.05) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div className="w-full max-w-[560px]">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div style={{
            width: "44px", height: "44px",
            background: "linear-gradient(135deg, #0096ff, #0040ff)",
            borderRadius: "14px",
            boxShadow: "0 0 24px rgba(0,150,255,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "22px"
          }}>🏥</div>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "22px", fontWeight: "800", letterSpacing: "-0.5px"
          }}>
            Care<span style={{ color: "#0096ff" }}>Link</span>
          </div>
        </div>

        {/* Main Card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "28px",
          padding: "40px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)"
        }}>

          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "26px", fontWeight: "800",
            letterSpacing: "-0.5px", marginBottom: "6px"
          }}>Join Consultation</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "28px" }}>
            Enter your details to start or join a secure video session
          </p>

          {/* Appointment ID */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{
              display: "block", fontSize: "11px", fontWeight: "600",
              letterSpacing: "1.2px", textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)", marginBottom: "8px"
            }}>Appointment ID</label>
            <div style={{
              display: "flex", alignItems: "center",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px", overflow: "hidden",
              transition: "all 0.2s"
            }}>
              <div style={{
                padding: "14px 16px",
                background: "rgba(0,150,255,0.1)",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                color: "#0096ff", fontWeight: "700",
                fontSize: "15px", letterSpacing: "0.5px",
                flexShrink: 0
              }}>APT-</div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="001"
                value={aptNumber}
                onChange={handleAptChange}
                style={{
                  flex: 1, padding: "14px 16px",
                  background: "transparent", border: "none",
                  color: "#fff", fontSize: "15px",
                  outline: "none", fontFamily: "'DM Sans', sans-serif"
                }}
              />
              {aptNumber && (
                <div style={{
                  padding: "6px 12px", marginRight: "8px",
                  background: "rgba(0,200,100,0.1)",
                  border: "1px solid rgba(0,200,100,0.2)",
                  borderRadius: "8px", fontSize: "11px",
                  color: "#00d68f", fontWeight: "600"
                }}>✓</div>
              )}
            </div>
          </div>

          {/* UID */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{
              display: "block", fontSize: "11px", fontWeight: "600",
              letterSpacing: "1.2px", textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)", marginBottom: "8px"
            }}>Your UID</label>
            <input
              type="number"
              placeholder="e.g. 12345"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              style={{
                width: "100%", padding: "14px 18px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px", color: "#fff",
                fontSize: "15px", outline: "none",
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: "border-box", transition: "all 0.2s"
              }}
            />
          </div>

          {/* Role Selection */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block", fontSize: "11px", fontWeight: "600",
              letterSpacing: "1.2px", textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)", marginBottom: "8px"
            }}>Join as</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { value: "patient", label: "🧑‍💼 Patient" },
                { value: "doctor", label: "👨‍⚕️ Doctor" }
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  style={{
                    padding: "14px",
                    borderRadius: "14px",
                    border: role === r.value
                      ? "1px solid #0096ff"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: role === r.value
                      ? "rgba(0,150,255,0.15)"
                      : "rgba(255,255,255,0.03)",
                    color: role === r.value ? "#fff" : "rgba(255,255,255,0.45)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px", fontWeight: "500",
                    cursor: "pointer", transition: "all 0.2s",
                    boxShadow: role === r.value ? "0 0 20px rgba(0,150,255,0.15)" : "none"
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Preview Box */}
          <div style={{
            width: "100%", height: "180px",
            background: "#0a1628",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            marginBottom: "16px",
            position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            {previewOn && cameraEnabled ? (
              <div id="preview-video" style={{ position: "absolute", inset: 0 }} />
            ) : (
              <div style={{ textAlign: "center", color: "rgba(255,255,255,0.25)" }}>
                <div style={{ fontSize: "36px", marginBottom: "6px" }}>📷</div>
                <div style={{ fontSize: "13px" }}>Camera preview off</div>
              </div>
            )}

            {/* Preview label */}
            {previewOn && (
              <div style={{
                position: "absolute", top: "10px", left: "10px",
                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
                padding: "3px 10px", borderRadius: "20px",
                fontSize: "11px", border: "1px solid rgba(255,255,255,0.1)"
              }}>📹 Preview</div>
            )}
          </div>

          {/* Mic / Camera Toggles */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <button
              onClick={() => setMicEnabled(!micEnabled)}
              style={{
                flex: 1, padding: "12px",
                borderRadius: "12px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px", fontWeight: "600",
                transition: "all 0.2s",
                background: micEnabled ? "rgba(0,150,255,0.12)" : "rgba(255,59,59,0.12)",
                border: micEnabled ? "1px solid rgba(0,150,255,0.3)" : "1px solid rgba(255,59,59,0.3)",
                color: micEnabled ? "#60b8ff" : "#ff6b6b",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
              }}
            >
              {micEnabled ? "🎙️ Mic On" : "🔇 Mic Off"}
            </button>

            <button
              onClick={() => {
                if (!cameraEnabled) {
                  setCameraEnabled(true);
                  startPreview();
                } else {
                  setCameraEnabled(false);
                  stopPreview();
                }
              }}
              style={{
                flex: 1, padding: "12px",
                borderRadius: "12px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px", fontWeight: "600",
                transition: "all 0.2s",
                background: cameraEnabled ? "rgba(0,150,255,0.12)" : "rgba(255,59,59,0.12)",
                border: cameraEnabled ? "1px solid rgba(0,150,255,0.3)" : "1px solid rgba(255,59,59,0.3)",
                color: cameraEnabled ? "#60b8ff" : "#ff6b6b",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
              }}
            >
              {cameraEnabled ? "📷 Camera On" : "🚫 Camera Off"}
            </button>
          </div>

          {/* Preview Button */}
          {!previewOn && (
            <button
              onClick={startPreview}
              style={{
                width: "100%", padding: "11px",
                marginBottom: "14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                color: "rgba(255,255,255,0.5)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px", cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              👁️ Preview Camera
            </button>
          )}

          {/* Join Button */}
          <button            type="button"            onClick={handleJoin}
            style={{
              width: "100%", padding: "16px",
              background: "linear-gradient(135deg, #0096ff, #0040ff)",
              border: "none", borderRadius: "14px",
              color: "#fff",
              fontFamily: "'Syne', sans-serif",
              fontSize: "16px", fontWeight: "700",
              cursor: "pointer", letterSpacing: "0.3px",
              boxShadow: "0 8px 30px rgba(0,100,255,0.35)",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}
          >
            Start Consultation →
          </button>

          {/* Info note */}
          <p style={{
            textAlign: "center", marginTop: "16px",
            fontSize: "12px", color: "rgba(255,255,255,0.25)"
          }}>
            🔒 Secure end-to-end encrypted video consultation
          </p>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom;