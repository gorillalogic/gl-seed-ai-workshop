import { test } from "node:test";
import assert from "node:assert";
import { getAllUsers, clearStore } from "./store.js";
import { seed } from "./seed.js";

test("S1-001 & S1-002: Express server + Seed data", async (t) => {
  await t.test("Seed creates three users", async () => {
    clearStore();
    await seed();
    const users = getAllUsers();
    assert.strictEqual(users.length, 3, "Should have 3 users");

    const roles = new Set(users.map((u) => u.role));
    assert.strictEqual(roles.size, 3, "Should have 3 unique roles");
    assert.ok(
      roles.has("employee"),
      "Should have employee role"
    );
    assert.ok(roles.has("manager"), "Should have manager role");
    assert.ok(roles.has("hr"), "Should have hr role");
  });

  await t.test("Each user has required fields", async () => {
    clearStore();
    await seed();
    const users = getAllUsers();

    users.forEach((user) => {
      assert.ok(user.id, "User should have id");
      assert.ok(user.email, "User should have email");
      assert.ok(user.password, "User should have password");
      assert.ok(user.role, "User should have role");
      assert.ok(user.name, "User should have name");
    });
  });

  await t.test("Seed users have correct emails and roles", async () => {
    clearStore();
    await seed();
    const users = getAllUsers();

    const roles = users.map((u) => u.role);
    assert.deepStrictEqual(
      new Set(roles),
      new Set(["employee", "manager", "hr"]),
      "Should have all three roles"
    );

    const emails = users.map((u) => u.email);
    assert.ok(
      emails.includes("employee@example.com"),
      "Should have employee email"
    );
    assert.ok(
      emails.includes("manager@example.com"),
      "Should have manager email"
    );
    assert.ok(emails.includes("hr@example.com"), "Should have hr email");
  });
});
