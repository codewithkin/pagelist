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

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor to standardize error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
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
