import { useEffect, useState, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { io } from "socket.io-client";
import API_BASE_URL from "../config.js";
import JoinRoom from "./JoinRoom.jsx";
import CallRoom from "./CallRoom.jsx";
import "../../components/videoCall.css";

let cameraTrackRef = null;

function VideoCall({
  initialAppointmentId = "",
  initialRole = "patient",
  autoJoinEnabled = false,
}) {
  const [appointmentId, setAppointmentId] = useState(initialAppointmentId);
  const [uid, setUid] = useState("");
  const [role, setRole] = useState(initialRole);
  const [joined, setJoined] = useState(false);
  const [localTracks, setLocalTracks] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [socket, setSocket] = useState(null);

  const clientRef = useRef(null);

  useEffect(() => {
    if (autoJoinEnabled && appointmentId && !joined) {
      const timer = setTimeout(() => {
        joinCall(true, true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoJoinEnabled, appointmentId, joined]);

  // Initialize socket connection
  useEffect(() => {
    if (joined && appointmentId) {
      const socketUrl = import.meta.env.VITE_TELEMEDICINE_SERVICE_URL || "http://localhost:3004";
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        // Join the room
        newSocket.emit('join-room', {
          appointmentId,
          role,
          userId: uid || 'anonymous'
        });
      });

      // Listen for messages
      newSocket.on('receive-message', (messageData) => {
        setMessages(prev => [...prev, {
          ...messageData,
          mine: messageData.senderRole === role
        }]);
      });

      // Listen for files
      newSocket.on('receive-file', (fileData) => {
        setMessages(prev => [...prev, {
          ...fileData,
          mine: fileData.senderRole === role
        }]);
      });

      // Listen for user join/leave
      newSocket.on('user-joined', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          text: data.message,
          timestamp: new Date().toISOString()
        }]);
      });

      newSocket.on('user-left', (data) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          text: data.message,
          timestamp: new Date().toISOString()
        }]);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [joined, appointmentId, role, uid]);

  // Chat functions
  const sendMessage = () => {
    if (!socket || !chatInput.trim()) return;

    socket.emit('send-message', {
      appointmentId,
      message: chatInput.trim(),
      sender: role === 'doctor' ? 'Doctor' : 'Patient',
      senderRole: role
    });

    setChatInput("");
  };

  const sendFile = async (file) => {
    if (!socket || !file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      const fileSize = (file.size / 1024).toFixed(1) + ' KB';

      socket.emit('send-file', {
        appointmentId,
        fileName: file.name,
        fileData: base64Data,
        fileSize,
        sender: role === 'doctor' ? 'Doctor' : 'Patient',
        senderRole: role
      });
    };
    reader.readAsDataURL(file);
  };

  const joinCall = async (micEnabled = true, cameraEnabled = true, appointmentIdOverride, uidOverride) => {
    try {
      const finalAppointmentId = appointmentIdOverride || appointmentId || `APT-${Math.floor(Math.random() * 900000 + 100000)}`;
      const finalUid = parseInt(uidOverride || uid) || Math.floor(Math.random() * 900000 + 100000);

      if (!appointmentId) setAppointmentId(finalAppointmentId);
      if (!uid) setUid(String(finalUid));

      // Create Agora client
      clientRef.current = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      // When other users join
      clientRef.current.on("user-published", async (user, mediaType) => {
        await clientRef.current.subscribe(user, mediaType);

        if (mediaType === "video") {
          setTimeout(() => {
            user.videoTrack.play("remote-video");
          }, 500);
        }

        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      });

      // Create room in backend
      await fetch(`${API_BASE_URL}/telemedicine/room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({
          appointmentId: finalAppointmentId,
          doctorId: "DOC-001",
          patientId: "PAT-001",
        }),
      });

      const randomUid =
        finalUid;

      // Get token from backend
      const tokenRes = await fetch(
        `${API_BASE_URL}/telemedicine/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Bypass-Tunnel-Reminder": "true",
          },
          body: JSON.stringify({
            channelName: `appointment_${finalAppointmentId}`,
            uid: randomUid,
            role,
          }),
        }
      );

      const { appId, channelName, token } = await tokenRes.json();

      // Join channel; if no token is provided, pass null to allow insecure/legacy mode
      await clientRef.current.join(
        appId,
        channelName,
        token || null,
        randomUid
      );

      // Subscribe to existing users
      for (const user of clientRef.current.remoteUsers) {
        await clientRef.current.subscribe(user, "video");
        await clientRef.current.subscribe(user, "audio");

        setTimeout(() => {
          if (user.videoTrack) user.videoTrack.play("remote-video");
          if (user.audioTrack) user.audioTrack.play();
        }, 500);
      }

      // Create local tracks
      const [micTrack, cameraTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();

      await micTrack.setEnabled(micEnabled);
      await cameraTrack.setEnabled(cameraEnabled);

      const tracksToPublish = [];
      if (micEnabled) tracksToPublish.push(micTrack);
      if (cameraEnabled) tracksToPublish.push(cameraTrack);

      if (tracksToPublish.length > 0) {
        await clientRef.current.publish(tracksToPublish);
      }

      cameraTrackRef = cameraTrack;

      setLocalTracks([micTrack, cameraTrack]);
      setMicOn(micEnabled);
      setCameraOn(cameraEnabled);
      setJoined(true);

      // Play local video
      setTimeout(() => {
        if (cameraTrackRef) {
          cameraTrackRef.play("local-video");
        }
      }, 1000);
    } catch (error) {
      console.error("Error joining call:", error);
      alert("Error joining call: " + error.message);
    }
  };

  const leaveCall = async () => {
    try {
      localTracks.forEach((track) => {
        track.stop();
        track.close();
      });

      cameraTrackRef = null;

      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current.removeAllListeners();
        clientRef.current = null;
      }

      // Disconnect socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }

      await fetch(`${API_BASE_URL}/telemedicine/room/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({
          channelName: `appointment_${appointmentId}`,
        }),
      });
    } catch (error) {
      console.error("Error leaving call:", error);
    } finally {
      setJoined(false);
      setLocalTracks([]);
      setMicOn(true);
      setCameraOn(true);
      setMessages([]);
      setChatInput("");
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