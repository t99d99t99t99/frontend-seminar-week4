import { useEffect, useState } from "react";
import RecipeCard from "./components/RecipeCard";
import { getAllRecipes } from "./services/recipeService";
import type { Recipe } from "./types/recipe";

function App() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    getAllRecipes()
      .then((data) => {
        if (!active) return;

        setRecipe((data as Recipe[])[0] ?? null);
        setStatus("ready");
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <p className="p-6">레시피를 불러오는 중...</p>;
  }

  if (status === "error") {
    return <p className="p-6">레시피를 불러오지 못했어요.</p>;
  }

  if (!recipe) {
    return <p className="p-6">표시할 레시피가 없어요.</p>;
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-bold">레시피 카드 미리보기</h1>

      <RecipeCard recipe={recipe} onSelect={setSelectedId} />

      {selectedId !== null && (
        <p className="mt-4 text-sm">선택한 레시피 ID: {selectedId}</p>
      )}
    </main>
  );
}

export default App;
