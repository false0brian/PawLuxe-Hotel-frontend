import { useMemo, useState } from "react";
import {
  closeStreamSession,
  fetchBookingReport,
  fetchBookings,
  fetchPetStatus,
  issueStreamToken,
  verifyStreamToken,
} from "../lib/api";
import { useAppStore } from "../store/appStore";

export function useOwnerLive() {
  const { apiBase, apiKey, role, userId, sessionToken, ownerForm } = useAppStore();
  const [status, setStatus] = useState(null);
  const [tokenResult, setTokenResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [verifyResult, setVerifyResult] = useState(null);
  const [report, setReport] = useState(null);

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

  async function verifyTokenSession({ token, camId, viewerSessionId }) {
    if (!token?.trim()) {
      setError("토큰이 없습니다. 먼저 발급하세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await verifyStreamToken({
        apiBase,
        apiKey,
        token: token.trim(),
        camId: camId?.trim(),
        viewerSessionId: viewerSessionId?.trim(),
        role: "system",
      });
      setVerifyResult(data);
    } catch (e) {
      setError(`세션 verify 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function closeTokenSession({ token, camId, viewerSessionId }) {
    if (!token?.trim() || !viewerSessionId?.trim()) {
      setError("token, viewer_session_id를 입력하세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await closeStreamSession({
        apiBase,
        apiKey,
        token: token.trim(),
        camId: camId?.trim(),
        viewerSessionId: viewerSessionId.trim(),
        role: "system",
      });
      setVerifyResult(data);
    } catch (e) {
      setError(`세션 종료 실패: ${e.message}`);
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

  async function loadReport() {
    if (!ownerForm.bookingId.trim()) {
      setError("booking_id를 먼저 선택하세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await fetchBookingReport({
        apiBase,
        apiKey,
        bookingId: ownerForm.bookingId.trim(),
        role,
        userId,
        sessionToken,
      });
      setReport(data);
    } catch (e) {
      setError(`리포트 조회 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return {
    status,
    tokenResult,
    verifyResult,
    report,
    bookings,
    error,
    loading,
    validation,
    loadStatus,
    createToken,
    verifyTokenSession,
    closeTokenSession,
    loadBookings,
    loadReport,
  };
}
