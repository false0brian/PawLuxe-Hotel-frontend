import { useState } from "react";
import { createCareLog, moveZone } from "../lib/api";
import { useAppStore } from "../store/appStore";

export function useStaffOps() {
  const { apiBase, apiKey, role, userId, sessionToken } = useAppStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function submitMove({ petId, toZoneId }) {
    if (!petId.trim() || !toZoneId.trim()) {
      setError("pet_id, to_zone_id를 입력하세요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await moveZone({
        apiBase,
        apiKey,
        sessionToken,
        role,
        userId,
        petId: petId.trim(),
        toZoneId: toZoneId.trim(),
      });
      setResult(data);
    } catch (e) {
      setError(`존 이동 실패: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function submitLog({ petId, bookingId, type, value }) {
    if (!petId.trim() || !bookingId.trim() || !type.trim() || !value.trim()) {
      setError("pet_id, booking_id, type, value를 입력하세요.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await createCareLog({
        apiBase,
        apiKey,
        sessionToken,
        role,
        userId,
        petId: petId.trim(),
        bookingId: bookingId.trim(),
        type: type.trim(),
        value: value.trim(),
      });
      setResult(data);
    } catch (e) {
      setError(`기록 실패: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, result, submitMove, submitLog };
}
