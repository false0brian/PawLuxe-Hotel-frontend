import React, { useMemo, useState } from "react";
import { useOwnerLive } from "../hooks/useOwnerLive";
import { useAppStore } from "../store/appStore";

export default function OwnerLivePanel() {
  const ownerForm = useAppStore((s) => s.ownerForm);
  const setOwnerFormField = useAppStore((s) => s.setOwnerFormField);
  const {
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
  } =
    useOwnerLive();
  const [viewerSessionId, setViewerSessionId] = useState("device-a");
  const [verifyCamId, setVerifyCamId] = useState("");
  const resolvedCamId = useMemo(() => verifyCamId || tokenResult?.cam_ids?.[0] || "", [verifyCamId, tokenResult]);

  return (
    <section className="panel">
      <h2>Owner Live</h2>
      <p className="muted">예약 범위 + 현재 존 기준으로 라이브 접근을 검증합니다.</p>
      <div className="grid3">
        <input
          placeholder="pet_id"
          value={ownerForm.petId}
          onChange={(e) => setOwnerFormField("petId", e.target.value)}
        />
        <input
          placeholder="owner_id"
          value={ownerForm.ownerId}
          onChange={(e) => setOwnerFormField("ownerId", e.target.value)}
        />
        <input
          placeholder="booking_id"
          value={ownerForm.bookingId}
          onChange={(e) => setOwnerFormField("bookingId", e.target.value)}
        />
      </div>
      {validation.length > 0 ? <p className="warn">검증: {validation[0]}</p> : null}
      <div className="row">
        <button className="ghost" onClick={loadBookings} disabled={loading}>
          {loading ? "조회중..." : "예약 목록 조회"}
        </button>
      </div>
      {bookings.length > 0 ? (
        <div className="row">
          <select
            value=""
            onChange={(e) => {
              const b = bookings.find((row) => row.booking_id === e.target.value);
              if (!b) return;
              setOwnerFormField("bookingId", b.booking_id);
              setOwnerFormField("petId", b.pet_id);
            }}
          >
            <option value="">예약 선택</option>
            {bookings.map((b) => (
              <option key={b.booking_id} value={b.booking_id}>
                {b.booking_id} | pet:{b.pet_id} | {b.status}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="row">
        <button onClick={loadStatus} disabled={loading}>
          {loading ? "조회중..." : "펫 상태 조회"}
        </button>
        <button onClick={createToken} disabled={loading}>
          {loading ? "발급중..." : "라이브 토큰 발급"}
        </button>
        <button className="ghost" onClick={loadReport} disabled={loading}>
          {loading ? "조회중..." : "오늘 리포트/클립 조회"}
        </button>
        <input
          placeholder="viewer_session_id"
          value={viewerSessionId}
          onChange={(e) => setViewerSessionId(e.target.value)}
        />
        <input placeholder="verify_cam_id(optional)" value={verifyCamId} onChange={(e) => setVerifyCamId(e.target.value)} />
        <button
          className="ghost"
          onClick={() =>
            verifyTokenSession({ token: tokenResult?.token || "", camId: resolvedCamId, viewerSessionId })
          }
          disabled={loading}
        >
          세션 verify
        </button>
        <button
          className="ghost"
          onClick={() => closeTokenSession({ token: tokenResult?.token || "", camId: resolvedCamId, viewerSessionId })}
          disabled={loading}
        >
          세션 종료
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {status ? <pre>{JSON.stringify(status, null, 2)}</pre> : null}
      {tokenResult?.watermark ? <p className="muted">워터마크: {tokenResult.watermark}</p> : null}
      {tokenResult ? <pre>{JSON.stringify(tokenResult, null, 2)}</pre> : null}
      {verifyResult ? <pre>{JSON.stringify(verifyResult, null, 2)}</pre> : null}
      {report ? (
        <>
          <div className="divider" />
          <h3>오늘 클립</h3>
          <p className="muted">총 {report?.summary?.clip_count ?? 0}개</p>
          <div className="cards">
            {(report.clips || []).slice(0, 8).map((clip) => (
              <article className="card" key={clip.clip_id}>
                <strong>{clip.event_type === "auto_highlight" ? "Auto Highlight" : clip.event_type || "clip"}</strong>
                <span>clip_id: {clip.clip_id}</span>
                <span>start: {clip.start_ts}</span>
                <span>end: {clip.end_ts}</span>
                <span className="muted">path: {clip.path}</span>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
