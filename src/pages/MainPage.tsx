import { useEffect, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import { getAllRecipes, getRecipePage } from "../services/recipeService";
import type { Recipe } from "../types/recipe";

const PAGE_SIZE = 6;

type LoadStatus = "loading" | "ready" | "error";

type MainPageProps = {
  onSelect: (id: number) => void;
};

export default function MainPage({ onSelect }: MainPageProps) {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [tagsStatus, setTagsStatus] = useState<LoadStatus>("loading");
  const [pageStatus, setPageStatus] = useState<LoadStatus>("loading");

  useEffect(() => {
    let active = true;

    getAllRecipes()
      .then((data) => {
        if (!active) return;

        setAllRecipes(data);
        setTagsStatus("ready");
      })
      .catch(() => {
        if (active) setTagsStatus("error");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    setPageStatus("loading");

    getRecipePage((page - 1) * PAGE_SIZE, PAGE_SIZE, selectedTags)
      .then((data) => {
        if (!active) return;

        setRecipes(data.recipes);
        setTotalPages(data.totalPages);
        setPageStatus("ready");
      })
      .catch(() => {
        if (active) setPageStatus("error");
      });

    return () => {
      active = false;
    };
  }, [page, selectedTags]);

  const tags = Array.from(new Set(allRecipes.flatMap((recipe) => recipe.tags)));

  const filteredCount = allRecipes.filter((recipe) =>
    selectedTags.every((tag) => recipe.tags.includes(tag)),
  ).length;

  const loading = tagsStatus === "loading" || pageStatus === "loading";

  const error = tagsStatus === "error" || pageStatus === "error";

  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));

  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstPage + index,
  );

  function toggleTag(tag: string) {
    setSelectedTags((previous) =>
      previous.includes(tag)
        ? previous.filter((item) => item !== tag)
        : [...previous, tag],
    );
    setPage(1);
  }

  function clearTags() {
    setSelectedTags([]);
    setPage(1);
  }

  const paginationClass =
    "rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">천 개의 레시피</h1>
        <p className="mt-2 text-muted-foreground">
          태그를 선택해 원하는 레시피를 찾아보세요.
        </p>
      </header>

      {tagsStatus === "ready" && (
        <>
          <section aria-label="태그 필터" className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={selectedTags.length === 0}
                onClick={clearTags}
                className={`rounded-full border px-4 py-2 text-sm ${
                  selectedTags.length === 0
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
              >
                전체
              </button>

              {tags.map((tag) => {
                const selected = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>

          <p aria-live="polite" className="mb-4 text-sm text-muted-foreground">
            총 {filteredCount}개의 레시피
          </p>
        </>
      )}

      {error ? (
        <div role="alert" className="py-20 text-center">
          <p>레시피를 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md border px-4 py-2"
          >
            다시 시도
          </button>
        </div>
      ) : loading ? (
        <p role="status" className="py-20 text-center">
          레시피를 불러오는 중...
        </p>
      ) : recipes.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          해당하는 레시피가 없어요.
        </p>
      ) : (
        <section
          aria-label="레시피 목록"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelect} />
          ))}
        </section>
      )}

      {!error && totalPages > 1 && (
        <nav
          aria-label="레시피 페이지"
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            disabled={loading || page === 1}
            onClick={() => setPage(page - 1)}
            className={paginationClass}
          >
            이전
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              disabled={loading}
              aria-label={`${pageNumber}페이지`}
              aria-current={pageNumber === page ? "page" : undefined}
              onClick={() => setPage(pageNumber)}
              className={`${paginationClass} ${
                pageNumber === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => setPage(page + 1)}
            className={paginationClass}
          >
            다음
          </button>
        </nav>
      )}
    </main>
  );
}
