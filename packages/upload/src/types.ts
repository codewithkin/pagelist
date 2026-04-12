export interface UploadOptions {
  bucket: string;
  key: string;
  contentType: string;
  body: Buffer | Uint8Array | string;
}

export interface UploadResult {
  url: string;
  key: string;
  size: number;
  contentType: string;
}

export interface UploadConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region: string;
  publicUrl: string;
}
