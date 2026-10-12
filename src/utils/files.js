/**
 * File-attachment helpers (drag & drop / paste / file picker in chat)
 * Backend: swap object URLs for real upload -> POST /files, then store file_id + url
 */

export const MAX_ATTACHMENTS = 10;

export function formatFileSize(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function isImageFile(file) {
  return Boolean(file?.type?.startsWith("image/"));
}

let seq = 0;

/** Wrap a native File into a pending composer attachment (local preview URL). */
export function toPendingAttachment(file) {
  const kind = isImageFile(file) ? "image" : "file";
  return {
    id: `att-${Date.now()}-${seq++}`,
    file,
    name: file.name || "unnamed",
    size: file.size || 0,
    type: file.type || "application/octet-stream",
    kind,
    url: URL.createObjectURL(file),
  };
}

/** Strip the native File before storing on a message (backend: replace url with CDN url). */
export function toMessageAttachment(pending) {
  const { id, name, size, type, kind, url } = pending;
  return { id, name, size, type, kind, url };
}
