# Legacy-конструктор: доменное ядро

Как работает старое приложение `C:\Projects\April\front\konstructor\src` (CRA, JS, redux без RTK).
Документ — источник истины при переносе на Next/TS. Парный документ: [legacy-persistence.md](./legacy-persistence.md), план — [migration-plan.md](./migration-plan.md).

## 1. Конвейер продаж (роутинг)

Роутинг — собственный редьюсер (`redux/reducers/router/router-reducer.ts`), не react-router:

```
GLOBAL → KONSTRUCTOR → PRODUCTS → DOCUMENT
```

1. **GLOBAL** — глобальные параметры: линейка (`ПРОФ` / `Универсальная`), тип доступа (Интернет / Проксима), регион.
2. **KONSTRUCTOR** — выбор комплекта + правка наполнения (инфоблоки, ЭР, LT, консалтинг, star, академия) + выбор ОД.
3. **PRODUCTS** — таблица позиций: `general` (что продаём) и `alternative` (с чем сравниваем в КП).
4. **DOCUMENT** — генерация КП / договора / счёта.

Отдельные «приложения» в том же бандле: `REPORT`, `CALLING`, `TRANSKRIBATION`, `FAVORITES` — к ядру не относятся.

## 2. Три сущности: complect → product → productRow

Главное, что надо понимать. Это **разные** вещи, связаны числовыми `number`-индексами.

### 2.1 `complect` (ComplectType) — состав + правила

`types/complect-type.ts:19`. Описывает **что входит** в комплект:
- `filling: string[]` — имена инфоблоков (наполнение);
- `ers`, `packetsEr`, `ersInPacket` — энциклопедии решений и их пакеты;
- `lt`, `ltInPacket` — сервисы Legal Tech (бесплатно в комплекте / платно в пакете);
- `freeBlocks`, `consalting`, `consaltingProduct`, `star`, `academy`;
- правила: `weight` (эталонный вес), `type: 'prof' | 'universal'`, `abs`, `isChanging`, `withConsalting`, `withStar`, `noChanged: string[]`.

⚠️ **Два независимых источника комплектов** (связь по `number`, рассинхрон ломает всё молча):
- `state.profs` / `state.universals` — **хардкод** наполнения в редьюсерах (`prof-complects-reducer.js` 661 строка, `universal-complects-reducer.js`);
- `initialData.complects` — с бэка (Firebase/Google Sheets), используется только для генерации продуктов.

### 2.2 `product` (ProductType) — декартово произведение

`types/product-types.ts:5`. Генерируется **один раз при инициализации**: `комплект × вид поставки × тип договора` (`generateProducts` → `utils/reducers-utils/product/product.ts`). Продукт плоский: complectNumber/Name, supplyNumber/Name + договорные тексты, measureId/Code, `contractCoefficient` (= prepayment договора), discount, цены.

Текущий продукт: `getCurrentProduct(profProducts, universalProducts, complectIndex, odIndex, contractShortName, линейка)` — поиск по `supplyNumber === odIndex && complectNumber === complectIndex` в бакете `products[prof|universal][contract.shortName]`.

### 2.3 `productRow` (ProductRowType) — коммерческая позиция

`types/product-row-type.ts:30`. Будущая строка `crm.item.productrow` Bitrix: `id`, `setId`, `name`, `type: general|alternative`, `productType: garant|lt|lt_other|consalting|star|academy`, ссылки `complect/contract/supply`, вложенная копия `product`, и цена `price: { default, current, quantity, month, sum, measure, discount }`.

Создание: `getRowFromProduct` (`utils/reducers-utils/product/product-row.ts:30`).

**Оркестратор всей цепочки**: `changeCurrentProductAndPrice()` (`products-reducer.js:55`) — вызывается при любой смене комплекта/ОД/договора → пересчитывает `products.current` → `setGeneralProductRows(GARANT)` → строка в `sets.general[0].rows.garant[0]`.

## 3. ОД и наполнение — терминология

| Термин | Значение |
|---|---|
| **ОД** | «одновременный доступ» — число одновременных пользователей системы |
| **supplies** (в state `od`) | **виды поставки**: `internet` / `proxima` × кол-во ОД, с ценовым коэффициентом (1 … 7) и текстами для договоров (`contractProp*`, `acontract*` — абонентский, `lcontract*` — лицензионный) |
| **наполнение** | `currentComplect.filling` + ers/lt/freeBlocks/consalting/star/academy — состав комплекта |
| `contract.prepayment` | множитель длительности договора: 1/6/12/24 мес (не «предоплата»!) |
| `abs` | базовая абонентская единица цены (у универсалов и консалтинга) |

Нумерация supplies: `0` Интернет Стандартная, `1..8` Интернет 1/2/3/5/10/20/30/50 ОД, `9` Локальная, `10` Проксима Флэш, `11..18` Проксима 1..50 ОД. Для PROF исключаются `0` и `9` (`od-reducer.ts:135`).

Типы договоров (contracts.items): `internet` (мес.), `proxima` (услуг, мес.), `abonHalf/abonYear/abonTwoYears` (абонентский 6/12/24), `licHalf/licYear/licTwoYears` (лицензионный 6/12/24), `key`. Дисконт длительности: 6 мес → 0.9, 12 → 0.8, 24 → 0.7. У каждого — свой `itemId` (товар каталога Bitrix) и measure.

## 4. Наполнение — глобальный синглтон (главное ограничение)

Источник истины состава — **единственный объект `state.currentComplect`**. Чекбоксы (`infoblocks`, `encyclopedias`, `freeBlocks`, `legalTech`, `consalting`, `star`, `academyBlocks`) — лишь проекции: `setCheckboxes(currentComplect)` раскидывает, `changeInfoblock/changeER/changeLt/...` меняют `currentComplect` и пере-проецируют.

**«Наполнение только у главного товара»** зашито в нескольких местах (главный товар = строка `id === 0` в `sets.general[0].rows.garant`):
1. `getUpdatedSetFromNewRow`, ветка `isCreating` (`product.ts:1026`) — строка из конструктора всегда `id = 0` и всегда одна.
2. Второй Гарант в general (`product-rows-reducer.ts:250`) создаётся «голым» — тот же supply и contract, меняется только `complect.number`.
3. UI (`RowCard.jsx:383-404`): у второго Гаранта селект только комплекта, поставка/договор — текст; у альтернатив — полный выбор.
4. Мастер добавления выкидывает все Гаранты кроме `id === 0` (`product-row.ts:308`); `lt_other` обнуляется у альтернатив («пакеты LT Other привязаны к основному сету»).
5. Карточка результата и описание для КП считаются только по `id === 0` и по глобальным чекбоксам (`result-reducer.js:257,409`, `field-reducer.js:66`).

**Для переноса**: состав должен стать свойством строки (`composition` per row), а не синглтоном.

## 5. Жёсткие правила составления

Все — чистые функции в `utils/reducers-utils/complect/complect-utils.js` (но с `window.alert` внутри):

### 5.1 Вес и подбор комплекта
- Вес = Σ weight включённых инфоблоков (кроме «Регионального законодательства») + Σ weight ЭР + вес регионов. Каждый регион в комплекте = **+0.5**, рутовый блок «Региональное законодательство» = +0.5 (`weight.js`, `region-util.ts:13`).
- **PROF**: вес должен равняться эталону `complect.weight`; исключение №17 «Максимум» — допустим вес ≥ эталона. Иначе ошибка `Неправильный вес комплекта` (`result-reducer.js:324`).
- **Универсал**: пользователь набирает блоки от `universalDefaultComplect` (вес 0, только «Законодательство России» + регион); по суммарному весу автоматически подбирается комплект линейки — первый с `weight >= текущего` (берётся предыдущий при перелёте) (`current-complect-reducer.js:234`). Линейка: Классик 1 → Классик+ 1.5 → Универсал 2 → Универсал+ 3 → Профессионал 4 → Мастер 6 → Аналитик 9 → Аналитик+ 12 → Максимум 23/24.

### 5.2 Связность инфоблоков (`fillingInfoblocks`)
- «Справочник НТД по строительству» и «Справочник промышленника» ⇄ свои «…Дополнительные материалы» (только вместе).
- Судебная практика ⇄ freeblocks: арбитражная → №7, общей юрисдикции → №6.

### 5.3 ЭР и пакеты ЭР (`fillingEr`, `fillingPketsEr`)
- Выключение ЭР, входящей в активный пакет, «разваливает» пакет: пакет уходит из `packetsEr`, остальные его ЭР переезжают в `ers`.
- **«Офис» — всегда ровно 2 пакета ЭР** (принудительные комбинации, alert).

### 5.4 Legal Tech (`fillingLt`) — самые жёсткие
- «Офис» / `exzak`: **минимум 5 сервисов LT** бесплатно; лишние (>5) уходят в `ltInPacket` (платный пакет); при падении ниже 5 сервис поднимается обратно.
- Прочие PROF (кроме «Эксперт PRO»): **ровно 2** сервиса.
- «Эксперт PRO»: особая ветка, `lt = [3]` при опустошении.
- **Универсал: весь LT платный** (всё в `ltInPacket`).
- LT №16 «ЧекДок Премиум» весит 2 — компенсируется `ltCoefficient`.
- Платный пакет подбирается по суммарному весу `ltInPacket`: вес 2/5/10 → Малый/Средний/Большой (`legal-tech-utils.js`); нет пакета с таким весом → «LT собран неверно».

### 5.5 Консалтинг (`fillingConsalting`)
- Позиции: 0 Горячая линия (всегда, не отключается), 1 Советы экспертов (abs 1), 2 Правовой консалтинг Премиум (abs 3). Выбор эксклюзивен.
- Тянет freeblocks: выбор 1 → +[8,10] −9; выбор 2 → +[8,9,10]. Freeblocks 8/9/10 нельзя включить вручную — только в составе консалтинга.
- `complect.withConsalting === true` — консалтинг входит в комплект по умолчанию.

### 5.6 Star, Академия
- Star (СТАР — система торговых аналитических решений): один пакет; запрещён у комплекта №18; `complect.withStar` → строка со стоимостью 0 (`isFreeStar`).
- Академия: 21 хардкод-пакет (`academy-data.ts`: срок 1–12 мес × объём 16–768 ч); эксклюзивный выбор; своя генерация продуктов и своя формула цены.

### 5.7 `isChanging` — мягкое правило
Жёсткого запрета менять «неизменяемый» комплект нет — проставляется `warning: 'Внесены изменения в неизменяемый комплект'`. `noChanged: string[]` (комплекты 18/19/20) — список неотключаемых инфоблоков.

### 5.8 Совместимость комплект × поставка × договор
⚠️ Продублирована в **трёх местах**: `generateGarantProducts` (`product.ts:596-668`), `filterContracts` (`contract-utils.ts:50`), `filterSupplies` (`product-row.ts:373`). Правила:
- PROF: все поставки кроме №0 (Стандартная) и №9 (Локальная); Универсал — все.
- internet + PROF → `internet, abon*, lic*, key`; internet + Универсал → `internet, lic*, key`; proxima (≠10 Флэш) → `proxima, lic*, key`; Флэш → только `proxima`.

При переносе — свести в одну декларативную матрицу.

## 6. Цены

### 6.1 Источники
- `prices.prof` — плоская таблица `{complectNumber, supplyNumber, price, region}`, `region: 1 = Москва, 0 = регионы`.
- `prices.universal` — по регионам, но в расчёте почти не участвует: универсал считается через `abs`.
- `regions[]` — `{number, title, name, abs, infoblock}`; `region.abs` — ставка абонентки региона; `name === 'msk'` — переключатель Москва/регионы.
- LT/star: цены в самих элементах (`msk` / `regions`).

### 6.2 Формула строки (`getRowFromProduct`, `product-row.ts:30`)

```
tax = withTax ? 1.05 : 1        // налог поставщика; НЕ применяется к лицензионным (LIC)

если universal / consalting (withAbs):
    price = abs × region.abs [× supply.coefficient — кроме консалтинга]
если prof / lt / star / lt_other:
    price = таблица prices.prof | product.mskPrice / regionsPrice
академия:
    price = пакет.regions; при monthQuantity: price × contractCoefficient / monthQuantity

price      = price × contractCoefficient × tax     // contractCoefficient = 1|6|12|24
current    = price × discount                      // 0.9 / 0.8 / 0.7 по длительности
month      = price / contractCoefficient
```

`withTax` = `provider.withTax && contractType !== LIC` (`get-with-tax.util.ts`).

### 6.3 Редактирование
`calculateTotalPrice(type, value, price)` (`row-price-utils.ts:41`) — режимы: PRICE, QUANTITY (0<q<100), DISCOUNT (% или ₽), SUM, DEFAULT (переключение налога ±5%). Оркестратор `changeCommercial(...)` (`product-rows-reducer.ts:952`). В режиме «объединённого» сета правки применяются к `total[0]`, количество — ко всем строкам (кроме академии с датами). Смена поставщика (`changeProviderTax`) массово пересчитывает всё, пропуская LIC.

## 7. Сеты и сравнение

`state.rows` (`product-rows-reducer.ts:62`):

```
sets: {
  general:     [RowSetType]      // ровно один сет — то, что продаём
  alternative: [RowSetType]      // до 7 — «Для сравнения» в КП
}
RowSetType = { id, show, rows: { garant[], lt[], lt_other[], consalting[], star[], academy[] },
               total: [row] }    // свёрнутая строка: имена через « + », цены суммируются
show: 'rows' | 'set'             // тумблер «Разъединить/Объединить»
current: {...}                   // мастер пошагового добавления строки
```

- Альтернатива собирается мастером: `initializeProductRow(ALTERNATIVE)` → `selectCreatingRowsProp(...)` (пошаговый выбор комплект/поставка/договор/сервисы со «затычкой» `не выбирать`) → `pushCreatedRow`.
- Лимит 7 альтернатив (alert «слишком много комплектов для сравнения»).
- В КП альтернативы попадают отдельной секцией (`document-price-reducer.ts:154`, `getPriceCellsFromSets`).
- **В сделку Bitrix альтернативы НЕ уходят** — только general (см. legacy-persistence.md).

## 8. Дополнительные сервисы — сводка

Общий паттерн: свой редьюсер чекбоксов → `getCurrentServiceProduct` → `setGeneralProductRows(тип)` → строка своего `productType` в general-сете.

| Сервис | Состав | Цена | Особенности |
|---|---|---|---|
| **LT** (legalTech.lt) | ~18 сервисов (Сутяжник, Конструктор ПД, Онлайн Патент, Искра, Экспресс Подпись…) | бесплатно в комплекте (`lt`) / пакет по весу (`ltInPacket`) | правила §5.4; у Искры отдельный `iskraConfig` (count) |
| **LT-пакеты** (legalTech.packages) | Малый (вес 2) / Средний (5) / Большой (10) | `msk` / `regions` из init | подбор по весу |
| **LT Other** (`modules/legal-tech-other`) | доп. пакеты LT | по весу сервисов | `withoutRules: boolean` — **уже есть прецедент «отключить правила»**; Средний пакет запрещён вне отдела сервиса; только в general-сете |
| **Консалтинг** | Горячая линия / Советы экспертов / ПК Премиум | `abs × region.abs × prepayment` | §5.5; договорные тексты по типу контракта |
| **Star** | один пакет + 10 подсервисов (для описания) | `msk` / `regions` | бесплатен при `withStar` |
| **Академия** | 21 пакет часов | своя формула, деление на месяцы | вне общих чекбоксов, модалка |

## 9. Инициализация (init-данные)

Старый источник: Firebase CF `getApril` (версионный кэш в `localStorage.april`) → fallback Google Apps Script; контракты — отдельно POST `konstruct/contracts` (Laravel). Эталонный дамп: [oldinit.json](./oldinit.json).

Ключи старого init: `customFields`, `filtredClientFields`, `domain`, `contracts{current,items}`, `complects[21]`, `supplies[19]`, `bitrix{rq,add,update,product,forContract,forCalculation,productRows}` (карта UF-полей сделки), `regions[9]`, `prices{prof[408],universal[81]}`, `legalTech{lt,packages}`, `consalting[3]`, `star[1]`.

Раскладка по store: `setInitialOds(supplies)`, `generateProducts(...)` (полная матрица), `setFetchedRegions`, `setPrices`, `setBitrixFields`, `getContracts`, `setFetchedLt/Consalting/Star`; академия — из хардкода.

## 10. Известные баги легаси (не воспроизводить)

- `case CREATE_COMPLECT || MAXIMUM:` и аналогичные `case A || B` — вторые ветки мертвы (`current-complect-reducer.js:224`, `legal-tech-reducer.js:415`, `consalting-reducer.js:202`, `deal-reducer.js:224`).
- `complect-utils.js:218` — необъявленная `action` в ветке «Офис» (runtime-ошибка).
- `complect-utils.js:602` — `academy.filter(i => i !== i)` всегда пусто.
- Мутации состояния в утилитах (`complect-utils.js:252`, `infoblocks-utils.js:4`).
- `window.alert` и `debugger` внутри редьюсеров.
- Правила совместимости продублированы ×3 (§5.8), источники комплектов ×2 (§2.1).
