import { resolveSupply, type Catalog } from '@/modules/entities/catalog';
import { allLtServiceCodes, checkComplectWeight } from '@/modules/entities/composition';
import {
    TAX_COEFFICIENT,
    buildTotalRow,
    type KRow,
    type RowSet,
    type RowSetContext,
} from '@/modules/entities/row-set';

export interface SummaryFact {
    label: string;
    value: string;
}

export interface SummaryTotal {
    sum: string;
    /** «в том числе НДС 5% — Y ₽» при налоге поставщика. */
    note: string | null;
    itemsCount: number;
}

export const formatRub = (value: number): string =>
    `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽`;

/**
 * Сводка главной строки (легаси ResultContainer): комплект, вес, доступы,
 * договор, регион, сервисы наполнения, наборы для сравнения.
 */
export const buildSummaryFacts = (
    catalog: Catalog,
    context: RowSetContext,
    mainRow: KRow,
    comparisonCount: number,
): SummaryFact[] => {
    const { complectCode, supplyCode, contractCode } = mainRow.refs;
    const complect = catalog.complects.byCode[complectCode ?? ''] ?? null;
    const composition = mainRow.composition;
    const facts: SummaryFact[] = [
        { label: 'Комплект', value: complect?.title ?? mainRow.names.shortName },
    ];

    if (complect && composition) {
        const weight = checkComplectWeight(composition, { complect, catalog });
        facts.push({
            label: 'Вес',
            value: `${weight.weight} из ${weight.expected}`,
        });
    }
    facts.push(
        {
            label: 'Доступ',
            value: resolveSupply(catalog, supplyCode)?.name ?? '—',
        },
        {
            label: 'Договор',
            value: catalog.contracts.byCode[contractCode]?.name ?? '—',
        },
        {
            label: 'Регион',
            value: catalog.regions.byCode[context.regionCode ?? '']?.title ?? '—',
        },
    );

    if (composition) {
        const ltCount = allLtServiceCodes(composition).length;
        const packets = composition.ltOther.length;
        facts.push({
            label: 'Legal Tech',
            value: ltCount
                ? `сервисов: ${ltCount}${packets ? `, доп. пакетов: ${packets}` : ''}`
                : 'нет',
        });
        facts.push({
            label: 'Консалтинг',
            value:
                catalog.services.consalting.find(
                    service => service.code === composition.consalting,
                )?.name ?? 'Горячая линия',
        });
        if (composition.star) facts.push({ label: 'СТАР', value: 'включён' });
    }
    if (comparisonCount > 0) {
        facts.push({
            label: 'Для сравнения',
            value: `наборов: ${comparisonCount}`,
        });
    }
    return facts;
};

/** Итог основного набора: сумма и НДС (легаси format-set-block-summary). */
export const buildSummaryTotal = (
    general: RowSet,
    withTax: boolean,
): SummaryTotal | null => {
    const total = buildTotalRow(general);
    if (!total) return null;
    const sum = total.price.sum;
    return {
        sum: formatRub(sum),
        note: withTax
            ? `в том числе НДС 5% — ${formatRub(sum - sum / TAX_COEFFICIENT)}`
            : null,
        itemsCount: general.rows.length,
    };
};
