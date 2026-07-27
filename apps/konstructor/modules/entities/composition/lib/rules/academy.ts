import type {
    Composition,
    CompositionCtx,
    RuleResult,
} from '../../model/types';

/** Академия: эксклюзивный выбор одного пакета (или отказ) */
export const applyAcademy = (
    composition: Composition,
    code: string | null,
    ctx: CompositionCtx,
): RuleResult => {
    if (code && !ctx.catalog.academy.some(pkg => pkg.code === code)) {
        return {
            composition,
            violations: [
                {
                    code: 'academy/unknown-package',
                    message: `Неизвестный пакет академии: ${code}`,
                },
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
