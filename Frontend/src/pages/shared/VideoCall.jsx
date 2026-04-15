import { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import AgoraRTM from "agora-rtm-sdk";
import JoinRoom from "./JoinRoom.jsx";
import CallRoom from "./CallRoom.jsx";
import "../../components/videoCall.css";

let cameraTrackRef = null;

function VideoCall({ initialAppointmentId = "", initialRole = "patient", autoJoinEnabled = false }) {
  const [appointmentId, setAppointmentId] = useState(initialAppointmentId);
  const [uid, setUid] = useState("");
  const [role, setRole] = useState(initialRole);
  const [joined, setJoined] = useState(false);
  const [localTracks, setLocalTracks] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const clientRef = useRef(null);
  const rtmClientRef = useRef(null);
  const rtmChannelRef = useRef(null);
  const messagesEndRef = useRef(null);
  const uidRef = useRef(null);
  const roleRef = useRef(null);
  const userRolesRef = useRef({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (autoJoinEnabled && appointmentId && !joined) {
      const timer = setTimeout(() => {
        joinCall(true, true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoJoinEnabled, appointmentId, joined]);

  const joinCall = async (micEnabled = true, cameraEnabled = true) => {
    try {
      clientRef.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

      clientRef.current.on("user-published", async (user, mediaType) => {
        await clientRef.current.subscribe(user, mediaType);
        if (mediaType === "video") {
          setTimeout(() => { user.videoTrack.play("remote-video"); }, 500);
        }
        if (mediaType === "audio") { user.audioTrack.play(); }
      });

      await fetch(`${API_BASE_URL}/telemedicine/room`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true" },
        body: JSON.stringify({ appointmentId, doctorId: "DOC-001", patientId: "PAT-001" })
      });

      const randomUid = parseInt(uid) || Math.floor(Math.random() * 100000);
      uidRef.current = randomUid;
      roleRef.current = role;
      userRolesRef.current[String(randomUid)] = role;

      const tokenRes = await fetch(`${API_BASE_URL}/telemedicine/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true" },
        body: JSON.stringify({ channelName: `appointment_${appointmentId}`, uid: randomUid, role })
      });

      const { appId, channelName } = await tokenRes.json();
      await clientRef.current.join(appId, channelName, null, randomUid);

      for (const user of clientRef.current.remoteUsers) {
        await clientRef.current.subscribe(user, "video");
        await clientRef.current.subscribe(user, "audio");
        setTimeout(() => {
          if (user.videoTrack) user.videoTrack.play("remote-video");
          if (user.audioTrack) user.audioTrack.play();
        }, 500);
      }

      const [micTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        { AEC: true, ANS: true, AGC: true },
        {}
      );

      await micTrack.setEnabled(micEnabled);
      await cameraTrack.setEnabled(cameraEnabled);

      const tracksToPublish = [];
      if (micEnabled) tracksToPublish.push(micTrack);
      if (cameraEnabled) tracksToPublish.push(cameraTrack);
      if (tracksToPublish.length > 0) {
        await clientRef.current.publish(tracksToPublish);
      }

      cameraTrackRef = cameraTrack;
      setMicOn(micEnabled);
      setCameraOn(cameraEnabled);

      rtmClientRef.current = new AgoraRTM.RTM(appId, String(randomUid));
      await rtmClientRef.current.login({ token: null });
      await rtmClientRef.current.subscribe(channelName);
      rtmChannelRef.current = channelName;

      // Updated message listener - handles both text and file messages
      rtmClientRef.current.addEventListener("message", (event) => {
        if (event.publisher === String(uidRef.current)) return;
        let msgText = event.message;
        let senderRole = null;
        let senderLabel = "Remote User";

        try {
          const parsed = JSON.parse(event.message);
          senderRole = parsed.role;
          userRolesRef.current[event.publisher] = parsed.role;
          senderLabel = parsed.role === "doctor" ? "👨‍⚕️ Doctor" : "🧑‍💼 Patient";

          // Handle file message
          if (parsed.type === "file") {
            setMessages(prev => [...prev, {
              type: "file",
              fileName: parsed.fileName,
              fileSize: parsed.fileSize,
              fileData: parsed.fileData,
              sender: senderLabel,
              senderRole,
              mine: false
            }]);
            setTimeout(scrollToBottom, 100);
            return;
          }

          // Handle text message
          if (parsed.text) {
            msgText = parsed.text;
          }

        } catch {
          senderRole = userRolesRef.current[event.publisher] || null;
          senderLabel = senderRole === "doctor" ? "👨‍⚕️ Doctor" : senderRole === "patient" ? "🧑‍💼 Patient" : "Remote User";
        }

        setMessages(prev => [...prev, { text: msgText, sender: senderLabel, senderRole, mine: false }]);
        setTimeout(scrollToBottom, 100);
      });

      setLocalTracks([micTrack, cameraTrack]);
      setJoined(true);

      setTimeout(() => {
        if (cameraTrackRef) cameraTrackRef.play("local-video");
      }, 1500);

      setTimeout(async () => {
        if (clientRef.current) {
          for (const user of clientRef.current.remoteUsers) {
            if (user.videoTrack) user.videoTrack.play("remote-video");
            if (user.audioTrack) user.audioTrack.play();
          }
        }
      }, 2000);

    } catch (error) {
      console.error("Error joining call:", error);
      alert("Error joining call: " + error.message);
    }
  };

  const leaveCall = async () => {
    try {
      localTracks.forEach(track => { track.stop(); track.close(); });
      cameraTrackRef = null;
      await clientRef.current.leave();
      clientRef.current.removeAllListeners();
      clientRef.current = null;

      if (rtmClientRef.current && rtmChannelRef.current) {
        await rtmClientRef.current.unsubscribe(rtmChannelRef.current);
        await rtmClientRef.current.logout();
        rtmClientRef.current = null;
        rtmChannelRef.current = null;
      }

      await fetch(`${API_BASE_URL}/telemedicine/room/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Bypass-Tunnel-Reminder": "true" },
        body: JSON.stringify({ channelName: `appointment_${appointmentId}` })
      });

    } catch (error) {
      console.error("Error leaving call:", error);
    } finally {
      setJoined(false);
      setLocalTracks([]);
      setMessages([]);
      setMicOn(true);
      setCameraOn(true);
      userRolesRef.current = {};
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !rtmClientRef.current || !rtmChannelRef.current) return;
    try {
      const payload = JSON.stringify({ text: chatInput, role: roleRef.current });
      await rtmClientRef.current.publish(rtmChannelRef.current, payload);
      setMessages(prev => [...prev, {
        text: chatInput,
        sender: roleRef.current === "doctor" ? "👨‍⚕️ Doctor" : "🧑‍💼 Patient",
        senderRole: roleRef.current,
        mine: true
      }]);
      setChatInput("");
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendFile = async (file) => {
    // Check file size — 10MB max
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Maximum size is 10MB.");
      return;
    }

    try {
      //  Step 1 — Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default");
      formData.append("cloud_name", "dsmp82v3z");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dsmp82v3z/auto/upload",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      const fileUrl = data.secure_url;

      //  Step 2 — Send just the URL through RTM
      const message = JSON.stringify({
        type: "file",
        role: roleRef.current,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        fileData: fileUrl,
      });

      await rtmClientRef.current.publish(rtmChannelRef.current, message);

      //  Step 3 — Add to local messages
      setMessages((prev) => [...prev, {
        id: Date.now(),
        type: "file",
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        fileData: fileUrl,
        sender: "You",
        senderRole: role,
        mine: true,
      }]);

    } catch (err) {
      console.error("File upload failed:", err);
      alert("Failed to send file. Please try again.");
    }
  };
  const toggleMic = async () => {
    if (localTracks[0]) {
      await localTracks[0].setEnabled(!micOn);
      setMicOn(!micOn);
    }
  };

  const toggleCamera = async () => {
    if (localTracks[1]) {
      await localTracks[1].setEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    }
  };

  return (
    <div className="vc-root">
      {!joined ? (
        <JoinRoom
          appointmentId={appointmentId}
          setAppointmentId={setAppointmentId}
          uid={uid}
          setUid={setUid}
          role={role}
          setRole={setRole}
          joinCall={joinCall}
        />
      ) : (
        <CallRoom
          role={role}
          appointmentId={appointmentId}
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          sendMessage={sendMessage}
          sendFile={sendFile}
          micOn={micOn}
          cameraOn={cameraOn}
          toggleMic={toggleMic}
          toggleCamera={toggleCamera}
          leaveCall={leaveCall}
        />
      )}
    </div>
  );
}

export default VideoCall;