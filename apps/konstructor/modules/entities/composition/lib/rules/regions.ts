import type { Composition, CompositionCtx, Rule, RuleResult } from '../../model/types';
import { addUnique, remove } from '../utils';
import { REGION_ROOT_CODE } from './infoblock-links';

/**
 * Регионы в составе (legacy region-thunks / region-util): каждый регион
 * +0.5 веса, рутовый блок «Региональное законодательство» +0.5. Добавление
 * региона включает рутовый блок (иначе регион в составе «висит» без раздела);
 * снятие региона рутовый блок не трогает — как в легаси.
 */
export const applyRegionToggle = (
    composition: Composition,
    code: string,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    const autoFixes: string[] = [];
    let next: Composition = {
        ...composition,
        regions: checked
            ? addUnique(composition.regions, code)
            : remove(composition.regions, code),
    };
    if (checked && !next.infoblocks.includes(REGION_ROOT_CODE)) {
        next = { ...next, infoblocks: addUnique(next.infoblocks, REGION_ROOT_CODE) };
        autoFixes.push(
            `Включён блок «${ctx.catalog.infoblocks[REGION_ROOT_CODE]?.name ?? 'Региональное законодательство'}»`,
        );
    }
    return { composition: next, violations: [], autoFixes };
};

export const regionsRule: Rule = {
    code: 'regions',
    actions: ['toggleRegion'],
    apply: (composition, action, ctx) =>
        action.kind === 'toggleRegion'
            ? applyRegionToggle(composition, action.code, action.checked, ctx)
            : null,
};
