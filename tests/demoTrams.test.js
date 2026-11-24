import assert from "node:assert/strict";
import test from "node:test";
import {
  createRouteProfile,
  demoTramCount,
  getNextDemoTramArrivalSeconds,
  getDemoTramPositions,
  getPositionAtDistance,
} from "../Frontend/utils/demoTrams.js";

const loop = [
  [13.8, 100],
  [13.8, 100.001],
  [13.801, 100.001],
  [13.8, 100],
];

test("places demo trams at evenly spaced points around the loop", () => {
  const profile = createRouteProfile(loop);
  const trams = getDemoTramPositions(profile, 0);

  assert.equal(trams.length, demoTramCount);
  assert.deepEqual(trams[0].position, loop[0]);
  assert.equal(new Set(trams.map(({ position }) => position.join(","))).size, demoTramCount);
});

test("moves demo trams along the route and wraps at the loop end", () => {
  const profile = createRouteProfile(loop);
  const start = getDemoTramPositions(profile, 0)[0].position;
  const afterMove = getDemoTramPositions(profile, 20)[0].position;

  assert.notDeepEqual(afterMove, start);
  assert.deepEqual(
    getPositionAtDistance(profile, profile.totalLength),
    getPositionAtDistance(profile, 0),
  );
  assert.deepEqual(
    getPositionAtDistance(profile, -10),
    getPositionAtDistance(profile, profile.totalLength - 10),
  );
});

test("estimates the next demo tram arrival at a stop along the route", () => {
  const profile = createRouteProfile(loop);
  const stopPosition = getPositionAtDistance(profile, 6);

  assert.equal(
    getNextDemoTramArrivalSeconds(profile, 0, loop[0]),
    0,
  );
  assert.ok(
    getNextDemoTramArrivalSeconds(profile, 1, stopPosition) > 0,
  );
  assert.equal(
    getNextDemoTramArrivalSeconds(profile, 0, [0, 0]),
    null,
  );
});

test("closes open routes and rejects invalid geometry", () => {
  const profile = createRouteProfile(loop.slice(0, -1));

  assert.ok(profile.totalLength > 0);
  assert.equal(createRouteProfile([[13.8, 100], [NaN, 100]]), null);
});
