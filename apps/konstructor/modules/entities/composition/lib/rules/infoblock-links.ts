import { getComplectRuleFlags } from '../../../catalog';
import {
    violation,
    type Composition,
    type CompositionCtx,
    type Rule,
    type RuleResult,
    type RuleViolation,
} from '../../model/types';
import { addUnique, remove } from '../utils';

/**
 * Инфоблоки (legacy fillingInfoblocks + fillingFreeblocksWithUncheck + noChanged
 * + onRegionInfoblockChange):
 * - блок с родителем и весом 0 («Доп. материалы») нельзя переключать отдельно —
 *   он следует за родителем;
 * - арбитражная практика (lv/la/laa) ⇄ бесплатный онлайн-архив online2;
 * - практика судов общей юрисдикции (lgeneral) ⇄ архив online1;
 * - noChanged комплекта (флаг) — блок снять нельзя;
 * - рутовый блок «Региональное законодательство» (reg) тянет за собой текущий
 *   регион сборки: включили — регион в составе, выключили — регион снят.
 */

export const ARBITRATION_CODES = ['lv', 'la', 'laa'];
export const GENERAL_COURT_CODE = 'lgeneral';
export const ARBITRATION_FREE = 'online2';
export const GENERAL_FREE = 'online1';
export const REGION_ROOT_CODE = 'reg';

export const applyInfoblockToggle = (
    composition: Composition,
    code: string,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    const violations: RuleViolation[] = [];
    const autoFixes: string[] = [];
    const block = ctx.catalog.infoblocks[code];
    const flags = getComplectRuleFlags(ctx.complect);

    // «Доп. материалы» — только вместе с родителем
    if (block && block.weight === 0 && block.parents.length > 0) {
        return {
            composition,
            violations: [
                violation(
                    'infoblock/child-locked',
                    `«${block.name}» переключается только вместе с основным блоком`,
                ),
            ],
            autoFixes: [],
        };
    }

    // Неотключаемые блоки комплекта (legacy noChanged)
    if (!checked && flags.noChanged?.includes(code)) {
        return {
            composition,
            violations: [
                violation(
                    'infoblock/no-changed',
                    `«${block?.name ?? code}» входит в комплект «${ctx.complect.title}» и не снимается`,
                ),
            ],
            autoFixes: [],
        };
    }

    let next: Composition = {
        ...composition,
        infoblocks: checked
            ? addUnique(composition.infoblocks, code)
            : remove(composition.infoblocks, code),
    };

    // Дочерние блоки следуют за родителем
    if (block?.children?.length) {
        for (const childCode of block.children) {
            const child = ctx.catalog.infoblocks[childCode];
            if (!child || child.weight !== 0) continue;
            next = {
                ...next,
                infoblocks: checked
                    ? addUnique(next.infoblocks, childCode)
                    : remove(next.infoblocks, childCode),
            };
            autoFixes.push(
                checked
                    ? `Добавлен связанный блок «${child.name}»`
                    : `Убран связанный блок «${child.name}»`,
            );
        }
    }

    // Судебная практика ⇄ бесплатные онлайн-архивы
    if (ARBITRATION_CODES.includes(code)) {
        const hasArbitration = ARBITRATION_CODES.some(item =>
            next.infoblocks.includes(item),
        );
        const inFree = next.freeBlocks.includes(ARBITRATION_FREE);
        if (hasArbitration && !inFree) {
            next = {
                ...next,
                freeBlocks: addUnique(next.freeBlocks, ARBITRATION_FREE),
            };
            autoFixes.push('Добавлен онлайн-архив арбитражных судов');
        }
        if (!hasArbitration && inFree) {
            next = {
                ...next,
                freeBlocks: remove(next.freeBlocks, ARBITRATION_FREE),
            };
            autoFixes.push('Убран онлайн-архив арбитражных судов');
        }
    }
    if (code === GENERAL_COURT_CODE) {
        const inFree = next.freeBlocks.includes(GENERAL_FREE);
        if (checked && !inFree) {
            next = { ...next, freeBlocks: addUnique(next.freeBlocks, GENERAL_FREE) };
            autoFixes.push('Добавлен архив практики мировых судей');
        }
        if (!checked && inFree) {
            next = { ...next, freeBlocks: remove(next.freeBlocks, GENERAL_FREE) };
            autoFixes.push('Убран архив практики мировых судей');
        }
    }

    // Рутовый региональный блок ⇄ текущий регион сборки
    if (code === REGION_ROOT_CODE && ctx.regionCode) {
        const region = ctx.catalog.regions.byCode[ctx.regionCode];
        const inRegions = next.regions.includes(ctx.regionCode);
        if (checked && !inRegions) {
            next = { ...next, regions: addUnique(next.regions, ctx.regionCode) };
            autoFixes.push(`Регион «${region?.title ?? ctx.regionCode}» добавлен в состав`);
        }
        if (!checked && inRegions) {
            next = { ...next, regions: remove(next.regions, ctx.regionCode) };
            autoFixes.push(`Регион «${region?.title ?? ctx.regionCode}» снят`);
        }
    }

    return { composition: next, violations, autoFixes };
};

export const infoblockRule: Rule = {
    code: 'infoblock',
    actions: ['toggleInfoblock'],
    apply: (composition, action, ctx) =>
        action.kind === 'toggleInfoblock'
            ? applyInfoblockToggle(composition, action.code, action.checked, ctx)
            : null,
};
