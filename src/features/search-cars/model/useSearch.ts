"use client";
import { useState, useCallback } from "react";
import { useFiltersStore } from "@/features/filter-cars";
import type { FilterState } from "@/entities/car";

type SmartFilters = Partial<Pick<FilterState, "brand" | "fuel" | "priceMin" | "priceMax" | "sort" | "query">>;

export function useSearch() {
  const setFilter = useFiltersStore(s => s.setFilter);
  const reset = useFiltersStore(s => s.reset);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const brandsRes = await fetch("/api/brands");
      const { brands } = await brandsRes.json();

      const res = await fetch("/api/smart-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, brands }),
      });

      if (!res.ok) throw new Error("Smart search failed");

      const filters: SmartFilters = await res.json();

      reset();

      if (filters.brand) setFilter("brand", filters.brand);
      if (filters.fuel) setFilter("fuel", filters.fuel);
      if (filters.priceMin) setFilter("priceMin", filters.priceMin);
      if (filters.priceMax) setFilter("priceMax", filters.priceMax);
      if (filters.sort) setFilter("sort", filters.sort);
      if (filters.query) setFilter("query", filters.query);
    } catch {
      setFilter("query", query);
    } finally {
      setIsLoading(false);
    }
  }, [setFilter, reset]);

  return { handleSubmit, isLoading };
}
