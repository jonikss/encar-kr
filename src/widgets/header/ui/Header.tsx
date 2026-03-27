"use client";
import { SearchInput } from "@/features/search-cars";

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-mark">E</div>
          <div className="logo-text">ENCAR<span>KR</span></div>
        </div>
        <SearchInput />
        <div className="header-right">
          <div className="update-pill">Источник: <span>ENCAR.COM</span></div>
        </div>
      </div>
    </header>
  );
}
