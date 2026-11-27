import assert from "node:assert/strict";
import test from "node:test";
import { jwtVerify } from "jose";
import { setSessionCookie } from "../Backend/services/authSession.js";
import { setDriverSessionCookie } from "../Backend/services/driverSession.js";

test("issues an HttpOnly session cookie with the current auth version", async () => {
  const previousSecret = process.env.AUTH_SECRET;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.AUTH_SECRET = "test-only-auth-secret-that-is-long-enough";
  process.env.NODE_ENV = "production";

  try {
    let cookie;
    await setSessionCookie(
      { setHeader: (_name, value) => { cookie = value; } },
      "42",
      3,
    );

    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /Secure/);
    const token = decodeURIComponent(cookie.match(/silpatram_session=([^;]+)/)[1]);
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.AUTH_SECRET),
    );
    assert.equal(payload.sub, "42");
    assert.equal(payload.av, 3);
  } finally {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});

test("issues an isolated HttpOnly driver session cookie", async () => {
  const previousSecret = process.env.AUTH_SECRET;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.AUTH_SECRET = "test-only-auth-secret-that-is-long-enough";
  process.env.NODE_ENV = "production";

  try {
    let cookie;
    await setDriverSessionCookie(
      { setHeader: (_name, value) => { cookie = value; } },
      "19",
      2,
    );

    assert.match(cookie, /silpatram_driver_session=/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /Secure/);
    const token = decodeURIComponent(
      cookie.match(/silpatram_driver_session=([^;]+)/)[1],
    );
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.AUTH_SECRET),
    );
    assert.equal(payload.sub, "19");
    assert.equal(payload.av, 2);
    assert.equal(payload.role, "driver");
  } finally {
    if (previousSecret === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previousSecret;
    if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousNodeEnv;
  }
});
