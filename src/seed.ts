import { setUser, User } from "./store.js";

export async function seed(): Promise<void> {
  // Employee user
  const employee: User = {
    id: "employee@example.com",
    email: "employee@example.com",
    password: "password123",
    role: "employee",
    name: "John Employee",
  };
  setUser(employee);

  // Manager user
  const manager: User = {
    id: "manager@example.com",
    email: "manager@example.com",
    password: "password123",
    role: "manager",
    name: "Jane Manager",
  };
  setUser(manager);

  // HR user
  const hr: User = {
    id: "hr@example.com",
    email: "hr@example.com",
    password: "password123",
    role: "hr",
    name: "Bob HR",
  };
  setUser(hr);

  console.log("Seed data loaded: 3 users created");
}
