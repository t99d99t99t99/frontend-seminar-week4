import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import RecipeDetail from "./RecipeDetail";

function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={<MainPage onSelect={(id) => navigate(`/recipe/${id}`)} />}
      />

      <Route
        path="/recipe/:id"
        element={
          <>
            <nav
              aria-label="페이지 이동"
              className="px-4 pt-6 sm:px-16 lg:px-24"
            >
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:underline"
              >
                ← 레시피 목록으로
              </Link>
            </nav>

            <RecipeDetail />
          </>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
