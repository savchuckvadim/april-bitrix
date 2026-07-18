import {
    getPbxListInstall,
    getPbxListInstallMonitoring,
    getPbxListFieldInstall,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type {
    DeleteListResult,
    InstallListsResult,
    ListFieldDeleteResult,
    ListFieldItemDeleteDto,
    ListFieldItemEditDto,
    ListFieldItemResult,
    ListFieldTemplate,
    ListFieldsInstallResult,
    ListMonitoring,
    ListParse,
    ListRow,
    PortalLists,
} from '../../model';

/**
 * Единственное место, где импортируются сгенерированные list-клиенты.
 * Оборачивает три контроллера pbx-install: install, field-install (manage),
 * monitoring.
 */
export class ListHelper {
    private install = getPbxListInstall();
    private fields = getPbxListFieldInstall();
    private monitoring = getPbxListInstallMonitoring();

    /** Текущее состояние списков на портале (статусы списков и полей). */
    getMonitoring(domain: string): Promise<ListMonitoring> {
        return this.monitoring.pbxListInstallMonitoringMonitoring(domain);
    }

    /** Эталон (все списки всех шаблонов) — для предпросмотра. */
    getParse(): Promise<ListParse> {
        return this.monitoring.pbxListInstallMonitoringParse();
    }

    /** Списки портала как они лежат в PortalDB (`bitrixlists` + поля). */
    getPortalLists(domain: string): Promise<PortalLists> {
        return this.install.pbxListInstallGetListsByDomain(domain);
    }

    /** Установить весь эталон (все шаблоны, идемпотентно). */
    installAll(domain: string): Promise<InstallListsResult> {
        return this.install.pbxListInstallInstallAll(domain);
    }

    /** Установить один список по его шаблону-источнику. */
    installList(domain: string, row: ListRow): Promise<InstallListsResult> {
        return this.install.pbxListInstallInstallList(
            domain,
            row.sourceListName,
            row.sourceGroup,
        );
    }

    /** Установить переданные поля конкретного списка (body-вариант). */
    installFields(
        domain: string,
        list: { type: string; group: 'sales' | 'service' | 'general' },
        fields: ListFieldTemplate[],
    ): Promise<ListFieldsInstallResult> {
        return this.fields.pbxListFieldInstallInstallFieldsByBody({
            domain,
            type: list.type,
            group: list.group,
            fields,
        });
    }

    /** Удалить поля списка по code (PortalDB + Bitrix). */
    deleteFields(
        domain: string,
        list: { type: string; group: 'sales' | 'service' | 'general' },
        codes: string[],
    ): Promise<ListFieldDeleteResult[]> {
        return this.fields.pbxListFieldInstallDeleteFields({
            domain,
            type: list.type,
            group: list.group,
            codes,
        });
    }

    /** Переименовать одно значение enum-поля (PortalDB + Bitrix). */
    editFieldItem(dto: ListFieldItemEditDto): Promise<ListFieldItemResult[]> {
        return this.fields.pbxListFieldInstallEditFieldItem(dto);
    }

    /** Удалить одно значение enum-поля (PortalDB + Bitrix). */
    deleteFieldItem(
        dto: ListFieldItemDeleteDto,
    ): Promise<ListFieldItemResult[]> {
        return this.fields.pbxListFieldInstallDeleteFieldItem(dto);
    }

    /** Удалить список: каскад в PortalDB, опционально инфоблок в Bitrix. */
    deleteList(
        domain: string,
        list: { type: string; group: 'sales' | 'service' | 'general' },
        withBitrix: boolean,
    ): Promise<DeleteListResult> {
        return this.install.pbxListInstallDeleteList(
            domain,
            list.type,
            list.group,
            { withBitrix: String(withBitrix) },
        );
    }
}