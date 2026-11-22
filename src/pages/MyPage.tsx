import { useQuery } from "@tanstack/react-query";
import { Navigate, useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import { authQueries } from "../services/authService";
import { favoriteQueries } from "../services/favoriteService";

function MyPage() {
  const navigate = useNavigate();

  const userQuery = useQuery(authQueries.me());
  const user = userQuery.data;

  const favoritesQuery = useQuery({
    ...favoriteQueries.list(user?.id ?? 0),
    enabled: Boolean(user),
  });

  if (userQuery.isPending) {
    return <p className="p-6">사용자 정보를 확인하는 중...</p>;
  }

  if (userQuery.isError) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-8">
        <p>사용자 정보를 불러오지 못했어요.</p>
        <button
          type="button"
          onClick={() => {
            void userQuery.refetch();
          }}
          disabled={userQuery.isFetching}
          className="mt-3 rounded-md border px-4 py-2"
        >
          다시 시도
        </button>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold">마이페이지</h1>

      <section className="mt-8 rounded-xl border p-6">
        <h2 className="text-xl font-semibold">내 정보</h2>

        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm text-muted-foreground">이름</dt>
            <dd className="mt-1 font-medium">{user.displayName}</dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">아이디</dt>
            <dd className="mt-1">{user.username}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          즐겨찾기한 레시피
          {favoritesQuery.isSuccess && (
            <span className="ml-2 text-base text-muted-foreground">
              {favoritesQuery.data.length}개
            </span>
          )}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          카드를 누르면 레시피를 자세히 볼 수 있어요.
        </p>

        {favoritesQuery.isPending && (
          <p className="mt-6">즐겨찾기를 불러오는 중...</p>
        )}

        {favoritesQuery.isError && (
          <div className="mt-6">
            <p role="alert">즐겨찾기 목록을 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => {
                void favoritesQuery.refetch();
              }}
              disabled={favoritesQuery.isFetching}
              className="mt-3 rounded-md border px-4 py-2"
            >
              다시 시도
            </button>
          </div>
        )}

        {favoritesQuery.isSuccess && favoritesQuery.data.length === 0 && (
          <p className="mt-6 rounded-xl border p-6 text-muted-foreground">
            아직 즐겨찾기한 레시피가 없어요. 상세 페이지에서 마음에 드는
            레시피를 저장해 보세요.
          </p>
        )}

        {favoritesQuery.isSuccess && favoritesQuery.data.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favoritesQuery.data.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={(id) => navigate(`/recipe/${id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyPage;
