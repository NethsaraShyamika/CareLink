import { useRef, useState, useEffect } from "react";

function CallRoom({
  role,
  appointmentId,
  messages = [],
  chatInput = "",
  setChatInput = () => {},
  sendMessage = () => {},
  sendFile = () => {},
  micOn,
  cameraOn,
  toggleMic,
  toggleCamera,
  leaveCall,
}) {
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDuration = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { await sendFile(file); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "📎";
    const ext = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx"].includes(ext)) return "📊";
    return "📎";
  };

  const handleDownload = (fileData, fileName) => {
    if (!fileData || !fileName) return;

    try {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = fileData; // This should be a data URL like "data:application/pdf;base64,..."
      link.download = fileName;
      link.style.display = 'none';

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(fileData, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      className="w-full min-h-screen bg-[#070d1a] flex flex-col overflow-hidden">

      {/* ── AMBIENT BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/8 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/6 blur-[140px]" />
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      {/* ── TOP BAR ── */}
      <header className="relative z-20 flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm shadow-lg shadow-blue-500/30">
            🏥
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight">Care<span className="text-blue-400">Link</span></span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Live Session</span>
            </div>
          </div>
        </div>

        {/* Center — call info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-white/70 text-xs font-mono font-semibold">{formatDuration(callDuration)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-white/40 text-xs">ID:</span>
            <span className="text-white/70 text-xs font-mono">{appointmentId}</span>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
            role === "doctor"
              ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
              : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
          }`}>
            {role === "doctor" ? "👨‍⚕️ Doctor" : "🧑‍💼 Patient"}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowChat(!showChat)} title="Toggle Chat"
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${
              showChat ? "bg-blue-500/20 border border-blue-500/30 text-blue-400" : "bg-white/5 border border-white/10 text-white/40 hover:text-white"
            }`}>
            💬
          </button>
          <button onClick={toggleFullscreen} title="Fullscreen"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all">
            {isFullscreen ? "⊡" : "⛶"}
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex flex-1 gap-4 p-4 overflow-hidden">

        {/* ── LEFT: VIDEO SECTION ── */}
        <div className="flex flex-col flex-1 gap-4 min-w-0">

          {/* Videos grid */}
          <div className="grid grid-cols-2 gap-3 flex-1">

            {/* Remote video — larger */}
            <div className="relative col-span-2 lg:col-span-1 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-white/[0.08] shadow-2xl group"
              style={{ minHeight: "280px" }}>
              <div id="remote-video" className="absolute inset-0 w-full h-full" />
              {/* Gradient overlay bottom */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              {/* Label */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${role === "doctor" ? "bg-emerald-400" : "bg-blue-400"} animate-pulse`} />
                <span className="text-white/80 text-xs font-semibold backdrop-blur-sm bg-black/20 px-2 py-1 rounded-lg">
                  {role === "doctor" ? "🧑‍💼 Patient" : "👨‍⚕️ Doctor"}
                </span>
              </div>
              {/* Signal indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {[3, 5, 7].map((h, i) => (
                  <div key={i} className="w-1 bg-emerald-400 rounded-full" style={{ height: `${h}px` }} />
                ))}
              </div>
            </div>

            {/* Local video */}
            <div className="relative col-span-2 lg:col-span-1 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border border-white/[0.08] shadow-2xl"
              style={{ minHeight: "280px" }}>
              <div id="local-video" className="absolute inset-0 w-full h-full" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${role === "doctor" ? "bg-blue-400" : "bg-emerald-400"} animate-pulse`} />
                <span className="text-white/80 text-xs font-semibold backdrop-blur-sm bg-black/20 px-2 py-1 rounded-lg">
                  {role === "doctor" ? "👨‍⚕️ You (Doctor)" : "🧑‍💼 You (Patient)"}
                </span>
              </div>
              {/* Mic indicator */}
              {!micOn && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-red-500/80 backdrop-blur-sm text-white text-[10px] font-bold flex items-center gap-1">
                  🔇 Muted
                </div>
              )}
            </div>
          </div>

          {/* ── CONTROLS BAR ── */}
          <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">

            {/* Mic */}
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={toggleMic}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-200 shadow-lg ${
                  micOn
                    ? "bg-white/10 border border-white/20 text-white hover:bg-white/15"
                    : "bg-red-500/20 border border-red-500/40 text-red-400"
                }`}>
                {micOn ? "🎙️" : "🔇"}
              </button>
              <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wider">
                {micOn ? "Mic" : "Muted"}
              </span>
            </div>

            {/* Camera */}
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={toggleCamera}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-all duration-200 shadow-lg ${
                  cameraOn
                    ? "bg-white/10 border border-white/20 text-white hover:bg-white/15"
                    : "bg-red-500/20 border border-red-500/40 text-red-400"
                }`}>
                {cameraOn ? "📷" : "🚫"}
              </button>
              <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wider">
                {cameraOn ? "Camera" : "Off"}
              </span>
            </div>

            {/* Speaker */}
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-all duration-200 shadow-lg ${
                  isSpeakerOn
                    ? "bg-white/10 border border-white/20 text-white hover:bg-white/15"
                    : "bg-red-500/20 border border-red-500/40 text-red-400"
                }`}>
                {isSpeakerOn ? "🔊" : "🔈"}
              </button>
              <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wider">
                {isSpeakerOn ? "Speaker" : "Muted"}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-white/10 mx-2" />

            {/* Chat toggle */}
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={() => setShowChat(!showChat)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg transition-all duration-200 shadow-lg relative ${
                  showChat
                    ? "bg-blue-500/20 border border-blue-500/40 text-blue-400"
                    : "bg-white/10 border border-white/20 text-white hover:bg-white/15"
                }`}>
                💬
                {messages.length > 0 && !showChat && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {messages.length > 9 ? "9+" : messages.length}
                  </span>
                )}
              </button>
              <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wider">Chat</span>
            </div>

            {/* Share screen placeholder */}
            <div className="flex flex-col items-center gap-1.5">
              <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg bg-white/10 border border-white/20 text-white/60 hover:bg-white/15 hover:text-white transition-all duration-200 shadow-lg">
                🖥️
              </button>
              <span className="text-[9px] text-white/30 font-semibold uppercase tracking-wider">Share</span>
            </div>

            {/* Divider */}
            <div className="w-px h-10 bg-white/10 mx-2" />

            {/* End call */}
            <div className="flex flex-col items-center gap-1.5">
              <button onClick={leaveCall}
                className="w-14 h-12 rounded-2xl flex items-center justify-center text-lg bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30 hover:from-red-400 hover:to-rose-500 transition-all duration-200 hover:scale-105 active:scale-95">
                📵
              </button>
              <span className="text-[9px] text-red-400/70 font-semibold uppercase tracking-wider">End Call</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: CHAT PANEL ── */}
        {showChat && (
          <div className="w-[320px] flex-shrink-0 flex flex-col rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-2xl">

            {/* Chat header */}
            <div className="px-4 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white font-bold text-sm">Consultation Chat</span>
              </div>
              <span className="text-white/25 text-xs bg-white/5 px-2 py-0.5 rounded-full">
                {messages.length} msgs
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent" }}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <div>
                    <p className="text-white/40 text-sm font-semibold">No messages yet</p>
                    <p className="text-white/20 text-xs mt-0.5">Start the consultation chat</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex flex-col ${msg.mine ? "items-end" : "items-start"}`}>
                    {/* Sender label for non-system messages */}
                    {msg.type !== 'system' && (
                      <span className={`text-[10px] font-semibold mb-1 px-1 ${
                        msg.senderRole === "doctor" ? "text-blue-400/80" : "text-emerald-400/80"
                      }`}>
                        {msg.sender}
                      </span>
                    )}

                    {msg.type === "file" ? (
                      // File bubble
                      <div className={`w-full max-w-[260px] rounded-2xl overflow-hidden border ${
                        msg.mine
                          ? "bg-blue-600/20 border-blue-500/30"
                          : "bg-white/[0.06] border-white/10"
                      }`}>
                        <div className="flex items-center gap-3 p-3">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0">
                            {getFileIcon(msg.fileName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-semibold truncate">{msg.fileName}</p>
                            <p className="text-white/40 text-[10px] mt-0.5">{msg.fileSize}</p>
                          </div>
                        </div>
                        {msg.fileData && (
                          <button
                            onClick={() => handleDownload(msg.fileData, msg.fileName)}
                            className="w-full py-2 text-xs font-semibold text-blue-300 bg-blue-500/15 hover:bg-blue-500/25 transition-all border-t border-white/5 flex items-center justify-center gap-1.5">
                            ⬇️ Download File
                          </button>
                        )}
                      </div>
                    ) : msg.type === "system" ? (
                      // System message
                      <div className="w-full max-w-[260px] px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                        <p className="text-white/60 text-xs italic">{msg.text}</p>
                      </div>
                    ) : (
                      // Text bubble
                      <div className={`max-w-[260px] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.mine
                          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm shadow-lg shadow-blue-500/20"
                          : "bg-white/[0.08] text-white/85 rounded-bl-sm border border-white/[0.08]"
                      }`}>
                        {msg.text}
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 border-t border-white/[0.06] flex flex-col gap-2">
              {/* File upload button */}
              <input ref={fileInputRef} type="file" accept="*/*" onChange={handleFileChange} className="hidden" />

              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                  title="Send file or report"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-all ${
                    uploading
                      ? "bg-white/5 opacity-40 cursor-not-allowed"
                      : "bg-white/8 border border-white/10 text-white/50 hover:bg-white/15 hover:text-white"
                  }`}>
                  {uploading ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : "📎"}
                </button>

                <div className="flex-1 flex items-center gap-2 bg-white/[0.06] border border-white/10 rounded-xl px-3 focus-within:border-blue-500/40 transition-all">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message…"
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/25 py-2.5"
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-400 hover:to-blue-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
                  ➤
                </button>
              </div>

              <p className="text-[10px] text-white/20 text-center">
                Press Enter to send · 📎 to attach files
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        
        #local-video video,
        #remote-video video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

export default CallRoom;