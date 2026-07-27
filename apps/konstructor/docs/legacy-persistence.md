# Legacy-конструктор: запоминание сделки и Bitrix

Персистентность старого приложения. **Это единственное легаси, с которым требуется обратная совместимость**: init и всё остальное делаем заново, но сохранённые слепки сделок обязаны восстанавливаться в новом приложении. Парный документ: [legacy-core.md](./legacy-core.md).

## 1. Где хранится слепок

Состояние конструктора **не хранится ни в полях сделки Bitrix, ни в localStorage**. Слепок пишется на бэкенд двумя дублями (без транзакции):
- Laravel `https://garant-app.ru/api`: `POST deal` (save), `POST getDeal {dealId, domain}` (restore);
- Firebase callable `setDeal` / `getDeal` (fallback при чтении).

Ключ записи — `(dealId, domain)`. Сделка Bitrix — только идентификатор.

В новом бэке таблица уже существует: Prisma-модель `BxDocumentDeal` → **`bx_document_deals`** (`back/prisma/schema.prisma`) — её колонки в точности повторяют формат слепка (`app`, `global`, `currentComplect`, `od`, `result`, `contract`, `product`, `rows`, `regions`, … LongText-JSON; плюс `dealId`, `userId`, `domain`, `serviceSmartId`, `favoriteId`, `templateId`, `isFavorite`). Сервис `inner-deal` (`back/apps/konstructor/src/modules/inner-deal`) читает/пишет её, но **HTTP-эндпоинтов пока нет** (используется только изнутри offer-word и init-deal). Перед реализацией проверить: пишет ли Laravel `garant-app.ru` в эту же таблицу — по совпадению колонок похоже, что да; тогда старые слепки уже доступны новому бэку.

## 2. Формат слепка (v1 — то, что лежит в БД)

`setRememberDeal` (`redux/reducers/app/remember-reducer.js`). Плоский объект, **каждое поле — JSON-строка**:

```jsonc
{
  "dealId": 129487, "userId": 447, "domain": "gsr.bitrix24.ru",

  "app":             "{...}",  // {domain, company, user, currentUser, token, dealId} — при restore НЕ используется
  "global":          "{...}",  // state.global целиком (линейка, тип доступа, регион)
  "currentComplect": "{...}",  // ComplectType целиком (наполнение главного товара)
  "od":              "{...}",  // {currentOd: {number}, currentOdIndex} — ТОЛЬКО номер вида поставки
  "result":          "{...}",  // пишется, при restore НЕ используется
  "contract":        "{...}",  // {current: Contract} — выбранный тип договора
  "dealName":        "{...}",  // пишется, НЕ восстанавливается
  "product":         "null",   // всегда строка "null" (legacy-заглушка)
  "rows":            "{...}",  // ВЕСЬ state.rows — главный носитель данных
  "regions":         "{...}",  // {inComplect[], favorite[], noWidth[]}
  "iskraConfig":     "[...]",  // [{number, code, subtitle, count}] для Искры
  "ltOther":         "[...]" | null   // IOtherLtPack[] или null (уже строка или null, без обёртки!)
}
```

### 2.1 `rows` — ядро слепка

```jsonc
{
  "general": [], "alternative": [],   // legacy до сетов, обычно пустые
  "current": {...},                    // состояние мастера добавления
  "show": "rows" | "set",
  "sets": {
    "general":     [RowSet],           // максимум 1
    "alternative": [RowSet]            // до 7
  },
  "count": { "general": 1, "alternative": 0 }
}

RowSet = { "id", "show", "rows": { "garant": [Row], "lt": [], "lt_other": [], "consalting": [], "star": [], "academy": [] },
           "total": [Row] }            // ровно 1 свёрнутая строка

Row = {                                // ProductRowType, types/product-row-type.ts:30
  "id": 0 | false,                     // 0 = главный товар; false = не закоммичен
  "number", "setId", "name", "shortName", "defaultName", "alternativeName", ...,
  "type": "general" | "alternative",
  "productType": "garant"|"lt"|"lt_other"|"consalting"|"star"|"academy",
  "supply":  { "number", "name", "type", ... },      // ссылка по number!
  "contract":{ "number", "name", "code" },           // code может ОТСУТСТВОВАТЬ в старых записях
  "complect":{ "type", "number" },                   // ссылка по number!
  "product":  {...},                   // ПОЛНАЯ копия справочного продукта на момент сохранения
  "currentSupply": {...},              // полная копия вида поставки
  "price": { "default", "current", "quantity", "month", "sum", "year",
             "measure": { "id", "code", "type": 1|6|12|24, "name", "contractNumber" },
             "discount": { "precent", "amount", "current": "precent"|"amount" } }
}
```

**Все ссылки на справочники — числовые `number`** (комплект, поставка, договор). Новый init живёт на `code`/`id` — при restore нужен маппинг number → code (см. §5).

## 3. Как работает restore (v1)

`newGetRememberDeal(deal)` — `JSON.parse` каждого поля + диспатчи:
`rememberGlobal(global, regions)` → `rememberCurrentComplect()` → `setRememberOd()` (поиск supply по number, fallback supplies[0]) → `rememberContracts()` → `rememberOtherLtThunk()` → `setIskraConfigs()` → `rememberRows(rows)` → `setRememberedTemplateId()`.

Признак «сделка запомнена»: `JSON.parse(deal.rows).sets.general[0].total[0].name` truthy → старт сразу на шаге DOCUMENT, иначе GLOBAL.

### 3.1 Уже реализованные миграции старых записей (`rememberRows`, `product-rows-reducer.ts:1078`)

Новое приложение обязано переваривать всё то же:
- записи **без `academy`** в `rows` сетов → достроить `academy: []`;
- строки **без `contract.code`** → достроить код по `contract.number` из справочника договоров;
- записи **без `current.academy`** → дефолтный блок;
- записи **без `iskraConfig` / `ltOther`** — в легаси это роняло restore (`JSON.parse(undefined)`), в новом — обязательно опциональность;
- совсем старые `rows.general[]` без сетов — легаси их молча теряет (ветка пустая); зафиксировать решение: поддерживать не будем (записи давно перезаписаны).

### 3.2 Асимметрии save/restore

- `app`, `result`, `dealName` — пишутся, не читаются.
- `product` — всегда `"null"`.
- `templateId` — читается при restore, но в слепок сделки **не пишется** (пишет только «Избранное») → шаблон Word по сделке не восстанавливался. В новой схеме поле `templateId` в `bx_document_deals` есть — починить.

## 4. Родственные форматы (тот же слепок)

- **Избранное** (`modules/favorites`): тот же набор полей, минус `dealId/iskraConfig/ltOther`, плюс `favoriteId` и `templateId`. Endpoints `konstructor/front/favorite*`. В `bx_document_deals` — флаг `isFavorite` + `favoriteId`.
- **Сервисный смарт** (`service-department`): тот же слепок + `serviceSmartId`, POST `deal/serviceSmart`, чтение POST `deals/bydealid` → массив записей. Один `dealId` может иметь **несколько** слепков, различаемых `serviceSmartId` (null = обычная сделка). Новое API обязано это поддерживать.

## 5. Требования к обратной совместимости в новом приложении

1. **Snapshot v1 адаптер**: модуль, принимающий запись `bx_document_deals` в старом формате и восстанавливающий состояние новой модели. Внутри: parse с защитой всех полей, миграции §3.1, маппинг `number → code` по новым справочникам (комплекты, supplies, договоры, регионы).
2. **Снапшот v2** (новый формат: code-ссылки, composition per row, версия `schemaVersion`) — пишем только его; читаем оба (по признаку версии/формы).
3. **Не терять неизвестные поля**: v1-запись при пересохранении в v2 не должна ломать возможность отката.
4. Цены в слепке — **денормализованы** (сохранённые суммы). При restore не пересчитывать молча по новым прайсам: показывать сохранённые цены, пересчёт — явным действием пользователя (в легаси так же: строки живут со своими ценами).
5. Несколько слепков на сделку (`serviceSmartId`), избранное (`isFavorite`), `templateId` — в одном контракте.

## 6. Отправка в Bitrix (productRows)

Один POST `konstructor/bitrix/deal/update` (Laravel) — бэк сам вызывает Bitrix. Payload:

- `setDealData.FIELDS` — название, PROBABILITY 30, OPPORTUNITY 0, CURRENCY_ID RUB (+assigned/category/stage при создании);
- `updateDealInfoblocksData.fields` — UF-поля наполнения: `contract, companyId, npa, la, c, sp, er, per, erinpac, lt, plt, ltinpac, freeBlocks, consalting, field_14(star)` — id полей приходят из init (`bitrix.update`);
- `updateDealContractData.fields` — поля для договора: `complectName, abonementTime, consalting, note*, hdd, way, supply, supplyForContract, loginsQuantity, contractSupplyPropSuppliesQuantity, field_1(quantityForKp)` (`bitrix.product`);
- `setProductRowsData.productRows` — маппинг строки:

```js
{ id: row.id || row.number, priceNetto: price.default, price: price.current,
  discountSum: default - current, discountTypeId: 1, ownerId: dealId, ownerType: 'D',
  productName: `${row.name} ${row.supply.name}`, quantity: price.quantity,
  customized: 'Y', measureCode: price.measure.id /* фактически всегда id */, measureId, sort: i }
```

Правила:
- уходит **только general-сет**: при `show === 'set'` — одна строка `total[0]`, иначе все строки всех групп (`getGeneralRowsFromSets`);
- **альтернативы в Bitrix не пишутся** — живут только в слепке и КП;
- сервисный смарт — тот же маппинг напрямую через BX24 `crm.item.productrow.set` с `ownerType` смарта.

Известные дефекты маппинга (не воспроизводить): `supply: product.supplyName` — поле не существует (всегда undefined); `measureCode` = id вместо code.

## 7. Триггеры

- **SAVE — одна точка**: кнопка «Создать Сделку»/«Сохранить» → thunk `sendDeal()` → updateDeal (Bitrix) → `setRememberDeal` (слепок). Автосохранения нет. В режиме отдела сервиса — `sendServiceOfferSmartDeal()`.
- **RESTORE — на старте**: placement → dealId (для компании — через `full/document/company/deals` первая сделка) → getDeal → есть запись и `rows.sets.general[0].total[0].name` → restore + переход на DOCUMENT.
