import type { Context } from "hono";
import * as WorkspaceService from "@/services/workspace.service";
import { ok, err } from "@/lib/response";

export async function handleGetWorkspaceStats(c: Context) {
  const user = c.get("user") as { id: string };
  if (!user?.id) {
    return err(c, "You must be signed in to view your workspace.", 401);
  }
  try {
    const data = await WorkspaceService.getWorkspaceStats(user.id);
    return ok(c, data);
  } catch (e) {
    let message = "We couldn't load your workspace. Please try refreshing the page.";
    if (e instanceof Error) {
      message = e.message;
    }
    return err(c, message, 500);
  }
}
