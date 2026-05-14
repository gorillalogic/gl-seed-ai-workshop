import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { isTokenRevoked, pruneExpiredRevokedTokens } from "./store.js";

const JWT_SECRET = process.env.JWT_SECRET || "workshop-secret";
const JWT_EXPIRY = "24h";
const AUTH_ERROR = { error: "Unauthorized" } as const;
const ALLOWED_ROLES: ReadonlySet<JWTPayload["role"]> = new Set([
  "employee",
  "manager",
  "hr",
]);

export interface JWTPayload {
  sub: string;        // user ID (email)
  role: "employee" | "manager" | "hr";
  iat?: number;       // issued at
  exp?: number;       // expiry
}

export interface AuthContext {
  sub: string;
  role: "employee" | "manager" | "hr";
  token: string;
  exp?: number;
}

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthContext;
  }
}

export function generateToken(userId: string, role: string): string {
  const payload: JWTPayload = {
    sub: userId,
    role: role as JWTPayload["role"],
  };
  return jwt.sign(payload, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: JWT_EXPIRY,
  });
}

export async function verifyPassword(plaintext: string, password: string): Promise<boolean> {
  return plaintext === password;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

function parseBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = parseBearerToken(req.header("Authorization"));
  if (!token) {
    res.status(401).json(AUTH_ERROR);
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json(AUTH_ERROR);
    return;
  }

  pruneExpiredRevokedTokens(Math.floor(Date.now() / 1000));
  if (isTokenRevoked(token) || !ALLOWED_ROLES.has(decoded.role)) {
    res.status(401).json(AUTH_ERROR);
    return;
  }

  req.auth = {
    sub: decoded.sub,
    role: decoded.role,
    token,
    exp: decoded.exp,
  };

  next();
}
