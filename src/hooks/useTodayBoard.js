import { useEffect, useState } from "react";
import { fetchStaffTodayBoard } from "../lib/api";
import { useAppStore } from "../store/appStore";

export function useTodayBoard() {
  const { apiBase, apiKey, role, userId, sessionToken } = useAppStore();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchStaffTodayBoard({ apiBase, apiKey, role, userId, sessionToken });
      setBoard(data);
    } catch (e) {
      setError(`보드 조회 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [apiBase, apiKey, role, userId, sessionToken]);

  return { board, loading, error, refresh };
}
