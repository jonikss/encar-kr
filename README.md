# ENCAR KR — Авто из Кореи

Агрегатор объявлений подержанных автомобилей с [encar.com](https://www.encar.com) — крупнейшей площадки Южной Кореи. Свежие данные, фильтрация, поиск, пагинация. Интерфейс на русском языке.

## Стек

| Слой             | Технология                                  |
| ---------------- | ------------------------------------------- |
| Фреймворк        | Next.js 16 (App Router)                     |
| База данных      | Supabase (PostgreSQL)                       |
| Серверный стейт  | TanStack Query v5 (`@tanstack/react-query`) |
| Клиентский стейт | Zustand v4                                  |
| AI-поиск         | LangChain.js + OpenAI-совместимый провайдер |
| Деплой           | Vercel + Cron                               |
| Архитектура      | Feature-Sliced Design (FSD)                 |

## Архитектура

Проект построен по методологии [Feature-Sliced Design](https://feature-sliced.design/). Каждый слайс имеет публичный API через `index.ts`.

### Правила импортов

```
app      → pages    → widgets  → features → entities → shared
(верхний)                                              (нижний)
```

Импорт разрешён только сверху вниз. Каждый слайс импортирует соседей через public API (`index.ts`), не через внутренние пути.

### Структура

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # RootLayout + Providers
│   ├── page.tsx                      # Точка входа → HomePage
│   ├── providers.tsx                 # QueryClientProvider
│   ├── globals.css                   # Все стили (тёмная тема)
│   └── api/
│       ├── cars/route.ts             # GET /api/cars — список с фильтрами, сортировкой, пагинацией
│       ├── brands/route.ts           # GET /api/brands — уникальные марки
│       ├── scrape/route.ts           # GET|POST /api/scrape — запуск парсера
│       └── smart-search/route.ts     # POST /api/smart-search — AI-парсинг поискового запроса
│
├── pages/
│   └── home/
│       ├── index.ts
│       └── ui/HomePage.tsx           # SSR-страница: Hero + CarsGrid + Footer
│
├── widgets/
│   ├── header/
│   │   ├── index.ts
│   │   └── ui/Header.tsx             # Sticky-шапка с логотипом и поиском
│   ├── hero/
│   │   ├── index.ts
│   │   └── ui/Hero.tsx               # Промо-блок со статистикой
│   └── cars-grid/
│       ├── index.ts
│       └── ui/CarsGrid.tsx           # Сетка карточек + пагинация
│
├── features/
│   ├── filter-cars/
│   │   ├── index.ts
│   │   ├── model/filtersStore.ts     # Zustand — единственный источник истины фильтров
│   │   └── ui/FilterBar.tsx          # Панель фильтров: марка, топливо, цена, сортировка, сброс
│   └── search-cars/
│       ├── index.ts
│       ├── model/useSearch.ts        # AI-поиск по Enter → structured output → Zustand
│       └── ui/SearchInput.tsx        # Поле поиска в шапке (Enter = AI, fallback = ILIKE)
│
├── entities/
│   └── car/
│       ├── index.ts
│       ├── model/types.ts            # Car, FilterState, CarsResponse, SortOption
│       ├── api/
│       │   ├── carsApi.ts            # fetch-функции (fetchCars, fetchBrands)
│       │   └── queries.ts            # TanStack Query хуки (useCars, useBrands)
│       └── ui/CarCard.tsx            # Карточка автомобиля
│
└── shared/
    ├── index.ts
    ├── api/supabase.ts               # Supabase клиент (anon + service role)
    ├── lib/
    │   ├── queryClient.ts            # Singleton QueryClient
    │   ├── scraper.ts                # Парсер ENCAR API → Supabase
    │   ├── smartSearch.ts            # LLM: zod-схема, промпт, parseSearchQuery()
    │   └── utils.ts                  # Локализация: English (DB) → Русский (UI)
    └── ui/
        └── Skeleton.tsx              # Скелетон для загрузки
```

## AI-поиск (Smart Search)

Поиск в шапке использует LLM для понимания запросов на естественном языке. Пользователь вводит текст и нажимает **Enter** — запрос отправляется в LLM, который извлекает структурированные фильтры.

### Как это работает

```
"бензиновый хёндай до 2 млн подешевле"
                ↓ Enter
        POST /api/smart-search
                ↓
   LangChain.js → ChatOpenAI (withStructuredOutput + zod)
                ↓
   { brand: "Hyundai", fuel: "Gasoline", priceMax: "2000000", sort: "price_asc" }
                ↓
   Zustand setFilter() → FilterBar обновляется → данные перезагружаются
```

### Возможности парсера

- **Марка** — распознаёт русские варианты: "хёндай" → Hyundai, "киа" → Kia, "бмв" → BMW
- **Топливо** — "бензиновый" → Gasoline, "дизель" → Diesel, "электро" → Electric
- **Цена** — "до 2 млн" → priceMax: 2000000, "от 500 тыс" → priceMin: 500000
- **Сортировка** — "подешевле" → price_asc, "новее" → year_desc, "меньше пробег" → mileage_asc
- **Остаток** — нераспознанная часть (модель, комплектация) попадает в текстовый поиск

### Провайдер

Используется любой OpenAI-совместимый API-провайдер. Настраивается через env-переменные:

```
OPENAI_API_KEY=<ключ>
OPENAI_BASE_URL=https://api.провайдер.ru/v1
OPENAI_MODEL=openai/gpt-4o-mini
```

### Архитектура (FSD)

| Что                          | Где                                  |
| ---------------------------- | ------------------------------------ |
| Zod-схема, промпт, LLM-вызов | `shared/lib/smartSearch.ts`          |
| Серверный route              | `app/api/smart-search/route.ts`      |
| Клиентская логика            | `features/search-cars/model/useSearch.ts` |
| UI поиска                    | `features/search-cars/ui/SearchInput.tsx` |

При ошибке LLM запрос уходит в обычный текстовый поиск (ILIKE) как fallback.

## Фильтрация

- **Марка** — выпадающий список из БД
- **Топливо** — бензин, дизель, гибрид, электро, газ
- **Цена** — диапазон в рублях (конвертируется в KRW через `KRW_TO_RUB`)
- **Сортировка** — по цене, году, пробегу
- **Текстовый поиск** — отображается как тег с кнопкой сброса
- **Сброс** — кнопка «Сбросить» появляется при активных фильтрах

## Поток данных

```
ENCAR API (корейский) → scraper.ts (Korean→English) → Supabase (English)
                                                          ↓
                              UI (Русский) ← utils.ts (English→Русский)
```

### Разделение стейта

| Данные                                   | Инструмент     | Расположение                                 |
| ---------------------------------------- | -------------- | -------------------------------------------- |
| Фильтры (brand, fuel, price, sort, query, page) | Zustand  | `features/filter-cars/model/filtersStore.ts`  |
| Список авто с сервера                    | TanStack Query | `entities/car/api/queries.ts`                |
| Список марок                             | TanStack Query | `entities/car/api/queries.ts`                |
| QueryClient singleton                    | —              | `shared/lib/queryClient.ts`                  |

## Запуск

```bash
# Установка
npm install

# Переменные окружения
cp .env.local.example .env.local
# Заполнить NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, SCRAPE_SECRET,
# OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL

# Разработка
npm run dev

# Первый запуск парсера
curl -X POST http://localhost:3000/api/scrape \
  -H "x-scrape-secret: ваш-секрет"
```

## База данных (Supabase SQL)

```sql
create table if not exists cars (
  id            bigint primary key,
  brand         text,
  model         text,
  badge         text,
  badge_detail  text,
  title         text,
  year          int,
  year_label    text,
  fuel          text,
  mileage       int     default 0,
  price_raw     int     default 0,
  price_krw     bigint  default 0,
  photo         text,
  detail_url    text,
  color         text,
  transmission  text,
  displacement  text,
  scraped_at    timestamptz default now()
);

create table if not exists scrape_log (
  id       int primary key default 1,
  ran_at   timestamptz,
  inserted int,
  errors   text
);

create index if not exists idx_cars_brand      on cars(brand);
create index if not exists idx_cars_fuel       on cars(fuel);
create index if not exists idx_cars_price      on cars(price_krw);
create index if not exists idx_cars_year       on cars(year desc);
create index if not exists idx_cars_mileage    on cars(mileage);
create index if not exists idx_cars_scraped_at on cars(scraped_at desc);

alter table cars       enable row level security;
alter table scrape_log enable row level security;

create policy "Public read cars"       on cars       for select using (true);
create policy "Public read scrape_log" on scrape_log for select using (true);
```

## Деплой

```bash
# Vercel
npx vercel --prod

# Vercel Dashboard → Settings → Environment Variables — добавить все из .env.local
# Cron (vercel.json) — автоматический скрейп ежедневно в 00:00 UTC
```
