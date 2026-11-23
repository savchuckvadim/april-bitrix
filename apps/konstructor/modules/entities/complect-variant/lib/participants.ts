import { isSnapshotV2 } from '../../snapshot/model/types';
import { COMPLECT_MODE, type ComplectMode, type ComplectVariantRecordDto } from '../model/dto';
import { isFinalVariantStage, type ComplectVariantStage } from './stage';

type StageOf = (variantSmartId: number | null) => ComplectVariantStage;

/**
 * Незакрытые варианты: стадия не финальная (Успех, Отклонён, Не состоялся).
 * Остальные стадии (Черновик, Текущий, В мердже, КП, Счёт, Договор, Поставка,
 * Согласование) служебные пометки хода работы, на участие они не влияют.
 */
export const selectUnclosedVariants = <T extends { variantSmartId: number | null }>(
    variants: readonly T[],
    stageOf: StageOf,
): T[] => variants.filter(variant => !isFinalVariantStage(stageOf(variant.variantSmartId)));

/**
 * Кто из вариантов участвует в документах, которые идут по режиму сделки
 * (договор, отчёт о поставке, заявка поставки, товары сделки) и в переезде в
 * сервисный отдел. Решает режим сделки:
 *  - `compare` («только открытый вариант») — единственный участник открытый
 *    вариант, если он есть в списке и не закрыт; открытого варианта нет или он
 *    закрыт — участников нет, документы идут по живому состоянию, как у сделки
 *    без вариантов;
 *  - `multi_contract` и `single_contract` («все варианты») — все незакрытые
 *    варианты, черновики тоже.
 * Закрытый вариант (финальная стадия) не участвует ни в одном режиме. КП режим
 * не читает: его участников даёт selectOfferParticipants.
 */
export const selectParticipants = <T extends { variantSmartId: number | null }>(
    variants: readonly T[],
    stageOf: StageOf,
    mode: ComplectMode,
    openVariantSmartId: number | null,
): T[] => {
    const unclosed = selectUnclosedVariants(variants, stageOf);
    if (mode !== COMPLECT_MODE.compare) return unclosed;
    if (openVariantSmartId === null) return [];
    return unclosed.filter(variant => variant.variantSmartId === openVariantSmartId);
};

/**
 * Участники КП (Word, PDF и оба превью). КП делают по одному варианту, поэтому
 * режим сделки на него не влияет: участник — открытый незакрытый вариант при
 * любом режиме; при его отсутствии КП идёт по живому состоянию.
 */
export const selectOfferParticipants = <T extends { variantSmartId: number | null }>(
    variants: readonly T[],
    stageOf: StageOf,
    openVariantSmartId: number | null,
): T[] => selectParticipants(variants, stageOf, COMPLECT_MODE.compare, openVariantSmartId);

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
