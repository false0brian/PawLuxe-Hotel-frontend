import React, { useState } from "react";
import { useCameraHealth } from "../hooks/useCameraHealth";
import { useAuditLogs } from "../hooks/useAuditLogs";

export default function AdminHealthPanel() {
  const [auto, setAuto] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [auditActionFilter, setAuditActionFilter] = useState("all");
  const [auditResultFilter, setAuditResultFilter] = useState("all");
  const [auditQuery, setAuditQuery] = useState("");
  const { rows, error, loading, refresh } = useCameraHealth({ autoRefreshMs: auto ? 5000 : 0 });
  const { rows: auditRows, loading: auditLoading, error: auditError, refresh: refreshAudit } = useAuditLogs();
  const filteredRows =
    statusFilter === "all"
      ? rows
      : rows.filter((row) => (statusFilter === "stale" ? row.is_stale : row.status === statusFilter));
  const filteredAuditRows = auditRows.filter((row) => {
    if (auditActionFilter !== "all" && row.action !== auditActionFilter) return false;
    if (auditResultFilter !== "all" && row.result !== auditResultFilter) return false;
    if (!auditQuery.trim()) return true;
    const q = auditQuery.trim().toLowerCase();
    return (
      String(row.pet_id ?? "").toLowerCase().includes(q) ||
      String(row.booking_id ?? "").toLowerCase().includes(q) ||
      String(row.cam_id ?? "").toLowerCase().includes(q) ||
      String(row.reason ?? "").toLowerCase().includes(q)
    );
  });

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
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">all</option>
          <option value="healthy">healthy</option>
          <option value="degraded">degraded</option>
          <option value="down">down</option>
          <option value="stale">stale</option>
        </select>
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
        {filteredRows.map((row) => (
          <div className="trow" key={row.camera_id}>
            <span>{row.camera_id}</span>
            <span className={`status-chip ${row.is_stale ? "status-stale" : `status-${row.status}`}`}>{row.status}</span>
            <span>{row.fps ?? "-"}</span>
            <span>{row.latency_ms ?? "-"}</span>
            <span>{String(row.is_stale)}</span>
          </div>
        ))}
      </div>
      <div className="divider" />
      <h3>Stream Audit Logs</h3>
      <div className="row">
        <button onClick={() => refreshAudit(30)} disabled={auditLoading}>
          {auditLoading ? "조회중..." : "감사로그 조회"}
        </button>
        <select value={auditActionFilter} onChange={(e) => setAuditActionFilter(e.target.value)}>
          <option value="all">action: all</option>
          <option value="issue">issue</option>
          <option value="verify">verify</option>
          <option value="deny">deny</option>
        </select>
        <select value={auditResultFilter} onChange={(e) => setAuditResultFilter(e.target.value)}>
          <option value="all">result: all</option>
          <option value="ok">ok</option>
          <option value="denied">denied</option>
        </select>
        <input
          placeholder="검색(pet/booking/cam/reason)"
          value={auditQuery}
          onChange={(e) => setAuditQuery(e.target.value)}
        />
      </div>
      {auditError ? <p className="error">{auditError}</p> : null}
      <div className="table">
        <div className="thead audit-head">
          <span>at</span>
          <span>action</span>
          <span>result</span>
          <span>pet_id</span>
          <span>cam_id</span>
          <span>reason</span>
        </div>
        {filteredAuditRows.slice(0, 30).map((row) => (
          <div className="trow audit-row" key={row.log_id}>
            <span>{String(row.at ?? "").slice(11, 19)}</span>
            <span>{row.action}</span>
            <span>{row.result}</span>
            <span>{row.pet_id ?? "-"}</span>
            <span>{row.cam_id ?? "-"}</span>
            <span>{row.reason ?? "-"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
