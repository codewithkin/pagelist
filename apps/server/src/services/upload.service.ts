import {
  uploadFile,
  deleteFile,
  generateKey,
  type UploadResult,
} from "@pagelist/upload";

export async function uploadBookPdf(
  userId: string,
  filename: string,
  buffer: Buffer
): Promise<UploadResult> {
  const key = generateKey("book", userId, filename);
  
  return uploadFile({
    bucket: "pagelist",
    key,
    contentType: "application/pdf",
    body: buffer,
  });
}

export async function uploadProfilePicture(
  userId: string,
  filename: string,
  buffer: Buffer
): Promise<UploadResult> {
  const key = generateKey("profile", userId, filename);
  
  return uploadFile({
    bucket: "pagelist",
    key,
    contentType: getMimeType(filename),
    body: buffer,
  });
}

export async function deleteUploadedFile(key: string): Promise<void> {
  return deleteFile(key);
}

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
