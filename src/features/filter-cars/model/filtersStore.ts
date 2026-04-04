import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import type { FilterState, SortOption } from "@/entities/car";

interface FiltersStore extends FilterState {
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  reset: () => void;
}

const DEFAULT: FilterState = {
  brand: "",
  fuel:  "",
  sort:  "default",
  query: "",
  page:  1,
  priceMin: "",
  priceMax: "",
};

export const useFiltersStore = create<FiltersStore>((set) => ({
  ...DEFAULT,

  setFilter: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}),
    })),

  reset: () => set(DEFAULT),
}));

export const selectFilters = (s: FiltersStore): FilterState => ({
  brand: s.brand,
  fuel:  s.fuel,
  sort:  s.sort,
  query: s.query,
  page:  s.page,
  priceMin: s.priceMin,
  priceMax: s.priceMax,
});

export function useFilters(): FilterState {
  return useFiltersStore(useShallow(selectFilters));
}
