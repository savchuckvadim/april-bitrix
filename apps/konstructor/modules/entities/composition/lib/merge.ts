import type { Composition } from '../model/types';
import { union } from './utils';

/**
 * Мердж наполнений нескольких garant-строк general-сета: строки «идут вместе»,
 * их составы объединяются БЕЗ повторов (одинаковый инфоблок не дублируется).
 * Используется для итоговой карточки, описания и UF-полей сделки.
 */
export const mergeCompositions = (
    compositions: Composition[],
): Composition | null => {
    const first = compositions[0];
    if (!first) return null;
    if (compositions.length === 1) return first;

    // Приоритет консалтинга: pkpremium > sovex > null
    const consaltingPriority = (code: string | null): number =>
        code === 'pkpremium' ? 2 : code === 'sovex' ? 1 : 0;
    const consalting = compositions
        .map(composition => composition.consalting)
        .reduce((best, code) =>
            consaltingPriority(code) > consaltingPriority(best) ? code : best,
        );

    return {
        complectCode: first.complectCode,
        mode: first.mode,
        infoblocks: union(...compositions.map(c => c.infoblocks)),
        ers: union(...compositions.map(c => c.ers)),
        erPackets: union(...compositions.map(c => c.erPackets)),
        ersInPacket: union(...compositions.map(c => c.ersInPacket)),
        lt: union(...compositions.map(c => c.lt)),
        ltInPacket: union(...compositions.map(c => c.ltInPacket)),
        freeBlocks: union(...compositions.map(c => c.freeBlocks)),
        consalting,
        star: compositions.some(c => c.star),
        academy:
            compositions.map(c => c.academy).find(code => code !== null) ??
            null,
        regions: union(...compositions.map(c => c.regions)),
    };
};
