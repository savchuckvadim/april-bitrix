import { getComplectRuleFlags } from '../../../catalog';
import {
    violation,
    type Composition,
    type CompositionCtx,
    type Rule,
    type RuleResult,
} from '../../model/types';

/**
 * СТАР (legacy fillingStar): один; у комплекта с флагом withStar (Эксперт в
 * закупках) СТАР зашит и не переключается, строка СТАР бесплатна
 * (обрабатывается в pricing по тому же флагу).
 */
export const applyStar = (
    composition: Composition,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    if (getComplectRuleFlags(ctx.complect).withStar) {
        return {
            composition,
            violations: [
                violation(
                    'star/locked-for-exzak',
                    `В комплекте «${ctx.complect.title}» СТАР входит по умолчанию и не переключается`,
                ),
            ],
            autoFixes: [],
        };
    }
    return {
        composition: { ...composition, star: checked },
        violations: [],
        autoFixes: [],
    };
};

export const starRule: Rule = {
    code: 'star',
    actions: ['toggleStar'],
    apply: (composition, action, ctx) =>
        action.kind === 'toggleStar' ? applyStar(composition, action.checked, ctx) : null,
};
