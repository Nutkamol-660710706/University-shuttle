async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "บันทึกตำแหน่งไม่สำเร็จ กรุณาลองใหม่");
  }
  return result;
}

export function getMyLocation() {
  return request("/api/me/location");
}

export function saveMyLocation(location) {
  return request("/api/me/location", { method: "PUT", body: location });
}

export function deleteMyLocation() {
  return request("/api/me/location", { method: "DELETE" });
}
