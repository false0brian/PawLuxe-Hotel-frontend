import { useMemo, useRef, useState } from "react";
import { useAppStore } from "../store/appStore";

function wsBaseFromApi(apiBase) {
  const u = new URL(apiBase);
  const wsProtocol = u.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${u.host}${u.pathname.replace(/\/$/, "")}`;
}

export function useLiveTracks() {
  const { apiBase, apiKey, role, userId } = useAppStore();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [tracks, setTracks] = useState([]);
  const [messages, setMessages] = useState([]);

  const wsEndpointBase = useMemo(() => wsBaseFromApi(apiBase), [apiBase]);

  function connect({ cameraId = "", animalId = "", intervalMs = 1000 }) {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setError("");
    const qs = new URLSearchParams({
      api_key: apiKey,
      role,
      user_id: userId || "staff-1",
      interval_ms: String(intervalMs),
    });
    if (cameraId.trim()) qs.set("camera_id", cameraId.trim());
    if (animalId.trim()) qs.set("animal_id", animalId.trim());

    const ws = new WebSocket(`${wsEndpointBase}/ws/live-tracks?${qs.toString()}`);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setError("웹소켓 연결 오류");
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setMessages((prev) => [payload, ...prev].slice(0, 30));
        if (payload.type === "tracks" && Array.isArray(payload.tracks)) {
          setTracks(payload.tracks);
        } else if (payload.error) {
          setError(String(payload.error));
        }
      } catch (_e) {
        setError("메시지 파싱 오류");
      }
    };
    socketRef.current = ws;
  }

  function disconnect() {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setConnected(false);
  }

  return { connected, error, tracks, messages, connect, disconnect };
}
