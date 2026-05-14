import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { AddressInfo } from "node:net";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import app from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

test("S2-003: role-based home frontend", async (t) => {
  await t.test("home page is served from /home.html", async () => {
    await withServer(async (baseUrl) => {
      const response = await fetch(`${baseUrl}/home.html`);
      assert.strictEqual(response.status, 200);
      const body = await response.text();
      assert.ok(body.includes("Role Entry Points"));
    });
  });

  await t.test("login page script routes successful login to /home.html", async () => {
    const html = await readFile(path.join(__dirname, "../public/index.html"), "utf-8");
    assert.ok(
      html.includes("window.location.href = '/home.html';"),
      "index.html should navigate to /home.html after successful login",
    );
  });

  await t.test("home page defines employee, manager, and hr entry points", async () => {
    const homeHtml = await readFile(path.join(__dirname, "../public/home.html"), "utf-8");

    assert.ok(homeHtml.includes("Employee Home"));
    assert.ok(homeHtml.includes("Manager Home"));
    assert.ok(homeHtml.includes("HR Home"));
  });
});
