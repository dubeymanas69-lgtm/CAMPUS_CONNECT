import {
  createDownloadUrl,
  deleteNote,
  listNotes,
  uploadNote,
} from "../services/notesService.js";

export async function getNotes(_request, response, next) {
  try {
    const notes = await listNotes();

    response.json({
      success: true,
      notes,
    });
  } catch (error) {
    next(error);
  }
}

export async function postNote(request, response, next) {
  try {
    const note = await uploadNote({
      file: request.file,
      unitKey: request.body.unitKey,
      title: request.body.title,
      category: request.body.category,
    });

    response.status(201).json({
      success: true,
      ...note,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeNote(request, response, next) {
  try {
    await deleteNote(request.params.id);

    response.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDownloadUrl(
  request,
  response,
  next
) {
  try {
    const result = await createDownloadUrl(request.params.id);

    response.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
