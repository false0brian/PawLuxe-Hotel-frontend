import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLiveTracks } from "../hooks/useLiveTracks";
import { useAppStore } from "../store/appStore";
import { fetchCameraPlaybackUrl } from "../lib/api";

export default function LiveOverlayPanel() {
  const { apiBase, apiKey, role, userId, sessionToken } = useAppStore();
  const [cameraId, setCameraId] = useState("");
  const [animalId, setAnimalId] = useState("");
  const [intervalMs, setIntervalMs] = useState(1000);
  const [streamUrl, setStreamUrl] = useState("");
  const [srcWidth, setSrcWidth] = useState(1920);
  const [srcHeight, setSrcHeight] = useState(1080);
  const { connected, error, tracks, messages, connect, disconnect } = useLiveTracks();

  const stageRef = useRef(null);
  const [stageSize, setStageSize] = useState({ w: 960, h: 540 });

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      setStageSize({ w: rect.width, h: rect.height });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const fitted = useMemo(() => {
    const stageW = stageSize.w;
    const stageH = stageSize.h;
    const srcW = Math.max(1, Number(srcWidth) || 1);
    const srcH = Math.max(1, Number(srcHeight) || 1);

    const scale = Math.min(stageW / srcW, stageH / srcH);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const offsetX = (stageW - drawW) / 2;
    const offsetY = (stageH - drawH) / 2;
    return { scale, drawW, drawH, offsetX, offsetY };
  }, [stageSize, srcWidth, srcHeight]);

  async function autoFillPlaybackUrl() {
    if (!cameraId.trim()) return;
    try {
      const data = await fetchCameraPlaybackUrl({
        apiBase,
        apiKey,
        sessionToken,
        role,
        userId,
        cameraId: cameraId.trim(),
      });
      setStreamUrl(data.playback_url || "");
    } catch (_e) {
      // If API lookup fails, user can still enter URL manually.
    }
  }

  return (
    <section className="panel">
      <h2>Live Track Overlay</h2>
      <p className="muted">실제 영상 위에 객체 bbox를 실시간 오버레이합니다.</p>

      <div className="row">
        <input placeholder="camera_id(optional)" value={cameraId} onChange={(e) => setCameraId(e.target.value)} />
        <input placeholder="animal_id(optional)" value={animalId} onChange={(e) => setAnimalId(e.target.value)} />
        <input
          placeholder="interval_ms"
          type="number"
          value={intervalMs}
          onChange={(e) => setIntervalMs(Number(e.target.value || 1000))}
        />
        <button onClick={() => connect({ cameraId, animalId, intervalMs })}>{connected ? "재연결" : "연결"}</button>
        <button className="ghost" onClick={disconnect}>연결 종료</button>
      </div>

      <div className="row">
        <input
          placeholder="영상 URL (HLS/mp4/webm)"
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
        />
        <button className="ghost" onClick={autoFillPlaybackUrl}>카메라 URL 자동입력</button>
      </div>

      <div className="row">
        <input type="number" value={srcWidth} onChange={(e) => setSrcWidth(Number(e.target.value || 1920))} />
        <input type="number" value={srcHeight} onChange={(e) => setSrcHeight(Number(e.target.value || 1080))} />
        <span className="muted">source resolution (bbox 기준)</span>
      </div>

      {error ? <p className="error">{error}</p> : null}
      <p className="muted">연결: {String(connected)} | tracks: {tracks.length}</p>

      <div className="overlay-stage" ref={stageRef}>
        {streamUrl.trim() ? (
          <video className="overlay-video" src={streamUrl} autoPlay muted playsInline controls />
        ) : (
          <div className="overlay-empty">영상 URL을 입력하면 프레임 위에 오버레이됩니다.</div>
        )}

        {tracks.map((t) => {
          const bb = t.bbox_xyxy || [];
          if (bb.length !== 4) return null;
          const left = fitted.offsetX + bb[0] * fitted.scale;
          const top = fitted.offsetY + bb[1] * fitted.scale;
          const width = Math.max(2, (bb[2] - bb[0]) * fitted.scale);
          const height = Math.max(2, (bb[3] - bb[1]) * fitted.scale);
          return (
            <div
              key={`${t.track_id}-${t.ts}`}
              className="bbox"
              style={{ left, top, width, height }}
              title={`${t.animal_id ?? "unknown"} @ ${t.zone_id ?? "-"}`}
            >
              <span>{t.animal_id ?? "unknown"}</span>
            </div>
          );
        })}
      </div>

      {messages.length > 0 ? <pre>{JSON.stringify(messages[0], null, 2)}</pre> : null}
    </section>
  );
}
