import type {
    ListMonitoringResponseDto,
    ListMonitorRowDto,
    ListFieldMonitorRowDto,
    ListParseResponseDto,
    ListTemplateDto,
    InstallListsResponseDto,
    InstalledListResultDto,
    ListFieldsInstallResultDto,
    DeletePbxListResultDto,
    PortalListsResponseDto,
    PortalListDto,
    PortalListFieldDto,
    PortalListFieldItemDto,
    InstallEntityFieldDto,
    PerPortalListFieldDeleteResultDto,
    EditListFieldItemDto,
    DeleteListFieldItemDto,
    PerPortalListFieldItemResultDto,
    ListTemplateItemDto,
    BitrixListFieldItemDto,
    BitrixListDetailsDto,
    DbListDetailsDto,
} from '@workspace/nest-pbx-install-api';

/** Смерженное состояние списков: эталон × Bitrix × PortalDB. */
export type ListMonitoring = ListMonitoringResponseDto;
/** Строка статуса списка (эталон × Bitrix × БД `bitrixlists`). */
export type ListRow = ListMonitorRowDto;
/** Строка статуса поля списка (эталон × Bitrix × БД `bitrixfields`). */
export type ListFieldRow = ListFieldMonitorRowDto;
/** Описание сматченного инфоблока в Bitrix (`lists.get`). */
export type BitrixListDetails = BitrixListDetailsDto;
/** Зеркало списка в PortalDB (`bitrixlists`), без полей. */
export type DbListDetails = DbListDetailsDto;

/** Эталон для предпросмотра перед установкой (parse). */
export type ListParse = ListParseResponseDto;
/** Эталонный список из Excel-шаблона. */
export type ListTemplate = ListTemplateDto;
/** Эталонное поле списка (тело body-установки). */
export type ListFieldTemplate = InstallEntityFieldDto;
/** Значение enum-поля из эталона (Excel-шаблон). */
export type ListTemplateItem = ListTemplateItemDto;
/** Значение enum-свойства в Bitrix. */
export type BitrixListFieldItem = BitrixListFieldItemDto;

/** Результат установки списков (installed[]). */
export type InstallListsResult = InstallListsResponseDto;
/** Результат установки одного списка. */
export type InstalledListResult = InstalledListResultDto;
/** Результат установки полей одного списка. */
export type ListFieldsInstallResult = ListFieldsInstallResultDto;
/** Результат удаления списка (Bitrix + PortalDB). */
export type DeleteListResult = DeletePbxListResultDto;
/** Пер-портальный результат удаления полей. */
export type ListFieldDeleteResult = PerPortalListFieldDeleteResultDto;

/** Списки портала из PortalDB. */
export type PortalLists = PortalListsResponseDto;
/** Один список портала из PortalDB с полями. */
export type PortalList = PortalListDto;
/** Поле списка из PortalDB (`bitrixfields`, зеркало). */
export type PortalListField = PortalListFieldDto;
/** Значение enum-поля списка из PortalDB. */
export type PortalListFieldItem = PortalListFieldItemDto;

/** Переименование одного значения enum-поля (PortalDB + Bitrix). */
export type ListFieldItemEditDto = EditListFieldItemDto;
/** Удаление одного значения enum-поля (PortalDB + Bitrix). */
export type ListFieldItemDeleteDto = DeleteListFieldItemDto;
/** Пер-портальный результат операции над значением enum-поля. */
export type ListFieldItemResult = PerPortalListFieldItemResultDto;