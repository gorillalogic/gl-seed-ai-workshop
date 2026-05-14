import app from "./index.js";
import { seed } from "./seed.js";

const PORT = 3000;

async function start(): Promise<void> {
  try {
    await seed();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to start server:", error.message);
      console.error(error.stack);
    } else {
      console.error("Failed to start server:", error);
    }
    process.exit(1);
  }
}

start().catch((error) => {
  if (error instanceof Error) {
    console.error("Unhandled error:", error.message);
    console.error(error.stack);
  } else {
    console.error("Unhandled error:", error);
  }
  process.exit(1);
});
