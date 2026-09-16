# CampusHere

CampusHere is a Vite React campus notes app with a separate Node.js/Express API for note uploads. Uploaded files are stored in Firebase Cloud Storage and note metadata is stored in Firestore.

## Project Structure

- `src/` contains the existing React/TypeScript frontend.
- `server/` contains the Express API, Firebase Admin setup, routes, controllers, middleware, and storage/database services.
- `public/favicon.svg` is used by `index.html`.
- `.env.example` documents the backend configuration.

## Firebase Setup

1. Create a Firebase project.
2. Enable Cloud Storage.
3. Enable Firestore in native mode.
4. Create a Firebase Admin service account.
5. Keep the service account JSON outside Git.
6. Set Storage rules so browser users cannot write directly to the bucket. Uploads should go through the Express API.

## Environment Variables

Create `.env` from `.env.example`:

```bash
PORT=5000
CORS_ORIGIN=http://localhost:5173
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
SIGNED_URL_EXPIRES_MINUTES=15
```

Provide Firebase Admin credentials using either:

- `FIREBASE_SERVICE_ACCOUNT_BASE64`, a base64-encoded service account JSON, or
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.

Never put real Firebase private keys or service account JSON in frontend code or Git.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm run dev:server
```

Start the frontend in another terminal:

```bash
npm run dev
```

Vite proxies `/api` requests to `http://localhost:5000`.

## Upload Flow

```text
React frontend
  -> POST /api/notes multipart/form-data
  -> Express + multer validation
  -> Firebase Admin SDK
  -> Firebase Cloud Storage
  -> Firestore note metadata
```

Files are stored under:

```text
notes/<unit-key>/<category>/<timestamp-random-id>.<extension>
```

The original filename is preserved in metadata, but it is not used as the storage object identifier.

## API

- `GET /api/health` checks that the API is running.
- `GET /api/notes` returns note metadata.
- `POST /api/notes` uploads one note file.
- `GET /api/notes/:id/download-url` returns a short-lived signed read URL.
- `DELETE /api/notes/:id` removes metadata and the Storage object.

Supported upload types:

- Original notes: PDF, PPT, PPTX
- Smart AI notes: PDF only

The current maximum file size is 25 MB.

## Security Notes

- Firebase Admin credentials stay on the backend only.
- The browser never receives service account credentials.
- Uploads validate file presence, extension, MIME type, size, category, title, and unit.
- Firebase Storage is read through signed URLs instead of making the bucket publicly writable.
- CORS is controlled with `CORS_ORIGIN`.
