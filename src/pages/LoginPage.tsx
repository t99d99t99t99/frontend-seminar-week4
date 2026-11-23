import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authQueries, authService } from "../services/authService";

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (user) => {
      await queryClient.cancelQueries({
        queryKey: authQueries.me().queryKey,
      });

      queryClient.setQueryData(authQueries.me().queryKey, user);
      navigate("/", { replace: true });
    },
  });

  const isWrongCredentials =
    axios.isAxiosError(loginMutation.error) &&
    loginMutation.error.response?.status === 401;

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">로그인</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        로그인하고 마음에 드는 레시피를 저장해 보세요.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();

          if (loginMutation.isPending) return;

          loginMutation.mutate({
            username: username.trim(),
            password,
          });
        }}
      >
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-medium">
            아이디
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={loginMutation.isPending}
            required
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loginMutation.isPending}
            required
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </div>

        {loginMutation.isError && (
          <p role="alert" className="text-sm text-red-600">
            {isWrongCredentials
              ? "아이디 또는 비밀번호가 올바르지 않습니다."
              : "로그인 요청에 실패했어요. 잠시 후 다시 시도해 주세요."}
          </p>
        )}

        <button
          type="submit"
          disabled={loginMutation.isPending || !username.trim() || !password}
          className="w-full rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground disabled:opacity-50"
        >
          {loginMutation.isPending ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <Link
        to="/"
        className="mt-6 inline-block text-sm text-muted-foreground underline"
      >
        레시피 목록으로 돌아가기
      </Link>
    </main>
  );
}

export default LoginPage;
