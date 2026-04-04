"use client";
import { useRef } from "react";
import { useSearch } from "../model/useSearch";

export function SearchInput() {
  const { handleSubmit, handleClear, isLoading } = useSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="header-search">
      {isLoading ? (
        <div className="header-search-spinner" />
      ) : (
        <svg className="header-search-icon" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      <input
        ref={inputRef}
        type="search"
        placeholder="Поиск по марке, модели, комплектации…"
        disabled={isLoading}
        onChange={e => {
          if (!e.target.value) handleClear();
        }}
        onKeyDown={e => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(inputRef.current?.value ?? "");
          }
        }}
      />
    </div>
  );
}
