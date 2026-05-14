import express, { Express, Request, Response } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "./auth.js";
import { authRouter } from "./routes/auth.js";
import { protectedRouter } from "./routes/protected.js";

const __filename = fileURLToPath(import.meta.url);
let __dirname = path.dirname(__filename);

// Adjust __dirname for TypeScript/ts-node
// When running with ts-node, __dirname points to the root, so we need to add /src
if (!__dirname.endsWith("/src")) {
  __dirname = path.join(__dirname, "src");
}

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use(authRouter);
app.use("/api", requireAuth, protectedRouter);

// Serve index.html for root
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.get("/home.html", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/home.html"));
});

export default app;
