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
 * ЭР и пакеты ЭР (legacy fillingEr / fillingPketsEr, encyclopedias-utils).
 *
 * Вес: отдельная ЭР — 0.5, пакет — 1, ЭР внутри пакета — 0 (считает weight.ts:
 * ers + erPackets, ersInPacket не весит). Пакет и отдельные ЭР могут идти вместе.
 *
 * Правила:
 * - обычный комплект держит один пакет: новый заменяет прежний, снятие — без пакета;
 * - Офис (флаг erPacketsRequired) держит ровно два любых: снятие одного подставляет
 *   оставшийся, третий вытесняет самый старый;
 * - снятие ЭР из пакета разваливает пакет: он снимается, остальные его ЭР
 *   переезжают в отдельные (по 0.5). В Офисе пакеты не разваливаются — ЭР не снять;
 * - без правил (mode free) лимитов нет, но структура та же: ersInPacket остаётся
 *   производным от активных пакетов, развал пакета работает.
 *
 * Сознательное отличие от легаси: при смене пакета Офиса отдельные ЭР сохраняются
 * (легаси молча их очищал) — снимаются только те, что теперь покрыты пакетом.
 */

/** Сколько пакетов держит обычный комплект (легаси packetsEr = [index]) */
const SINGLE_PACKET_LIMIT = 1;

/** Группа пакетов ЭР в каталоге */
const ER_PACKET_GROUP_CODE = 'per';

const packetName = (code: string, ctx: CompositionCtx): string =>
    ctx.catalog.infoblocks[code]?.name ?? code;

const packetChildren = (code: string, ctx: CompositionCtx): string[] =>
    ctx.catalog.infoblocks[code]?.children ?? [];

const availablePackets = (ctx: CompositionCtx): string[] =>
    ctx.catalog.groups.find(group => group.code === ER_PACKET_GROUP_CODE)
        ?.infoblockCodes ?? [];

const withRules = (composition: Composition): boolean =>
    composition.mode !== 'free';

const recalcErsInPacket = (
    composition: Composition,
    ctx: CompositionCtx,
): Composition => {
    const covered = union(
        ...composition.erPackets.map(packet => packetChildren(packet, ctx)),
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
    if (checked) {
        const next = recalcErsInPacket(
            { ...composition, ers: addUnique(composition.ers, code) },
            ctx,
        );
        return { composition: next, violations: [], autoFixes: [] };
    }

    const owningPacket = composition.erPackets.find(packet =>
        packetChildren(packet, ctx).includes(code),
    );
    if (!owningPacket) {
        const next = recalcErsInPacket(
            { ...composition, ers: remove(composition.ers, code) },
            ctx,
        );
        return { composition: next, violations: [], autoFixes: [] };
    }

    const required = getComplectRuleFlags(ctx.complect).erPacketsRequired;
    if (required && withRules(composition)) {
        return {
            composition,
            violations: [
                violation(
                    'er-packets/office-er-in-packet',
                    `В комплекте «${ctx.complect.title}» ЭР входит в пакет и снимается только вместе с ним`,
                ),
            ],
            autoFixes: [],
        };
    }

    // Выключаем ЭР, покрытую пакетом → пакет разваливается
    const rest = packetChildren(owningPacket, ctx).filter(item => item !== code);
    const next = recalcErsInPacket(
        {
            ...composition,
            erPackets: remove(composition.erPackets, owningPacket),
            ers: union(composition.ers, rest),
        },
        ctx,
    );
    return {
        composition: next,
        violations: [],
        autoFixes: [
            `Пакет «${packetName(owningPacket, ctx)}» расформирован, остальные ЭР сохранены отдельно`,
        ],
    };
};

export const applyErPacketToggle = (
    composition: Composition,
    code: string,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    const autoFixes: string[] = [];
    const required = getComplectRuleFlags(ctx.complect).erPacketsRequired;
    const limit = required ?? SINGLE_PACKET_LIMIT;

    let erPackets = checked
        ? addUnique(composition.erPackets, code)
        : remove(composition.erPackets, code);

    if (withRules(composition)) {
        if (!checked && required && erPackets.length < required) {
            // Офис: вместо снятого — оставшийся пакет, иначе их станет меньше нужного
            const replacement = availablePackets(ctx).find(
                packet => packet !== code && !erPackets.includes(packet),
            );
            if (!replacement) {
                return {
                    composition,
                    violations: [
                        violation(
                            'er-packets/office-two-required',
                            `В комплекте «${ctx.complect.title}» должны содержаться ${required} любых пакета ЭР`,
                        ),
                    ],
                    autoFixes: [],
                };
            }
            erPackets = [...erPackets, replacement];
            autoFixes.push(
                `В комплекте «${ctx.complect.title}» ровно ${required} пакета ЭР: вместо «${packetName(code, ctx)}» — «${packetName(replacement, ctx)}»`,
            );
        }
        if (checked && erPackets.length > limit) {
            // Лишний пакет вытесняет самый старый
            const removed = erPackets.slice(0, erPackets.length - limit);
            erPackets = erPackets.slice(-limit);
            autoFixes.push(
                `Пакет «${removed.map(item => packetName(item, ctx)).join('», «')}» заменён на «${packetName(code, ctx)}»`,
            );
        }
    }

    const next = recalcErsInPacket({ ...composition, erPackets }, ctx);
    return { composition: next, violations: [], autoFixes };
};

/** Подсветка: число пакетов (восстановленный слепок, режим без правил) */
export const validateErPackets = (
    composition: Composition,
    ctx: CompositionCtx,
): RuleViolation[] => {
    const count = composition.erPackets.length;
    const required = getComplectRuleFlags(ctx.complect).erPacketsRequired;
    if (required) {
        return count === required
            ? []
            : [
                  violation(
                      'er-packets/office-count',
                      `В комплекте «${ctx.complect.title}» должно быть ровно ${required} пакета ЭР, сейчас: ${count}`,
                      'warning',
                  ),
              ];
    }
    return count > SINGLE_PACKET_LIMIT
        ? [
              violation(
                  'er-packets/too-many',
                  `В комплекте «${ctx.complect.title}» может быть только один пакет ЭР, сейчас: ${count}`,
                  'warning',
              ),
          ]
        : [];
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
    validate: validateErPackets,
};
