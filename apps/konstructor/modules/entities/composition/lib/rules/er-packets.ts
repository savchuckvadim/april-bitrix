import type {
    Composition,
    CompositionCtx,
    RuleResult,
    RuleViolation,
} from '../../model/types';
import { addUnique, remove, union } from '../utils';

/**
 * ЭР и пакеты ЭР (legacy fillingEr / fillingPketsEr):
 * - выключение ЭР, входящей в активный пакет, «разваливает» пакет:
 *   пакет снимается, остальные его ЭР переезжают в отдельные ers;
 * - «Офис» — всегда ровно 2 пакета ЭР;
 * - ersInPacket — производное: объединение составов активных пакетов.
 */

const OFFICE_CODE = 'office';
const OFFICE_PACKETS_REQUIRED = 2;

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
    const isOffice = ctx.complect.code === OFFICE_CODE;

    let erPackets = checked
        ? addUnique(composition.erPackets, code)
        : remove(composition.erPackets, code);

    if (isOffice) {
        if (!checked && erPackets.length < OFFICE_PACKETS_REQUIRED) {
            return {
                composition,
                violations: [
                    {
                        code: 'er-packets/office-two-required',
                        message:
                            'В комплекте Гарант-Офис должны содержаться два любых Пакета ЭР',
                    },
                ],
                autoFixes: [],
            };
        }
        if (checked && erPackets.length > OFFICE_PACKETS_REQUIRED) {
            // Третий пакет вытесняет самый старый
            const removed = erPackets[0];
            erPackets = erPackets.slice(1);
            if (removed) {
                autoFixes.push(
                    `Пакет «${ctx.catalog.infoblocks[removed]?.name ?? removed}» заменён (в Офисе ровно два пакета ЭР)`,
                );
            }
        }
    }

    const next = recalcErsInPacket({ ...composition, erPackets }, ctx);
    return { composition: next, violations, autoFixes };
};
