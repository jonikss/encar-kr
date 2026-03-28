import type { CarsResponse, FilterState } from "../model/types";

export const PER_PAGE = 12;

export async function fetchCars(filters: FilterState): Promise<CarsResponse> {
  const params = new URLSearchParams({ limit: String(PER_PAGE) });
  if (filters.brand) params.set("brand", filters.brand);
  if (filters.fuel) params.set("fuel", filters.fuel);
  if (filters.query) params.set("q", filters.query);
  if (filters.sort !== "default") params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));

  const res = await fetch(`/api/cars?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchBrands(): Promise<string[]> {
  const res = await fetch("/api/brands");
  if (!res.ok) return [];
  const { brands } = await res.json();
  return brands as string[];
}
