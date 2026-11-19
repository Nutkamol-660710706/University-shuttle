async function getCollection(path, signal) {
  const response = await fetch(path, { signal });
  if (!response.ok) {
    throw new Error(`โหลดข้อมูลไม่สำเร็จ (${response.status})`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("API ส่งข้อมูลในรูปแบบที่ไม่ถูกต้อง");
  }
  return data;
}

export function getStops(signal) {
  return getCollection("/api/stops", signal);
}

export function getRoutes(signal) {
  return getCollection("/api/routes", signal);
}
