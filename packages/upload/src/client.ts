import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { UploadOptions, UploadResult, UploadConfig } from "./types";

let s3Client: S3Client | null = null;
let config: UploadConfig | null = null;

export function initializeUploadClient(cfg: UploadConfig): void {
  config = cfg;
  s3Client = new S3Client({
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
  });
}

export function getUploadClient(): S3Client {
  if (!s3Client || !config) {
    throw new Error("Upload client not initialized. Call initializeUploadClient first.");
  }
  return s3Client;
}

export function getUploadConfig(): UploadConfig {
  if (!config) {
    throw new Error("Upload config not available. Call initializeUploadClient first.");
  }
  return config;
}

export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
  const client = getUploadClient();
  const cfg = getUploadConfig();

  const command = new PutObjectCommand({
    Bucket: cfg.bucketName,
    Key: options.key,
    Body: options.body,
    ContentType: options.contentType,
  });

  try {
    await client.send(command);
    
    // Construct the public URL for the uploaded file
    const publicUrl = `https://${cfg.bucketName}.${cfg.accountId}.r2.dev/${options.key}`;

    return {
      url: publicUrl,
      key: options.key,
      size:
        typeof options.body === "string"
          ? Buffer.byteLength(options.body)
          : options.body.length,
      contentType: options.contentType,
    };
  } catch (error) {
    throw new Error(
      `Failed to upload file to R2: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function deleteFile(key: string): Promise<void> {
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const client = getUploadClient();
  const cfg = getUploadConfig();

  const command = new DeleteObjectCommand({
    Bucket: cfg.bucketName,
    Key: key,
  });

  try {
    await client.send(command);
  } catch (error) {
    throw new Error(
      `Failed to delete file from R2: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export function generateKey(type: "book" | "profile", userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${type}/${userId}/${timestamp}-${sanitized}`;
}
