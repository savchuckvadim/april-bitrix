# @workspace/event-sales-flow

Изоморфное ядро event-report-флоу «Звонков», снятое с ЖИВОГО бэка
`back/apps/event-sales/src/event-report`. Исполняется в браузере (фрейм
Битрикс24, прямой путь при недоступном бэке) и позже — на самом бэке.
Сейчас в пакете скелет А0 + чистое ядро А1 (контекст, entity/field-policy,
deal-калькуляторы, KPI/история/лид/задача-билдеры, side-flow джобы, анкеты)
со спеками бэка; I/O-сервисы, use-case и adapters/browser приезжают в А2
(план: `~/.claude/plans/magical-wandering-meadow.md`, ЧАСТЬ А).

## Правило анти-дрейфа

Пакет — копия живого бэка, а не форк:

- **правка флоу — сначала бэк, затем синк пакета** и обновление
  `FLOW_SOURCE_COMMIT` в `src/version.ts` (sha бэка, с которого снят код);
- пути под `src/` зеркалят `back/apps/event-sales/src/event-report` 1:1
  (`types/`, `dto/`, дальше `services/`, `use-cases/`); `src/shared/*` —
  доноры из `back/apps/event-sales/src/shared` и `back/libs/*`
  (карта соответствий — в `scripts/diff-back.mjs`);
- допустимые отличия от бэка: **только импорты, декораторы
  (class-validator/@nestjs/swagger отброшены — DTO стали интерфейсами)
  и логгер** (`AppLogger` из `src/shared/lib/logger.ts` вместо @nestjs
  Logger). Содержимое чистых файлов не «улучшается» при переносе;
- запрещённые импорты внутри пакета: `@nestjs/*`, `@lib/*`, `@/modules/*`,
  `src/modules/*`, `class-validator`, `@nestjs/swagger`, `prisma`,
  `@packages/*`. Разрешены dayjs и локальные относительные пути; нужные
  битрикс-типы скопированы локально в `src/shared/bitrix/bitrix.interface.ts`.

Контроль: `pnpm diff:back` печатает постатейно «идентичны / только
импорты / DTO эквивалентны по полям / перенесены частично (вырезы до А2) /
содержательно / только в пакете / дрейф / ещё не перенесены».
В CI гоняется как warning (exit 0).

## Три порта (швы)

Ядро не знает, где исполняется — все I/O уходят в порты (`src/ports/`):

- **`FlowTransport`** (`flow-transport.port.ts`) — Bitrix REST:
  накопительный батч `batch.*` (cmd-ключи сохраняются — на них ссылаются
  `$result`-чейны), одиночные `call.*`, `flush()`. В А0 объявлен
  минимально; точный состав фиксируется при адаптации сервисов (А2).
  Реализации: браузером — поверх `@workspace/bitrix` (`adapters/browser`,
  А2), бэком — поверх `BitrixService`.
- **`FlowPortalSource`** (`flow-portal.port.ts`) — ровно 9 lookup-методов
  бэковой `PortalModel` (сигнатуры сняты 1:1); типы слепка объявлены
  локально по фактическому использованию. Браузерный адаптер — поверх
  Redux-слепка портала + `packages/pbx/src/lib/resolve.ts`.
- **`FlowLogger`** (`flow-logger.port.ts`) — `{log, warn, error}`;
  консольная реализация — `AppLogger`.

Вход настроек — отдельно от портов: `src/ports/flow-settings.ts`
(`withTaskChecklist`, `fieldPolicy`, `DirectCapabilityMap` — каркас).

Точка входа `src/index.ts` **не** реэкспортирует `adapters/browser`
(фронт импортирует их лениво отдельным путём, бэк подключит свои).

## Типы наружу — сборкой деклараций

Потребители видят пакет ДЕКЛАРАЦИЯМИ (`types` → `build/index.d.ts`,
`tsconfig.build.json`), а грузят ИСХОДНИКАМИ (`main` +
`transpilePackages`). Так и должно быть: зеркальное ядро писано под
БЭКОВУЮ строгость, а приложения компилируются строже — включи они
исходники пакета в свою программу tsc, посыпались бы ошибки в файлах,
которые править запрещено правилом анти-дрейфа. Декларации рождены из
этого же кода, поэтому разойтись с ним не могут.

`build/` под `.gitignore` и живёт только локально. **Отсюда правило:
тайпчек приложений гонять через `pnpm typecheck` / `turbo typecheck`** —
turbo сначала выполнит `typecheck` пакета (он же эмитит свежие
декларации), и только потом тайпчек приложения. Ручной
`npx tsc --noEmit` внутри приложения деклараций НЕ обновляет и может
показать зелёный результат против устаревшей поверхности пакета.

## Команды

```bash
pnpm --filter @workspace/event-sales-flow typecheck   # эмит build/*.d.ts + проверка адаптеров
pnpm --filter @workspace/event-sales-flow build       # только эмит деклараций
pnpm --filter @workspace/event-sales-flow test        # vitest run
pnpm --filter @workspace/event-sales-flow diff:back   # контроль дрейфа против бэка
```

Пакет подключён в `apps/event-sales/next.config.ts` через
`transpilePackages`; `pnpm-workspace.yaml` покрывает `packages/*`.
