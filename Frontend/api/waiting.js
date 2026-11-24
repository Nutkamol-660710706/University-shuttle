async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "จัดการสถานะการรอไม่สำเร็จ กรุณาลองใหม่");
  }
  return result;
}

export async function getWaitingStopCounts() {
  const counts = await request("/api/waiting");
  if (!Array.isArray(counts)) {
    throw new Error("API ส่งข้อมูลจำนวนผู้รอในรูปแบบที่ไม่ถูกต้อง");
  }
  return counts;
}

export function getMyWaitingStop() {
  return request("/api/me/waiting");
}

export function saveMyWaitingStop(stopNumber) {
  return request("/api/me/waiting", {
    method: "PUT",
    body: { stopNumber },
  });
}

export function deleteMyWaitingStop() {
  return request("/api/me/waiting", { method: "DELETE" });
}
