import { Hono } from "hono";
import { requireAuth } from "@/middleware/require-auth";
import {
  handleGetBooks,
  handleGetBook,
  handleCreateBook,
  handleUpdateBook,
  handleDeleteBook,
} from "@/controllers/books.controller";

const router = new Hono();

router.get("/", requireAuth, handleGetBooks);
router.post("/", requireAuth, handleCreateBook);
router.get("/:id", requireAuth, handleGetBook);
router.put("/:id", requireAuth, handleUpdateBook);
router.delete("/:id", requireAuth, handleDeleteBook);

export default router;
