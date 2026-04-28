import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const start = async () => {
  await connectDB();
  const server = app.listen(env.PORT, () => console.log(`API running on port ${env.PORT}`));

  const shutdown = () => server.close(() => process.exit(0));
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

console.log("ENV CHECK:", {
  MONGO_URI: process.env.MONGO_URI ? "OK" : "MISSING",
  JWT_SECRET: process.env.JWT_SECRET ? "OK" : "MISSING",
  PORT: process.env.PORT
});