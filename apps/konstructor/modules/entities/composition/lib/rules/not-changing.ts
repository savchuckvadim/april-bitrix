import { defaultComposition, violation, type Rule } from '../../model/types';

const sameSet = (a: readonly string[], b: readonly string[]): boolean =>
    a.length === b.length && a.every(code => b.includes(code));

/**
 * Неизменяемый комплект (legacy current-complect-reducer: `isChanging === false`
 * → warning «Внесены изменения в неизменяемый комплект»). Не блокирует —
 * предупреждение, пока состав отличается от дефолта комплекта.
 */
export const notChangingRule: Rule = {
    code: 'not-changing',
    actions: [],
    validate: (composition, ctx) => {
        if (ctx.complect.isChanging) return [];
        const defaults = defaultComposition(ctx.complect);
        const untouched =
            sameSet(composition.infoblocks, defaults.infoblocks) &&
            sameSet(composition.ers, defaults.ers) &&
            sameSet(composition.erPackets, defaults.erPackets);
        if (untouched) return [];
        return [
            violation(
                'complect/not-changing',
                `Внесены изменения в неизменяемый комплект «${ctx.complect.title}»`,
                'warning',
            ),
        ];
    },
};
