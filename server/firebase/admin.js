import admin from "firebase-admin";
import { config } from "../config/env.js";

function getCredential() {
  if (config.firebaseServiceAccountBase64) {
    const decoded = Buffer.from(
      config.firebaseServiceAccountBase64,
      "base64"
    ).toString("utf8");

    return admin.credential.cert(JSON.parse(decoded));
  }

  if (
    config.firebaseProjectId &&
    config.firebaseClientEmail &&
    config.firebasePrivateKey
  ) {
    return admin.credential.cert({
      projectId: config.firebaseProjectId,
      clientEmail: config.firebaseClientEmail,
      privateKey: config.firebasePrivateKey,
    });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault();
  }

  const error = new Error(
    "Firebase Admin credentials are not configured."
  );
  error.statusCode = 500;
  throw error;
}

function getApp() {
  if (!config.firebaseStorageBucket) {
    const error = new Error(
      "FIREBASE_STORAGE_BUCKET is required."
    );
    error.statusCode = 500;
    throw error;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: getCredential(),
      storageBucket: config.firebaseStorageBucket,
    });
  }

  return admin.app();
}

export function getDb() {
  getApp();
  return admin.firestore();
}

export function getBucket() {
  getApp();
  return admin.storage().bucket();
}
