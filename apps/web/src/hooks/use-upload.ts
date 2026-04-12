import { useMutation } from "@tanstack/react-query";
import { apiUpload } from "@/lib/api-client";
import type { UploadResult } from "@pagelist/upload";

export function useUploadBook() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append("file", file);
      return apiUpload("/api/upload/book-pdf", formData);
    },
  });
}

export function useUploadCover() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append("file", file);
      return apiUpload("/api/upload/book-cover", formData);
    },
  });
}

export function useUploadProfilePicture() {
  return useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append("file", file);
      return apiUpload("/api/upload/profile-picture", formData);
    },
  });
}
