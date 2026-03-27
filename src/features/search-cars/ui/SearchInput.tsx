"use client";
import { useSearch } from "../model/useSearch";

export function SearchInput() {
  const { handleChange } = useSearch();

  return (
    <div className="header-search">
      <svg className="header-search-icon" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        placeholder="Поиск по марке, модели, комплектации…"
        onChange={e => handleChange(e.target.value)}
      />
    </div>
  );
}
