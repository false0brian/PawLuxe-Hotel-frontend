function headers(apiKey, extra = {}) {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    ...extra,
  };
}

function authHeaders({ apiKey, sessionToken = "", role = "owner", userId = "" }) {
  return headers(
    apiKey,
    sessionToken ? { "x-session-token": sessionToken } : { "x-role": role, ...(userId ? { "x-user-id": userId } : {}) }
  );
}

async function parseError(res) {
  let detail = "";
  try {
    const body = await res.json();
    detail = body?.detail ?? "";
  } catch (_e) {
    detail = "";
  }
  throw new Error(detail ? `${res.status} ${detail}` : `status ${res.status}`);
}

export async function fetchPetStatus({ apiBase, apiKey, petId, sessionToken, ownerId, role, userId }) {
  const qs = ownerId ? `?owner_id=${encodeURIComponent(ownerId)}` : "";
  const res = await fetch(`${apiBase}/pets/${petId}/status${qs}`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchCameraHealth({ apiBase, apiKey, role = "staff", userId = "staff-1", sessionToken = "" }) {
  const res = await fetch(`${apiBase}/admin/camera-health`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function issueStreamToken({ apiBase, apiKey, ownerId, bookingId, petId, role = "owner", userId, sessionToken = "" }) {
  const res = await fetch(`${apiBase}/auth/stream-token`, {
    method: "POST",
    headers: authHeaders({ apiKey, sessionToken, role, userId: userId ?? ownerId }),
    body: JSON.stringify({ owner_id: ownerId, booking_id: bookingId, pet_id: petId, ttl_seconds: 120 }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function verifyStreamToken({
  apiBase,
  apiKey,
  token,
  camId = "",
  viewerSessionId = "",
  role = "system",
  userId = "",
  sessionToken = "",
}) {
  const res = await fetch(`${apiBase}/auth/stream-verify`, {
    method: "POST",
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
    body: JSON.stringify({
      token,
      cam_id: camId || undefined,
      viewer_session_id: viewerSessionId || undefined,
    }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function closeStreamSession({
  apiBase,
  apiKey,
  token,
  camId = "",
  viewerSessionId,
  role = "system",
  userId = "",
  sessionToken = "",
}) {
  const res = await fetch(`${apiBase}/auth/stream-session/close`, {
    method: "POST",
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
    body: JSON.stringify({
      token,
      cam_id: camId || undefined,
      viewer_session_id: viewerSessionId,
    }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function moveZone({ apiBase, apiKey, sessionToken = "", role = "staff", userId, petId, toZoneId }) {
  const res = await fetch(`${apiBase}/staff/move-zone`, {
    method: "POST",
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
    body: JSON.stringify({ pet_id: petId, to_zone_id: toZoneId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function createCareLog({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "staff",
  userId,
  petId,
  bookingId,
  type,
  value,
}) {
  const res = await fetch(`${apiBase}/staff/logs`, {
    method: "POST",
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
    body: JSON.stringify({
      pet_id: petId,
      booking_id: bookingId,
      type,
      value,
      staff_id: userId ?? "",
    }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchAuditLogs({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "admin",
  userId = "admin-1",
  limit = 50,
}) {
  const res = await fetch(`${apiBase}/admin/stream-audit-logs?limit=${limit}`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchStaffTodayBoard({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "staff",
  userId = "staff-1",
}) {
  const res = await fetch(`${apiBase}/staff/today-board`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchBookings({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "owner",
  userId = "",
  ownerId = "",
}) {
  const qs = ownerId ? `?owner_id=${encodeURIComponent(ownerId)}` : "";
  const res = await fetch(`${apiBase}/bookings${qs}`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchBookingReport({
  apiBase,
  apiKey,
  bookingId,
  sessionToken = "",
  role = "owner",
  userId = "",
}) {
  const res = await fetch(`${apiBase}/reports/bookings/${encodeURIComponent(bookingId)}`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchClipPlaybackUrl({
  apiBase,
  apiKey,
  clipId,
  sessionToken = "",
  role = "owner",
  userId = "",
}) {
  const res = await fetch(`${apiBase}/clips/${encodeURIComponent(clipId)}/playback-url`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchCameraPlaybackUrl({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "staff",
  userId = "staff-1",
  cameraId,
}) {
  const res = await fetch(`${apiBase}/live/cameras/${encodeURIComponent(cameraId)}/playback-url`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchLiveZoneSummary({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "staff",
  userId = "staff-1",
  windowSeconds = 10,
  cameraId = "",
  animalId = "",
}) {
  const qs = new URLSearchParams();
  qs.set("window_seconds", String(windowSeconds));
  if (cameraId.trim()) qs.set("camera_id", cameraId.trim());
  if (animalId.trim()) qs.set("animal_id", animalId.trim());
  const res = await fetch(`${apiBase}/live/zones/summary?${qs.toString()}`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchLiveZoneHeatmap({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "staff",
  userId = "staff-1",
  windowSeconds = 300,
  bucketSeconds = 10,
  cameraId = "",
  animalId = "",
}) {
  const qs = new URLSearchParams();
  qs.set("window_seconds", String(windowSeconds));
  qs.set("bucket_seconds", String(bucketSeconds));
  if (cameraId.trim()) qs.set("camera_id", cameraId.trim());
  if (animalId.trim()) qs.set("animal_id", animalId.trim());
  const res = await fetch(`${apiBase}/live/zones/heatmap?${qs.toString()}`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchLiveZoneRisk({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "staff",
  userId = "staff-1",
  windowSeconds = 60,
  staleSeconds = 15,
}) {
  const qs = new URLSearchParams();
  qs.set("window_seconds", String(windowSeconds));
  qs.set("stale_seconds", String(staleSeconds));
  const res = await fetch(`${apiBase}/live/zones/risk?${qs.toString()}`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function evaluateAlerts({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "system",
  userId = "",
}) {
  const res = await fetch(`${apiBase}/system/alerts/evaluate`, {
    method: "POST",
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function generateAutoClips({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "system",
  userId = "",
  windowSeconds = 180,
  maxClips = 5,
  perAnimalLimit = 2,
}) {
  const qs = new URLSearchParams();
  qs.set("window_seconds", String(windowSeconds));
  qs.set("max_clips", String(maxClips));
  qs.set("per_animal_limit", String(perAnimalLimit));
  const res = await fetch(`${apiBase}/system/clips/auto-generate?${qs.toString()}`, {
    method: "POST",
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchStaffAlerts({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "staff",
  userId = "staff-1",
  status = "open",
  limit = 100,
}) {
  const qs = new URLSearchParams();
  qs.set("status", status);
  qs.set("limit", String(limit));
  const res = await fetch(`${apiBase}/staff/alerts?${qs.toString()}`, {
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function ackStaffAlert({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "staff",
  userId = "staff-1",
  alertId,
  status = "acked",
}) {
  const res = await fetch(`${apiBase}/staff/alerts/${encodeURIComponent(alertId)}/ack`, {
    method: "POST",
    headers: authHeaders({ apiKey, sessionToken, role, userId }),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function executeStaffAlertAction({
  apiBase,
  apiKey,
  sessionToken = "",
  role = "staff",
  userId = "staff-1",
  alertId,
  actionId,
}) {
  const res = await fetch(
    `${apiBase}/staff/alerts/${encodeURIComponent(alertId)}/actions/${encodeURIComponent(actionId)}`,
    {
      method: "POST",
      headers: authHeaders({ apiKey, sessionToken, role, userId }),
    }
  );
  if (!res.ok) await parseError(res);
  return res.json();
}
