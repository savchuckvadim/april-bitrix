# PBX Lists — управление универсальными списками

Слайс `modules/entities/pbx/list` (FSD, по образцу `rq`): установка и
синхронизация универсальных списков Bitrix (KPI, история работы, презентации)
между Excel-эталоном, Bitrix (`lists.*`) и PortalDB (`bitrixlists` +
`bitrixfields`).

## Структура

- `model/` — алиасы сгенерированных DTO (типизированы на бэке, никаких `void`).
- `lib/api/list-helper.ts` — единственное место импорта generated-клиентов
  (`getPbxListInstall`, `getPbxListInstallMonitoring`, `getPbxListFieldInstall`).
- `lib/hooks/use-list.ts` — react-query (KEY `['pbx-list']`, мутации
  инвалидируют весь KEY).
- `lib/items-matrix.ts` — чистый merge значений enum-поля по code:
  эталон × Bitrix (по `bitrixId` зеркала, fallback по value) × PortalDB.
- `ui/ListPanel` — экран: Tabs «Списки | Поля | Эталон | PortalDB», статусы
  inBitrix/inDb/inSync, предпросмотр эталона перед установкой, подтверждение
  удаления (для списка — чекбокс «удалить и в Bitrix»), диалоги точечного
  переименования/удаления значений enum-полей.
- `ui/FieldDetails` — развёртка поля: три источника + `ItemsMatrix`
  (переименовать/удалить значение — только при наличии зеркала в PortalDB).
- `ui/ListDetails` — развёртка списка: эталон × Bitrix (фактический
  IBLOCK_CODE/NAME/ACTIVE из `lists.get`) × БД (`bitrixlists`); в таблице
  списков колонка «Код» подсвечивает расхождения bitrixCode/dbCode с шаблоном.
- `ui/TemplatePanel` — эталон из Excel: IBLOCK_CODE, полный CODE
  (`группа_тип_код`), btx-коды, items (VALUE/CODE/SORT).
- `ui/DbListsPanel` — сырое зеркало PortalDB: `bitrixlists` + `bitrixfields`
  со всеми идентификаторами и `bitrixfield_items`.

## Backend

`back/apps/pbx-install/src/modules/list`:

- `GET pbx-list-install/monitoring/parse` — эталон всех шаблонов
  (`ListParseResponseDto`, у списка есть sourceListName/sourceGroup — папка
  шаблона для точечной установки).
- `GET pbx-list-install/monitoring/domain/:domain` — merged-статусы
  (`ListMonitoringResponseDto`).
- `GET pbx-list-install/install/domain/:domain` — установить весь эталон.
- `GET pbx-list-install/install/domain/:domain/listName/:listName/group/:group` —
  установить один шаблон.
- `GET pbx-list-install/domain/:domain` — списки портала из PortalDB
  (`PortalListsResponseDto`, вкладка PortalDB).
- `POST pbx-list-field-install/install-fields|delete-fields` — точечные
  операции над полями (адресация списка type + group).
- `POST pbx-list-field-install/edit-field-item|delete-field-item` — точечные
  операции над значением enum-поля (адресация fieldCode + itemCode + type +
  group; резолв через PortalDB, поэтому нужно зеркало; `domain: "all"`
  поддерживается бэком, из UI шлём конкретный домен).
- `DELETE pbx-list-install/install/domain/:domain/list/:type/group/:group?withBitrix=`.

Не подключено сознательно: `GET pbx-list-install/domain/:domain/list/:type/group/:group`
(одиночная выборка — покрыта общей), `GET pbx-list-field-install/install/...`
(GET-вариант установки полей — используем body-вариант),
`pbx-list-field-install-monitoring/*` (all/search — обзор по всем порталам,
не про страницу одного портала), `pbx-list-parse-template/parse/:listName/:group`
(одиночный parse — покрыт общим `monitoring/parse`).

## Важно

- Поля списков — свойства инфоблока: в PortalDB `bitrixCamelId` хранит
  `PROPERTY_N` (его интеграции передают в `lists.element.add`), `bitrixId` —
  CODE свойства.
- Регистрация: карточка в `pbx/page.tsx` (slug `list`) и пункт в
  `portalPbxEntities` (`routes.consts.ts`, id 11).