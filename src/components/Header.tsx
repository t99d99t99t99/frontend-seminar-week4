import { useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="hover:cursor-pointer"
        >
          천 개의 레시피
        </button>
      </h1>
    </header>
  );
}
