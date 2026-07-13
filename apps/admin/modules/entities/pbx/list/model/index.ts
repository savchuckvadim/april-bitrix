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
    InstallEntityFieldDto,
    PerPortalListFieldDeleteResultDto,
} from '@workspace/nest-pbx-install-api';

/** Смерженное состояние списков: эталон × Bitrix × PortalDB. */
export type ListMonitoring = ListMonitoringResponseDto;
/** Строка статуса списка (эталон × Bitrix × БД `bitrixlists`). */
export type ListRow = ListMonitorRowDto;
/** Строка статуса поля списка (эталон × Bitrix × БД `bitrixfields`). */
export type ListFieldRow = ListFieldMonitorRowDto;

/** Эталон для предпросмотра перед установкой (parse). */
export type ListParse = ListParseResponseDto;
/** Эталонный список из Excel-шаблона. */
export type ListTemplate = ListTemplateDto;
/** Эталонное поле списка (тело body-установки). */
export type ListFieldTemplate = InstallEntityFieldDto;

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