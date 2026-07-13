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
- `ui/ListPanel` — экран: Tabs «Списки | Поля», статусы inBitrix/inDb/inSync,
  предпросмотр эталона перед установкой, подтверждение удаления
  (для списка — чекбокс «удалить и в Bitrix»).

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
- `POST pbx-list-field-install/install-fields|delete-fields` — точечные
  операции над полями (адресация списка type + group).
- `DELETE pbx-list-install/install/domain/:domain/list/:type/group/:group?withBitrix=`.

## Важно

- Поля списков — свойства инфоблока: в PortalDB `bitrixCamelId` хранит
  `PROPERTY_N` (его интеграции передают в `lists.element.add`), `bitrixId` —
  CODE свойства.
- Регистрация: карточка в `pbx/page.tsx` (slug `list`) и пункт в
  `portalPbxEntities` (`routes.consts.ts`, id 11).