export const demoTramCount = 5;
export const demoPassengerDensityLevels = ["empty", "moderate", "crowded"];
export const demoTramSpeedMetersPerSecond = 4;
export const demoPassengerDensityLabels = {
  empty: "ว่าง",
  moderate: "ปานกลาง",
  crowded: "หนาแน่น",
};

const earthRadiusMeters = 6_371_000;
const maxStopOffsetMeters = 100;

export function getMockTramDensities(random = Math.random) {
  return Array.from(
    { length: demoTramCount },
    () =>
      demoPassengerDensityLevels[
        Math.floor(random() * demoPassengerDensityLevels.length)
      ],
  );
}

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
    segments.push({ start, end, length, startDistance: totalLength });
    totalLength += length;
  }

  return totalLength > 0 ? { segments, totalLength } : null;
}

function getDistanceAlongRoute(profile, position) {
  if (
    !profile?.segments.length ||
    !Array.isArray(position) ||
    position.length < 2 ||
    !Number.isFinite(position[0]) ||
    !Number.isFinite(position[1])
  ) {
    return null;
  }

  const metersPerDegree = (earthRadiusMeters * Math.PI) / 180;
  const longitudeScale =
    metersPerDegree * Math.cos((position[0] * Math.PI) / 180);
  const targetX = position[1] * longitudeScale;
  const targetY = position[0] * metersPerDegree;
  let closestDistance = Infinity;
  let closestRouteDistance = null;

  for (const segment of profile.segments) {
    const startX = segment.start[1] * longitudeScale;
    const startY = segment.start[0] * metersPerDegree;
    const endX = segment.end[1] * longitudeScale;
    const endY = segment.end[0] * metersPerDegree;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const progress = Math.max(
      0,
      Math.min(
        1,
        ((targetX - startX) * deltaX + (targetY - startY) * deltaY) /
          (deltaX ** 2 + deltaY ** 2),
      ),
    );
    const nearestPoint = [
      segment.start[0] + (segment.end[0] - segment.start[0]) * progress,
      segment.start[1] + (segment.end[1] - segment.start[1]) * progress,
    ];
    const distance = distanceBetween(position, nearestPoint);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestRouteDistance =
        segment.startDistance + segment.length * progress;
    }
  }

  return closestDistance <= maxStopOffsetMeters ? closestRouteDistance : null;
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
      elapsedSeconds * demoTramSpeedMetersPerSecond +
        (profile.totalLength * index) / demoTramCount,
    ),
  }));
}

export function getNextDemoTramArrival(
  profile,
  elapsedSeconds,
  stopPosition,
) {
  const stopDistance = getDistanceAlongRoute(profile, stopPosition);
  if (stopDistance === null || !Number.isFinite(elapsedSeconds)) return null;

  let nextArrival = null;
  for (let index = 0; index < demoTramCount; index += 1) {
    const tramDistance =
      elapsedSeconds * demoTramSpeedMetersPerSecond +
      (profile.totalLength * index) / demoTramCount;
    const distanceUntilStop =
      ((stopDistance - tramDistance) % profile.totalLength +
        profile.totalLength) %
      profile.totalLength;
    const seconds = distanceUntilStop / demoTramSpeedMetersPerSecond;

    if (!nextArrival || seconds < nextArrival.seconds) {
      nextArrival = { tramId: index + 1, seconds };
    }
  }
  return nextArrival;
}

export function getDemoTravelTimeBetweenStops(
  profile,
  startPosition,
  endPosition,
) {
  const startDistance = getDistanceAlongRoute(profile, startPosition);
  const endDistance = getDistanceAlongRoute(profile, endPosition);
  if (startDistance === null || endDistance === null) return null;

  const distance =
    ((endDistance - startDistance) % profile.totalLength +
      profile.totalLength) %
    profile.totalLength;
  return distance / demoTramSpeedMetersPerSecond;
}
