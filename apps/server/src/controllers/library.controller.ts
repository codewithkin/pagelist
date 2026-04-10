import type { Context } from "hono";
import * as LibraryService from "@/services/library.service";
import { ok, err } from "@/lib/response";

export async function handleGetLibraryStats(c: Context) {
  const user = c.get("user") as { id: string };
  if (!user?.id) {
    return err(c, "You must be signed in to view your library.", 401);
  }
  try {
    const data = await LibraryService.getLibraryStats(user.id);
    return ok(c, data);
  } catch (e) {
    let message = "We couldn't load your library. Please try refreshing the page.";
    if (e instanceof Error) {
      message = e.message;
    }
    return err(c, message, 500);
  }
}
