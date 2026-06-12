import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./lib/db";

async function startServer(): Promise<void> {
  if (env.MONGODB_URI) {
    await connectDB();
  } else {
    console.warn("MONGODB_URI not set — skipping database connection");
  }

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
