import { getComplectRuleFlags } from '../../../catalog';
import { violation, type CompositionCtx, type Rule, type RuleResult } from '../../model/types';
import type { Composition } from '../../model/types';
import {
    applyRegionsEdit,
    hasCompositionRegions,
    isRegionAction,
    REGION_ACTION_KINDS,
    type RegionAction,
} from '../regions-edit';
import { REGION_ROOT_CODE } from './infoblock-links';

/**
 * Регионы в составе (legacy region-thunks / region-util): два списка, «считать
 * вес» и «не считать». Рутовый блок «Региональное законодательство» следует за
 * регионами: появился регион — блок включается (иначе регион «висит» без
 * раздела), не осталось регионов — блок выключается. Комплект с неотключаемым
 * блоком (noChanged) последний регион снять не даёт.
 */
export const applyRegionsAction = (
    composition: Composition,
    action: RegionAction,
    ctx: CompositionCtx,
): RuleResult => {
    const next = applyRegionsEdit(composition, action);
    const rootName = ctx.catalog.infoblocks[REGION_ROOT_CODE]?.name ?? 'Региональное законодательство';
    const hadRoot = composition.infoblocks.includes(REGION_ROOT_CODE);
    const hasRoot = next.infoblocks.includes(REGION_ROOT_CODE);

    if (hadRoot && !hasRoot && getComplectRuleFlags(ctx.complect).noChanged?.includes(REGION_ROOT_CODE)) {
        return {
            composition,
            violations: [
                violation(
                    'regions/root-locked',
                    `«${rootName}» входит в комплект «${ctx.complect.title}» и не снимается: оставьте хотя бы один регион`,
                ),
            ],
            autoFixes: [],
        };
    }

    const autoFixes: string[] = [];
    if (!hadRoot && hasRoot) autoFixes.push(`Включён блок «${rootName}»`);
    if (hadRoot && !hasRoot && !hasCompositionRegions(next)) {
        autoFixes.push(`Блок «${rootName}» выключен: регионов не осталось`);
    }
    return { composition: next, violations: [], autoFixes };
};

export const regionsRule: Rule = {
    code: 'regions',
    actions: REGION_ACTION_KINDS,
    apply: (composition, action, ctx) =>
        isRegionAction(action) ? applyRegionsAction(composition, action, ctx) : null,
};
