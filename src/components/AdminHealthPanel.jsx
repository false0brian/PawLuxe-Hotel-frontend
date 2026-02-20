import { useState } from "react";
import { useCameraHealth } from "../hooks/useCameraHealth";

export default function AdminHealthPanel() {
  const [auto, setAuto] = useState(false);
  const { rows, error, loading, refresh } = useCameraHealth({ autoRefreshMs: auto ? 5000 : 0 });

  return (
    <section className="panel">
      <h2>Admin Camera Health</h2>
      <p className="muted">FPS, 지연, stale 여부를 한 화면에서 확인합니다.</p>
      <div className="row">
        <button onClick={refresh} disabled={loading}>
          {loading ? "조회중..." : "헬스 새로고침"}
        </button>
        <button className={auto ? "ghost active" : "ghost"} onClick={() => setAuto((v) => !v)}>
          {auto ? "자동새로고침 ON" : "자동새로고침 OFF"}
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <div className="table">
        <div className="thead">
          <span>camera_id</span>
          <span>status</span>
          <span>fps</span>
          <span>latency_ms</span>
          <span>stale</span>
        </div>
        {rows.map((row) => (
          <div className="trow" key={row.camera_id}>
            <span>{row.camera_id}</span>
            <span>{row.status}</span>
            <span>{row.fps ?? "-"}</span>
            <span>{row.latency_ms ?? "-"}</span>
            <span>{String(row.is_stale)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
