"use client";
import { useFiltersStore } from "../model/filtersStore";
import type { SortOption } from "@/entities/car";
import { timeAgo } from "@/shared";

const FUELS = [
  { value: "",          label: "Тип топлива" },
  { value: "Gasoline",  label: "Бензин" },
  { value: "Diesel",    label: "Дизель" },
  { value: "Hybrid",    label: "Гибрид" },
  { value: "Electric",  label: "Электро" },
  { value: "LPG",       label: "Газ" },
];

const SORTS: { value: SortOption; label: string }[] = [
  { value: "default",     label: "Сначала новые" },
  { value: "price_asc",   label: "Цена: по возрастанию" },
  { value: "price_desc",  label: "Цена: по убыванию" },
  { value: "year_desc",   label: "Год: новее" },
  { value: "mileage_asc", label: "Пробег: меньше" },
];

interface Props {
  brands: string[];
  count: number;
  updatedAt: string | null;
}

export function FilterBar({ brands, count, updatedAt }: Props) {
  const { brand, fuel, sort, priceMin, priceMax, setFilter } = useFiltersStore();

  return (
    <div className="controls">
      <div className="controls-inner">
        <span className="filter-label">Фильтр</span>

        <select className="ctrl-select" value={brand}
          onChange={e => setFilter("brand", e.target.value)}>
          <option value="">Все марки</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <select className="ctrl-select" value={fuel}
          onChange={e => setFilter("fuel", e.target.value)}>
          {FUELS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <input className="ctrl-input" type="number" placeholder="Цена от, ₽"
          value={priceMin}
          onChange={e => setFilter("priceMin", e.target.value)} />

        <input className="ctrl-input" type="number" placeholder="Цена до, ₽"
          value={priceMax}
          onChange={e => setFilter("priceMax", e.target.value)} />

        <div className="divider" />

        <select className="ctrl-select" value={sort}
          onChange={e => setFilter("sort", e.target.value as SortOption)}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <div className="results-count">
          <strong>{count.toLocaleString("ru-RU")}</strong> объявлений
          {updatedAt && <> · обновлено {timeAgo(updatedAt)}</>}
        </div>
      </div>
    </div>
  );
}
