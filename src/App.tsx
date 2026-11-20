import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import RecipeDetail from "./pages/RecipeDetail";

function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={<MainPage onSelect={(id) => navigate(`/recipe/${id}`)} />}
      />

      <Route path="/recipe/:id" element={<RecipeDetail />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
