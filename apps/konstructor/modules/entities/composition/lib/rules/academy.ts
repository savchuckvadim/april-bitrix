import {
    violation,
    type Composition,
    type CompositionCtx,
    type Rule,
    type RuleResult,
} from '../../model/types';

/**
 * Академия (legacy fillingAcademy): эксклюзивный выбор одного пакета (или
 * отказ). Допустимость пакета под длительность договора
 * (`contractLong ∋ quantity × coefficient`) проверяется в row-set при
 * сборке строки академии — у состава нет договора.
 */
export const applyAcademy = (
    composition: Composition,
    code: string | null,
    ctx: CompositionCtx,
): RuleResult => {
    if (code && !ctx.catalog.academy.some(pkg => pkg.code === code)) {
        return {
            composition,
            violations: [
                violation('academy/unknown-package', `Неизвестный пакет академии: ${code}`),
            ],
            autoFixes: [],
        };
    }
    return {
        composition: { ...composition, academy: code },
        violations: [],
        autoFixes: [],
    };
};

export const academyRule: Rule = {
    code: 'academy',
    actions: ['setAcademy'],
    apply: (composition, action, ctx) =>
        action.kind === 'setAcademy' ? applyAcademy(composition, action.code, ctx) : null,
};
