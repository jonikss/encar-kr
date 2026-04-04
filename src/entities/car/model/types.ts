export interface Car {
  id: number;
  brand: string;
  model: string;
  badge: string | null;
  badge_detail: string | null;
  title: string;
  year: number | null;
  year_label: string | null;
  fuel: string | null;
  mileage: number;
  price_raw: number;
  price_krw: number;
  photo: string | null;
  detail_url: string;
  color: string | null;
  transmission: string | null;
  displacement: string | null;
  scraped_at: string;
}

export type SortOption =
  | "default"
  | "price_asc"
  | "price_desc"
  | "year_desc"
  | "mileage_asc";

export interface FilterState {
  brand: string;
  fuel: string;
  sort: SortOption;
  query: string;
  page: number;
  priceMin: string;
  priceMax: string;
}

export interface CarsResponse {
  cars: Car[];
  count: number;
  updatedAt: string | null;
}
