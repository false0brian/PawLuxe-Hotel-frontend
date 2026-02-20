import React from "react";
import { useOwnerLive } from "../hooks/useOwnerLive";
import { useAppStore } from "../store/appStore";

export default function OwnerLivePanel() {
  const ownerForm = useAppStore((s) => s.ownerForm);
  const setOwnerFormField = useAppStore((s) => s.setOwnerFormField);
  const { status, tokenResult, bookings, error, loading, validation, loadStatus, createToken, loadBookings } =
    useOwnerLive();

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
      </div>
      {error ? <p className="error">{error}</p> : null}
      {status ? <pre>{JSON.stringify(status, null, 2)}</pre> : null}
      {tokenResult?.watermark ? <p className="muted">워터마크: {tokenResult.watermark}</p> : null}
      {tokenResult ? <pre>{JSON.stringify(tokenResult, null, 2)}</pre> : null}
    </section>
  );
}
