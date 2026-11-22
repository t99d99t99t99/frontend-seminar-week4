import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

const api = axios.create({
  baseURL: "https://frontend-seminar-week5-server.vercel.app",
  withCredentials: true,
});

type User = {
  id: number;
  username: string;
  displayName: string;
};

type LoginInput = {
  username: string;
  password: string;
};

export const authService = {
  async login(input: LoginInput): Promise<User> {
    const { data } = await api.post<User>("/auth/login", input);
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getMe(signal?: AbortSignal): Promise<User | null> {
    try {
      const { data } = await api.get<User>("/auth/me", { signal });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }

      throw error;
    }
  },
};

export const authQueries = {
  me: () =>
    queryOptions({
      queryKey: ["auth", "me"],
      queryFn: ({ signal }) => authService.getMe(signal),
      retry: false,
      staleTime: 30_000,
    }),
};
