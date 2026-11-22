import {
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { authQueries } from "../services/authService";
import { favoriteQueries, favoriteService } from "../services/favoriteService";
import type { Recipe } from "../types/recipe";

type ToggleInput = {
  recipe: Recipe;
  userId: number;
  isFavorite: boolean;
};

function FavoriteButton({ recipe }: { recipe: Recipe }) {
  const queryClient = useQueryClient();

  const userQuery = useQuery(authQueries.me());
  const user = userQuery.data;

  const favoritesQuery = useQuery({
    ...favoriteQueries.list(user?.id ?? 0),
    enabled: Boolean(user),
  });

  const pendingCount = useIsMutating({
    mutationKey: favoriteQueries.all,
  });

  const mutation = useMutation({
    mutationKey: favoriteQueries.all,

    mutationFn: async ({ recipe, isFavorite }: ToggleInput) => {
      if (isFavorite) {
        await favoriteService.remove(recipe.id);
      } else {
        await favoriteService.add(recipe.id);
      }
    },

    onMutate: async ({ recipe, userId, isFavorite }) => {
      const queryKey = favoriteQueries.list(userId).queryKey;

      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Recipe[]>(queryKey);

      queryClient.setQueryData<Recipe[]>(queryKey, (current = []) => {
        if (isFavorite) {
          return current.filter((item) => item.id !== recipe.id);
        }

        if (current.some((item) => item.id === recipe.id)) {
          return current;
        }

        return [...current, recipe];
      });

      return { queryKey, previous };
    },

    onError: (error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        void queryClient.invalidateQueries({
          queryKey: authQueries.me().queryKey,
        });
      }
    },

    onSettled: (_data, _error, variables) => {
      return queryClient.invalidateQueries({
        queryKey: favoriteQueries.list(variables.userId).queryKey,
      });
    },
  });

  if (userQuery.isPending) {
    return <p className="text-sm">로그인 상태 확인 중...</p>;
  }

  if (userQuery.isError) {
    return (
      <p className="text-sm text-red-600">로그인 상태를 확인하지 못했어요.</p>
    );
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-block rounded-md border px-4 py-2 text-sm"
      >
        로그인하고 즐겨찾기
      </Link>
    );
  }

  if (favoritesQuery.isPending) {
    return (
      <button
        type="button"
        disabled
        className="rounded-md border px-4 py-2 text-sm opacity-50"
      >
        즐겨찾기 확인 중...
      </button>
    );
  }

  if (favoritesQuery.isError) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <p>즐겨찾기를 불러오지 못했어요.</p>
        <button
          type="button"
          onClick={() => {
            void favoritesQuery.refetch();
          }}
          disabled={favoritesQuery.isFetching}
          className="underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const isFavorite = favoritesQuery.data.some((item) => item.id === recipe.id);

  return (
    <div>
      <button
        type="button"
        aria-pressed={isFavorite}
        aria-busy={mutation.isPending}
        disabled={pendingCount > 0}
        onClick={() => {
          if (
            queryClient.isMutating({
              mutationKey: favoriteQueries.all,
            }) > 0
          ) {
            return;
          }

          mutation.mutate({
            recipe,
            userId: user.id,
            isFavorite,
          });
        }}
        className="rounded-md border px-4 py-2 text-sm font-medium text-red-600 disabled:opacity-60"
      >
        {isFavorite ? "♥ 즐겨찾기 해제" : "♡ 즐겨찾기 추가"}
      </button>

      {mutation.isError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          즐겨찾기 변경에 실패했어요. 이전 상태로 되돌렸습니다.
        </p>
      )}
    </div>
  );
}

export default FavoriteButton;
