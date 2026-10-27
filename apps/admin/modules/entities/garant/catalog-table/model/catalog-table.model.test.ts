import { describe, expect, it } from 'vitest';
import {
    CATALOG_TABLES,
    CATALOG_TABLE_KINDS,
    CATALOG_SEED_SECTIONS,
    catalogTableInfo,
    summarizeReports,
    type TableImportReportDto,
} from './index';

const report = (
    overrides: Partial<TableImportReportDto> = {},
): TableImportReportDto => ({
    section: 'prof-regions',
    created: 0,
    updated: 0,
    unchanged: 0,
    skipped: [],
    ...overrides,
});

describe('каталог: описания таблиц', () => {
    it('у каждого вида таблицы есть описание с инструкцией', () => {
        for (const kind of CATALOG_TABLE_KINDS) {
            const info = catalogTableInfo(kind);
            expect(info.kind).toBe(kind);
            expect(info.title.length).toBeGreaterThan(0);
            expect(info.instructions.length).toBeGreaterThan(0);
            expect(info.fileName.endsWith('.xlsx')).toBe(true);
        }
    });

    it('виды таблиц и их описания не разъезжаются', () => {
        expect(CATALOG_TABLES.map(table => table.kind).sort()).toEqual(
            [...CATALOG_TABLE_KINDS].sort(),
        );
    });

    it('в книге цен объясняем, что цена колонки ОД общая для способов доставки', () => {
        const warnings = catalogTableInfo('prices').warnings ?? [];
        expect(warnings.join(' ')).toMatch(/Интернет и Проксима/);
        expect(warnings.join(' ')).toMatch(/Локальная/);
    });

    it('в книге цен предупреждаем, что универсальной линейке цены не вписывают', () => {
        const warnings = catalogTableInfo('prices').warnings ?? [];
        expect(warnings.join(' ')).toMatch(/универсальной линейки/);
    });

    it('пустой шаблон предусмотрен только у книги цен', () => {
        expect(catalogTableInfo('prices').canDownloadBlank).toBe(true);
        expect(catalogTableInfo('supplies').canDownloadBlank).toBeUndefined();
    });

    it('инструкция книги цен называет все листы рабочего файла', () => {
        const text = catalogTableInfo('prices').instructions.join(' ');
        for (const sheet of [
            'prof-prices-msc',
            'prof-prices-regions',
            'regions',
            'universal-weights',
            'lt',
            'star',
            'consalting',
        ]) {
            expect(text).toContain(sheet);
        }
    });

    it('у каждой секции первого наполнения есть пояснение', () => {
        expect(CATALOG_SEED_SECTIONS.length).toBe(3);
        for (const section of CATALOG_SEED_SECTIONS) {
            expect(section.title.length).toBeGreaterThan(0);
            expect(section.description.length).toBeGreaterThan(10);
        }
    });

    it('тексты для пользователя без английских кодов и жаргона', () => {
        const text = CATALOG_TABLES.flatMap(table => [
            table.title,
            table.summary,
            ...table.instructions,
            ...(table.warnings ?? []),
        ]).join(' ');
        // Коды колонок в кавычках допустимы, а вот терминов из кода быть не должно
        expect(text).not.toMatch(/dryRun|upsert|endpoint|payload|API/i);
    });
});

describe('summarizeReports', () => {
    it('складывает счётчики по листам', () => {
        const summary = summarizeReports([
            report({ created: 2, updated: 3, unchanged: 1 }),
            report({
                section: 'prof-msk',
                created: 1,
                skipped: [{ key: 'buh/internet_7', reason: 'нет поставки' }],
            }),
        ]);

        expect(summary).toEqual({
            created: 3,
            updated: 3,
            unchanged: 1,
            skipped: 1,
            hasChanges: true,
        });
    });

    it('файл без изменений: hasChanges false', () => {
        const summary = summarizeReports([report({ unchanged: 10 })]);

        expect(summary.hasChanges).toBe(false);
        expect(summary.unchanged).toBe(10);
    });

    it('пустой список отчётов не ломает сводку', () => {
        expect(summarizeReports([])).toEqual({
            created: 0,
            updated: 0,
            unchanged: 0,
            skipped: 0,
            hasChanges: false,
        });
    });
});
