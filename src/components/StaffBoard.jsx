import React, { useState } from "react";
import { useStaffOps } from "../hooks/useStaffOps";
import { useStaffAlerts } from "../hooks/useStaffAlerts";
import { useStaffActivityFeed } from "../hooks/useStaffActivityFeed";
import { useTodayBoard } from "../hooks/useTodayBoard";
import {
  ackStaffAlert,
  evaluateAlerts,
  executeStaffAlertAction,
  fetchStaffAlerts,
  generateAutoClips,
} from "../lib/api";
import { useAppStore } from "../store/appStore";

export default function StaffBoard() {
  const {
    apiBase,
    apiKey,
    role,
    userId,
    sessionToken,
    staffForm,
    setStaffFormField,
    mergeStaffForm,
    setTab,
    setZoneFocus,
  } = useAppStore();
  const [alerts, setAlerts] = useState([]);
  const [alertError, setAlertError] = useState("");
  const [autoClipWindow, setAutoClipWindow] = useState(180);
  const [autoClipMax, setAutoClipMax] = useState(5);
  const [autoClipResult, setAutoClipResult] = useState(null);
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
  const {
    connected: feedConnected,
    error: feedWsError,
    items: activityFeed,
    intervalMs: feedIntervalMs,
    setIntervalMs: setFeedIntervalMs,
    reconnect: reconnectFeed,
    disconnect: disconnectFeed,
  } = useStaffActivityFeed();
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

  async function runAlertAction(alertId, actionId) {
    setAlertError("");
    try {
      await executeStaffAlertAction({ apiBase, apiKey, role, userId, sessionToken, alertId, actionId });
      await loadAlerts();
    } catch (e) {
      setAlertError(`추천 액션 실패: ${e.message}`);
    }
  }

  async function runAutoClipGenerate() {
    setAlertError("");
    try {
      const data = await generateAutoClips({
        apiBase,
        apiKey,
        role: role === "system" || role === "admin" ? role : "system",
        userId,
        sessionToken,
        windowSeconds: autoClipWindow,
        maxClips: autoClipMax,
      });
      setAutoClipResult(data);
    } catch (e) {
      setAlertError(`자동 클립 생성 실패: ${e.message}`);
    }
  }

  const shownAlerts = liveAlerts.length > 0 ? liveAlerts : alerts;

  function focusFromActivity(item) {
    if (!item) return;
    if (item.kind === "zone_move") {
      mergeStaffForm({
        petId: item.pet_id || "",
        toZoneId: item.to_zone_id || "",
      });
      setTab("staff");
      return;
    }
    if (item.kind === "care_log") {
      mergeStaffForm({
        petId: item.pet_id || "",
        bookingId: item.booking_id || "",
        value: item.summary || "",
      });
      setTab("staff");
      return;
    }
    if (item.kind === "alert") {
      setZoneFocus({
        zoneId: item.zone_id || "",
        cameraId: item.camera_id || "",
        animalId: item.pet_id || "",
      });
      setTab("zone");
    }
  }

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
        <button className="ghost" onClick={runAutoClipGenerate}>자동 클립 생성</button>
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
        <input
          type="number"
          value={autoClipWindow}
          onChange={(e) => setAutoClipWindow(Number(e.target.value || 180))}
          placeholder="clip_window_sec"
        />
        <input
          type="number"
          value={autoClipMax}
          onChange={(e) => setAutoClipMax(Number(e.target.value || 5))}
          placeholder="clip_max"
        />
        <button className="ghost" onClick={reconnectFeed}>피드 WS 재연결</button>
        <button className="ghost" onClick={disconnectFeed}>피드 WS 종료</button>
        <input
          type="number"
          value={feedIntervalMs}
          onChange={(e) => setFeedIntervalMs(Number(e.target.value || 1500))}
          placeholder="feed_interval_ms"
        />
      </div>
      {boardError ? <p className="error">{boardError}</p> : null}
      {alertError ? <p className="error">{alertError}</p> : null}
      {alertsWsError ? <p className="error">{alertsWsError}</p> : null}
      {feedWsError ? <p className="error">{feedWsError}</p> : null}
      <p className="muted">Alerts WS connected: {String(alertsConnected)}</p>
      <p className="muted">Feed WS connected: {String(feedConnected)}</p>
      {autoClipResult ? <pre>{JSON.stringify(autoClipResult, null, 2)}</pre> : null}
      {board ? (
        <>
          <p className="muted">
            Active {board.total_active_bookings}건 | Zones {JSON.stringify(board.zone_counts)} | Actions{" "}
            {JSON.stringify(board.action_counts)}
          </p>
          <p className="muted">
            Alerts open:{board.alerts_summary?.open_count ?? 0} | critical:{board.alerts_summary?.critical_open_count ?? 0}
            {" "} | acked24h:{board.alerts_summary?.acked_24h_count ?? 0} | resolved24h:
            {board.alerts_summary?.resolved_24h_count ?? 0} | avgAckSec:
            {board.alerts_summary?.avg_ack_seconds_24h ?? "-"}
          </p>
        </>
      ) : null}
      {shownAlerts.length > 0 ? (
        <div className="cards">
          {shownAlerts.slice(0, 8).map((it) => (
            <article className="card" key={it.alert_id}>
              <strong>{it.type}</strong>
              <span>sev: {it.severity} | status: {it.status}</span>
              <span>{it.message}</span>
              <span className="muted">zone:{it.zone_id ?? "-"} cam:{it.camera_id ?? "-"}</span>
              {(it.recommended_actions || []).length > 0 ? (
                <div className="row">
                  {(it.recommended_actions || []).slice(0, 3).map((act) => (
                    <button
                      key={`${it.alert_id}-${act.action_id}`}
                      className="ghost"
                      onClick={() => runAlertAction(it.alert_id, act.action_id)}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              ) : null}
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
                  mergeStaffForm({
                    petId: it.pet_id ?? "",
                    bookingId: it.booking_id ?? "",
                    toZoneId: it.current_zone ?? "",
                  })
                }
              >
                이동
              </button>
              <button
                onClick={() =>
                  mergeStaffForm({
                    petId: it.pet_id ?? "",
                    bookingId: it.booking_id ?? "",
                    type: it.next_action === "medication_followup" ? "medication" : "feeding",
                    value: it.next_action,
                  })
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
          value={staffForm.petId}
          onChange={(e) => setStaffFormField("petId", e.target.value)}
        />
        <input
          placeholder="booking_id"
          value={staffForm.bookingId}
          onChange={(e) => setStaffFormField("bookingId", e.target.value)}
        />
        <input
          placeholder="to_zone_id"
          value={staffForm.toZoneId}
          onChange={(e) => setStaffFormField("toZoneId", e.target.value)}
        />
      </div>
      <div className="row">
        <select value={staffForm.type} onChange={(e) => setStaffFormField("type", e.target.value)}>
          <option value="feeding">feeding</option>
          <option value="potty">potty</option>
          <option value="walk">walk</option>
          <option value="medication">medication</option>
          <option value="note">note</option>
        </select>
        <input
          placeholder="value (예: ate 80%)"
          value={staffForm.value}
          onChange={(e) => setStaffFormField("value", e.target.value)}
        />
      </div>
      <div className="row">
        <button disabled={busy} onClick={() => submitMove({ petId: staffForm.petId, toZoneId: staffForm.toZoneId })}>
          {busy ? "처리중..." : "존 이동 실행"}
        </button>
        <button
          disabled={busy}
          onClick={() =>
            submitLog({
              petId: staffForm.petId,
              bookingId: staffForm.bookingId,
              type: staffForm.type,
              value: staffForm.value,
            })
          }
        >
          {busy ? "처리중..." : "케어 로그 기록"}
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : null}
      <div className="divider" />
      <h3>Activity Feed</h3>
      <div className="cards">
        {activityFeed.map((it, idx) => (
          <article className="card" key={`${it.kind}-${it.ts}-${idx}`}>
            <strong>{it.kind}</strong>
            <span>{it.summary}</span>
            <span className="muted">ts: {it.ts}</span>
            <span className="muted">staff: {it.staff_id ?? "-"}</span>
            <button className="ghost" onClick={() => focusFromActivity(it)}>관련 화면 열기</button>
          </article>
        ))}
      </div>
    </section>
  );
}
