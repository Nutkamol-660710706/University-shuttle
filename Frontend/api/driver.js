async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "คำขอไม่สำเร็จ กรุณาลองใหม่");
  }
  return result;
}

export function getCurrentDriver() {
  return request("/api/driver/me");
}

export function loginDriver(credentials) {
  return request("/api/driver/login", { method: "POST", body: credentials });
}

export function logoutDriver() {
  return request("/api/driver/logout", { method: "POST", body: {} });
}

export function getCurrentDriverTrip() {
  return request("/api/driver/trip");
}

export function startDriverTrip() {
  return request("/api/driver/trip/start", { method: "POST", body: {} });
}

export function endDriverTrip() {
  return request("/api/driver/trip/end", { method: "POST", body: {} });
}
