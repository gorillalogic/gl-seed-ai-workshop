import { Router, Request, Response } from "express";

export const protectedRouter = Router();

protectedRouter.get("/session", (req: Request, res: Response) => {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.status(200).json({
    user: {
      id: req.auth.sub,
      role: req.auth.role,
    },
  });
});
