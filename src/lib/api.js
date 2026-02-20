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
