import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import { handleUploadBookPdf, handleUploadProfilePicture } from "@/controllers/upload.controller";

const router = new Hono();

router.post("/book-pdf", requireAuth, handleUploadBookPdf);
router.post("/profile-picture", requireAuth, handleUploadProfilePicture);

export default router;
