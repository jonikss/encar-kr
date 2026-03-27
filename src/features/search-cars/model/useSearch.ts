"use client";
import { useRef } from "react";
import { useFiltersStore } from "@/features/filter-cars";

export function useSearch() {
  const setFilter = useFiltersStore(s => s.setFilter);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(q: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setFilter("query", q), 350);
  }

  return { handleChange };
}
