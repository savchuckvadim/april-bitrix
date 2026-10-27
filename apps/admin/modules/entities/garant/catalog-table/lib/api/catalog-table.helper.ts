import {
    getAdminGarantCatalogSeed,
    getAdminGarantCatalogTables,
} from '@workspace/nest-admin-api';
import type {
    CatalogExportMode,
    CatalogSeedSection,
    CatalogTableKind,
    TableImportReportDto,
} from '../../model';

/** Доступ к ручкам эталонных таблиц и сида каталога */
export class CatalogTableHelper {
    private readonly tables = getAdminGarantCatalogTables();
    private readonly seedApi = getAdminGarantCatalogSeed();

    /**
     * Файл таблицы: mode 'current' — с текущими данными,
     * 'blank' — пустой шаблон (только строки-ключи).
     */
    async export(
        kind: CatalogTableKind,
        mode: CatalogExportMode = 'current',
    ): Promise<Blob> {
        return await this.tables.catalogTableAdminExport(kind, { mode });
    }

    /** Загрузка заполненной таблицы; dryRun — предпросмотр без записи */
    async import(
        kind: CatalogTableKind,
        file: File,
        dryRun: boolean,
    ): Promise<TableImportReportDto[]> {
        return await this.tables.catalogTableAdminImport(kind, {
            file,
            dryRun,
        });
    }

    /** Досоздание отсутствующих справочников */
    async seed(
        sections: CatalogSeedSection[],
        dryRun: boolean,
    ): Promise<TableImportReportDto[]> {
        return await this.seedApi.catalogSeedAdminSeed({ sections, dryRun });
    }
}
