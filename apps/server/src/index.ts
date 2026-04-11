import { env } from "@pagelist/env/server";
import { initializeUploadClient } from "@pagelist/upload";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRouter from "@/routes/auth";
import onboardingRouter from "@/routes/onboarding";
import workspaceRouter from "@/routes/workspace";
import libraryRouter from "@/routes/library";
import booksRouter from "@/routes/books";
import earningsRouter from "@/routes/earnings";
import payoutsRouter from "@/routes/payouts";
import browseRouter from "@/routes/browse";
import uploadRouter from "@/routes/upload";

// Initialize R2 upload client
initializeUploadClient({
  accountId: env.R2_ACCOUNT_ID,
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  bucketName: env.R2_BUCKET_NAME,
  region: env.R2_REGION,
});

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.route("/api/auth", authRouter);
app.route("/api/onboarding", onboardingRouter);
app.route("/api/workspace", workspaceRouter);
app.route("/api/library", libraryRouter);
app.route("/api/books", booksRouter);
app.route("/api/earnings", earningsRouter);
app.route("/api/payouts", payoutsRouter);
app.route("/api/browse", browseRouter);
app.route("/api/upload", uploadRouter);

app.get("/", (c) => c.text("OK"));

export default app;
