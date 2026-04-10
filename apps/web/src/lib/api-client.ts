import axios from "axios";
import { env } from "@pagelist/env/web";

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Use as `queryFn` in `useQuery` for GET requests. */
export async function apiGet<T>(url: string): Promise<T> {
  const res = await apiClient.get<T>(url);
  return res.data;
}

/** Use as `mutationFn` in `useMutation` for POST / PUT / PATCH / DELETE requests. */
export async function apiMutation<TData = unknown, TBody = unknown>(
  method: "post" | "put" | "patch" | "delete",
  url: string,
  data?: TBody,
): Promise<TData> {
  const res = await apiClient[method]<TData>(url, data);
  return res.data;
}
