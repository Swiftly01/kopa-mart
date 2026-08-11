import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";

/**
 * Uploads a single chat attachment (image, document, or voice note) to the
 * backend's Cloudinary-backed upload endpoint (`POST /upload`, multipart,
 * field name "files"). The endpoint accepts a batch, but chat only ever
 * sends one file at a time, so we take the first result.
 */
export interface ChatMediaUploadResult {
  url: string;
  fileName: string;
  publicId: string;
  format: string;
  size: number;
}

interface UploadFilesResponse {
  files: {
    url: string;
    publicId: string;
    fileName: string;
    format: string;
    size: number;
  }[];
}

export class ChatMediaUnavailableError extends Error {
  constructor() {
    super(
      "Attachment uploads require the backend upload endpoint (POST /upload), which isn't reachable right now.",
    );
    this.name = "ChatMediaUnavailableError";
  }
}

export async function uploadChatMedia(
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<ChatMediaUploadResult> {
  const formData = new FormData();
  formData.append("files", file);

  try {
    const response = await apiClient.post<UploadFilesResponse>(
      `${apiBaseUrl}/api/v1/upload`,
      formData,
      {
        // No explicit Content-Type: the browser must set
        // "multipart/form-data; boundary=..." itself when sending a
        // FormData body. Setting it manually here omits the boundary and
        // breaks multipart parsing on the server.
        signal,
        onUploadProgress: (evt) => {
          if (!onProgress || !evt.total) return;
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      },
    );

    const uploaded = response.data.files[0];
    if (!uploaded) {
      throw new Error("Upload response contained no files");
    }
    return uploaded;
  } catch (error) {
    // 404 (route unreachable, e.g. misconfigured API base URL) is treated
    // as "not available" so the UI can show a distinct message. Anything
    // else (network, 400 validation, 413 too large) is re-thrown as-is.
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      (error as { response?: { status?: number } }).response?.status === 404
    ) {
      throw new ChatMediaUnavailableError();
    }
    throw error;
  }
}

/**
 * Deletes a previously uploaded chat attachment from Cloudinary, e.g. when
 * the user removes a staged attachment or deletes a sent message.
 */
export async function deleteChatMedia(publicId: string): Promise<void> {
  await apiClient.delete(`${apiBaseUrl}/api/v1/upload`, {
    params: { publicId },
  });
}
