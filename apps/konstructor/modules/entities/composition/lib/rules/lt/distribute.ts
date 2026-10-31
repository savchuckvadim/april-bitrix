import { getComplectRuleFlags } from '../../../../catalog';
import {
    violation,
    type Composition,
    type CompositionCtx,
    type LtPlacement,
    type Rule,
    type RuleResult,
    type RuleViolation,
} from '../../../model/types';
import { addUnique, remove } from '../../utils';
import { describeLtPackets, ltPacketHint } from './packets';
import { ltFreeLimit, ltFreeWeight, ltServiceWeight } from './weights';

/**
 * Галочки Legal Tech (легаси fillingLt): менеджер отмечает сервис, система
 * раскладывает. Сначала добираем бесплатные до лимита комплекта, сверх него —
 * в платный пакет. Сняли бесплатный — поднимаем платные с конца; поднимать
 * нечего — место остаётся свободным с предупреждением, замена сервиса не
 * блокируется. Тяжёлый сервис занимает места по весу. Без правил раскладка та
 * же, закреплённый сервис снимается, а сервис можно перенести вручную.
 */

const promoteFromPaid = (
    composition: Composition,
    ctx: CompositionCtx,
): { composition: Composition; promoted: string[] } => {
    const { catalog } = ctx;
    let next = composition;
    let room = ltFreeLimit(ctx.complect, catalog) - ltFreeWeight(composition, catalog);
    const promoted: string[] = [];
    for (const code of [...composition.ltInPacket].reverse()) {
        const weight = ltServiceWeight(code, catalog);
        if (weight > room) continue;
        next = { ...next, lt: addUnique(next.lt, code), ltInPacket: remove(next.ltInPacket, code) };
        room -= weight;
        promoted.push(code);
    }
    return { composition: next, promoted };
};

/** Раскладка без проверок: общая для режима правил и «без правил». */
export const distributeLt = (
    composition: Composition,
    code: string,
    checked: boolean,
    ctx: CompositionCtx,
): { composition: Composition; autoFixes: string[] } => {
    const { catalog } = ctx;
    const limit = ltFreeLimit(ctx.complect, catalog);
    const cleared: Composition = {
        ...composition,
        lt: remove(composition.lt, code),
        ltInPacket: remove(composition.ltInPacket, code),
    };

    if (checked) {
        const fitsFree = ltFreeWeight(cleared, catalog) + ltServiceWeight(code, catalog) <= limit;
        return fitsFree
            ? { composition: { ...cleared, lt: addUnique(cleared.lt, code) }, autoFixes: [] }
            : {
                  composition: { ...cleared, ltInPacket: addUnique(cleared.ltInPacket, code) },
                  autoFixes: limit > 0 ? ['Лимит бесплатных LT исчерпан — сервис добавлен платно'] : [],
              };
    }

    if (!composition.lt.includes(code)) return { composition: cleared, autoFixes: [] };
    const { composition: next, promoted } = promoteFromPaid(cleared, ctx);
    return {
        composition: next,
        autoFixes: promoted.length ? ['Сервис из платного пакета переведён в бесплатные'] : [],
    };
};

export const moveLtService = (composition: Composition, code: string, to: LtPlacement): Composition => {
    const inComposition = composition.lt.includes(code) || composition.ltInPacket.includes(code);
    if (!inComposition) return composition;
    const cleared = {
        ...composition,
        lt: remove(composition.lt, code),
        ltInPacket: remove(composition.ltInPacket, code),
    };
    return to === 'included'
        ? { ...cleared, lt: addUnique(cleared.lt, code) }
        : { ...cleared, ltInPacket: addUnique(cleared.ltInPacket, code) };
};

export const setLtSubtitle = (composition: Composition, code: string, subtitle: string | null): Composition => {
    const { [code]: _previous, ...rest } = composition.ltSubtitles ?? {};
    const trimmed = subtitle?.trim();
    return { ...composition, ltSubtitles: trimmed ? { ...rest, [code]: trimmed } : rest };
};

/** Подсветка: свободные бесплатные места и несобранный платный пакет. */
export const validateLt = (composition: Composition, ctx: CompositionCtx): RuleViolation[] =>
    describeLtPackets(composition, ctx).flatMap(packet => {
        if (packet.kind === 'included' && packet.limit && packet.weight < packet.limit) {
            return [
                violation(
                    'lt/free-under-limit',
                    `В комплекте «${ctx.complect.title}» бесплатных Legal Tech ${packet.weight} из ${packet.limit}: можно добавить ещё`,
                    'warning',
                ),
            ];
        }
        if (packet.kind !== 'paid') return [];
        if (packet.status === 'incomplete') {
            return [violation('lt/invalid-packet-weight', `Платный Legal Tech. ${ltPacketHint(packet)}`, 'warning')];
        }
        if (packet.status === 'locked') {
            return [
                violation(
                    'lt/locked-packet',
                    `Платный Legal Tech: пакет веса ${packet.weight} доступен только сервисному отделу. ${ltPacketHint(packet)}`,
                    'warning',
                ),
            ];
        }
        return [];
    });

export const applyLtToggle = (
    composition: Composition,
    code: string,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    const pinned = getComplectRuleFlags(ctx.complect).pinnedLt;
    if (!checked && code === pinned && composition.mode !== 'free') {
        const name = ctx.catalog.services.lt.find(service => service.code === code)?.name ?? code;
        return {
            composition,
            violations: [violation('lt/pinned', `В комплекте «${ctx.complect.title}» сервис «${name}» входит всегда`)],
            autoFixes: [],
        };
    }
    const result = distributeLt(composition, code, checked, ctx);
    return {
        composition: result.composition,
        violations: validateLt(result.composition, ctx),
        autoFixes: result.autoFixes,
    };
};

const settled = (composition: Composition, ctx: CompositionCtx): RuleResult => ({
    composition,
    violations: validateLt(composition, ctx),
    autoFixes: [],
});

export const ltRule: Rule = {
    code: 'lt',
    actions: ['toggleLt', 'moveLt', 'setLtSubtitle'],
    apply: (composition, action, ctx) => {
        switch (action.kind) {
            case 'toggleLt':
                return applyLtToggle(composition, action.code, action.checked, ctx);
            case 'moveLt':
                if (composition.mode !== 'free') {
                    return {
                        composition,
                        violations: [violation('lt/move-needs-free', 'Переносить сервис вручную можно только без правил')],
                        autoFixes: [],
                    };
                }
                return settled(moveLtService(composition, action.code, action.to), ctx);
            case 'setLtSubtitle':
                return settled(setLtSubtitle(composition, action.code, action.subtitle), ctx);
            default:
                return null;
        }
    },
    validate: validateLt,
};
