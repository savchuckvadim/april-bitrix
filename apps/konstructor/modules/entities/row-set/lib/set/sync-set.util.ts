import type { Catalog } from '../../../catalog';
import { getComplectRuleFlags } from '../../../catalog';
import { describeLtPackets, mergeCompositions } from '../../../composition';
import type { KRow, RowSet } from '../../model/types';
import { buildGarantRow, buildServiceRow } from '../row';
import { garantRows, leadGarantRow } from './set-ops.util';
import { academyRowFor } from './sync-academy.util';

export interface RowSetContext {
    regionCode: string | null;
    withTax: boolean;
    /** Сервисный отдел — ему доступен средний пакет LT-other (вес 4) */
    serviceDepartment?: boolean;
}

/**
 * Пересборка сета после изменения наполнения/региона
 * (замена легаси changeCurrentProductAndPrice + setGeneralProductRows):
 * - garant-строки пересчитываются по каталогу (композиция, роль,
 *   количество и пользовательское имя сохраняются);
 * - сервисные строки (LT-пакет, консалтинг, СТАР, академия) выводятся из
 *   ОБЪЕДИНЁННОГО наполнения garant-строк сета (мердж без повторов) и
 *   получают количество набора (легаси: новая строка берёт quantity сета);
 * - пакеты LT-other — по строке lt_other на каждый собранный пакет (ключ —
 *   id пакета); несобранный пакет строки не даёт;
 * - сервисные строки привязаны к ВЕДУЩЕЙ garant-строке (у comparison-сетов
 *   main-строки нет — поэтому не findMainRow);
 * - ручные правки коммерции и total-строки при пересборке сбрасываются —
 *   как в легаси (количество сохраняется).
 */
export const syncSetWithComposition = (
    set: RowSet,
    catalog: Catalog,
    context: RowSetContext,
): RowSet => {
    if (!context.regionCode) return set;
    const lead = leadGarantRow(set);
    if (!lead) return set;

    const rebuiltGarant: KRow[] = [];
    for (const row of garantRows(set)) {
        const rebuilt = buildGarantRow({
            catalog,
            regionCode: context.regionCode,
            withTax: context.withTax,
            key: row.key,
            setId: row.setId,
            role: row.role,
            complectCode: row.refs.complectCode ?? '',
            supplyCode: row.refs.supplyCode,
            contractCode: row.refs.contractCode,
            composition: row.composition,
            quantity: row.price.quantity,
        });
        if (rebuilt) {
            rebuiltGarant.push({
                ...rebuilt,
                names: {
                    ...rebuilt.names,
                    alternativeName: row.names.alternativeName,
                },
            });
        } else {
            rebuiltGarant.push(row);
        }
    }

    const merged = mergeCompositions(
        rebuiltGarant
            .map(row => row.composition)
            .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    );

    const serviceRows: KRow[] = [];
    const leadComplect = lead.refs.complectCode
        ? catalog.complects.byCode[lead.refs.complectCode]
        : null;
    const serviceBase = {
        catalog,
        regionCode: context.regionCode,
        withTax: context.withTax,
        setId: set.id,
        role: lead.role,
        supplyCode: lead.refs.supplyCode,
        contractCode: lead.refs.contractCode,
        quantity: lead.price.quantity,
    } as const;

    if (merged) {
        const ltPackets = describeLtPackets(merged, {
            catalog,
            complect: leadComplect ?? null,
            serviceDepartment: context.serviceDepartment,
        });
        for (const packet of ltPackets) {
            // бесплатная часть товаром не идёт; доп. пакеты — только в основном наборе
            if (!packet.isProduct || !packet.package) continue;
            if (packet.kind === 'extra' && set.kind !== 'general') continue;
            const isExtra = packet.kind === 'extra';
            const row = buildServiceRow({
                ...serviceBase,
                key: isExtra ? `${set.id}_lt_other_${packet.id}` : `${set.id}_lt`,
                productType: isExtra ? 'lt_other' : 'lt',
                service: packet.package,
                ...(isExtra
                    ? {
                          packetId: packet.id,
                          alternativeName:
                              merged.ltOther.find(item => item.id === packet.id)?.alternativeName ?? null,
                      }
                    : {}),
            });
            if (row) serviceRows.push(row);
        }

        if (merged.consalting) {
            const service = catalog.services.consalting.find(
                item => item.code === merged.consalting,
            );
            if (service) {
                const row = buildServiceRow({
                    ...serviceBase,
                    key: `${set.id}_consalting`,
                    productType: 'consalting',
                    service,
                });
                if (row) serviceRows.push(row);
            }
        }

        if (merged.star) {
            const service = catalog.services.star[0];
            if (service) {
                const row = buildServiceRow({
                    ...serviceBase,
                    key: `${set.id}_star`,
                    productType: 'star',
                    service,
                    isFree: Boolean(leadComplect && getComplectRuleFlags(leadComplect).withStar),
                });
                if (row) serviceRows.push(row);
            }
        }
    }

    const withGarant: RowSet = { ...set, rows: [...rebuiltGarant, ...serviceRows] };
    const academy = academyRowFor({ ...withGarant, rows: [...withGarant.rows, ...academyRows(set)] }, catalog, context);

    return {
        ...withGarant,
        rows: academy ? [...withGarant.rows, academy] : withGarant.rows,
        totalPrice: null,
    };
};

/** Прежняя строка академии: нужна, чтобы пакет «до конца комплекта» сохранил своё количество */
const academyRows = (set: RowSet): KRow[] => set.rows.filter(row => row.productType === 'academy');
