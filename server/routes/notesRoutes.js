import { Router } from "express";
import {
  getDownloadUrl,
  getNotes,
  postNote,
  removeNote,
} from "../controllers/notesController.js";
import { uploadSingleNote } from "../middleware/upload.js";

const router = Router();

router.get("/", getNotes);
router.post("/", uploadSingleNote, postNote);
router.get("/:id/download-url", getDownloadUrl);
router.delete("/:id", removeNote);

export default router;
