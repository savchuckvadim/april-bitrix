import type { KComplect } from '@/modules/entities/catalog';
import {
    checkComplectWeight,
    pickUniversalComplect,
    type Composition,
    type CompositionCtx,
} from '@/modules/entities/composition';

/** Вес наполнения вышел за комплект Универсала: что подсказать менеджеру */
export interface UniversalHint {
    current: KComplect;
    weight: number;
    expected: number;
    /** Комплект, под который подходит вес (может совпасть с текущим); null — вес меньше самого лёгкого */
    target: KComplect | null;
}

/**
 * Подсказка только для Универсала, где комплект назван по весу (легаси
 * SET_WEIGHT_AND_NAME_OF_UNIVERSAL_COMPLECT): вес не сходится с комплектом —
 * показываем, на какой комплект перейти. Сама смена идёт по кнопке менеджера.
 */
export const describeUniversalHint = (
    composition: Composition,
    ctx: CompositionCtx,
): UniversalHint | null => {
    if (ctx.complect.type !== 'universal') return null;
    const check = checkComplectWeight(composition, ctx);
    if (check.matches) return null;

    return {
        current: ctx.complect,
        weight: check.weight,
        expected: check.expected,
        target: pickUniversalComplect(check.weight, ctx.catalog.complects.universal),
    };
};

/** Комплект, на который можно перейти кнопкой: подходящий по весу и другой, чем текущий */
export const universalSwitchTarget = (hint: UniversalHint): KComplect | null =>
    hint.target && hint.target.code !== hint.current.code ? hint.target : null;

export const formatUniversalHint = (hint: UniversalHint): string => {
    const base = `Вес наполнения ${hint.weight} не совпадает с комплектом «${hint.current.title}» (${hint.expected}).`;
    if (!hint.target) return `${base} Вес меньше самого лёгкого комплекта линейки.`;
    if (hint.target.code === hint.current.code) {
        return `${base} Уберите лишнее или добавьте блоки до веса следующего комплекта.`;
    }
    return `${base} Подходит «${hint.target.title}» (${hint.target.weight}).`;
};
