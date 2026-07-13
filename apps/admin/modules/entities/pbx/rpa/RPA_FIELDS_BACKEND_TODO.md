# Задание бэку: RPA fields monitoring — шаблон как истина + два режима

Касается `back/apps/pbx-install/src/modules/rpa`. На фронте затрагивает
`modules/entities/pbx/rpa/field` и страницу `pbx/rpa/general/supply`.

## Контекст: что сейчас не так

Эндпоинт `GET pbx-rpa-field-install/domain/:domain/rpaName/:rpaName`
(`PbxRpaFieldMonitoringService.getPbxRpaFieldsByDomain`) джойнит PortalDB и Bitrix
**строго по полному имени**:

```ts
const portalField = portalFields.find(f => f.bitrixId === bxField.fieldName);
```

Это ломается, потому что `bitrixId` в `t_fields` хранится неконсистентно по порталам:

| источник | поле `in_arm` |
|---|---|
| шаблон (`parse`) | `bxFieldName: "IN_ARM"` (короткий, из колонки «Смарт») |
| PortalDB (новый install) | `bitrixId: "UF_RPA_1_IN_ARM"` |
| PortalDB (легаси-портал) | `bitrixId: "IN_ARM"`, `bitrixCamelId: "ufCrmIN_ARM"` |
| живой Bitrix | `fieldName: "UF_RPA_9_IN_ARM"`, `xmlId: "in_arm"` |

Итог на легаси-портале (garantservisvoronezh, `RPA_9`): `mergedFields: []`, **все**
поля валятся одновременно в `portalFieldsWithoutMerged` и `bitrixFieldsWithoutMerged`,
хотя поля реально есть и там, и там. Это **ложный рассинхрон** из-за ключа джойна.

Единственный стабильный ключ во всех трёх слоях — логический `code` / `xmlId`
(`in_arm`). Он уже правильно используется в `PbxRpaFieldOverviewService.merge()`
(`pbx-rpa-field-overview.service.ts`), но только в эндпоинте `/all`, не в per-domain.

## Задача 1 — починить матчинг (per-domain endpoint)

Переписать `getPbxRpaFieldsByDomain` на джойн по `code`/`xmlId`, как в overview-сервисе:

- ключ строки = `bx.xmlId` || (`db.find(d => d.bitrixId === bx.fieldName)?.code`) || суффикс
  после снятия префикса `UF_RPA_<typeId>_` || `fieldName`;
- точное совпадение по полному `fieldName` остаётся приоритетным fallback'ом;
- результат — те же `mergedFields / *WithoutMerged`, но мёрж перестаёт врать на легаси-данных.

Проще всего — переиспользовать `merge()` из `PbxRpaFieldOverviewService` (вынести в общий
хелпер) и не плодить две разные логики склейки.

## Задача 2 — items: enum'ы Bitrix теряются при пустом template-list

В `PortalFieldTypedEntityInstallService.buildEntity`
(`shared/typed-entity/field/portal-field-typed-entity-install.service.ts`):

```ts
if (field.parsedField.type === 'enumeration'
    && field.bxField.enum
    && field.parsedField.list.length > 0) {   // ← гвард
    e.items = this.buildItems(field.bxField.enum);
} else {
    e.items = [];                              // ← затираем реальные enum'ы Bitrix
}
```

Если шаблонный `list` пуст (а Bitrix-поле — enumeration с живыми значениями, напр.
`in_arm` = Да/Нет), в БД пишется `items: []`. Ре-синк не лечит — гвард срабатывает снова.
→ Убрать зависимость от `parsedField.list.length`: если `bxField.enum` непустой —
зеркалить items из Bitrix (шаблон только дополняет/упорядочивает, но не блокирует).

## Задача 3 — шаблон как истина + явный «нет шаблона» (главное по фиче)

Сейчас селекторы `group` (general/service/sales) × `rpaName` (supply/presentation)
позволяют выбрать комбо, для которого шаблона нет (нет файла
`install/<group>/rpa/<rpaName>/data.xlsx`). Per-domain endpoint про шаблон не знает —
он молча отдаёт «в Bitrix есть, в БД нет, шаблона нет», без сигнала, что **по этому
сочетанию работать вообще нельзя**.

Нужно:

1. **Режим «по шаблону» (default).** Эндпоинт принимает `(group, rpaName)` и подключает
   шаблон через `ParseRpaService`. Если шаблона для комбо нет — возвращать **типизированный
   статус** `templateMissing: true` (а не 404 и не пустой мёрж), чтобы фронт показал
   явный блок «для выбранного сочетания шаблона нет — операции недоступны», а не пустую
   таблицу. В режиме «по шаблону» отдаём только поля, которые есть в шаблоне, со статусом
   каждого: `synced / missing_in_db / missing_in_bitrix / template_only` (взять из
   `RpaFieldStatus`).

2. **Режим «вне шаблона» (вторая вкладка/кнопка).** По тому же `(domain, group, rpaName)`
   отдаём то, что установлено **вне** шаблона: статусы `bitrix_only`, `db_only`,
   `tracked_no_template`. Это «что реально стоит в клиентском Bitrix / в PortalDB по домену,
   но отсутствует в эталоне». Сюда же по аналогии — категории и стадии вне шаблона
   (если будем расширять на воронки/стадии).

Модель статусов уже есть в `PbxRpaFieldOverviewService` (`RPA_FIELD_STATUS_VALUES`) —
переиспользовать её, а не вводить новую.

### Про `app` (event/konstructor/all)

Для RPA путь шаблона — `install/<group>/rpa/<rpaName>`, **без сегмента `app`**
(`app` фигурирует только в CRM-сущностях). Нужно решение: `app` для RPA — это
а) часть пути шаблона (тогда менять `ParseRpaService.getParsedData` и структуру `install/`),
или б) только UI-фильтр над порталами. **По умолчанию — (б)**, если у бэка нет
шаблонов с разбивкой по app. Зафиксировать явно в ответе/спеке.

## Обязательно

- **Все ответы — типизированные DTO с `@ApiProperty`** (никаких `void`/`unknown`),
  включая флаг `templateMissing` и enum статусов — иначе orval сгенерит нетипизированный клиент.
- Обновить OpenAPI-спеку pbx-install.
- После этого пользователь сам запускает `pnpm run generate` в `packages/nest-pbx-install-api`.

## Потом на фронте

- В `modules/entities/pbx/rpa/field` нормализатор (`lib/utils/merge-fields.ts`) уже умеет
  снимать префикс `UF_RPA_<id>_` (`fieldNameKey`) и матчить по `code` — переключить панель
  на новые статусы из DTO вместо локальной эвристики.
- `RpaFieldsPanel`: две вкладки «По шаблону | Вне шаблона», блок-заглушка при `templateMissing`.
