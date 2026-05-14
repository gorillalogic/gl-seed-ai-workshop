import { test } from "node:test";
import assert from "node:assert";
import {
  setUser,
  getUserByEmail,
  getAllUsers,
  clearStore,
  User,
} from "./store.js";

test("S1-002: In-memory Store", async (t) => {
  await t.test("setUser and getUserByEmail work correctly", () => {
    clearStore();
    const user: User = {
      id: "test@example.com",
      email: "test@example.com",
      password: "password123",
      role: "employee",
      name: "Test User",
    };

    setUser(user);
    const retrieved = getUserByEmail(user.id);

    assert.deepStrictEqual(retrieved, user, "User should be retrieved correctly");
  });

  await t.test("getUserByEmail retrieves by email", () => {
    clearStore();
    const user: User = {
      id: "test@example.com",
      email: "test@example.com",
      password: "password123",
      role: "employee",
      name: "Test User",
    };

    setUser(user);
    const retrieved = getUserByEmail("test@example.com");

    assert.deepStrictEqual(retrieved, user, "User should be retrieved by email");
  });

  await t.test("getAllUsers returns all stored users", () => {
    clearStore();
    const users: User[] = [
      {
        id: "user1@example.com",
        email: "user1@example.com",
        password: "password123",
        role: "employee",
        name: "User 1",
      },
      {
        id: "user2@example.com",
        email: "user2@example.com",
        password: "password123",
        role: "manager",
        name: "User 2",
      },
    ];

    users.forEach((user) => setUser(user));
    const retrieved = getAllUsers();

    assert.strictEqual(retrieved.length, 2, "Should return 2 users");
    assert.ok(
      retrieved.some((u) => u.email === "user1@example.com"),
      "Should contain user1"
    );
    assert.ok(
      retrieved.some((u) => u.email === "user2@example.com"),
      "Should contain user2"
    );
  });

  await t.test("clearStore removes all users", () => {
    const user: User = {
      id: "test@example.com",
      email: "test@example.com",
      password: "password123",
      role: "employee",
      name: "Test User",
    };

    setUser(user);
    clearStore();
    const retrieved = getUserByEmail(user.id);

    assert.strictEqual(retrieved, undefined, "Store should be empty after clear");
  });

  await t.test("getUserByEmail returns undefined for non-existent user", () => {
    clearStore();
    const retrieved = getUserByEmail("nonexistent@example.com");

    assert.strictEqual(
      retrieved,
      undefined,
      "Should return undefined for non-existent user"
    );
  });
});
