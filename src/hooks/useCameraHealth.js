import { useEffect, useState } from "react";
import { fetchCameraHealth } from "../lib/api";
import { useAppStore } from "../store/appStore";

export function useCameraHealth({ autoRefreshMs = 0 } = {}) {
  const { apiBase, apiKey, role, userId, sessionToken } = useAppStore();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const data = await fetchCameraHealth({ apiBase, apiKey, role, userId, sessionToken });
      setRows(data);
    } catch (e) {
      setError(`카메라 헬스 조회 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autoRefreshMs || autoRefreshMs < 1000) return;
    const id = setInterval(() => {
      refresh();
    }, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, apiBase, apiKey, role, userId, sessionToken]);

  return { rows, error, loading, refresh };
}
