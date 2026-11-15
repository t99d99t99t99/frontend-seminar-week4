import { recipes } from "../data/recipes.ts";
import type { Recipe } from "../types/recipe.ts";

export const getAllRecipes = () => {
  return new Promise<Recipe[]>((resolve) => {
    setTimeout(() => {
      resolve(recipes);
    }, 1000);
  });
};

/**
 * 선택한 태그를 모두 가지고 있는 레시피를 전부 포함한 배열을 반환합니다.
 * 태그 목록이 비어 있다면 모든 레시피가 포함됩니다.
 *
 * @param tags - 필터링할 태그 문자열 배열
 * @returns 조건에 맞는 레시피 배열을 담은 Promise
 */
const getRecipesByAllTags = (tags: string[]): Recipe[] => {
  if (tags.length === 0) {
    return recipes;
  }

  const filteredRecipes = recipes.filter((recipe) =>
    tags.every((tag) => recipe.tags.includes(tag)),
  );

  return filteredRecipes;
};

/**
 * 선택한 태그들 중 하나 이상의 태그를 가지고 있는 레시피를 전부 포함한 배열을 반환합니다.
 * 태그 목록이 비어 있다면 빈 배열이 반환됩니다.
 *
 * @param tags - 필터링할 태그 문자열 배열
 * @returns 조건에 맞는 레시피 배열
 */
const getRecipesByAnyTags = (tags: string[]): Recipe[] => {
  if (tags.length === 0) {
    return [];
  }

  const filteredRecipes = recipes.filter((recipe) =>
    tags.some((tag) => recipe.tags.includes(tag)),
  );

  return filteredRecipes;
};

/**
 * 조건에 맞는 레시피 중 페이지네이션된 레시피 배열과 총 페이지 수를 담은 Promise를 반환합니다.
 * 태그 목록이 비어 있거나 전달되지 않으면 모든 레시피를 대상으로 합니다.
 *
 * @param offset - 페이지네이션 시 건너뛸 레시피의 시작 인덱스
 * @param limit - 한 번에 가져올 최대 레시피 개수
 * @param tags - 필터링할 태그 문자열 배열
 * @returns 조건에 맞는 레시피 배열, 총 페이지 수, 총 레시피 수를 담은 Promise
 */
export const getRecipePage = (
  offset: number,
  limit: number,
  tags?: string[],
) => {
  return new Promise<{
    recipes: Recipe[];
    totalPages: number;
    totalCount: number;
  }>((resolve) => {
    setTimeout(() => {
      if (limit <= 0) {
        return resolve({ recipes: [], totalPages: 0, totalCount: 0 });
      }
      const recipes = getRecipesByAllTags(tags ? tags : []);

      resolve({
        recipes: recipes.slice(offset, offset + limit),
        totalPages: Math.ceil(recipes.length / limit),
        totalCount: recipes.length,
      });
    }, 1000);
  });
};

/**
 * 타겟 레시피와 관련된 레시피를 전부 포함한 배열을 반환합니다.
 * 관련된 레시피는 타겟 레시피와 태그를 하나 이상 공유하는 레시피입니다.
 *
 * @param targetRecipe - 관련 레시피를 탐색할 타겟 레시피
 * @returns - 해당 레시피와 관련된 모든 레시피가 담긴 배열
 */
const getRelatedRecipes = (targetRecipe: Recipe): Recipe[] => {
  const relatedRecipes = getRecipesByAnyTags(targetRecipe.tags);
  return relatedRecipes.filter((recipe) => recipe.id !== targetRecipe.id);
};

/**
 * 단일 레시피의 정보를 반환합니다.
 * @param id - 타겟 레시피의 id
 * @returns 해당 레시피의 정보가 담긴 Recipe 객체
 */
const getRecipe = (id: number): Recipe | undefined =>
  recipes.find((recipe) => recipe.id === id);

/**
 * 타겟 레시피와 관련 레시피 목록이 함께 담긴 Promise를 반환합니다.
 * @param id - 타겟 레시피의 id
 * @returns 타겟 레시피와 관련 레시피 목록이 담긴 Promise
 */
export const getRecipeDetail = (id: number) => {
  return new Promise<{ recipe: Recipe; relatedRecipes: Recipe[] }>(
    (resolve, reject) => {
      setTimeout(() => {
        const recipe = getRecipe(id);

        if (!recipe) {
          reject(new Error("Recipe Not Found"));
          return;
        }

        resolve({ recipe, relatedRecipes: getRelatedRecipes(recipe) });
      }, 1000);
    },
  );
};

/**
 * 존재하는 모든 태그의 목록을 반환합니다.
 * @returns 모든 태그의 목록을 나타내는 string의 배열
 */
export const getTags = (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tags = [...new Set(recipes.flatMap((recipe) => recipe.tags ?? []))];
      resolve(tags);
    }, 1000);
  });
};
