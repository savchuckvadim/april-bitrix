/**
 * Отчёт переноса из легаси: русские подписи статусов, порядок строк,
 * фильтр по статусу и плашки итогов.
 */

import { describe, expect, it } from 'vitest';
import {
    PROVIDER_IMAGE_LEGACY_STATUSES,
    PROVIDER_IMAGE_LEGACY_STATUS_LABELS,
    type ProviderImageLegacyImportRow,
    type ProviderImageLegacyImportTotals,
    type ProviderImageLegacyStatus,
} from '../model';
import {
    filterLegacyImportRows,
    hasLegacyImportWork,
    legacyImportRowKey,
    legacyImportTotalsItems,
    legacyRoleLabel,
    legacyStatusLabel,
    sortLegacyImportRows,
} from './provider-image-legacy-report.util';

const row = (patch: Partial<ProviderImageLegacyImportRow>): ProviderImageLegacyImportRow => ({
    portalDomain: 'a.bitrix24.ru',
    rqId: 1,
    rqName: 'ООО «Альфа»',
    role: 'stamp',
    legacyFileId: 1,
    legacyPath: 'rq/1/stamp.png',
    status: 'would-import',
    message: null,
    ...patch,
});

const totals = (patch: Partial<ProviderImageLegacyImportTotals> = {}): ProviderImageLegacyImportTotals => ({
    imported: 0,
    wouldImport: 0,
    exists: 0,
    already: 0,
    noFile: 0,
    skipped: 0,
    error: 0,
    ...patch,
});

describe('подписи статусов', () => {
    it('семь статусов по-русски, как их назвал владелец', () => {
        expect(PROVIDER_IMAGE_LEGACY_STATUS_LABELS).toEqual({
            imported: 'перенесена',
            'would-import': 'будет перенесена',
            exists: 'уже есть другая — не трогаем',
            already: 'уже перенесена',
            'no-file': 'файл не выбран',
            skipped: 'не переносится',
            error: 'ошибка',
        });
    });

    it('legacyStatusLabel отдаёт подпись по статусу', () => {
        expect(legacyStatusLabel('no-file')).toBe('файл не выбран');
        expect(legacyStatusLabel('error')).toBe('ошибка');
    });

    it('список статусов экрана совпадает с подписями', () => {
        expect([...PROVIDER_IMAGE_LEGACY_STATUSES].sort()).toEqual(
            Object.keys(PROVIDER_IMAGE_LEGACY_STATUS_LABELS).sort(),
        );
    });
});

describe('legacyRoleLabel', () => {
    it('даёт подпись роли экрана', () => {
        expect(legacyRoleLabel('signature_director')).toBe('Подпись руководителя');
        expect(legacyRoleLabel('logo')).toBe('Логотип');
    });

    it('без роли подписи нет', () => {
        expect(legacyRoleLabel(null)).toBeNull();
    });
});

describe('sortLegacyImportRows', () => {
    it('сортирует по порталу, затем по названию реквизитов', () => {
        const sorted = sortLegacyImportRows([
            row({ portalDomain: 'b.bitrix24.ru', rqId: 3, rqName: 'Бета' }),
            row({ portalDomain: 'a.bitrix24.ru', rqId: 2, rqName: 'Яблоко' }),
            row({ portalDomain: 'a.bitrix24.ru', rqId: 1, rqName: 'Альфа' }),
        ]);

        expect(sorted.map((item) => item.rqName)).toEqual(['Альфа', 'Яблоко', 'Бета']);
    });

    it('строки без портала и без названия идут в конец своей группы', () => {
        const sorted = sortLegacyImportRows([
            row({ portalDomain: null, rqId: 9, rqName: 'Ничей' }),
            row({ portalDomain: 'a.bitrix24.ru', rqId: 5, rqName: null }),
            row({ portalDomain: 'a.bitrix24.ru', rqId: 4, rqName: 'Альфа' }),
        ]);

        expect(sorted.map((item) => item.rqId)).toEqual([4, 5, 9]);
    });

    it('внутри реквизитов роли идут в порядке экрана, без роли в конце', () => {
        const sorted = sortLegacyImportRows([
            row({ role: null, legacyFileId: 5 }),
            row({ role: 'logo', legacyFileId: 4 }),
            row({ role: 'signature_accountant', legacyFileId: 3 }),
            row({ role: 'signature_director', legacyFileId: 2 }),
            row({ role: 'stamp', legacyFileId: 1 }),
        ]);

        expect(sorted.map((item) => item.role)).toEqual([
            'stamp',
            'signature_director',
            'signature_accountant',
            'logo',
            null,
        ]);
    });

    it('одинаковые роли различает номер файла легаси', () => {
        const sorted = sortLegacyImportRows([
            row({ legacyFileId: 20 }),
            row({ legacyFileId: 10 }),
        ]);

        expect(sorted.map((item) => item.legacyFileId)).toEqual([10, 20]);
    });

    it('исходный массив не меняется', () => {
        const source = [row({ rqId: 2, rqName: 'Б' }), row({ rqId: 1, rqName: 'А' })];
        const before = source.map((item) => item.rqId);

        sortLegacyImportRows(source);

        expect(source.map((item) => item.rqId)).toEqual(before);
    });
});

describe('filterLegacyImportRows', () => {
    const rows = [
        row({ legacyFileId: 1, status: 'imported' }),
        row({ legacyFileId: 2, status: 'error' }),
        row({ legacyFileId: 3, status: 'error' }),
    ];

    it('null оставляет все строки', () => {
        expect(filterLegacyImportRows(rows, null)).toHaveLength(3);
    });

    it('статус оставляет только свои строки', () => {
        expect(filterLegacyImportRows(rows, 'error').map((item) => item.legacyFileId)).toEqual([2, 3]);
        expect(filterLegacyImportRows(rows, 'skipped')).toEqual([]);
    });
});

describe('legacyImportTotalsItems', () => {
    it('даёт все семь статусов по порядку экрана с числами из итогов', () => {
        const items = legacyImportTotalsItems(
            totals({ imported: 3, wouldImport: 4, exists: 1, already: 2, noFile: 5, skipped: 6, error: 7 }),
        );

        expect(items.map((item) => [item.status, item.count])).toEqual([
            ['imported', 3],
            ['would-import', 4],
            ['already', 2],
            ['exists', 1],
            ['no-file', 5],
            ['skipped', 6],
            ['error', 7],
        ]);
    });

    it('несёт подпись и окраску статуса', () => {
        const items = legacyImportTotalsItems(totals({ error: 1 }));
        const byStatus = (status: ProviderImageLegacyStatus) =>
            items.find((item) => item.status === status);

        expect(byStatus('error')).toMatchObject({ label: 'ошибка', tone: 'danger' });
        expect(byStatus('imported')).toMatchObject({ label: 'перенесена', tone: 'success' });
        expect(byStatus('exists')?.tone).toBe('warning');
    });
});

describe('hasLegacyImportWork', () => {
    it('нет отчёта проверки: переносить нечего', () => {
        expect(hasLegacyImportWork(null)).toBe(false);
    });

    it('проверка с «будет перенесена» открывает перенос', () => {
        expect(hasLegacyImportWork({ dryRun: true, totals: totals({ wouldImport: 2 }) })).toBe(true);
    });

    it('проверка без новых картинок перенос не открывает', () => {
        expect(hasLegacyImportWork({ dryRun: true, totals: totals({ already: 5 }) })).toBe(false);
    });

    it('отчёт уже выполненного переноса снова переносить не даёт', () => {
        expect(hasLegacyImportWork({ dryRun: false, totals: totals({ wouldImport: 2 }) })).toBe(false);
    });
});

describe('legacyImportRowKey', () => {
    it('различает строки по реквизитам, роли и файлу', () => {
        expect(legacyImportRowKey(row({ rqId: 7, role: 'logo', legacyFileId: 9 }))).toBe('7:logo:9');
        expect(legacyImportRowKey(row({ rqId: 7, role: null, legacyFileId: 9 }))).toBe('7:-:9');
    });
});
