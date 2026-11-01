import { academyFits, academyPackageLabel } from '../../../catalog';
import {
    violation,
    type Composition,
    type CompositionCtx,
    type Rule,
    type RuleResult,
    type RuleViolation,
} from '../../model/types';

/**
 * Академия (легаси fillingAcademy + useAcademy): один пакет или отказ. Пакет
 * «на срок» должен совпадать со сроком сделки (ctx.termMonths = количество ×
 * договор). Выбор остаётся в наполнении и при смене срока: строка академии
 * появляется, когда срок снова совпал (легаси убирал пакет и возвращал его из
 * памяти экрана, здесь память — само наполнение).
 */

const termMismatch = (
    composition: Composition,
    ctx: CompositionCtx,
    level: 'error' | 'warning',
): RuleViolation | null => {
    const pkg = ctx.catalog.academy.find(item => item.code === composition.academy);
    if (!pkg || ctx.termMonths === null || ctx.termMonths === undefined) return null;
    if (academyFits(pkg, ctx.termMonths)) return null;
    return violation(
        'academy/term-mismatch',
        `Академия «${academyPackageLabel(pkg)}» не подходит под срок сделки ${ctx.termMonths} мес: строки не будет, пока срок не совпадёт`,
        level,
    );
};

export const validateAcademy = (composition: Composition, ctx: CompositionCtx): RuleViolation[] => {
    const mismatch = termMismatch(composition, ctx, 'warning');
    return mismatch ? [mismatch] : [];
};

export const applyAcademy = (
    composition: Composition,
    code: string | null,
    ctx: CompositionCtx,
): RuleResult => {
    if (code && !ctx.catalog.academy.some(pkg => pkg.code === code)) {
        return {
            composition,
            violations: [violation('academy/unknown-package', `Неизвестный пакет академии: ${code}`)],
            autoFixes: [],
        };
    }
    const next = { ...composition, academy: code };
    const mismatch = termMismatch(next, ctx, 'error');
    if (mismatch) return { composition, violations: [mismatch], autoFixes: [] };
    return { composition: next, violations: [], autoFixes: [] };
};

export const academyRule: Rule = {
    code: 'academy',
    actions: ['setAcademy'],
    apply: (composition, action, ctx) =>
        action.kind === 'setAcademy' ? applyAcademy(composition, action.code, ctx) : null,
    validate: validateAcademy,
};
