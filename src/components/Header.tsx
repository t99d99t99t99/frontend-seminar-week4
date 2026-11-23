import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type HeaderProps = {
  children: ReactNode;
};

export default function Header({ children }: HeaderProps) {
  return (
    <header className="border-b">
      <nav
        aria-label="주 메뉴"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4"
      >
        <h1 className="text-3xl font-bold">
          <Link to="/">천 개의 레시피</Link>
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {children}
        </div>
      </nav>
    </header>
  );
}
