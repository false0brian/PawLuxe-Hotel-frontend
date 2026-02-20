import { useState } from "react";
import { fetchAuditLogs } from "../lib/api";
import { useAppStore } from "../store/appStore";

export function useAuditLogs() {
  const { apiBase, apiKey, role, userId, sessionToken } = useAppStore();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh(limit = 50) {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAuditLogs({ apiBase, apiKey, role, userId, sessionToken, limit });
      setRows(data);
    } catch (e) {
      setError(`감사로그 조회 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return { rows, loading, error, refresh };
}
