# Дизайн-система April — аудит, рефакторинг, темы-с-эффектами

> Документ-задача. Дата аудита: 2026-07-15. Область: `front/` (все apps + packages/ui, theme, april-theme, april-ui).

---

## Часть 0. Аудит текущего состояния

### 0.1 Что уже хорошо

Все 8 приложений (`web`, `admin`, `bitrix`, `event-sales`, `event-service`, `konstructor`, `kpi-sales`, `kpi-service`) — единый стек: **Next.js 15.3.6 + React 19 + Tailwind v4 + next-themes**, и все подключают **один общий стилевой вход** `@workspace/ui/globals.css` в корневом `layout.tsx`. Локальных копий shadcn-компонентов в приложениях нет — всё берётся из `@workspace/ui/components/*` (button ×345 импортов, card ×185, badge ×90 …). PostCSS-конфиг тоже один и реэкспортируется из ui-пакета.

Система тем: **11 цветовых схем × light/dark** (`default, blue, violet, pink, green, yellow, orange, red, bx, beige, explosive-pink`) как классы на `:root` (`blue-dark` и т.п.), поверх — слой семантических токенов [april-tokens.css](../packages/ui/src/styles/themes/april-tokens.css): `--success/--warning`, палитра типов событий `--event-*` и реактивный `--event-current` через `data-event-type` на контейнере. Tailwind v4 конфигурируется целиком в CSS через `@theme inline` в [globals.css](../packages/ui/src/styles/globals.css) — `tailwind.config.*` нет нигде, это правильно для v4.

`apps/event-sales` — эталонный потребитель: токены событий через `data-event-type` + `text-event-current` / `border-[var(--event-current)]`, hex-хардкода почти нет.

### 0.2 Проблемы (по убыванию важности)

| # | Проблема | Где |
|---|----------|-----|
| P1 | **Три пересекающихся theme-пакета**: `@workspace/theme` (admin, bitrix, event-sales, kpi-sales), `@workspace/april-theme` (event-service, konstructor) и канонический CSS в `@workspace/ui`. У `theme`/`april-theme` свои локальные копии CSS-тем, но только default/blue/violet — дрейф от 11 схем в ui. | `packages/theme`, `packages/april-theme`, `packages/ui/src/styles/themes` |
| P2 | **Тяжёлые зависимости в общем ui-пакете**: `three` (~150+ KB gz), `postprocessing`, `ogl`, `face-api.js` лежат в `dependencies` `@workspace/ui` ради 7 эффект-компонентов (`Aurora`, `ColorBends`, `GridScan`, `Iridescence`, `LiquidEther`, `Orb`, `GradientText`). `ColorBends` статически импортируется в hero `apps/bitrix` — three попадает в бандл без lazy. | `packages/ui/package.json`, `apps/bitrix/app/(app)/home/components/Hero*.tsx` |
| P3 | **Нет системы масштаба/плотности**: ни `font-size` на `html`, ни `--scale`/`--density`-токенов, ни text-scale. Единственный масштабируемый токен — `--radius` per-theme. | весь `packages/ui/src/styles` |
| P4 | **Хардкод цветов в графиках**: 122–202 hex-значений на приложение (kpi-service — 202), почти все — серии recharts/chart.js, не привязанные к `--chart-1..5`. Плюс `text-white/bg-black` (bitrix — 77). | `apps/kpi-*/modules/**`, `apps/bitrix` |
| P5 | **Разные default-темы и провайдеры по приложениям**: `default-dark` (admin), `bx-light` (bitrix), `light` (event-sales, kpi-sales), `system` (web, без AprilThemeProvider вообще); event-service подключает сразу три пакета (`april-ui` + `april-theme` + `theme`). | `apps/*/…/providers.tsx` |
| P6 | Мелочи: дубли `Tooltip.tsx` в 4 приложениях; коллизия имени `FormField` (shadcn vs RHF-обёртка в `shared`); мёртвые `styles/original.css`, `styles/violite.css`; свои шрифты (Inter/Roboto) только у event-service/konstructor против Geist у остальных; barrel `components/index.ts` экспортирует ~20 из 33 компонентов. | `packages/ui`, `apps/*` |

Отдельный полезный артефакт: `packages/april-ui/DESIGN_SYSTEM.md` уже описывает целевую идеологию (только токены тем, примитивы из `@workspace/ui`, intent-слой `april→primary`, `green→success` и т.д.) — его берём за основу, а не пишем с нуля.

---

## Часть 1. План рефакторинга дизайн-системы

Цель: **один пакет-источник правды** для токенов, тем, примитивов и эффектов; приложения не знают ничего, кроме `@workspace/ui` (+ тонкий intent-слой `april-ui` для бизнес-компонентов).

### Фаза 1 — консолидация theme-пакетов (фундамент, ~1–2 дня)

- [ ] 1.1 Перенести лучший провайдер (за основу — `@workspace/april-theme`: `useApplyColorScheme`, `useColorSchemeState`, `COLOR_SCHEME_OPTIONS` со свотчами) в `packages/ui/src/theme/` (provider + hooks + `ThemeToggler`).
- [ ] 1.2 Добавить экспорт `"./theme": "./src/theme/index.ts"` в exports-map `packages/ui/package.json`.
- [ ] 1.3 Удалить локальные копии CSS-тем из `packages/theme` и `packages/april-theme` — CSS живёт только в `packages/ui/src/styles/themes/`.
- [ ] 1.4 Мигрировать все 7 приложений на `@workspace/ui/theme`; `packages/theme` и `packages/april-theme` пометить deprecated и удалить после миграции.
- [ ] 1.5 Унифицировать wiring: везде `NextThemesProvider attribute="class"` + один `AprilThemeProvider`; default-тема — параметр провайдера (у bitrix остаётся `bx-light` и т.д.), но сам код провайдера один.
- [ ] 1.6 `apps/web` подключить к общему провайдеру (сейчас голый next-themes).

### Фаза 2 — архитектура токенов (ядро ДС, ~2–3 дня)

Ввести явные слои токенов (все в `packages/ui/src/styles/`):

```
tokens/
  primitives.css    # сырые значения-палитры (опционально, можно пропустить)
  semantic:         # то, что уже есть: --background, --primary, --success, --event-*
  density.css       # НОВОЕ: --scale, spacing/typography (см. Часть 2)
  effects.css       # НОВОЕ: токены эффектов per-theme (см. Часть 4)
themes/*.css        # 11 схем × light/dark — переопределяют ТОЛЬКО semantic-слой
```

- [ ] 2.1 Довести семантический набор: `--info` (+foreground) в пару к success/warning/destructive; `--chart-6..10` для длинных серий KPI.
- [ ] 2.2 **Графики на токены**: в `chart.tsx` (shadcn chart) уже есть механизм config→CSS-var; завести общую палитру `CHART_SERIES = ['var(--chart-1)', …]` в ui и мигрировать recharts/chart.js конфиги kpi-sales/kpi-service (это уберёт ~80% всех hex в репо). Для chart.js цвета берутся из `getComputedStyle(document.documentElement).getPropertyValue('--chart-1')` — сделать хук `useChartTokens()`.
- [ ] 2.3 Прибить `text-white/bg-black` в apps: заменить на `text-primary-foreground`, `bg-background` и т.п. (bitrix — 77 мест, приоритет).
- [ ] 2.4 SVG-логотипы — `fill="currentColor"` либо токены; исключения задокументировать.
- [ ] 2.5 Удалить `styles/original.css`, `styles/violite.css`; убрать закомментированный дубль `@theme` из `themes.css`.
- [ ] 2.6 Расширить паттерн `data-event-type` → задокументировать как общий механизм «реактивных токенов» (следующий кандидат: `--complect-*` + `data-complect`, уже упомянут в комментарии april-tokens.css).

### Фаза 3 — гигиена ui-пакета (~1 день)

- [ ] 3.1 Эффект-компоненты (`Aurora`, `ColorBends`, `GradientText`, `GridScan`, `Iridescence`, `LiquidEther`, `Orb`) → `src/components/effects/`, экспорт `"./effects/*"`. Все они `'use client'` + только dynamic import (см. Часть 4).
- [ ] 3.2 `three`, `postprocessing`, `ogl`, `face-api.js` — вынести из `dependencies` в `peerDependencies` (optional) либо оставить, но гарантировать, что попадают в бандл только через `next/dynamic` (проверить `@next/bundle-analyzer`). Статические импорты `ColorBends` в `apps/bitrix` Hero → `next/dynamic(..., { ssr: false })`.
- [ ] 3.3 Разрешить коллизию `FormField`: RHF-версию в `shared` переименовать (например `AFormField`), убрать оговорку из `src/index.ts`.
- [ ] 3.4 Дубли `Tooltip.tsx` из event-sales/event-service/konstructor/kpi-service → один компонент в ui (`shared/tooltip` или проп-расширение shadcn tooltip).
- [ ] 3.5 Пополнить barrel `components/index.ts` (или наоборот — объявить субпасы единственным публичным API и убрать barrel; выбрать одно).
- [ ] 3.6 Шрифты: решение — Geist как стандарт ДС; event-service/konstructor оставляют Inter/Roboto только в print-слое (`pagedjs.css`), экранная типографика — общая.

### Фаза 4 — масштаб/плотность (Часть 2 этого документа, ~1–2 дня)

### Фаза 5 — темы с эффектами (Части 3–4, ~2–3 дня)

### Фаза 6 — миграция приложений (по одному, в любом порядке)

Порядок предлагается: `web` (тривиально) → `event-sales` (уже почти чистое) → `admin` → `bitrix` (много text-white) → `kpi-sales`/`kpi-service` (графики на токены) → `event-service`/`konstructor` (снять april-theme, print-шрифты).

Definition of Done дизайн-системы:
- один theme-пакет (`@workspace/ui/theme`), `packages/theme` и `packages/april-theme` удалены;
- `grep '#[0-9a-f]{6}' apps/` находит только SVG-исключения и print;
- у каждого приложения layout подключает только `@workspace/ui/globals.css`, провайдер один;
- масштаб и эффекты управляются токенами/атрибутами, а не кодом приложений.

---

## Часть 2. Управление «масштабом» вёрстки (мельче/крупнее всё)

### 2.1 Принцип

Tailwind-утилиты (`p-4`, `text-sm`, `gap-2`, `h-9`…) считаются в **rem**, а `1rem = font-size на `<html>``. Значит глобальный масштаб — это одна CSS-переменная на корне. Ничего в компонентах менять не нужно, все 8 приложений масштабируются сразу.

### 2.2 Реализация (`packages/ui/src/styles/tokens/density.css`)

```css
:root {
    --app-scale: 1;               /* 1 = 16px базовых */
    font-size: calc(16px * var(--app-scale));
}

/* пресеты — data-атрибут на <html>, рядом с классом темы */
:root[data-scale='compact']     { --app-scale: 0.875; } /* 14px */
:root[data-scale='comfortable'] { --app-scale: 1; }      /* 16px */
:root[data-scale='large']       { --app-scale: 1.125; }  /* 18px */
:root[data-scale='xl']          { --app-scale: 1.25; }   /* 20px */
```

Важно для Tailwind v4: **не трогать `--spacing`** (можно было бы `--spacing: calc(0.25rem * var(--density))` для отдельной оси «плотность отступов», но это меняет только spacing-утилиты и создаёт рассинхрон с текстом; корневой font-size масштабирует всё согласованно — и текст, и паддинги, и line-height).

Дополнительная (опциональная) ось — **density только для отступов**, независимая от размера текста:

```css
:root[data-density='dense'] { --spacing: 0.2rem; }  /* default 0.25rem */
```

### 2.3 Управление из UI

- [ ] Хук `useUIScale()` в `@workspace/ui/theme`: state + `document.documentElement.dataset.scale = value` + persist в `localStorage['ui-scale']` (по аналогии с `color-scheme`).
- [ ] Компонент `ScaleToggler` (A−/A/A+) рядом с `ThemeToggler`.
- [ ] Инлайн-скрипт в layout (как у next-themes) для чтения localStorage до гидрации — чтобы не мигал масштаб.

### 2.4 Предостережения

- Все новые компоненты — только rem-утилиты; `px` допустим лишь для бордеров/теней (они и не должны масштабироваться).
- `konstructor`/`event-service` print-слой (`12pt` в pagedjs.css) от `--app-scale` не зависит — печать фиксирована, это норм.
- Проверить абсолютные пиксельные размеры в `time-picker`/`time-scale` и канвас-эффектах — канвасы меряются в px от контейнера, им ок.

---

## Часть 3. Библиотеки «поверх shadcn» — результат ресёрча (июль 2026)

Все три главных кандидата распространяются **не как npm-зависимость, а как исходники** (shadcn registry / копипаст) — код ложится к нам в `packages/ui`, мы им владеем и можем переводить на токены. Это идеально для монорепо.

### 3.1 Magic UI — основной поставщик ⭐

- https://magicui.design, MIT, open-source, официально «companion для shadcn/ui», Tailwind v4 + React 19 из коробки, использует те же CSS-переменные, что shadcn.
- Установка: `pnpm dlx shadcn@latest add @magicui/magic-card` (полноценный registry-неймспейс в `components.json`).
- Зависимость: `motion` (framer-motion) — см. §3.5 про вес.
- Нужные компоненты:
  - **MagicCard** — ровно запрошенное: spotlight-градиент за курсором + подсветка границы; **все цвета через пропсы** (`gradientColor`, `gradientFrom/To`, `gradientSize`, `gradientOpacity`) → подставляем `var(--primary)`;
  - **ShineBorder** — переливающаяся рамка (чистый CSS-anim);
  - **BorderBeam** — луч по периметру;
  - NeonGradientCard, ShimmerButton, AnimatedBeam.

### 3.2 React Bits — второй источник (самый лёгкий)

- https://reactbits.dev (GitHub DavidHDev/react-bits, ~43k★), лицензия MIT + Commons Clause (нельзя перепродавать саму библиотеку — нам ок).
- 140+ компонентов, 4 варианта каждый (JS/TS × CSS/Tailwind) — берём `TS-TW`. Установка: `npx shadcn@latest add @react-bits/<Component>-TS-TW`, либо jsrepo, либо копипаст.
- **Без обязательного framer-motion** — большинство на чистом CSS/rAF; GSAP/three — опционально для отдельных компонентов.
- Нужное: **SpotlightCard** (градиент-прожектор за курсором, цвет — проп `spotlightColor` → `var(--primary)`). Важно: цвета у React Bits часто захардкожены — при копировании сразу переводить на токены.
- **У нас уже стоят два компонента оттуда**: `ColorBends`, `GridScan` (плюс Aurora/Orb/Iridescence/LiquidEther того же семейства) — паттерн знаком, осталось навести порядок (Фаза 3).

### 3.3 Aceternity UI — точечно

- https://ui.aceternity.com. Бесплатные компоненты — свободная лицензия; Pro ($199) не нужен.
- Установка тоже через shadcn CLI (`@aceternity/card-spotlight`). Зависимость `motion` почти везде, местами `three`.
- Интересное: **CardSpotlight**, **GlareCard** (голографический перелив как у Linear), Spotlight для hero, HoverBorderGradient. Цвета часто захардкожены (neutral-палитра) — переводить на токены при копировании.

### 3.4 «Стеклянные» (glassmorphism)

Живые варианты: **shadcn-glass-ui** (artyhoo, 59 компонентов, Apache-2.0, требует TW 4.1+, но очень молодая), **glasscn** (registry, apple-style liquid glass), **@crenspire/glass-ui**, Skiper UI, Cult UI. Устаревшее: glasscn-ui (itsjavi, TW v3). `liquid-glass-react` — эффектный, но полноценно работает только в Chrome/Edge.

**Вывод по стеклу: не тащить библиотеку.** Glassmorphism — это на ~90% CSS (`backdrop-blur` + полупрозрачные `--card/--popover/--border`), и в нашей архитектуре это делается **новой темой** (см. Часть 4), подглядывая рецепты в shadcn-glass-ui/glasscn. Библиотеки-npm плохо кастомизируются под наши 11 схем.

### 3.5 Вес зависимостей

| Пакет | Размер (min+gzip) | Примечание |
|---|---|---|
| `motion` (`<motion.div>`) | ~34 KB | tree-shaking ниже не опускает |
| `motion` (`LazyMotion` + `m`) | ~4.6 KB + domAnimation 15 KB lazy | компоненты Magic UI/Aceternity надо переписать `motion.div → m.div` (код наш — можно) |
| GSAP core | ~23–27 KB | с 2025 полностью бесплатен (куплен Webflow), включая бывшие платные плагины |
| `three` | ~150+ KB | ТОЛЬКО через `next/dynamic` |

---

## Часть 4. Темы с эффектами: как добавить и можно ли «только при определённых темах»

### 4.1 Прямой ответ на вопрос

**Да, фрагментарно подключать можно — и это правильный способ. Но «включить одной CSS-темой» — нельзя полностью**, потому что spotlight/glare — это JS-компоненты (mousemove → координаты → radial-gradient), а не стили. CSS-темой можно включать только CSS-часть (стекло, shine-border, border-beam). Рабочая схема — трёхслойная:

**Слой A. Токены эффектов per-theme** (`styles/tokens/effects.css` + переопределения в файлах тем):

```css
:root {
    --fx-spotlight: 0;                       /* выкл по умолчанию */
    --fx-glass: 0;
    --fx-spotlight-color: var(--primary);
    --fx-glass-blur: 12px;
    --fx-glass-bg: transparent;
}
/* новая тема "aurora" — эффекты включены */
:root.aurora-dark {
    /* обычный набор shadcn-токенов + */
    --fx-spotlight: 1;
    --fx-glass: 1;
    --fx-glass-bg: oklch(0.2 0.05 265 / 55%);
}
```

**Слой B. Компоненты-обёртки в ui**: приложение всегда использует один компонент, эффект-версия подгружается только когда тема её просит:

```tsx
// packages/ui/src/components/effects/fx-card.tsx
'use client';
const MagicCard = dynamic(() => import('./magic-card'), { ssr: false });

export function FxCard({ children, ...props }: CardProps) {
    const enabled = useFxToken('--fx-spotlight');   // читает токен активной темы
    if (!enabled) return <Card {...props}>{children}</Card>;
    return <MagicCard gradientColor="var(--fx-spotlight-color)" {...props}>{children}</MagicCard>;
}
```

`next/dynamic` гарантирует: пользователи «спокойных» тем **не грузят** ни `motion`, ни код эффекта — соответствует нашему правилу lazy. `useFxToken` — маленький хук: `getComputedStyle(document.documentElement).getPropertyValue(name) === '1'`, с подпиской на смену темы (re-read по событию из ThemeProvider / MutationObserver на class).

**Слой C. Чисто CSS-эффекты — гасим селектором темы**: ShineBorder/BorderBeam/glass — это CSS-анимации и backdrop-blur, их можно включать/выключать без JS:

```css
:root:not(.aurora-dark):not(.aurora-light) .fx-border-beam { display: none; }
/* + всегда: */
@media (prefers-reduced-motion: reduce) { .fx-border-beam, .fx-shine { animation: none; } }
```

### 4.2 Стеклянная тема — как обычная тема монорепо

Добавляется ровно так же, как существующие 11: файлы `glass-light.css`/`glass-dark.css` в `packages/ui/src/styles/themes/` + import в `themes.css` + пункт в `COLOR_SCHEME_OPTIONS`. Отличие — полупрозрачные поверхности + `--fx-glass: 1`:

```css
:root.glass-dark {
    --background: oklch(0.13 0.02 265);
    --card: oklch(0.25 0.03 265 / 45%);      /* полупрозрачная карта */
    --popover: oklch(0.22 0.03 265 / 70%);
    --border: oklch(1 0 0 / 14%);
    --fx-glass: 1;
}
```

и вариант в `card.tsx` (не новый компонент, а data-состояние): `data-fx-glass` → `backdrop-blur-[var(--fx-glass-blur)]`. Фоновая подложка (чтобы стеклу было что размывать) — уже имеющиеся `Aurora`/`ColorBends` через dynamic import в layout-е тем, где `--fx-glass: 1`.

### 4.3 Куда класть код библиотек

- `components.json` (уже есть в каждом приложении, css указывает на packages/ui) — по shadcn-monorepo-схеме registry-компоненты ставятся сразу в `packages/ui`. Целевая папка: `packages/ui/src/components/effects/`.
- Сразу после `shadcn add`: заменить хардкод-цвета на `var(--…)`, `motion.div` → `LazyMotion`/`m.div`, добавить `'use client'`, экспорт через `./effects/*`.
- `motion` добавляется в deps `@workspace/ui` один раз (~5 KB через LazyMotion в первичной загрузке, остальное lazy).

### 4.4 Чек-лист Фазы 5

- [ ] 5.1 `styles/tokens/effects.css` + `--fx-*` дефолты; маппинг нужных в `@theme inline`.
- [ ] 5.2 Хук `useFxToken` + подписка на смену темы в `@workspace/ui/theme`.
- [ ] 5.3 Установить через registry: `@magicui/magic-card`, `@magicui/shine-border`, `@magicui/border-beam`; React Bits `SpotlightCard-TS-TW`; (опц.) Aceternity `glare-card` → всё в `components/effects/`, цвета на токены.
- [ ] 5.4 Обёртки `FxCard` (+ при желании `FxButton` на ShimmerButton) с dynamic import.
- [ ] 5.5 Темы `glass-light/dark` и `aurora-light/dark` (aurora = существующий Aurora/ColorBends-фон + spotlight-карточки + explosive-pink-подобная палитра).
- [ ] 5.6 Витрина: страница в `apps/web` (он пустой — идеальный полигон) со всеми темами × FxCard × масштабами.
- [ ] 5.7 Bundle-check: `@next/bundle-analyzer` — убедиться, что `motion`/`three` отсутствуют в чанках при дефолтной теме.

---

## Приложение А. Сводка ответов

1. **Все приложения используют один ui?** Да — все 8 на `@workspace/ui` и общем `globals.css`, форка компонентов нет. Реальный разброс: три theme-пакета, хардкод в графиках, `text-white` в bitrix, свои шрифты у print-приложений.
2. **Масштаб «мельче/крупнее всё»** — одна переменная `--app-scale` на корневом `font-size` (всё в rem) + `data-scale`-пресеты + `ScaleToggler`; опциональная отдельная ось плотности через `--spacing` Tailwind v4.
3. **Библиотеки**: карточки с переливающимся градиентом за курсором — **Magic UI MagicCard** (основной, MIT, shadcn-registry, токен-совместимый) и **React Bits SpotlightCard** (самый лёгкий, без framer-motion; ColorBends/GridScan у нас уже оттуда). «Стеклянные» — не библиотекой, а собственной темой `glass-*` на `backdrop-blur` + прозрачных токенах (рецепты — shadcn-glass-ui/glasscn).
4. **Только при определённых темах / фрагментарно — да**: токены `--fx-*` в темах + обёртки с `next/dynamic` (JS-эффекты не грузятся вне «эффектных» тем) + CSS-гейтинг селекторами тем для чисто CSS-эффектов. Одной лишь CSS-темой JS-эффекты не включить — нужен слой обёрток, он описан выше.
