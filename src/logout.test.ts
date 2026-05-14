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

test("S2-004: logout invalidates current token", async (t) => {
  await t.test("POST /logout returns 200 JSON for authenticated user", async () => {
    clearStore();
    await seed();

    await withServer(async (baseUrl) => {
      const loginResponse = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "employee@example.com",
          password: "password123",
        }),
      });
      assert.strictEqual(loginResponse.status, 200);
      const loginBody = (await loginResponse.json()) as { token: string };

      const logoutResponse = await fetch(`${baseUrl}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${loginBody.token}`,
        },
      });
      assert.strictEqual(logoutResponse.status, 200);
      const logoutBody = (await logoutResponse.json()) as { message: string };
      assert.strictEqual(logoutBody.message, "Logged out successfully");
    });
  });

  await t.test("reusing same token after logout returns 401", async () => {
    clearStore();
    await seed();

    await withServer(async (baseUrl) => {
      const loginResponse = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "manager@example.com",
          password: "password123",
        }),
      });
      assert.strictEqual(loginResponse.status, 200);
      const loginBody = (await loginResponse.json()) as { token: string };

      const logoutResponse = await fetch(`${baseUrl}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${loginBody.token}`,
        },
      });
      assert.strictEqual(logoutResponse.status, 200);

      const replayResponse = await fetch(`${baseUrl}/api/session`, {
        headers: {
          Authorization: `Bearer ${loginBody.token}`,
        },
      });
      assert.strictEqual(replayResponse.status, 401);
      const replayBody = (await replayResponse.json()) as { error: string };
      assert.strictEqual(replayBody.error, "Unauthorized");
    });
  });
});
