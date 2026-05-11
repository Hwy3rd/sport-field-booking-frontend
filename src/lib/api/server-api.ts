import { env } from "@/lib/env";
import type { ApiResponse } from "@/types/api.type";

const BASE_URL = env.CLOUD_API_URL ?? env.LOCAL_API_URL;

function toQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiResponse<T>;
  if (!payload.success || !payload.data) {
    throw new Error(payload.message || "Request failed");
  }
  return payload.data;
}

export async function serverGet<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}${toQueryString(params)}`, {
    method: "GET",
    ...options,
  });

  return parseResponse<T>(response);
}

export async function serverPost<T, B extends object>(
  path: string,
  body: B,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    body: JSON.stringify(body),
    ...options,
  });

  return parseResponse<T>(response);
}
