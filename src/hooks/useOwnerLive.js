import { useMemo, useState } from "react";
import { fetchPetStatus, issueStreamToken } from "../lib/api";
import { useAppStore } from "../store/appStore";

export function useOwnerLive() {
  const { apiBase, apiKey, role, userId, sessionToken, ownerForm } = useAppStore();
  const [status, setStatus] = useState(null);
  const [tokenResult, setTokenResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validation = useMemo(() => {
    const errs = [];
    if (!ownerForm.petId.trim()) errs.push("pet_id는 필수입니다.");
    if (!ownerForm.ownerId.trim()) errs.push("owner_id는 필수입니다.");
    return errs;
  }, [ownerForm]);

  async function loadStatus() {
    if (validation.length > 0) {
      setError(validation[0]);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await fetchPetStatus({
        apiBase,
        apiKey,
        petId: ownerForm.petId.trim(),
        ownerId: ownerForm.ownerId.trim(),
        role,
        userId,
        sessionToken,
      });
      setStatus(data);
    } catch (e) {
      setError(`상태 조회 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function createToken() {
    if (validation.length > 0) {
      setError(validation[0]);
      return;
    }
    if (!ownerForm.bookingId.trim()) {
      setError("booking_id는 토큰 발급에 필수입니다.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const data = await issueStreamToken({
        apiBase,
        apiKey,
        ownerId: ownerForm.ownerId.trim(),
        bookingId: ownerForm.bookingId.trim(),
        petId: ownerForm.petId.trim(),
        role,
        userId,
        sessionToken,
      });
      setTokenResult(data);
    } catch (e) {
      setError(`토큰 발급 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return {
    status,
    tokenResult,
    error,
    loading,
    validation,
    loadStatus,
    createToken,
  };
}
