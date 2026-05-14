import { request as httpRequest } from "http";
import app from "./index.js";

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export async function makeRequest(
  path: string,
  options: RequestOptions = {}
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        hostname: "localhost",
        port: 3000,
        path: path,
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 500,
            body: data,
          });
        });
      }
    );

    req.on("error", reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

export async function startServer(): Promise<void> {
  // Server starts in index.ts on import
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

export async function stopServer(): Promise<void> {
  // Graceful shutdown would be implemented here
}
