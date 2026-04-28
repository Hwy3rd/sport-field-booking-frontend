import axios from "axios";
import Cookies from "js-cookie";
import { env } from "../env";
import { ApiResponse } from "@/types/api.type";
import { RefreshTokenResponse } from "@/types/auth.type";

const BASE_URL = env.CLOUD_API_URL ?? env.LOCAL_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let refreshTokenPromise: Promise<string> | null = null;

const getRefreshedAccessToken = async (): Promise<string> => {
  if (!refreshTokenPromise) {
    refreshTokenPromise = api
      .post("/auth/refresh-token", null, {
        withCredentials: true,
      })
      .then((response) => {
        const newAccessToken = response?.data?.data?.accessToken as
          | string
          | undefined;
        if (!newAccessToken) {
          throw new Error("Missing access token in refresh response");
        }
        Cookies.set("accessToken", newAccessToken, { expires: 7 });
        return newAccessToken;
      })
      .finally(() => {
        refreshTokenPromise = null;
      });
  }
``
  return refreshTokenPromise;
};


//attach access token to header
api.interceptors.request.use((config) => {
  const accessToken = Cookies.get("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    const retried = Boolean((originalRequest as { _retry?: boolean })._retry);

    if (error.response?.status === 401 && !retried) {
      (originalRequest as { _retry?: boolean })._retry = true;

      try {
        const newAccessToken = await getRefreshedAccessToken();

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (error) {
        //refresh token failed, logout user
        Cookies.remove("accessToken");
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
