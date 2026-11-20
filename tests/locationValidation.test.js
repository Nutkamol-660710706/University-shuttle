import assert from "node:assert/strict";
import test from "node:test";
import { AuthError } from "../Backend/services/authErrors.js";
import { validateLocation } from "../Backend/services/locationValidation.js";

test("validates a current location and optional accuracy", () => {
  assert.deepEqual(
    validateLocation({
      latitude: 13.819,
      longitude: 100.04,
      accuracyMeters: 12.5,
    }),
    {
      latitude: 13.819,
      longitude: 100.04,
      accuracyMeters: 12.5,
    },
  );
  assert.deepEqual(
    validateLocation({ latitude: -90, longitude: 180 }),
    { latitude: -90, longitude: 180, accuracyMeters: null },
  );
});

test("rejects invalid coordinates and accuracy values", () => {
  for (const location of [
    { latitude: 91, longitude: 0 },
    { latitude: 0, longitude: -181 },
    { latitude: "13.8", longitude: 100 },
    { latitude: Number.NaN, longitude: 100 },
    { latitude: 13, longitude: 100, accuracyMeters: -1 },
  ]) {
    assert.throws(
      () => validateLocation(location),
      (error) => error instanceof AuthError && error.status === 400,
    );
  }
});
