import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

export const filterSchema = z.object({
  brand: z
    .string()
    .nullable()
    .describe("Марка автомобиля из списка доступных брендов, на английском (например Hyundai, Kia, BMW). null если не указана"),
  fuel: z
    .enum(["Gasoline", "Diesel", "Hybrid", "Electric", "LPG"])
    .nullable()
    .describe("Тип топлива: Gasoline=бензин, Diesel=дизель, Hybrid=гибрид, Electric=электро, LPG=газ. null если не указан"),
  priceMin: z
    .string()
    .nullable()
    .describe("Минимальная цена в рублях (только число, без пробелов). null если не указана"),
  priceMax: z
    .string()
    .nullable()
    .describe("Максимальная цена в рублях (только число, без пробелов). null если не указана"),
  sort: z
    .enum(["default", "price_asc", "price_desc", "year_desc", "mileage_asc"])
    .nullable()
    .describe("Сортировка: price_asc=дешевле, price_desc=дороже, year_desc=новее, mileage_asc=меньше пробег. null если не указана"),
  query: z
    .string()
    .nullable()
    .describe("Остаток запроса для текстового поиска по названию, если не удалось разобрать в фильтры. null если всё разобрано"),
});

export type SmartSearchResult = z.infer<typeof filterSchema>;

function buildSystemPrompt(brands: string[]): string {
  return `Ты — парсер поисковых запросов для сайта продажи корейских автомобилей.
Пользователь вводит запрос на русском языке. Твоя задача — извлечь из него структурированные фильтры.

Доступные марки: ${brands.join(", ")}

Правила:
- Цены указываются в рублях. "млн" = 1 000 000, "тыс" = 1 000. Например "до 2 млн" → priceMax: "2000000", "от 500 тыс" → priceMin: "500000"
- Марку выбирай только из списка доступных. Если пользователь написал "хёндай" или "хендай" — это Hyundai, "киа" — Kia, "бмв" — BMW и т.д.
- Если запрос содержит слова вроде "дешевле", "подешевле" — ставь sort: "price_asc". "Дороже" — "price_desc". "Новее" — "year_desc". "Меньше пробег" — "mileage_asc"
- query — ТОЛЬКО нераспознанный остаток, который не попал ни в один фильтр (например название модели или комплектации). Слова, уже разобранные в brand/fuel/price/sort, НЕ должны дублироваться в query. Если всё разобрано — query = null
- Не выдумывай фильтры, которых нет в запросе`;
}

export async function parseSearchQuery(
  query: string,
  brands: string[],
): Promise<SmartSearchResult> {
  const model = new ChatOpenAI({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  });

  return model.withStructuredOutput(filterSchema).invoke([
    { role: "system", content: buildSystemPrompt(brands) },
    { role: "user", content: query },
  ]);
}
