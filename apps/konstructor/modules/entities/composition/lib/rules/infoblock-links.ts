import type {
    Composition,
    CompositionCtx,
    RuleResult,
    RuleViolation,
} from '../../model/types';
import { addUnique, remove } from '../utils';

/**
 * Связность инфоблоков (legacy fillingInfoblocks + fillingFreeblocksWithUncheck):
 * - блок с родителем и весом 0 («Доп. материалы») нельзя переключать отдельно —
 *   он следует за родителем;
 * - арбитражная практика (lv/la/laa) ⇄ бесплатный онлайн-архив online2;
 * - практика судов общей юрисдикции (lgeneral) ⇄ архив online1.
 */

const ARBITRATION_CODES = ['lv', 'la', 'laa'];
const GENERAL_COURT_CODE = 'lgeneral';
const ARBITRATION_FREE = 'online2';
const GENERAL_FREE = 'online1';

export const applyInfoblockToggle = (
    composition: Composition,
    code: string,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    const violations: RuleViolation[] = [];
    const autoFixes: string[] = [];
    const block = ctx.catalog.infoblocks[code];

    // «Доп. материалы» — только вместе с родителем
    if (block && block.weight === 0 && block.parents.length > 0) {
        return {
            composition,
            violations: [
                {
                    code: 'infoblock/child-locked',
                    message: `«${block.name}» переключается только вместе с основным блоком`,
                },
            ],
            autoFixes: [],
        };
    }

    let next: Composition = {
        ...composition,
        infoblocks: checked
            ? addUnique(composition.infoblocks, code)
            : remove(composition.infoblocks, code),
    };

    // Дочерние блоки следуют за родителем
    if (block?.children?.length) {
        for (const childCode of block.children) {
            const child = ctx.catalog.infoblocks[childCode];
            if (!child || child.weight !== 0) continue;
            next = {
                ...next,
                infoblocks: checked
                    ? addUnique(next.infoblocks, childCode)
                    : remove(next.infoblocks, childCode),
            };
            autoFixes.push(
                checked
                    ? `Добавлен связанный блок «${child.name}»`
                    : `Убран связанный блок «${child.name}»`,
            );
        }
    }

    // Судебная практика ⇄ бесплатные онлайн-архивы
    if (ARBITRATION_CODES.includes(code)) {
        const hasArbitration = ARBITRATION_CODES.some(item =>
            next.infoblocks.includes(item),
        );
        const inFree = next.freeBlocks.includes(ARBITRATION_FREE);
        if (hasArbitration && !inFree) {
            next = {
                ...next,
                freeBlocks: addUnique(next.freeBlocks, ARBITRATION_FREE),
            };
            autoFixes.push('Добавлен онлайн-архив арбитражных судов');
        }
        if (!hasArbitration && inFree) {
            next = {
                ...next,
                freeBlocks: remove(next.freeBlocks, ARBITRATION_FREE),
            };
            autoFixes.push('Убран онлайн-архив арбитражных судов');
        }
    }
    if (code === GENERAL_COURT_CODE) {
        const inFree = next.freeBlocks.includes(GENERAL_FREE);
        if (checked && !inFree) {
            next = { ...next, freeBlocks: addUnique(next.freeBlocks, GENERAL_FREE) };
            autoFixes.push('Добавлен архив практики мировых судей');
        }
        if (!checked && inFree) {
            next = { ...next, freeBlocks: remove(next.freeBlocks, GENERAL_FREE) };
            autoFixes.push('Убран архив практики мировых судей');
        }
    }

    return { composition: next, violations, autoFixes };
};
