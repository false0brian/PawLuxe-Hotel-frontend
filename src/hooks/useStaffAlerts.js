import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "../store/appStore";

function wsBaseFromApi(apiBase) {
  const u = new URL(apiBase);
  const wsProtocol = u.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${u.host}${u.pathname.replace(/\/$/, "")}`;
}

export function useStaffAlerts() {
  const { apiBase, apiKey, role, userId } = useAppStore();
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [autoEval, setAutoEval] = useState(false);
  const [intervalMs, setIntervalMs] = useState(1500);
  const wsBase = useMemo(() => wsBaseFromApi(apiBase), [apiBase]);

  function connect() {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setError("");
    const qs = new URLSearchParams({
      api_key: apiKey,
      role,
      user_id: userId || "staff-1",
      interval_ms: String(intervalMs),
      status: "open",
      limit: "100",
      auto_eval: String(autoEval),
    });
    const ws = new WebSocket(`${wsBase}/ws/staff-alerts?${qs.toString()}`);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setError("알림 웹소켓 연결 오류");
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.error) {
          setError(String(payload.error));
          return;
        }
        if (payload.type === "staff_alerts" && Array.isArray(payload.alerts)) {
          setAlerts(payload.alerts);
        }
      } catch (_e) {
        setError("알림 메시지 파싱 오류");
      }
    };
    wsRef.current = ws;
  }

  function disconnect() {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }

  useEffect(() => {
    connect();
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, apiKey, role, userId, autoEval, intervalMs]);

  return {
    connected,
    error,
    alerts,
    autoEval,
    intervalMs,
    setAutoEval,
    setIntervalMs,
    reconnect: connect,
    disconnect,
  };
}
