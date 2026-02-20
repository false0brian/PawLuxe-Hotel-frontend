import React, { useState } from "react";
import { useStaffOps } from "../hooks/useStaffOps";
import { useStaffAlerts } from "../hooks/useStaffAlerts";
import { useTodayBoard } from "../hooks/useTodayBoard";
import { ackStaffAlert, evaluateAlerts, fetchStaffAlerts } from "../lib/api";
import { useAppStore } from "../store/appStore";

export default function StaffBoard() {
  const { apiBase, apiKey, role, userId, sessionToken } = useAppStore();
  const [form, setForm] = useState({
    petId: "",
    bookingId: "",
    toZoneId: "",
    type: "feeding",
    value: "",
  });
  const [alerts, setAlerts] = useState([]);
  const [alertError, setAlertError] = useState("");
  const { busy, error, result, submitMove, submitLog } = useStaffOps();
  const { board, loading: boardLoading, error: boardError, refresh } = useTodayBoard();
  const {
    connected: alertsConnected,
    error: alertsWsError,
    alerts: liveAlerts,
    autoEval,
    intervalMs,
    setAutoEval,
    setIntervalMs,
    reconnect,
    disconnect,
  } = useStaffAlerts();
  const items = board?.items ?? [];

  async function loadAlerts() {
    setAlertError("");
    try {
      const data = await fetchStaffAlerts({ apiBase, apiKey, role, userId, sessionToken });
      setAlerts(data);
    } catch (e) {
      setAlertError(`알림 조회 실패: ${e.message}`);
    }
  }

  async function runAlertEvaluate() {
    setAlertError("");
    try {
      await evaluateAlerts({
        apiBase,
        apiKey,
        role: role === "system" || role === "admin" ? role : "system",
        userId,
        sessionToken,
      });
      await loadAlerts();
    } catch (e) {
      setAlertError(`알림 평가 실패: ${e.message}`);
    }
  }

  async function resolveAlert(alertId, status = "acked") {
    setAlertError("");
    try {
      await ackStaffAlert({ apiBase, apiKey, role, userId, sessionToken, alertId, status });
      await loadAlerts();
    } catch (e) {
      setAlertError(`알림 처리 실패: ${e.message}`);
    }
  }

  const shownAlerts = liveAlerts.length > 0 ? liveAlerts : alerts;

  return (
    <section className="panel">
      <h2>Staff Today Board</h2>
      <p className="muted">기록 5초 컷을 목표로 한 운영 중심 화면입니다.</p>
      <div className="row">
        <button className="ghost" onClick={refresh} disabled={boardLoading}>
          {boardLoading ? "보드 갱신중..." : "보드 새로고침"}
        </button>
        <button className="ghost" onClick={loadAlerts}>알림 조회</button>
        <button className="ghost" onClick={runAlertEvaluate}>알림 평가 실행</button>
        <button className="ghost" onClick={reconnect}>알림 WS 재연결</button>
        <button className="ghost" onClick={disconnect}>알림 WS 종료</button>
        <button className={`ghost ${autoEval ? "active" : ""}`} onClick={() => setAutoEval(!autoEval)}>
          auto_eval: {String(autoEval)}
        </button>
        <input
          type="number"
          value={intervalMs}
          onChange={(e) => setIntervalMs(Number(e.target.value || 1500))}
          placeholder="alert_interval_ms"
        />
      </div>
      {boardError ? <p className="error">{boardError}</p> : null}
      {alertError ? <p className="error">{alertError}</p> : null}
      {alertsWsError ? <p className="error">{alertsWsError}</p> : null}
      <p className="muted">Alerts WS connected: {String(alertsConnected)}</p>
      {board ? (
        <p className="muted">
          Active {board.total_active_bookings}건 | Zones {JSON.stringify(board.zone_counts)} | Actions{" "}
          {JSON.stringify(board.action_counts)}
        </p>
      ) : null}
      {shownAlerts.length > 0 ? (
        <div className="cards">
          {shownAlerts.slice(0, 8).map((it) => (
            <article className="card" key={it.alert_id}>
              <strong>{it.type}</strong>
              <span>sev: {it.severity} | status: {it.status}</span>
              <span>{it.message}</span>
              <span className="muted">zone:{it.zone_id ?? "-"} cam:{it.camera_id ?? "-"}</span>
              <div className="row">
                <button className="ghost" onClick={() => resolveAlert(it.alert_id, "acked")}>ack</button>
                <button className="ghost" onClick={() => resolveAlert(it.alert_id, "resolved")}>resolve</button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      <div className="cards">
        {items.map((it) => (
          <article className="card" key={it.booking_id}>
            <strong>{it.pet_name}</strong>
            <span>pet_id: {it.pet_id}</span>
            <span>현재 존: {it.current_zone}</span>
            <span>위험 배지: {(it.risk_badges ?? []).join(", ")}</span>
            <span>다음 액션: {it.next_action}</span>
            <div className="row">
              <button
                onClick={() =>
                  setForm((s) => ({
                    ...s,
                    petId: it.pet_id ?? "",
                    bookingId: it.booking_id ?? "",
                    toZoneId: it.current_zone ?? "",
                  }))
                }
              >
                이동
              </button>
              <button
                onClick={() =>
                  setForm((s) => ({
                    ...s,
                    petId: it.pet_id ?? "",
                    bookingId: it.booking_id ?? "",
                    type: it.next_action === "medication_followup" ? "medication" : "feeding",
                    value: it.next_action,
                  }))
                }
              >
                기록
              </button>
              <button>클립</button>
              <button>사고</button>
            </div>
          </article>
        ))}
      </div>
      <div className="divider" />
      <h3>실행 패널</h3>
      <div className="grid3">
        <input
          placeholder="pet_id"
          value={form.petId}
          onChange={(e) => setForm((s) => ({ ...s, petId: e.target.value }))}
        />
        <input
          placeholder="booking_id"
          value={form.bookingId}
          onChange={(e) => setForm((s) => ({ ...s, bookingId: e.target.value }))}
        />
        <input
          placeholder="to_zone_id"
          value={form.toZoneId}
          onChange={(e) => setForm((s) => ({ ...s, toZoneId: e.target.value }))}
        />
      </div>
      <div className="row">
        <select value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}>
          <option value="feeding">feeding</option>
          <option value="potty">potty</option>
          <option value="walk">walk</option>
          <option value="medication">medication</option>
          <option value="note">note</option>
        </select>
        <input
          placeholder="value (예: ate 80%)"
          value={form.value}
          onChange={(e) => setForm((s) => ({ ...s, value: e.target.value }))}
        />
      </div>
      <div className="row">
        <button disabled={busy} onClick={() => submitMove({ petId: form.petId, toZoneId: form.toZoneId })}>
          {busy ? "처리중..." : "존 이동 실행"}
        </button>
        <button
          disabled={busy}
          onClick={() => submitLog({ petId: form.petId, bookingId: form.bookingId, type: form.type, value: form.value })}
        >
          {busy ? "처리중..." : "케어 로그 기록"}
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : null}
    </section>
  );
}
