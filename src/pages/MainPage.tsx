import { useDebouncedValue } from "@tanstack/react-pacer";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import RecipeCard from "../components/RecipeCard";
import { recipeQueries } from "../services/recipeService";
import type { RecipeListResponse } from "../types/recipeListResponse";

type MainPageProps = {
  onSelect: (id: number) => void;
};

type TagsFilterProp = {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
};

function TagsFilter({
  tags,
  selectedTags,
  onToggleTag,
  onClearTags,
}: TagsFilterProp) {
  const [tagsIsOpen, setTagsIsOpen] = useState(false);
  const MAX_TAGS_FOLDED = 10;
  const selectedTagSet = new Set(selectedTags);

  let tagsToShow: string[] = [];
  if (tagsIsOpen) tagsToShow = tags;
  else {
    let includedTags = 0;
    let includedSelectedTags = 0;
    for (const tag of tags) {
      tagsToShow.push(tag);
      ++includedTags;
      if (selectedTagSet.has(tag)) ++includedSelectedTags;

      if (
        includedTags - includedSelectedTags >=
        MAX_TAGS_FOLDED - selectedTags.length
      )
        break;
    }
    const shownTagSet = new Set(tagsToShow);
    tagsToShow = tagsToShow.concat(
      selectedTags.filter((tag) => !shownTagSet.has(tag)),
    );
  }

  return (
    <section aria-label="태그 필터" className="mb-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={selectedTags.length === 0}
          onClick={onClearTags}
          className={`rounded-full border px-4 py-2 text-sm ${
            selectedTags.length === 0
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-background hover:bg-muted"
          }`}
        >
          전체
        </button>

        {tagsToShow.map((tag) => {
          const selected = selectedTagSet.has(tag);

          return (
            <button
              key={tag}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggleTag(tag)}
              className={`hover:cursor-pointer
                rounded-full border px-4 py-2 text-sm ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                }`}
            >
              {tag}
            </button>
          );
        })}
        <br />
      </div>
      <button
        type="button"
        onClick={() => setTagsIsOpen(!tagsIsOpen)}
        className="hover:cursor-pointer text-muted-foreground underline py-2"
      >
        {tagsIsOpen ? "접기" : "더보기"}
      </button>
    </section>
  );
}

type SearchBarProps = {
  onSearchQueryChange: (searchQuery: string) => void;
};

function SearchBar({ onSearchQueryChange }: SearchBarProps) {
  return (
    <InputGroup className="mb-3">
      <InputGroupInput
        onChange={(event) => {
          onSearchQueryChange(event.target.value);
        }}
      />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
    </InputGroup>
  );
}

type PageNavProps = {
  page: number;
  totalPages: number;
  recipeSearchResult: UseQueryResult<RecipeListResponse, Error>;
  onSetPage: (page: number) => void;
};

function PageNav({
  page,
  totalPages,
  recipeSearchResult,
  onSetPage,
}: PageNavProps) {
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => firstPage + index,
  );
  const paginationClass =
    "rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="레시피 페이지"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        disabled={recipeSearchResult.isLoading || page === 1}
        onClick={() => onSetPage(page - 1)}
        className={paginationClass}
      >
        이전
      </button>

      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          disabled={recipeSearchResult.isLoading}
          aria-label={`${pageNumber}페이지`}
          aria-current={pageNumber === page ? "page" : undefined}
          onClick={() => onSetPage(pageNumber)}
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
        disabled={recipeSearchResult.isLoading || page >= totalPages}
        onClick={() => onSetPage(page + 1)}
        className={paginationClass}
      >
        다음
      </button>
    </nav>
  );
}

export default function MainPage({ onSelect }: MainPageProps) {
  const LIMIT = 6;
  const [page, setPage] = useState(1);
  const skip = (page - 1) * LIMIT;

  const tagsResult = useQuery(recipeQueries.tags());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const searchParams = useMemo(
    () => ({
      q: searchQuery,
      tags: selectedTags,
      limit: LIMIT,
      skip,
    }),
    [searchQuery, selectedTags, skip],
  );
  const [debouncedSearch] = useDebouncedValue(searchParams, {
    wait: 300,
    leading: true,
  });
  const recipeSearchResult = useQuery(recipeQueries.search(debouncedSearch));

  const totalPages = Math.ceil((recipeSearchResult.data?.total ?? 0) / LIMIT);

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

  function toggleSearch(searchQuery: string) {
    setSearchQuery(searchQuery);
    setPage(1);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <SearchBar onSearchQueryChange={toggleSearch} />

      {tagsResult.isSuccess && (
        <TagsFilter
          tags={tagsResult.data}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          onClearTags={clearTags}
        />
      )}
      <p aria-live="polite" className="mb-4 text-sm text-muted-foreground">
        총 {recipeSearchResult.data?.total}개의 레시피
      </p>

      {recipeSearchResult.isError ? (
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
      ) : recipeSearchResult.isLoading ? (
        <p role="status" className="py-20 text-center">
          레시피를 불러오는 중...
        </p>
      ) : recipeSearchResult.data?.total === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          해당하는 레시피가 없어요.
        </p>
      ) : (
        <section
          aria-label="레시피 목록"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {recipeSearchResult.data?.recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelect} />
          ))}
        </section>
      )}

      {recipeSearchResult.isSuccess && totalPages > 1 && (
        <PageNav
          page={page}
          totalPages={totalPages}
          recipeSearchResult={recipeSearchResult}
          onSetPage={setPage}
        />
      )}
    </main>
  );
}
