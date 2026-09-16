import express from "express";
import cors from "cors";
import notesRoutes from "./routes/notesRoutes.js";
import { config } from "./config/env.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
  })
);

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    success: true,
    service: "campushere-api",
  });
});

app.use("/api/notes", notesRoutes);

app.use((error, _request, response, _next) => {
  const statusCode =
    error.statusCode ||
    (error.code === "LIMIT_FILE_SIZE" ? 413 : 500);
  const safeConfigurationError =
    error.message ===
      "Firebase Admin credentials are not configured." ||
    error.message === "FIREBASE_STORAGE_BUCKET is required.";

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    error:
      statusCode >= 500 && !safeConfigurationError
        ? "The server could not complete this request."
        : error.message,
  });
});

app.listen(config.port, () => {
  console.log(
    `CampusHere API listening on http://localhost:${config.port}`
  );
});
