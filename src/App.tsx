import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Header from "./components/Header";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import MyPage from "./pages/MyPage";
import RecipeDetail from "./pages/RecipeDetail";
import { authQueries, authService } from "./services/authService";
import { favoriteQueries } from "./services/favoriteService";

function App() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userQuery = useQuery(authQueries.me());
  const user = userQuery.data;

  const favoritePendingCount = useIsMutating({
    mutationKey: favoriteQueries.all,
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,

    onSuccess: async () => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: authQueries.me().queryKey,
        }),
        queryClient.cancelQueries({
          queryKey: favoriteQueries.all,
        }),
      ]);

      queryClient.setQueryData(authQueries.me().queryKey, null);
      queryClient.removeQueries({
        queryKey: favoriteQueries.all,
      });

      navigate("/", { replace: true });
    },
  });

  return (
    <>
      <Header>
        {userQuery.isPending && (
          <span className="text-muted-foreground">로그인 상태 확인 중...</span>
        )}

        {userQuery.isError && (
          <div className="flex items-center gap-2">
            <span>로그인 상태를 확인하지 못했어요.</span>
            <button
              type="button"
              onClick={() => {
                void userQuery.refetch();
              }}
              disabled={userQuery.isFetching}
              className="underline"
            >
              다시 확인
            </button>
          </div>
        )}

        {userQuery.isSuccess && user && (
          <>
            <span>{user.displayName}님</span>

            <Link to="/mypage" className="hover:underline">
              마이페이지
            </Link>

            <button
              type="button"
              onClick={() => {
                if (logoutMutation.isPending) return;

                if (
                  queryClient.isMutating({
                    mutationKey: favoriteQueries.all,
                  }) > 0
                ) {
                  return;
                }

                logoutMutation.mutate();
              }}
              disabled={logoutMutation.isPending || favoritePendingCount > 0}
              className="rounded-md border px-3 py-2 disabled:opacity-50"
            >
              {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
            </button>
          </>
        )}

        {userQuery.isSuccess && !user && (
          <Link to="/login" className="rounded-md border px-3 py-2">
            로그인
          </Link>
        )}
      </Header>

      {logoutMutation.isError && (
        <p
          role="alert"
          className="mx-auto max-w-6xl px-6 py-3 text-sm text-red-600"
        >
          로그아웃에 실패했어요. 다시 시도해 주세요.
        </p>
      )}

      {logoutMutation.isPending ? (
        <p role="status" className="p-6">
          로그아웃하는 중...
        </p>
      ) : (
        <Routes>
          <Route
            path="/"
            element={<MainPage onSelect={(id) => navigate(`/recipe/${id}`)} />}
          />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  );
}

export default App;
