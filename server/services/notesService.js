import crypto from "node:crypto";
import path from "node:path";
import { getBucket, getDb } from "../firebase/admin.js";
import { config } from "../config/env.js";

const NOTES_COLLECTION = "notes";

const allowedTypes = new Map([
  [
    ".pdf",
    [
      "application/pdf",
      "application/octet-stream",
    ],
  ],
  [
    ".ppt",
    [
      "application/vnd.ms-powerpoint",
      "application/octet-stream",
    ],
  ],
  [
    ".pptx",
    [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/octet-stream",
    ],
  ],
]);

function sanitizeSegment(value, fallback) {
  const cleaned = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return cleaned || fallback;
}

function validateNotePayload({ unitKey, title, category }) {
  if (!unitKey || String(unitKey).trim().length > 160) {
    return "A valid unit is required.";
  }

  if (!title || String(title).trim().length > 120) {
    return "A valid title is required.";
  }

  if (!["original", "ai"].includes(category)) {
    return "A valid note category is required.";
  }

  return "";
}

function validateFile(file, category) {
  if (!file) {
    return "A file is required.";
  }

  const extension = path
    .extname(file.originalname || "")
    .toLowerCase();
  const allowedMimeTypes = allowedTypes.get(extension);

  if (!allowedMimeTypes) {
    return category === "ai"
      ? "Smart AI notes must be PDF files."
      : "Only PDF, PPT, and PPTX files are allowed.";
  }

  if (category === "ai" && extension !== ".pdf") {
    return "Smart AI notes must be PDF files.";
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return "The uploaded file type is not allowed.";
  }

  return "";
}

function buildStoragePath({ unitKey, category, originalName }) {
  const extension = path.extname(originalName).toLowerCase();
  const safeUnit = sanitizeSegment(unitKey, "unit");
  const safeCategory = sanitizeSegment(category, "notes");
  const uniqueName = `${Date.now()}-${crypto
    .randomUUID()
    .replace(/-/g, "")}${extension}`;

  return `notes/${safeUnit}/${safeCategory}/${uniqueName}`;
}

function toNoteMeta(doc) {
  const data = doc.data();

  return {
    id: doc.id,
    unitKey: data.unitKey,
    title: data.title,
    fileName: data.originalFileName,
    originalFileName: data.originalFileName,
    mimeType: data.mimeType,
    size: data.fileSize,
    category: data.category,
    createdAt: data.createdAt,
    storagePath: data.storagePath,
  };
}

export async function listNotes() {
  const db = getDb();
  const snapshot = await db
    .collection(NOTES_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map(toNoteMeta);
}

export async function uploadNote({ file, unitKey, title, category }) {
  const payloadError = validateNotePayload({
    unitKey,
    title,
    category,
  });

  if (payloadError) {
    const error = new Error(payloadError);
    error.statusCode = 400;
    throw error;
  }

  const fileError = validateFile(file, category);

  if (fileError) {
    const error = new Error(fileError);
    error.statusCode = 400;
    throw error;
  }

  const bucket = getBucket();
  const db = getDb();

  const storagePath = buildStoragePath({
    unitKey,
    category,
    originalName: file.originalname,
  });

  const storageFile = bucket.file(storagePath);

  await storageFile.save(file.buffer, {
    resumable: false,
    metadata: {
      contentType: file.mimetype,
      metadata: {
        originalFileName: file.originalname,
      },
    },
  });

  const docRef = db.collection(NOTES_COLLECTION).doc();
  const createdAt = Date.now();
  const note = {
    unitKey: String(unitKey).trim(),
    title: String(title).trim(),
    category,
    storagePath,
    originalFileName: file.originalname,
    mimeType: file.mimetype,
    fileSize: file.size,
    createdAt,
  };

  try {
    await docRef.set(note);
  } catch (error) {
    await storageFile.delete({ ignoreNotFound: true });
    throw error;
  }

  return toNoteMeta({
    id: docRef.id,
    data: () => note,
  });
}

export async function deleteNote(id) {
  const bucket = getBucket();
  const db = getDb();

  const docRef = db.collection(NOTES_COLLECTION).doc(id);
  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    const error = new Error("Note not found.");
    error.statusCode = 404;
    throw error;
  }

  const { storagePath } = snapshot.data();

  await bucket.file(storagePath).delete({
    ignoreNotFound: true,
  });
  await docRef.delete();
}

export async function createDownloadUrl(id) {
  const bucket = getBucket();
  const db = getDb();

  const snapshot = await db
    .collection(NOTES_COLLECTION)
    .doc(id)
    .get();

  if (!snapshot.exists) {
    const error = new Error("Note not found.");
    error.statusCode = 404;
    throw error;
  }

  const note = toNoteMeta(snapshot);
  const [url] = await bucket.file(note.storagePath).getSignedUrl({
    action: "read",
    expires:
      Date.now() +
      config.signedUrlExpiresMinutes * 60 * 1000,
    responseDisposition: `inline; filename="${encodeURIComponent(
      note.fileName
    )}"`,
  });

  return {
    url,
    note,
    expiresInMinutes: config.signedUrlExpiresMinutes,
  };
}
