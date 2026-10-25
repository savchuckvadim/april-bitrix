import {
    violation,
    type Composition,
    type CompositionCtx,
    type Rule,
    type RuleResult,
} from '../../model/types';
import { addUnique, remove } from '../utils';
import { isConsaltingFreeblock } from './consalting';
import {
    ARBITRATION_CODES,
    ARBITRATION_FREE,
    GENERAL_COURT_CODE,
    GENERAL_FREE,
} from './infoblock-links';

/**
 * Бесплатные блоки (legacy fillingFreeblocksWithUncheck / CHANGE_FREE):
 * - консалтинговые блоки (ПК Премиум: база знаний / 2 заключения / устные
 *   консультации) включаются только выбором консалтинга;
 * - онлайн-архивы судебной практики в PROF привязаны к инфоблокам: пока
 *   арбитражная практика в составе — online2 не снять, пока «суды общей
 *   юрисдикции» — online1 не снять (в универсале тумблер свободный);
 * - остальные блоки переключаются свободно.
 */

const dependencyBlocks = (free: string): string[] => {
    if (free === ARBITRATION_FREE) return ARBITRATION_CODES;
    if (free === GENERAL_FREE) return [GENERAL_COURT_CODE];
    return [];
};

export const applyFreeBlockToggle = (
    composition: Composition,
    code: string,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    if (isConsaltingFreeblock(code)) {
        return {
            composition,
            violations: [
                violation(
                    'freeblock/consalting-only',
                    'Блок добавляется только в составе консалтинга',
                ),
            ],
            autoFixes: [],
        };
    }

    if (!checked && ctx.complect.type === 'prof') {
        const dependency = dependencyBlocks(code).find(block =>
            composition.infoblocks.includes(block),
        );
        if (dependency) {
            const name = ctx.catalog.infoblocks[dependency]?.name ?? dependency;
            return {
                composition,
                violations: [
                    violation(
                        'freeblock/dependency-locked',
                        `Архив идёт вместе с блоком «${name}» — снимите сначала его`,
                    ),
                ],
                autoFixes: [],
            };
        }
    }

    return {
        composition: {
            ...composition,
            freeBlocks: checked
                ? addUnique(composition.freeBlocks, code)
                : remove(composition.freeBlocks, code),
        },
        violations: [],
        autoFixes: [],
    };
};

export const freeBlocksRule: Rule = {
    code: 'free-blocks',
    actions: ['toggleFreeBlock'],
    apply: (composition, action, ctx) =>
        action.kind === 'toggleFreeBlock'
            ? applyFreeBlockToggle(composition, action.code, action.checked, ctx)
            : null,
};
