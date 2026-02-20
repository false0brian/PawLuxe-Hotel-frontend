import { useOwnerLive } from "../hooks/useOwnerLive";
import { useAppStore } from "../store/appStore";

export default function OwnerLivePanel() {
  const ownerForm = useAppStore((s) => s.ownerForm);
  const setOwnerFormField = useAppStore((s) => s.setOwnerFormField);
  const { status, tokenResult, error, loading, validation, loadStatus, createToken } = useOwnerLive();

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
        <button onClick={loadStatus} disabled={loading}>
          {loading ? "조회중..." : "펫 상태 조회"}
        </button>
        <button onClick={createToken} disabled={loading}>
          {loading ? "발급중..." : "라이브 토큰 발급"}
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {status ? <pre>{JSON.stringify(status, null, 2)}</pre> : null}
      {tokenResult ? <pre>{JSON.stringify(tokenResult, null, 2)}</pre> : null}
    </section>
  );
}
