function headers(apiKey, extra = {}) {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    ...extra,
  };
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
    headers: headers(
      apiKey,
      sessionToken ? { "x-session-token": sessionToken } : { "x-role": role, "x-user-id": userId }
    ),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function fetchCameraHealth({ apiBase, apiKey, role = "staff", userId = "staff-1", sessionToken = "" }) {
  const res = await fetch(`${apiBase}/admin/camera-health`, {
    headers: headers(
      apiKey,
      sessionToken ? { "x-session-token": sessionToken } : { "x-role": role, "x-user-id": userId }
    ),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function issueStreamToken({ apiBase, apiKey, ownerId, bookingId, petId, role = "owner", userId, sessionToken = "" }) {
  const res = await fetch(`${apiBase}/auth/stream-token`, {
    method: "POST",
    headers: headers(
      apiKey,
      sessionToken ? { "x-session-token": sessionToken } : { "x-role": role, "x-user-id": userId ?? ownerId }
    ),
    body: JSON.stringify({ owner_id: ownerId, booking_id: bookingId, pet_id: petId, ttl_seconds: 120 }),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}
