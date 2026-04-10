import type { Context } from "hono";
import * as LibraryService from "@/services/library.service";
import { ok, err } from "@/lib/response";

export async function handleGetLibraryStats(c: Context) {
  const user = c.get("user") as { id: string };
  try {
    const data = await LibraryService.getLibraryStats(user.id);
    return ok(c, data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load library.";
    return err(c, message, 500);
  }
}
