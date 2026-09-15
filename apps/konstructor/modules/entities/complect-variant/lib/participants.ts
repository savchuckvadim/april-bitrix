import { isSnapshotV2 } from '../../snapshot/model/types';
import type { ComplectVariantRecordDto } from '../model/dto';
import { COMPLECT_VARIANT_STAGE, type ComplectVariantStage } from './stage';

/**
 * Кто из вариантов участвует в сделке. Правило то же, что на бэке
 * (`selectVariantsToCopy`), иначе экран показывал бы одно, а в отдел сервиса
 * уезжало другое:
 *  1. отклонённые не участвуют;
 *  2. есть помеченные «Текущий» — участвуют только они;
 *  3. стадий никто не трогал — участвуют все.
 */
export const selectParticipants = <T extends { variantSmartId: number | null }>(
    variants: readonly T[],
    stageOf: (variantSmartId: number | null) => ComplectVariantStage,
): T[] => {
    const alive = variants.filter(
        variant =>
            stageOf(variant.variantSmartId) !== COMPLECT_VARIANT_STAGE.rejected,
    );
    const current = alive.filter(
        variant =>
            stageOf(variant.variantSmartId) === COMPLECT_VARIANT_STAGE.current,
    );
    return current.length ? current : alive;
};

/**
 * Код типа договора варианта из его записи. Слепок v2 хранит `contractCode`
 * в колонке rows, легаси-v1 — договор JSON-строкой в колонке contract.
 * Битую запись не разбираем: вариант остаётся без типа, и «один договор на
 * всех» окажется недоступен — безопаснее, чем объединить разнотипные договоры.
 */
export const getVariantContractCode = (
    record: ComplectVariantRecordDto,
): string => {
    if (record.rows) {
        try {
            const parsed = JSON.parse(record.rows) as unknown;
            if (isSnapshotV2(parsed)) return parsed.contractCode ?? '';
        } catch {
            // v1: rows — легаси-структура, договор лежит отдельно
        }
    }
    if (!record.contract) return '';
    try {
        const parsed = JSON.parse(record.contract) as {
            current?: { code?: string; shortName?: string };
        };
        return parsed?.current?.code || parsed?.current?.shortName || '';
    } catch {
        return '';
    }
};
