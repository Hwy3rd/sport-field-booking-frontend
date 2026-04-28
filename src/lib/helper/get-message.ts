import { ApiErrorResponse } from "@/types/api.type";
import { AxiosError } from "axios";

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as ApiErrorResponse | undefined)?.message;
    return message || error.message || fallback;
  }

  if (error instanceof Error) return error.message;

  return fallback;
};
