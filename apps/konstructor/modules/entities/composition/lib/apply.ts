import type {
    Composition,
    CompositionAction,
    CompositionCtx,
    RuleResult,
    RuleViolation,
} from '../model/types';
import { applyInfoblockToggle } from './rules/infoblock-links';
import { applyErPacketToggle, applyErToggle } from './rules/er-packets';
import { applyLtToggle, validateLtPacket } from './rules/lt';
import { applyConsalting, isConsaltingFreeblock } from './rules/consalting';
import { applyStar } from './rules/star';
import { applyAcademy } from './rules/academy';
import { addUnique, remove } from './utils';
import { checkComplectWeight } from './weight';

/**
 * Применение действия к составу.
 * mode 'rules' — работают автокоррекции и запреты (violations блокируют);
 * mode 'free'  — действие применяется «как есть», правила лишь подсвечивают
 *                нарушения (легаси-прецедент — withoutRules у LT-other).
 */

/** Наивное применение без правил (free-режим) */
const applyNaive = (
    composition: Composition,
    action: CompositionAction,
): Composition => {
    switch (action.kind) {
        case 'toggleInfoblock':
            return {
                ...composition,
                infoblocks: action.checked
                    ? addUnique(composition.infoblocks, action.code)
                    : remove(composition.infoblocks, action.code),
            };
        case 'toggleEr':
            return {
                ...composition,
                ers: action.checked
                    ? addUnique(composition.ers, action.code)
                    : remove(composition.ers, action.code),
            };
        case 'toggleErPacket':
            return {
                ...composition,
                erPackets: action.checked
                    ? addUnique(composition.erPackets, action.code)
                    : remove(composition.erPackets, action.code),
            };
        case 'toggleLt': {
            const cleared = {
                ...composition,
                lt: remove(composition.lt, action.code),
                ltInPacket: remove(composition.ltInPacket, action.code),
            };
            return action.checked
                ? { ...cleared, lt: addUnique(cleared.lt, action.code) }
                : cleared;
        }
        case 'toggleFreeBlock':
            return {
                ...composition,
                freeBlocks: action.checked
                    ? addUnique(composition.freeBlocks, action.code)
                    : remove(composition.freeBlocks, action.code),
            };
        case 'setConsalting':
            return { ...composition, consalting: action.code };
        case 'toggleStar':
            return { ...composition, star: action.checked };
        case 'setAcademy':
            return { ...composition, academy: action.code };
        case 'toggleRegion':
            return {
                ...composition,
                regions: action.checked
                    ? addUnique(composition.regions, action.code)
                    : remove(composition.regions, action.code),
            };
    }
};

/** Применение с правилами (rules-режим) */
const applyWithRules = (
    composition: Composition,
    action: CompositionAction,
    ctx: CompositionCtx,
): RuleResult => {
    switch (action.kind) {
        case 'toggleInfoblock':
            return applyInfoblockToggle(
                composition,
                action.code,
                action.checked,
                ctx,
            );
        case 'toggleEr':
            return applyErToggle(composition, action.code, action.checked, ctx);
        case 'toggleErPacket':
            return applyErPacketToggle(
                composition,
                action.code,
                action.checked,
                ctx,
            );
        case 'toggleLt':
            return applyLtToggle(composition, action.code, action.checked, ctx);
        case 'toggleFreeBlock':
            if (isConsaltingFreeblock(action.code)) {
                return {
                    composition,
                    violations: [
                        {
                            code: 'freeblock/consalting-only',
                            message:
                                'Блок добавляется только в составе консалтинга',
                        },
                    ],
                    autoFixes: [],
                };
            }
            return {
                composition: applyNaive(composition, action),
                violations: [],
                autoFixes: [],
            };
        case 'setConsalting':
            return applyConsalting(composition, action.code);
        case 'toggleStar':
            return applyStar(composition, action.checked, ctx);
        case 'setAcademy':
            return applyAcademy(composition, action.code, ctx);
        case 'toggleRegion':
            return {
                composition: applyNaive(composition, action),
                violations: [],
                autoFixes: [],
            };
    }
};

/** Сквозные проверки состава (не блокируют — подсветка) */
export const validateComposition = (
    composition: Composition,
    ctx: CompositionCtx,
): RuleViolation[] => {
    const violations: RuleViolation[] = [];

    violations.push(...validateLtPacket(composition, ctx.catalog));

    const weightCheck = checkComplectWeight(composition, ctx);
    if (!weightCheck.matches) {
        violations.push({
            code: 'weight/mismatch',
            message: `Неправильный вес комплекта: ${weightCheck.weight} вместо ${weightCheck.expected}`,
        });
    }

    return violations;
};

export const applyAction = (
    composition: Composition,
    action: CompositionAction,
    ctx: CompositionCtx,
): RuleResult => {
    if (composition.mode === 'free') {
        const next = applyNaive(composition, action);
        return {
            composition: next,
            violations: validateComposition(next, ctx),
            autoFixes: [],
        };
    }

    const result = applyWithRules(composition, action, ctx);
    // Блокирующее нарушение в rules-режиме — состав не изменился
    return {
        ...result,
        violations: [
            ...result.violations,
            ...validateComposition(result.composition, ctx).filter(
                violation =>
                    !result.violations.some(v => v.code === violation.code),
            ),
        ],
    };
};
