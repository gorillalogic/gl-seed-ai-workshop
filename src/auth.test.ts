import { test } from "node:test";
import assert from "node:assert";
import {
  generateToken,
  verifyToken,
  verifyPassword,
} from "./auth.js";

test("S1-004: Authentication - JWT & Password verification", async (t) => {
  await t.test("generateToken creates a valid JWT", () => {
    const token = generateToken("test@example.com", "employee");
    assert.ok(token, "Token should be generated");
    assert.ok(typeof token === "string", "Token should be a string");
  });

  await t.test("verifyToken decodes a valid token", () => {
    const userId = "test@example.com";
    const role = "employee";
    const token = generateToken(userId, role);

    const decoded = verifyToken(token);
    assert.ok(decoded, "Token should be decoded");
    assert.strictEqual(decoded?.sub, userId, "Token sub should match userId");
    assert.strictEqual(decoded?.role, role, "Token role should match");
  });

  await t.test("verifyToken returns null for invalid token", () => {
    const decoded = verifyToken("invalid.token.here");
    assert.strictEqual(decoded, null, "Invalid token should return null");
  });

  await t.test("verifyPassword validates correct password", async () => {
    const password = "test-password";
    const isValid = await verifyPassword(password, password);
    assert.ok(isValid, "Correct password should validate");
  });

  await t.test("verifyPassword rejects incorrect password", async () => {
    const password = "test-password";
    const wrongPassword = "wrong-password";
    const isValid = await verifyPassword(wrongPassword, password);
    assert.strictEqual(isValid, false, "Incorrect password should not validate");
  });

  await t.test("Token should expire (24 hours)", () => {
    // This test verifies the token is created with expiration
    const token = generateToken("test@example.com", "employee");
    const decoded = verifyToken(token);
    assert.ok(decoded?.exp, "Token should have expiration");

    if (decoded?.iat && decoded?.exp) {
      const expirySeconds = decoded.exp - decoded.iat;
      const twentyFourHoursInSeconds = 24 * 60 * 60;
      assert.strictEqual(
        expirySeconds,
        twentyFourHoursInSeconds,
        "Token should expire in 24 hours"
      );
    }
  });
});
