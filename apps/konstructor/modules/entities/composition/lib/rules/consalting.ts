import type { Composition, RuleResult } from '../../model/types';
import { addUnique, remove } from '../utils';

/**
 * Консалтинг (legacy fillingConsalting):
 * - «Горячая линия» (hotline) включена всегда и не переключается —
 *   в модели её нет, есть только платный выбор;
 * - выбор эксклюзивен: sovex («Советы экспертов») ИЛИ pkpremium («ПК Премиум»);
 * - sovex → freeBlocks + [pbcaonsalting, orallyconsalting] − [twoconsalting];
 * - pkpremium → freeBlocks + [pbcaonsalting, twoconsalting, orallyconsalting];
 * - null → все три консалтинговых freeblocks снимаются.
 */

export const CONSALTING_FREEBLOCKS = [
    'pbcaonsalting',
    'twoconsalting',
    'orallyconsalting',
] as const;

export const applyConsalting = (
    composition: Composition,
    code: string | null,
): RuleResult => {
    const autoFixes: string[] = [];
    let freeBlocks = composition.freeBlocks;
    for (const block of CONSALTING_FREEBLOCKS) {
        freeBlocks = remove(freeBlocks, block);
    }

    if (code === 'sovex') {
        freeBlocks = addUnique(freeBlocks, 'pbcaonsalting');
        freeBlocks = addUnique(freeBlocks, 'orallyconsalting');
        autoFixes.push('Добавлены бесплатные блоки Советов экспертов');
    } else if (code === 'pkpremium') {
        for (const block of CONSALTING_FREEBLOCKS) {
            freeBlocks = addUnique(freeBlocks, block);
        }
        autoFixes.push('Добавлены бесплатные блоки Правового консалтинга');
    }

    return {
        composition: { ...composition, consalting: code, freeBlocks },
        violations: [],
        autoFixes,
    };
};

/** Прямое включение консалтинговых freeblocks запрещено (только через выбор консалтинга) */
export const isConsaltingFreeblock = (code: string): boolean =>
    (CONSALTING_FREEBLOCKS as readonly string[]).includes(code);
