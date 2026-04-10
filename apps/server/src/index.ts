import { env } from "@pagelist/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRouter from "@/routes/auth";
import onboardingRouter from "@/routes/onboarding";
import workspaceRouter from "@/routes/workspace";
import libraryRouter from "@/routes/library";

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

app.get("/", (c) => c.text("OK"));

export default app;
