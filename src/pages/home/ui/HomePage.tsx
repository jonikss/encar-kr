import { supabase } from "@/shared";
import { Header } from "@/widgets/header";
import { Hero } from "@/widgets/hero";
import { CarsGrid } from "@/widgets/cars-grid";

async function getInitialData() {
  const [countRes, brandsRes] = await Promise.all([
    supabase.from("cars").select("id", { count: "exact", head: true }),
    supabase.from("cars").select("brand"),
  ]);

  const brands = [
    ...new Set((brandsRes.data ?? []).map((r: { brand: string }) => r.brand)),
  ].filter(Boolean).sort() as string[];

  return { count: countRes.count ?? 0, brands };
}

export async function HomePage() {
  const { count, brands } = await getInitialData();

  return (
    <>
      <Header />
      <Hero listingCount={count} brandCount={brands.length} />
      <CarsGrid />
      <footer className="footer">
        <div className="footer-logo">
          ENCAR<span>KR</span>
        </div>
        <div>
          Данные с{" "}
          <a href="https://www.encar.com" target="_blank" rel="noopener">
            encar.com
          </a>{" "}
          · Обновляется ежедневно в 03:00 МСК
        </div>
      </footer>
    </>
  );
}
