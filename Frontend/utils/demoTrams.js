export const demoTramCount = 5;

const earthRadiusMeters = 6_371_000;
const demoSpeedMetersPerSecond = 4;

function distanceBetween(start, end) {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(end[0] - start[0]);
  const longitudeDelta = radians(end[1] - start[1]);
  const startLatitude = radians(start[0]);
  const endLatitude = radians(end[0]);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export function createRouteProfile(path) {
  if (!Array.isArray(path) || path.length < 2) return null;
  if (
    path.some(
      (point) =>
        !Array.isArray(point) ||
        point.length < 2 ||
        !Number.isFinite(point[0]) ||
        !Number.isFinite(point[1]) ||
        point[0] < -90 ||
        point[0] > 90 ||
        point[1] < -180 ||
        point[1] > 180,
    )
  ) {
    return null;
  }

  const points = [...path];
  if (distanceBetween(points[0], points.at(-1)) > 1) {
    points.push(points[0]);
  }

  const segments = [];
  let totalLength = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const length = distanceBetween(start, end);
    if (length === 0) continue;
    segments.push({ start, end, length });
    totalLength += length;
  }

  return totalLength > 0 ? { segments, totalLength } : null;
}

export function getPositionAtDistance(profile, distance) {
  if (!profile?.segments.length || !Number.isFinite(distance)) return null;

  let remaining = ((distance % profile.totalLength) + profile.totalLength) % profile.totalLength;
  for (const segment of profile.segments) {
    if (remaining <= segment.length) {
      const progress = remaining / segment.length;
      return [
        segment.start[0] + (segment.end[0] - segment.start[0]) * progress,
        segment.start[1] + (segment.end[1] - segment.start[1]) * progress,
      ];
    }
    remaining -= segment.length;
  }
  return [...profile.segments[0].start];
}

export function getDemoTramPositions(profile, elapsedSeconds) {
  if (!profile || !Number.isFinite(elapsedSeconds)) return [];

  return Array.from({ length: demoTramCount }, (_, index) => ({
    id: index + 1,
    position: getPositionAtDistance(
      profile,
      elapsedSeconds * demoSpeedMetersPerSecond +
        (profile.totalLength * index) / demoTramCount,
    ),
  }));
}
