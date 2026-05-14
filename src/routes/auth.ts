import { Router, Request, Response } from "express";
import { generateToken, requireAuth, verifyPassword } from "../auth.js";
import { getUserByEmail, revokeToken } from "../store.js";

export const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  const user = typeof email === "string" ? getUserByEmail(email) : undefined;

  if (!user || typeof password !== "string") {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken(user.id, user.role);

  res.status(200).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
});

authRouter.post("/logout", requireAuth, (req: Request, res: Response) => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  revokeToken(req.auth.token, req.auth.exp);
  res.status(200).json({ message: "Logged out successfully" });
});
