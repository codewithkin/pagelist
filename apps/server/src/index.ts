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
import publicRouter from "@/routes/public";
import uploadRouter from "@/routes/upload";
import paymentsRouter from "@/routes/payments";

// Initialize R2 upload client (optional in development)
if (
  env.R2_ACCOUNT_ID &&
  env.R2_ACCESS_KEY_ID &&
  env.R2_SECRET_ACCESS_KEY &&
  env.R2_BUCKET_NAME &&
  env.R2_PUBLIC_URL
) {
  initializeUploadClient({
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucketName: env.R2_BUCKET_NAME,
    region: env.R2_REGION || "auto",
    publicUrl: env.R2_PUBLIC_URL,
  });
}

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: (origin) => origin ?? "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
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
app.route("/api/public", publicRouter);
app.route("/api/upload", uploadRouter);
app.route("/api/payments", paymentsRouter);

app.get("/", (c) => c.text("OK"));

export default app;
