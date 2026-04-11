import { Context } from "hono";
import { uploadBookPdf, uploadProfilePicture } from "@/services/upload.service";
import type { AuthenticatedUser } from "@pagelist/auth/types";

export async function handleUploadBookPdf(c: Context) {
  try {
    const user = c.get("user") as AuthenticatedUser;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return c.json({ error: "Only PDF files are allowed" }, 400);
    }

    const buffer = await file.arrayBuffer();
    const result = await uploadBookPdf(user.id, file.name, Buffer.from(buffer));

    return c.json(result, 200);
  } catch (error) {
    console.error("Book PDF upload error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      500
    );
  }
}

export async function handleUploadProfilePicture(c: Context) {
  try {
    const user = c.get("user") as AuthenticatedUser;
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    const validMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validMimes.includes(file.type)) {
      return c.json({ error: "Only image files (JPEG, PNG, WebP, GIF) are allowed" }, 400);
    }

    const buffer = await file.arrayBuffer();
    const result = await uploadProfilePicture(user.id, file.name, Buffer.from(buffer));

    return c.json(result, 200);
  } catch (error) {
    console.error("Profile picture upload error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      500
    );
  }
}
