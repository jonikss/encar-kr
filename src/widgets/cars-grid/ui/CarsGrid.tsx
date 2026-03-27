"use client";
import { useCars, useBrands, PER_PAGE, CarCard } from "@/entities/car";
import { useFilters, useFiltersStore, FilterBar } from "@/features/filter-cars";
import { CardSkeleton } from "@/shared";

export function CarsGrid() {
  const filters = useFilters();
  const setFilter = useFiltersStore((s) => s.setFilter);

  const { data, isLoading, isError, error } = useCars(filters);
  const { data: brands = [] } = useBrands();

  const cars = data?.cars ?? [];
  const count = data?.count ?? 0;
  const updatedAt = data?.updatedAt ?? null;
  const totalPages = Math.max(1, Math.ceil(count / PER_PAGE));
  const page = filters.page;

  function goTo(p: number) {
    setFilter("page", p);
    const el = document.querySelector(".grid-section");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  function getPageNumbers(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <>
      <FilterBar brands={brands} count={count} updatedAt={updatedAt} />

      <section className="grid-section">
        <div className="cars-grid">
          {isLoading &&
            Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}

          {isError && (
            <div className="state-box">
              <div className="state-icon">⚠️</div>
              <h3>Не удалось загрузить</h3>
              <p>
                {error instanceof Error ? error.message : "Ошибка загрузки"}
              </p>
            </div>
          )}

          {!isLoading && !isError && cars.length === 0 && (
            <div className="state-box">
              <div className="state-icon">🔍</div>
              <h3>Ничего не найдено</h3>
              <p>Попробуйте сбросить фильтры.</p>
            </div>
          )}

          {!isLoading &&
            !isError &&
            cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
        </div>

        {!isLoading && !isError && totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => goTo(page - 1)}
            >
              ← Назад
            </button>

            <div className="page-numbers">
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="page-dots">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`page-num ${p === page ? "page-active" : ""}`}
                    onClick={() => goTo(p)}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>

            <button
              className="page-btn"
              disabled={page >= totalPages}
              onClick={() => goTo(page + 1)}
            >
              Вперёд →
            </button>
          </div>
        )}
      </section>
    </>
  );
}
