import type { Recipe } from "../types/recipe";
import { Card } from "./ui/card";

type RecipeCardProps = {
  recipe: Recipe;
  onSelect: (id: number) => void;
};

export default function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <Card className="gap-0 overflow-hidden p-0 transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => onSelect(recipe.id)}
        className="block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
        aria-label={`${recipe.name} 레시피 보기`}
      >
        <img
          src={recipe.image}
          alt={recipe.name}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />

        <span className="flex flex-col gap-2 p-4">
          <strong className="text-lg font-semibold">{recipe.name}</strong>

          <span className="text-sm text-muted-foreground">
            총 {totalTime}분 · {recipe.servings}인분
          </span>

          <span className="text-sm text-muted-foreground">
            ★ {recipe.rating.toFixed(1)} · 리뷰 {recipe.reviewCount}개
          </span>

          <span className="mt-1 flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </span>
        </span>
      </button>
    </Card>
  );
}
