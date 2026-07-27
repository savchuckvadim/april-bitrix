import type {
    Composition,
    CompositionCtx,
    RuleResult,
} from '../../model/types';

/**
 * СТАР (legacy fillingStar): недоступен комплекту «Эксперт в закупках»
 * (exzak — там СТАР зашит и не переключается); при complect.withStar
 * строка СТАР бесплатна (обрабатывается в pricing).
 */
const EXZAK_CODE = 'exzak';

export const applyStar = (
    composition: Composition,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    if (ctx.complect.code === EXZAK_CODE) {
        return {
            composition,
            violations: [
                {
                    code: 'star/locked-for-exzak',
                    message:
                        'В комплекте «Эксперт в закупках» СТАР входит по умолчанию и не переключается',
                },
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
