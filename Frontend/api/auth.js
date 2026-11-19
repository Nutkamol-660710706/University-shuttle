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

export function getCurrentUser() {
  return request("/api/auth/me");
}

export function login(credentials) {
  return request("/api/auth/login", { method: "POST", body: credentials });
}

export function logout() {
  return request("/api/auth/logout", { method: "POST", body: {} });
}

export function register(data) {
  return request("/api/auth/register", { method: "POST", body: data });
}

export function startPasswordReset(data) {
  return request("/api/auth/password-reset/start", {
    method: "POST",
    body: data,
  });
}

export function verifyPasswordReset(data) {
  return request("/api/auth/password-reset/verify", {
    method: "POST",
    body: data,
  });
}
