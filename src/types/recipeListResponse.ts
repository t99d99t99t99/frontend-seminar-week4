import type { Recipe } from "./recipe";

export type RecipeListResponse = {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
};
