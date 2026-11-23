import { isSnapshotV2 } from '../../snapshot/model/types';
import type { ComplectVariantRecordDto } from '../model/dto';
import {
    COMPLECT_VARIANT_STAGE,
    isActiveVariantStage,
    isFinalVariantStage,
    type ComplectVariantStage,
} from './stage';

/**
 * Кто из вариантов участвует в документах и в сделке сервиса:
 *  1. варианты в финальных стадиях (Успех, Отклонён, Не состоялся) не
 *     участвуют никогда;
 *  2. есть варианты «в работе» (Текущий, КП, Счёт, Договор, Поставка,
 *     Согласование) — участвуют только они: после первого КП бэк переводит
 *     участников в стадию «КП», и следующее КП собирается из них же;
 *  3. таких нет — участвуют все нефинальные (черновики и «В мердже»).
 */
export const selectParticipants = <T extends { variantSmartId: number | null }>(
    variants: readonly T[],
    stageOf: (variantSmartId: number | null) => ComplectVariantStage,
): T[] => {
    const open = variants.filter(
        variant => !isFinalVariantStage(stageOf(variant.variantSmartId)),
    );
    const active = open.filter(variant =>
        isActiveVariantStage(stageOf(variant.variantSmartId)),
    );
    return active.length ? active : open;
};

/**
 * Имеет ли смысл «Сделать текущим»: действие нужно, только если после него
 * состав участников меняется. Единственный вариант (и любой, кто и так
 * участвует) уже идёт в сделку — кнопка пуста. Вариант «Отклонён» возвращается
 * в работу, поэтому для него действие остаётся. Варианты в остальных
 * финальных стадиях (Успех, Не состоялся) закрыты бэком: кнопки у них нет.
 */
export const canMakeVariantCurrent = <T extends { variantSmartId: number | null }>(
    variants: readonly T[],
    stageOf: (variantSmartId: number | null) => ComplectVariantStage,
    variantSmartId: number | null,
): boolean => {
    if (variantSmartId === null) return false;
    const stage = stageOf(variantSmartId);
    if (stage === COMPLECT_VARIANT_STAGE.current) return false;
    if (isFinalVariantStage(stage) && stage !== COMPLECT_VARIANT_STAGE.rejected) {
        return false;
    }

    const before = selectParticipants(variants, stageOf);
    const after = selectParticipants(variants, id =>
        id === variantSmartId ? COMPLECT_VARIANT_STAGE.current : stageOf(id),
    );
    return (
        before.length !== after.length ||
        before.some(variant => !after.includes(variant))
    );
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
