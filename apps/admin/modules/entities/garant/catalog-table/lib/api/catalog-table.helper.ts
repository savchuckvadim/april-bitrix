import {
    getAdminGarantCatalogSeed,
    getAdminGarantCatalogTables,
} from '@workspace/nest-admin-api';
import type {
    CatalogSeedSection,
    CatalogTableKind,
    TableImportReportDto,
} from '../../model';

/** Доступ к ручкам эталонных таблиц и сида каталога */
export class CatalogTableHelper {
    private readonly tables = getAdminGarantCatalogTables();
    private readonly seedApi = getAdminGarantCatalogSeed();

    /** Файл с текущим состоянием БД */
    async export(kind: CatalogTableKind): Promise<Blob> {
        return await this.tables.catalogTableAdminExport(kind);
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
