import oldInit from '../../../catalog/lib/__fixtures__/oldinit.json';
import { catalogFromOldInit } from '../../../catalog';
import type { ComplectVariantItem } from '../../../complect-variant/lib/api/complect-variant-helper';
import type { ComplectVariantRecordDto } from '../../../complect-variant/model/dto';
import { defaultComposition } from '../../../composition';
import { buildGarantRow, createSet, upsertRow, type RowSet } from '../../../row-set';
import { serializeV2 } from '../../../snapshot';

/** Слепки вариантов сделки и элементы смарта для тестов документов по вариантам. */
export const variantCatalog = catalogFromOldInit(oldInit);

const mainRowFor = (key: string, complectCode: string) => ({
    ...buildGarantRow({
        catalog: variantCatalog,
        regionCode: 'stv',
        withTax: false,
        key,
        setId: 'general',
        role: 'main' as const,
        complectCode,
        supplyCode: 'internet_5',
        contractCode: 'abonYear',
    })!,
    composition: defaultComposition(variantCatalog.complects.byCode[complectCode]!),
});

/** Общий набор из одной главной строки комплекта. */
export const mainSetOf = (key: string, complectCode: string): RowSet =>
    upsertRow(createSet('general', 'general'), mainRowFor(key, complectCode));

/** Колонка rows записи варианта: слепок v2 с данным общим набором. */
export const snapshotRowsOf = (general: RowSet): string =>
    JSON.stringify(
        serializeV2({
            state: {
                regionCode: 'stv',
                contractCode: 'abonYear',
                supplyCode: 'internet_5',
                general,
                alternative: [],
                templateId: null,
                rqId: null,
                pdf: null,
            },
            dealId: 1,
            domain: 'd',
            userId: 1,
            savedAt: '2026-10-24T00:00:00.000Z',
        }),
    );

/** Запись варианта; `rows` не задан — читаемый слепок с главной строкой комплекта. */
export const recordOf = (
    id: number,
    variantSmartId: number,
    complectCode: string,
    rows?: string | null,
): ComplectVariantRecordDto =>
    ({
        id,
        variantSmartId,
        rows: rows === undefined ? snapshotRowsOf(mainSetOf(`v${id}`, complectCode)) : rows,
    }) as ComplectVariantRecordDto;

export const variantItems: ComplectVariantItem[] = [
    { id: 101, title: 'Бухгалтеру', stageId: 'DT1:CURRENT' },
    { id: 102, title: 'Юристу', stageId: 'DT1:NEW' },
    { id: 103, title: 'Отклонённый', stageId: 'DT1:REJECTED' },
];
