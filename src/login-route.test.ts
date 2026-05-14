import assert from "node:assert";
import { AddressInfo } from "node:net";
import { test } from "node:test";
import app from "./index.js";
import { clearStore } from "./store.js";
import { seed } from "./seed.js";
import { verifyToken } from "./auth.js";

async function withServer<T>(callback: (baseUrl: string) => Promise<T>): Promise<T> {
  const server = app.listen(0);
  await new Promise<void>((resolve) => {
    server.on("listening", () => resolve());
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    return await callback(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

test("S2-001: POST /login contract", async (t) => {
  await t.test("returns 200 with JWT + user for valid credentials", async () => {
    clearStore();
    await seed();

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "employee@example.com",
          password: "password123",
        }),
      });

      assert.strictEqual(response.status, 200);
      const body = (await response.json()) as {
        token: string;
        user: { email: string; role: string };
      };
      assert.ok(body.token, "response should contain token");
      assert.strictEqual(body.user.email, "employee@example.com");
      assert.strictEqual(body.user.role, "employee");

      const decoded = verifyToken(body.token);
      assert.ok(decoded, "token should verify");
      assert.strictEqual(decoded?.sub, "employee@example.com");
      assert.strictEqual(decoded?.role, "employee");
    });
  });

  await t.test("returns 401 JSON for invalid credentials", async () => {
    clearStore();
    await seed();

    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "employee@example.com",
          password: "wrong-password",
        }),
      });

      assert.strictEqual(response.status, 401);
      const body = (await response.json()) as { error: string };
      assert.strictEqual(body.error, "Invalid credentials");
    });
  });
});
