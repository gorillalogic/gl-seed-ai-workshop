import assert from "node:assert";
import { AddressInfo } from "node:net";
import { test } from "node:test";
import app from "./index.js";
import { clearStore } from "./store.js";
import { seed } from "./seed.js";

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

test("S2-002: auth enforcement for protected routes", async (t) => {
  await t.test("GET /health and POST /login are public", async () => {
    clearStore();
    await seed();

    await withServer(async (baseUrl) => {
      const healthResponse = await fetch(`${baseUrl}/health`);
      assert.strictEqual(healthResponse.status, 200);
      const healthBody = (await healthResponse.json()) as { status: string };
      assert.strictEqual(healthBody.status, "ok");

      const loginResponse = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "manager@example.com",
          password: "password123",
        }),
      });
      assert.strictEqual(loginResponse.status, 200);
    });
  });

  await t.test("protected route returns 401 for missing or invalid token", async () => {
    clearStore();
    await seed();

    await withServer(async (baseUrl) => {
      const noToken = await fetch(`${baseUrl}/api/session`);
      assert.strictEqual(noToken.status, 401);
      const noTokenBody = (await noToken.json()) as { error: string };
      assert.strictEqual(noTokenBody.error, "Unauthorized");

      const invalidToken = await fetch(`${baseUrl}/api/session`, {
        headers: {
          Authorization: "Bearer invalid.token.value",
        },
      });
      assert.strictEqual(invalidToken.status, 401);
      const invalidTokenBody = (await invalidToken.json()) as { error: string };
      assert.strictEqual(invalidTokenBody.error, "Unauthorized");
    });
  });

  await t.test("valid token grants access to protected route", async () => {
    clearStore();
    await seed();

    await withServer(async (baseUrl) => {
      const loginResponse = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "hr@example.com",
          password: "password123",
        }),
      });
      assert.strictEqual(loginResponse.status, 200);
      const loginBody = (await loginResponse.json()) as { token: string };

      const protectedResponse = await fetch(`${baseUrl}/api/session`, {
        headers: {
          Authorization: `Bearer ${loginBody.token}`,
        },
      });

      assert.strictEqual(protectedResponse.status, 200);
      const protectedBody = (await protectedResponse.json()) as {
        user: { id: string; role: string };
      };
      assert.strictEqual(protectedBody.user.id, "hr@example.com");
      assert.strictEqual(protectedBody.user.role, "hr");
    });
  });
});
