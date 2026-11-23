import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import FavoriteButton from "../components/FavoriteButton";
import RecipeCard from "../components/RecipeCard";
import { recipeQueries } from "../services/recipeService";
import type { Recipe } from "../types/recipe";

function RelatedCarousel({ recipes }: { recipes: Recipe[] }) {
  const navigate = useNavigate();

  if (recipes.length === 0) return <p>관련 레시피가 없어요.</p>;

  const repetitions = Math.ceil(5 / recipes.length);
  const carouselRecipes: { key: string; recipe: Recipe }[] = [];

  for (let repetition = 0; repetition < repetitions; repetition++) {
    for (const recipe of recipes) {
      carouselRecipes.push({
        key: `${repetition}-${recipe.id}`,
        recipe,
      });
    }
  }

  return (
    <div id="related-recipe-cards" className="group overflow-hidden py-2">
      <style>{`
        @keyframes recipe-carousel {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <div className="flex w-max animate-[recipe-carousel_120s_linear_infinite] group-hover:paused group-focus-within:paused motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 gap-4 pr-4">
            {carouselRecipes.map(({ key, recipe }) => (
              <div key={key} className="w-60 shrink-0">
                <RecipeCard
                  recipe={recipe}
                  onSelect={(id) => {
                    navigate(`/recipe/${id}`);
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedRecipes({ recipe }: { recipe: Recipe }) {
  const relatedResult = useQuery(recipeQueries.related(recipe.tags));

  return (
    <div id="related-recipes" className="mt-8 leading-relaxed">
      <h2 className="mb-4 text-xl font-bold">
        이 요리와 연관 있는 레시피 보기
      </h2>

      {relatedResult.isLoading && <p>레시피를 불러오는 중...</p>}
      {relatedResult.isError && <p>레시피를 불러오지 못했어요</p>}
      {relatedResult.isSuccess && (
        <RelatedCarousel recipes={relatedResult.data.recipes} />
      )}
    </div>
  );
}

function RecipeDescription({ recipe }: { recipe: Recipe }) {
  return (
    <>
      <div id="basic-info" className="sm:flex sm:flex-row sm:gap-6">
        <img
          src={recipe.image}
          alt={`${recipe.name}의 사진`}
          className="mx-2 mb-4 aspect-square w-[calc(100%-1rem)] rounded-xl object-cover sm:mx-0 sm:mb-0 sm:h-60.5 sm:w-60.5 sm:shrink-0"
        />

        <div id="basic-info-texts" className="leading-relaxed [&>p]:mt-2">
          <div className="mb-3 flex items-center gap-3">
            <h1 className="text-2xl font-bold">{recipe.name}</h1>
            <span id="difficulty" className="shrink-0 text-[#1677ff]">
              {recipe.difficulty}
            </span>
          </div>

          <p id="total-time">
            총 요리시간 {recipe.cookTimeMinutes + recipe.prepTimeMinutes}분
          </p>
          <p id="prep-time">준비시간 {recipe.prepTimeMinutes}분</p>
          <p id="cook-time">조리시간 {recipe.cookTimeMinutes}분</p>

          <div id="tags" className="mt-3 flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <FavoriteButton key={recipe.id} recipe={recipe} />
      </div>

      <div id="ingredients" className="mt-8 leading-relaxed">
        <h2 className="mb-4 text-xl font-bold">재료</h2>
        <p>{recipe.ingredients.join(", ")}</p>
      </div>

      <div id="instructions" className="mt-8 leading-relaxed [&>p]:mt-2">
        <h2 className="mb-4 text-xl font-bold">레시피</h2>
        {recipe.instructions.map((instruction, index) => (
          <p key={instruction}>
            {index + 1}. {instruction}
          </p>
        ))}
      </div>

      <div id="information" className="mt-8 leading-relaxed [&>p]:mt-2">
        <h2 className="mb-4 text-xl font-bold">요리 정보</h2>
        <p id="cuisine">유형: {recipe.cuisine}</p>
        <p id="meal-type">음식특징: {recipe.mealType.join(", ")}</p>
        <p id="calories-per-serving">칼로리: {recipe.caloriesPerServing}</p>
        <p id="rating">별점: {recipe.rating}</p>
      </div>

      <RelatedRecipes recipe={recipe} />
    </>
  );
}

function RecipeDetail() {
  const { id } = useParams();
  const recipeResult = useQuery(recipeQueries.id(Number(id)));

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {recipeResult.isLoading && <p>레시피를 불러오는 중...</p>}
      {recipeResult.isError && <p>레시피를 불러오지 못했어요</p>}
      {recipeResult.isSuccess && (
        <RecipeDescription recipe={recipeResult.data} />
      )}
    </main>
  );
}

export default RecipeDetail;
