import React, { useEffect, useMemo, useState } from "react";
import { fetchCameraHealth, fetchLiveZoneHeatmap, fetchLiveZoneSummary } from "../lib/api";
import { useAppStore } from "../store/appStore";

export default function ZoneLivePanel() {
  const { apiBase, apiKey, role, userId, sessionToken } = useAppStore();
  const [windowSeconds, setWindowSeconds] = useState(10);
  const [refreshMs, setRefreshMs] = useState(1500);
  const [heatmapWindowSeconds, setHeatmapWindowSeconds] = useState(300);
  const [bucketSeconds, setBucketSeconds] = useState(10);
  const [cameraId, setCameraId] = useState("");
  const [animalId, setAnimalId] = useState("");
  const [summary, setSummary] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [healthRows, setHealthRows] = useState([]);
  const [error, setError] = useState("");

  const healthByCamera = useMemo(() => {
    const out = {};
    for (const row of healthRows) out[row.camera_id] = row;
    return out;
  }, [healthRows]);

  async function refresh() {
    setError("");
    try {
      const [summaryData, healthData, heatmapData] = await Promise.all([
        fetchLiveZoneSummary({
          apiBase,
          apiKey,
          sessionToken,
          role,
          userId,
          windowSeconds,
          cameraId,
          animalId,
        }),
        fetchCameraHealth({
          apiBase,
          apiKey,
          sessionToken,
          role,
          userId,
        }),
        fetchLiveZoneHeatmap({
          apiBase,
          apiKey,
          sessionToken,
          role,
          userId,
          windowSeconds: heatmapWindowSeconds,
          bucketSeconds,
          cameraId,
          animalId,
        }),
      ]);
      setSummary(summaryData);
      setHealthRows(healthData);
      setHeatmap(heatmapData);
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tick = setInterval(refresh, Math.max(500, Number(refreshMs) || 1500));
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshMs, windowSeconds, heatmapWindowSeconds, bucketSeconds, cameraId, animalId, role, userId, sessionToken]);

  return (
    <section className="panel">
      <h2>Zone Live Board</h2>
      <p className="muted">존 단위로 실시간 관측 수, 트랙 수, 카메라 헬스를 묶어서 표시합니다.</p>
      <div className="row">
        <input
          type="number"
          value={windowSeconds}
          onChange={(e) => setWindowSeconds(Number(e.target.value || 10))}
          placeholder="window_seconds"
        />
        <input
          type="number"
          value={refreshMs}
          onChange={(e) => setRefreshMs(Number(e.target.value || 1500))}
          placeholder="refresh_ms"
        />
        <input
          type="number"
          value={heatmapWindowSeconds}
          onChange={(e) => setHeatmapWindowSeconds(Number(e.target.value || 300))}
          placeholder="heatmap_window_sec"
        />
        <input
          type="number"
          value={bucketSeconds}
          onChange={(e) => setBucketSeconds(Number(e.target.value || 10))}
          placeholder="bucket_sec"
        />
        <input placeholder="camera_id(optional)" value={cameraId} onChange={(e) => setCameraId(e.target.value)} />
        <input placeholder="animal_id(optional)" value={animalId} onChange={(e) => setAnimalId(e.target.value)} />
        <button onClick={refresh}>즉시 새로고침</button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <p className="muted">
        window: {summary?.window_seconds ?? windowSeconds}s | zones: {summary?.zone_count ?? 0} | observations:{" "}
        {summary?.total_observations ?? 0}
      </p>
      <div className="cards">
        {(summary?.zones || []).map((zone) => (
          <article className="card zone-card" key={zone.zone_id}>
            <strong>{zone.zone_id}</strong>
            <span>관측: {zone.observation_count}</span>
            <span>트랙: {zone.track_count}</span>
            <span>동물: {zone.animal_count}</span>
            <span className="muted">last_ts: {zone.last_ts ?? "-"}</span>
            <div className="row">
              {zone.camera_ids.map((camId) => {
                const health = healthByCamera[camId];
                const status = health?.is_stale ? "stale" : health?.status ?? "unknown";
                return (
                  <span key={camId} className={`status-chip status-${status}`}>
                    {camId}:{status}
                  </span>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <div className="divider" />
      <h3>Zone Heatmap</h3>
      <p className="muted">
        {heatmap?.window_seconds ?? heatmapWindowSeconds}s / {heatmap?.bucket_seconds ?? bucketSeconds}s (
        {heatmap?.bucket_count ?? 0} buckets)
      </p>
      <div className="heatmap">
        {(heatmap?.zones || []).map((zone) => {
          const max = Math.max(1, zone.max_bucket_count || 1);
          return (
            <div className="heatmap-row" key={zone.zone_id}>
              <div className="heatmap-label">{zone.zone_id}</div>
              <div className="heatmap-bars">
                {zone.counts.map((count, idx) => (
                  <div
                    key={`${zone.zone_id}-${idx}`}
                    className="heatmap-bar"
                    style={{
                      height: `${Math.max(8, (count / max) * 44)}px`,
                      opacity: Math.max(0.18, count / max),
                    }}
                    title={`bucket ${idx + 1}: ${count}`}
                  />
                ))}
              </div>
              <div className="heatmap-total">{zone.total_observations}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
