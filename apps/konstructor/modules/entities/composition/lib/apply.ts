import type {
    Composition,
    CompositionAction,
    CompositionCtx,
    RuleResult,
    RuleViolation,
} from '../model/types';
import { isBlocking } from '../model/types';
import { addUnique, remove } from './utils';
import { COMPOSITION_RULES } from './rules/registry';
import {
    addLtOtherPacket,
    removeLtOtherPacket,
    renameLtOtherPacket,
    toggleLtOtherService,
} from './rules/lt-other';

/**
 * Применение действия к составу через реестр правил (lib/rules/registry.ts).
 * mode 'rules' — автокоррекции и запреты (блокирующие нарушения оставляют
 *                состав прежним);
 * mode 'free'  — действие применяется «как есть», правила лишь подсвечивают
 *                нарушения (тумблер «Без правил» доступен всем — решение 19).
 */

/** Наивное применение без правил (free-режим) */
export const applyNaive = (
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
        // пакеты LT-other: без правил сборка та же, разница — в подборе пакета
        case 'addLtOtherPacket':
            return addLtOtherPacket(composition, action.id);
        case 'removeLtOtherPacket':
            return removeLtOtherPacket(composition, action.id);
        case 'toggleLtOtherService':
            return toggleLtOtherService(composition, action.id, action.code, action.checked);
        case 'renameLtOtherPacket':
            return renameLtOtherPacket(composition, action.id, action.name);
    }
};

/** Сквозные проверки состава всеми правилами-валидаторами (подсветка) */
export const validateComposition = (
    composition: Composition,
    ctx: CompositionCtx,
): RuleViolation[] =>
    COMPOSITION_RULES.flatMap(rule => rule.validate?.(composition, ctx) ?? []);

/** Применение с правилами: первое правило, объявившее действие */
const applyWithRules = (
    composition: Composition,
    action: CompositionAction,
    ctx: CompositionCtx,
): RuleResult => {
    for (const rule of COMPOSITION_RULES) {
        if (!rule.apply || !rule.actions.includes(action.kind)) continue;
        const result = rule.apply(composition, action, ctx);
        if (result) return result;
    }
    // Действие без правила — применяется как есть
    return { composition: applyNaive(composition, action), violations: [], autoFixes: [] };
};

const mergeViolations = (
    primary: RuleViolation[],
    secondary: RuleViolation[],
): RuleViolation[] => [
    ...primary,
    ...secondary.filter(item => !primary.some(v => v.code === item.code)),
];

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
    // Блокирующее нарушение в rules-режиме — состав остаётся прежним
    const blocked = result.violations.some(isBlocking);
    const next = blocked ? composition : result.composition;
    return {
        composition: next,
        violations: mergeViolations(result.violations, validateComposition(next, ctx)),
        autoFixes: blocked ? [] : result.autoFixes,
    };
};
