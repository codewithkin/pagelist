import axios, { AxiosError } from "axios";
import { env } from "@pagelist/env/web";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Response interceptor to standardize error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    // Handle 401 Unauthorized - redirect to sign-in
    if (error.response?.status === 401) {
      // Dispatch custom event so app can redirect
      window.dispatchEvent(
        new CustomEvent("auth:unauthorized", {
          detail: {
            message: error.response.data?.error || "Your session has expired. Please sign in again.",
          },
        }),
      );
    }

    const message =
      error.response?.data?.error || error.message || "Something went wrong. Please try again.";
    throw new ApiError(message, error.response?.status);
  },
);

/** Use as `queryFn` in `useQuery` for GET requests. */
export async function apiGet<T>(url: string): Promise<T> {
  try {
    const res = await apiClient.get<ApiResponse<T>>(url);
    if (!res.data.success && !res.data.data) {
      throw new ApiError(res.data.error || "Failed to fetch data.");
    }
    return res.data.data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(e instanceof Error ? e.message : "Failed to fetch data.");
  }
}

/** Use as `mutationFn` in `useMutation` for POST / PUT / PATCH / DELETE requests. */
export async function apiMutation<TData = unknown, TBody = unknown>(
  method: "post" | "put" | "patch" | "delete",
  url: string,
  data?: TBody,
): Promise<TData> {
  try {
    const res = await apiClient[method]<ApiResponse<TData>>(url, data);
    if (!res.data.success && !res.data.data) {
      throw new ApiError(res.data.error || "Operation failed. Please try again.");
    }
    return res.data.data as TData;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(e instanceof Error ? e.message : "Operation failed. Please try again.");
  }
}

/** Use as `mutationFn` in `useMutation` for multipart/form-data uploads. */
export async function apiUpload<TData = unknown>(
  url: string,
  formData: FormData,
): Promise<TData> {
  try {
    const res = await apiClient.post<TData>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data as TData;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    const error = e as AxiosError<{ error?: string }>;
    const message = error.response?.data?.error || (e instanceof Error ? e.message : "Upload failed");
    throw new ApiError(message, error.response?.status);
  }
}
