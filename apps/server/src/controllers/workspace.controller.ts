import type { Context } from "hono";
import * as WorkspaceService from "@/services/workspace.service";
import { ok, err } from "@/lib/response";

export async function handleGetWorkspaceStats(c: Context) {
  const user = c.get("user") as { id: string };
  try {
    const data = await WorkspaceService.getWorkspaceStats(user.id);
    return ok(c, data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load workspace.";
    return err(c, message, 500);
  }
}
