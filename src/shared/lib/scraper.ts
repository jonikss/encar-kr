import axios from "axios";
import { getServiceClient } from "@/shared/api/supabase";

const ENCAR_API = "https://api.encar.com/search/car/list/general";
const PAGE_SIZE = 96;
const MAX_PAGES = 3;

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Referer: "https://www.encar.com/",
  Origin: "https://www.encar.com",
  Accept: "application/json, text/plain, */*",
};

const FUEL_MAP: Record<string, string> = {
  "가솔린":     "Gasoline",
  "디젤":       "Diesel",
  "하이브리드": "Hybrid",
  "전기":       "Electric",
  "LPG":        "LPG",
};

const TRANSMISSION_MAP: Record<string, string> = {
  "자동": "Automatic",
  "수동": "Manual",
  "CVT":  "CVT",
};

const BRAND_MAP: Record<string, string> = {
  "현대": "Hyundai",
  "기아": "Kia",
  "제네시스": "Genesis",
  "쉐보레(GM대우)": "Chevrolet",
  "쉐보레": "Chevrolet",
  "르노코리아(삼성)": "Renault Korea",
  "르노삼성": "Renault Samsung",
  "KG모빌리티(쌍용)": "KG Mobility",
  "쌍용": "SsangYong",
  "벤츠": "Mercedes-Benz",
  "BMW": "BMW",
  "아우디": "Audi",
  "폭스바겐": "Volkswagen",
  "볼보": "Volvo",
  "도요타": "Toyota",
  "렉서스": "Lexus",
  "혼다": "Honda",
  "닛산": "Nissan",
  "포드": "Ford",
  "링컨": "Lincoln",
  "지프": "Jeep",
  "캐딜락": "Cadillac",
  "크라이슬러": "Chrysler",
  "테슬라": "Tesla",
  "람보르기니": "Lamborghini",
  "페라리": "Ferrari",
  "포르쉐": "Porsche",
  "마세라티": "Maserati",
  "벤틀리": "Bentley",
  "롤스로이스": "Rolls-Royce",
  "재규어": "Jaguar",
  "랜드로버": "Land Rover",
  "미니": "MINI",
  "푸조": "Peugeot",
  "시트로엥": "Citroen",
  "피아트": "Fiat",
  "알파로메오": "Alfa Romeo",
  "인피니티": "Infiniti",
  "스바루": "Subaru",
  "미쓰비시": "Mitsubishi",
  "스즈키": "Suzuki",
  "마즈다": "Mazda",
  "뷰익": "Buick",
  "GMC": "GMC",
  "허머": "Hummer",
  "대우": "Daewoo",
  "스마트": "Smart",
  "로터스": "Lotus",
  "맥라렌": "McLaren",
  "애스턴마틴": "Aston Martin",
  "리비안": "Rivian",
  "폴스타": "Polestar",
};

interface RawItem {
  Id: string | number;
  Manufacturer?: string;
  Model?: string;
  Badge?: string;
  BadgeDetail?: string;
  FormYear?: string;
  Year?: number;
  FuelType?: string;
  Mileage?: number;
  Price?: number;
  Color?: string;
  Transmission?: string;
  Displacement?: string;
  Photo?: string;
  Photos?: { location: string }[];
}

function normalize(item: RawItem) {
  const id = typeof item.Id === "string" ? parseInt(item.Id) : item.Id;
  const formYear = item.FormYear ? parseInt(item.FormYear) : null;
  const yearLabel = item.Year ? String(Math.floor(item.Year)) : null;

  const photo = item.Photos?.[0]?.location
    ? `https://ci.encar.com${item.Photos[0].location}`
    : `https://ci.encar.com/carpicture${id}/pic1.jpg`;

  return {
    id,
    brand:        BRAND_MAP[item.Manufacturer ?? ""] ?? item.Manufacturer ?? "",
    model:        item.Model ?? "",
    badge:        item.Badge ?? null,
    badge_detail: item.BadgeDetail ?? null,
    title:        [item.Manufacturer, item.Model, item.Badge, item.BadgeDetail]
                    .filter(Boolean).join(" "),
    year:         formYear,
    year_label:   yearLabel,
    fuel:         FUEL_MAP[item.FuelType ?? ""] ?? item.FuelType ?? null,
    transmission: TRANSMISSION_MAP[item.Transmission ?? ""] ?? item.Transmission ?? null,
    mileage:      item.Mileage ?? 0,
    price_raw:    item.Price ?? 0,
    price_krw:    (item.Price ?? 0) * 10_000,
    photo,
    detail_url:   `https://fem.encar.com/cars/detail/${id}`,
    color:        item.Color ?? null,
    displacement: item.Displacement ?? null,
    scraped_at:   new Date().toISOString(),
  };
}

export async function runScrape() {
  const db = getServiceClient();
  let inserted = 0;
  const errors: string[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    try {
      const { data } = await axios.get(ENCAR_API, {
        params: {
          count: "true",
          q: "(And.Hidden.N._.CarType.A.)",
          inav: "|Metadata|Sort",
          sr: `|ModifiedDate|${page * PAGE_SIZE}|${PAGE_SIZE}`,
        },
        headers: HEADERS,
        timeout: 20_000,
      });

      const items: RawItem[] = data?.SearchResults ?? [];
      if (!items.length) break;

      const { error } = await db
        .from("cars")
        .upsert(items.map(normalize), { onConflict: "id" });

      if (error) { errors.push(error.message); }
      else        { inserted += items.length; }

      if (page < MAX_PAGES - 1) await new Promise(r => setTimeout(r, 1200));
    } catch (e: unknown) {
      errors.push(e instanceof Error ? e.message : String(e));
      break;
    }
  }

  await db.from("scrape_log").upsert({
    id: 1,
    ran_at: new Date().toISOString(),
    inserted,
    errors: JSON.stringify(errors),
  });

  return { inserted, errors };
}
