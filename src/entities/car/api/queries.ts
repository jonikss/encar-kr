import { useQuery } from "@tanstack/react-query";
import { fetchCars, fetchBrands } from "./carsApi";
import type { FilterState } from "../model/types";

export const carKeys = {
  all:    ["cars"] as const,
  list:   (filters: FilterState) => ["cars", "list", filters] as const,
  brands: ["cars", "brands"] as const,
};

export function useCars(filters: FilterState) {
  return useQuery({
    queryKey: carKeys.list(filters),
    queryFn:  () => fetchCars(filters),
    placeholderData: (prev) => prev,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: carKeys.brands,
    queryFn:  fetchBrands,
    staleTime: 10 * 60 * 1000,
  });
}
