import { queryOptions } from "@tanstack/react-query";
import axios from "axios";
import type { Recipe } from "../types/recipe.ts";
import type { RecipeListResponse } from "../types/recipeListResponse.ts";

const RECIPE_MAX_LIMIT = 100;

const api = axios.create({
  baseURL: "https://frontend-seminar-week5-server.vercel.app",
});

export const recipeQueries = {
  all: ["recipes"] as const,
  search: ({
    q,
    tags,
    limit,
    skip,
  }: {
    q?: string;
    tags?: string[];
    limit: number;
    skip: number;
  }) =>
    queryOptions({
      queryKey: [...recipeQueries.all, "search", { q, tags, limit, skip }],
      queryFn: async (): Promise<RecipeListResponse> => {
        const hasQuery = q && q.trim() !== "";
        const hasTags = tags && tags.length > 0;

        const fetchParams = hasTags
          ? { limit: RECIPE_MAX_LIMIT, skip: 0 }
          : { limit, skip };

        let result: RecipeListResponse;
        if (hasQuery) {
          const { data } = await api.get("/recipes/search", {
            params: { q, ...fetchParams },
          });
          result = data;
        } else if (hasTags) {
          const { data } = await api.get(`/recipes/tag/${tags[0]}`, {
            params: { ...fetchParams },
          });
          result = data;
        } else {
          const { data } = await api.get("/recipes", {
            params: { ...fetchParams },
          });
          result = data;
        }

        if (tags && tags.length > 0) {
          const filteredRecipes = result.recipes.filter((recipe) =>
            tags.every((tag) => recipe.tags.includes(tag)),
          );
          result.recipes = filteredRecipes.slice(skip, skip + limit);
          result.total = filteredRecipes.length;
        }

        return result;
      },
    }),

  tags: () =>
    queryOptions({
      queryKey: [...recipeQueries.all, "tags"],
      queryFn: async (): Promise<string[]> => {
        const { data } = await api.get("/recipes/tags");
        return data;
      },
    }),

  id: (id: number) =>
    queryOptions({
      queryKey: [...recipeQueries.all, "tag", id],
      queryFn: async (): Promise<Recipe> => {
        const { data } = await api.get(`/recipes/${id}`);
        return data;
      },
    }),

  related: (tags: string[]) => {
    const fetchParams = { limit: RECIPE_MAX_LIMIT, skip: 0 };
    return queryOptions({
      queryKey: [...recipeQueries.all, "related", tags],
      queryFn: async (): Promise<RecipeListResponse> => {
        const result: Recipe[] = [];
        const fetchResults = await Promise.all(
          tags.map(async (tag): Promise<RecipeListResponse> => {
            const { data } = await api.get<RecipeListResponse>(
              `/recipes/tag/${tag}`,
              { params: fetchParams },
            );
            return data;
          }),
        );

        const recipeIDs = new Set();
        fetchResults.forEach((fetchResult) => {
          fetchResult.recipes.forEach((recipe) => {
            if (recipeIDs.has(recipe.id)) return;
            recipeIDs.add(recipe.id);
            result.push(recipe);
          });
        });

        return {
          recipes: result,
          total: result.length,
          skip: 0,
          limit: RECIPE_MAX_LIMIT,
        };
      },
    });
  },
};
