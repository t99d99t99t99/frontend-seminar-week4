import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import type { Recipe } from "../types/recipe";

const api = axios.create({
  baseURL: "https://frontend-seminar-week5-server.vercel.app",
  withCredentials: true,
});

const PAGE_SIZE = 30;

export const favoriteService = {
  async getAll(signal?: AbortSignal): Promise<Recipe[]> {
    const recipes: Recipe[] = [];
    let skip = 0;

    while (true) {
      const { data } = await api.get<{ recipes: Recipe[] }>("/favorites", {
        params: {
          limit: PAGE_SIZE,
          skip,
        },
        signal,
      });

      recipes.push(...data.recipes);

      if (data.recipes.length < PAGE_SIZE) {
        return recipes;
      }

      skip += data.recipes.length;
    }
  },

  async add(recipeId: number): Promise<void> {
    await api.post("/favorites", { recipeId });
  },

  async remove(recipeId: number): Promise<void> {
    await api.delete(`/favorites/${recipeId}`);
  },
};

export const favoriteQueries = {
  all: ["favorites"] as const,

  list: (userId: number) =>
    queryOptions({
      queryKey: [...favoriteQueries.all, userId],
      queryFn: ({ signal }) => favoriteService.getAll(signal),
      staleTime: 30_000,
      retry: false,
      refetchOnWindowFocus: false,
    }),
};
