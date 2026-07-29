# Bitrix-инициализация: защита от утечки TESTING_USER во фрейме + честные логи

Статус: **не начато**
Приложения: `apps/kpi-sales` (первично), тот же паттерн — `apps/event-sales`, `apps/event-service`
Общий код: `packages/bitrix` (`BitrixService`, `BitrixBaseApi`)

---

## 1. Симптом (зафиксирован 2026-07-28, портал garantservisvoronezh.bitrix24.ru)

1. В консоли при загрузке во фрейме всегда логируются **фоллбэк-аргументы**, а не
   реальные данные: `april-garant.bitrix24.ru` + мок-юзер `reywhhsdfhs3554ufahfhd`
   (`TESTING_DOMAIN` / `TESTING_USER` из `apps/kpi-sales/modules/app/consts/app-global.ts`).
   Реальные domain/user, отрезолвленные фреймом, в лог не попадают вообще —
   выглядит как «работаю не под тем порталом/юзером».
2. В БД share-ссылок лежит запись с `creatorName: "reywhhsdfhs3554ufahfhd Савчук"`,
   `creatorBxUserId: 447`, `domain: garantservisvoronezh.bitrix24.ru` — мок-имя
   при реальном домене.

## 2. Диагноз

Цепочка инициализации:
`app-init.util.ts` → `Bitrix.start(TESTING_DOMAIN, TESTING_USER)` →
`BitrixService.init()` → `BitrixBaseApi.init()` (фрейм → `auth.getAuthData()` → `user.current`).

Корневые причины:

1. **Утечка мока во фрейме.** В `BitrixBaseApi.init` домен ставится из `authData`
   **до** запроса `user.current` (`getInitialized`). Если `user.current` падает или
   возвращает не-success, `this.user` остаётся пустым, а
   `apps/kpi-sales/modules/app/lib/initialize/app-init.util.ts:45`
   (`const user = (authUser ?? TESTING_USER)`) подставляет мок **при уже реальном
   домене**. Дальше мок-идентичность уходит в WS-коннект, structure-запросы и в
   создание share-ссылок (`report-links-thunks.ts` собирает `creatorName` из
   `user.NAME + user.LAST_NAME`) — так и родилась запись из симптома №2.
   Тот же паттерн `authUser ?? TESTING_USER`:
   - `apps/event-sales/modules/app/lib/initialize/app-init.util.ts:35`
   - `apps/event-service/modules/app/model/thunk/AppThunk.ts:29`
2. **Логи врут.** `packages/bitrix/src/bitrix.service.ts:79-81` логирует аргументы
   `init(domain, user)` (т.е. всегда TESTING_*), `bitrix.ts:13-14` дампит весь
   инстанс. Резолвнутые `inFrame/domain/user` не логируются нигде.

## 3. План работ

### Этап 1 — guard от мока во фрейме (обязательный)

- [ ] `packages/bitrix`: в `BitrixBaseApi` явно различать исходы инициализации:
      «вне фрейма» / «во фрейме, юзер получен» / «во фрейме, `user.current`
      не удался». Для третьего исхода **не** молча оставлять `user` пустым:
      добавить 1–2 ретрая `user.current`, после — отдавать наружу признак
      ошибки (например, `initialized: false` + `initError` в `BXInitializedDto`).
- [ ] `apps/kpi-sales/app-init.util.ts`: фоллбэк на `TESTING_USER` разрешён
      **только** при `!inFrame && !IS_PROD` (dev вне фрейма). Во фрейме без
      юзера — `setInitializedError` (экран ошибки/nonauth), никогда не мок.
      То же для `TESTING_DOMAIN`.
- [ ] Повторить guard в `apps/event-sales/app-init.util.ts:35` и
      `apps/event-service/AppThunk.ts:29`.
- [ ] Подумать: в PROD-сборке (`NEXT_PUBLIC_IN_BITRIX=true`) вообще не передавать
      TESTING_* в `Bitrix.start` (пустые значения), чтобы мок физически не мог
      попасть в рантайм прода.

### Этап 2 — честные логи (обязательный)

- [ ] `packages/bitrix`: убрать `console.log` аргументов из `BitrixService.init`
      (`bitrix.service.ts:79-81`) и дамп инстанса из `Bitrix.start`
      (`bitrix.ts:13-14`).
- [ ] После завершения `BitrixBaseApi.init` логировать **резолвнутые** данные:
      `inFrame`, `domain`, `user.ID`, `NAME + LAST_NAME` (без дампа всего
      объекта юзера). На проде — этот лог оставить (он и нужен для диагностики
      «кто я»), подробные dev-дампы — только вне PROD.
- [ ] При исходе «во фрейме, `user.current` не удался» — явный `console.error`
      с текстом причины (сейчас ошибка глотается и маскируется моком).

### Этап 3 — зачистка следов (быстро)

- [ ] Удалить из БД kpi-report-sales dev-ссылку
      `creatorBxUserId: 447`, `creatorName: "reywhhsdfhs3554ufahfhd Савчук"`
      (id `5de2edf6-4023-47c8-a405-3bd79eec43a7`).
- [ ] Дать моку человеческое имя (`Dev` / `Test User`), чтобы случайные следы
      в данных были сразу опознаваемы, а не выглядели как взлом.

### Связанное (отдельной задачей, не блокирует)

- Superuser определяется по `LAST_NAME.includes('Савчук')`
  (`apps/kpi-sales/.../department/lib/utils/super-user.ts`) — хрупко: любой
  однофамилец на любом портале получает полные права, а отличие в написании
  права ломает. Реальный кейс (2026-07-28, garantservisvoronezh): в профиле
  портала имя и фамилия перепутаны местами (`NAME: "Савчук"`,
  `LAST_NAME: "Вадим"`) → superuser не определился. Перевести на конфиг
  domain+userId (в коде уже помечено как временный механизм) — он к таким
  опечаткам иммунен.

## 4. Критерии приёмки

- Во фрейме при падении `user.current` приложение показывает экран ошибки,
  а не работает под моком; share-ссылка с мок-именем создаться не может.
- В PROD-логах при старте видно: `inFrame`, реальный домен и реальный
  `ID / Имя Фамилия` текущего юзера; TESTING_* в логах прода не появляются.
- Dev вне фрейма (`IS_PROD=false`) работает как раньше — на TESTING_*.
