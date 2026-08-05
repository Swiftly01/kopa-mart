import apiClient from "@/lib/utils/apiClient";

/**
 * ⚠️ BACKEND GAP — see CHAT_INTEGRATION_ANALYSIS.md, section "Missing endpoints".
 *
 * The backend has no generic media-upload endpoint for chat attachments or
 * voice notes. `SendMessageDto.mediaUrl` expects an already-hosted URL, but
 * nothing in the backend ZIP produces one for chat use (CloudinaryService is
 * only wired up for user avatars, product images, and seller-onboarding
 * documents — each tied to its own entity/folder, none of them conversations).
 *
 * This function calls the endpoint the frontend *would* need
 * (`POST /messages/attachments`, multipart, returning `{ url, fileName }`)
 * so that the moment that route exists on the backend, attachments and voice
 * notes start working with zero UI changes. Until then it fails fast with a
 * clear, typed error that the UI surfaces as a normal "upload failed / retry"
 * state instead of a silent crash.
 */
export interface ChatMediaUploadResult {
  url: string;
  fileName: string;
}

export class ChatMediaUnavailableError extends Error {
  constructor() {
    super(
      "Attachment uploads require a backend endpoint that doesn't exist yet (POST /messages/attachments).",
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
  formData.append("file", file);

  try {
    const response = await apiClient.post("/messages/attachments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      signal,
      onUploadProgress: (evt) => {
        if (!onProgress || !evt.total) return;
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      },
    });
    return response.data;
  } catch (error) {
    // 404 (route doesn't exist) is the expected failure mode today.
    // Anything else (network, 413, etc.) is re-thrown as-is so calling
    // code can distinguish "not built yet" from "genuinely failed".
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
