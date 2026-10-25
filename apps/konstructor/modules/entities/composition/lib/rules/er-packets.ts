import { getComplectRuleFlags } from '../../../catalog';
import {
    violation,
    type Composition,
    type CompositionCtx,
    type Rule,
    type RuleResult,
    type RuleViolation,
} from '../../model/types';
import { addUnique, remove, union } from '../utils';

/**
 * ЭР и пакеты ЭР (legacy fillingEr / fillingPketsEr):
 * - выключение ЭР, входящей в активный пакет, «разваливает» пакет:
 *   пакет снимается, остальные его ЭР переезжают в отдельные ers;
 * - комплект с флагом erPacketsRequired (Офис: 2) держит ровно столько
 *   пакетов: лишний вытесняет самый старый, ниже нельзя;
 * - ersInPacket — производное: объединение составов активных пакетов.
 */

const recalcErsInPacket = (
    composition: Composition,
    ctx: CompositionCtx,
): Composition => {
    const covered = union(
        ...composition.erPackets.map(
            packet => ctx.catalog.infoblocks[packet]?.children ?? [],
        ),
    );
    return {
        ...composition,
        ersInPacket: covered,
        // отдельная ЭР не дублирует ЭР из пакета
        ers: composition.ers.filter(code => !covered.includes(code)),
    };
};

export const applyErToggle = (
    composition: Composition,
    code: string,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    const autoFixes: string[] = [];

    if (checked) {
        const next = recalcErsInPacket(
            { ...composition, ers: addUnique(composition.ers, code) },
            ctx,
        );
        return { composition: next, violations: [], autoFixes };
    }

    // Выключаем ЭР, покрытую пакетом → пакет разваливается
    const owningPacket = composition.erPackets.find(packet =>
        (ctx.catalog.infoblocks[packet]?.children ?? []).includes(code),
    );
    if (owningPacket) {
        const packetErs = ctx.catalog.infoblocks[owningPacket]?.children ?? [];
        const rest = packetErs.filter(item => item !== code);
        const next = recalcErsInPacket(
            {
                ...composition,
                erPackets: remove(composition.erPackets, owningPacket),
                ers: union(composition.ers, rest),
            },
            ctx,
        );
        autoFixes.push(
            `Пакет «${ctx.catalog.infoblocks[owningPacket]?.name ?? owningPacket}» расформирован, остальные ЭР сохранены отдельно`,
        );
        return { composition: next, violations: [], autoFixes };
    }

    const next = recalcErsInPacket(
        { ...composition, ers: remove(composition.ers, code) },
        ctx,
    );
    return { composition: next, violations: [], autoFixes };
};

export const applyErPacketToggle = (
    composition: Composition,
    code: string,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    const violations: RuleViolation[] = [];
    const autoFixes: string[] = [];
    const required = getComplectRuleFlags(ctx.complect).erPacketsRequired;

    let erPackets = checked
        ? addUnique(composition.erPackets, code)
        : remove(composition.erPackets, code);

    if (required) {
        if (!checked && erPackets.length < required) {
            return {
                composition,
                violations: [
                    violation(
                        'er-packets/office-two-required',
                        `В комплекте «${ctx.complect.title}» должны содержаться ${required} любых Пакета ЭР`,
                    ),
                ],
                autoFixes: [],
            };
        }
        if (checked && erPackets.length > required) {
            // Лишний пакет вытесняет самый старый
            const removed = erPackets[0];
            erPackets = erPackets.slice(1);
            if (removed) {
                autoFixes.push(
                    `Пакет «${ctx.catalog.infoblocks[removed]?.name ?? removed}» заменён (в комплекте ровно ${required} пакета ЭР)`,
                );
            }
        }
    }

    const next = recalcErsInPacket({ ...composition, erPackets }, ctx);
    return { composition: next, violations, autoFixes };
};

export const erRule: Rule = {
    code: 'er',
    actions: ['toggleEr', 'toggleErPacket'],
    apply: (composition, action, ctx) => {
        if (action.kind === 'toggleEr') {
            return applyErToggle(composition, action.code, action.checked, ctx);
        }
        if (action.kind === 'toggleErPacket') {
            return applyErPacketToggle(composition, action.code, action.checked, ctx);
        }
        return null;
    },
};
