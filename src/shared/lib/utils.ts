export function formatPrice(krw: number): string {
  if (!krw) return "—";
  const man = krw / 10_000;
  if (man >= 10_000) return (man / 10_000).toFixed(1) + "억";
  return man.toLocaleString("ko-KR") + "만원";
}

const KRW_TO_RUB = 0.054;

export function formatRUB(krw: number): string {
  if (!krw) return "";
  return "≈ " + Math.round(krw * KRW_TO_RUB).toLocaleString("ru-RU") + " ₽";
}

export function formatMileage(km: number): string {
  if (!km) return "0 км";
  return km.toLocaleString("ru-RU") + " км";
}

export function fuelLabel(fuel: string | null): string {
  const map: Record<string, string> = {
    "Gasoline": "Бензин",
    "Diesel":   "Дизель",
    "Hybrid":   "Гибрид",
    "Electric": "Электро",
    "LPG":      "Газ",
  };
  return map[fuel ?? ""] ?? fuel ?? "—";
}

export function fuelClass(fuel: string | null): string {
  const map: Record<string, string> = {
    "Gasoline": "gasoline",
    "Diesel":   "diesel",
    "Hybrid":   "hybrid",
    "Electric": "electric",
  };
  return map[fuel ?? ""] ?? "default";
}

export function transmissionLabel(tr: string | null): string {
  const map: Record<string, string> = {
    "Automatic": "Автомат",
    "Manual":    "Механика",
    "CVT":       "Вариатор",
  };
  return map[tr ?? ""] ?? tr ?? "—";
}

export function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diff < 1)    return "только что";
  if (diff < 60)   return `${diff} мин назад`;
  if (diff < 1440) return `${Math.floor(diff / 60)} ч назад`;
  return `${Math.floor(diff / 1440)} дн назад`;
}
