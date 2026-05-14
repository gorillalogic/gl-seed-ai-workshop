// In-memory store for users
// Map indexed by email (used as user ID)

export interface User {
  id: string;           // unique identifier (email for now)
  email: string;        // email address
  password: string;     // workshop plain-text password
  role: "employee" | "manager" | "hr";
  name: string;         // display name
}

const userStore = new Map<string, User>();
const revokedTokenStore = new Map<string, number>();

export function setUser(user: User): void {
  userStore.set(user.id, user);
}

export function getUserByEmail(email: string): User | undefined {
  return userStore.get(email);
}

export function getAllUsers(): User[] {
  return Array.from(userStore.values());
}

export function clearStore(): void {
  userStore.clear();
  revokedTokenStore.clear();
}

export function revokeToken(token: string, expiresAt?: number): void {
  const fallbackExpiry = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  revokedTokenStore.set(token, expiresAt ?? fallbackExpiry);
}

export function isTokenRevoked(token: string): boolean {
  return revokedTokenStore.has(token);
}

export function pruneExpiredRevokedTokens(nowUnixSeconds: number): void {
  for (const [token, expiresAt] of revokedTokenStore.entries()) {
    if (expiresAt <= nowUnixSeconds) {
      revokedTokenStore.delete(token);
    }
  }
}
