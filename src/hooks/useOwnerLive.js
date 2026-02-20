import { useMemo, useState } from "react";
import { fetchBookings, fetchPetStatus, issueStreamToken } from "../lib/api";
import { useAppStore } from "../store/appStore";

export function useOwnerLive() {
  const { apiBase, apiKey, role, userId, sessionToken, ownerForm } = useAppStore();
  const [status, setStatus] = useState(null);
  const [tokenResult, setTokenResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

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

  async function loadBookings() {
    if (!ownerForm.ownerId.trim()) {
      setError("owner_id를 먼저 입력하세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await fetchBookings({
        apiBase,
        apiKey,
        role,
        userId,
        sessionToken,
        ownerId: ownerForm.ownerId.trim(),
      });
      const priority = { checked_in: 0, reserved: 1, checked_out: 2, canceled: 3 };
      const sorted = [...data].sort((a, b) => {
        const pa = priority[a.status] ?? 99;
        const pb = priority[b.status] ?? 99;
        if (pa !== pb) return pa - pb;
        return String(b.start_at).localeCompare(String(a.start_at));
      });
      setBookings(sorted);
    } catch (e) {
      setError(`예약 조회 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return {
    status,
    tokenResult,
    bookings,
    error,
    loading,
    validation,
    loadStatus,
    createToken,
    loadBookings,
  };
}
