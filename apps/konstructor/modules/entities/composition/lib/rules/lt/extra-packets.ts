import type { Catalog, KService } from '../../../../catalog';
import {
    violation,
    type Composition,
    type CompositionCtx,
    type LtOtherPacket,
    type Rule,
    type RuleResult,
    type RuleViolation,
} from '../../../model/types';
import { addUnique, remove } from '../../utils';
import {
    describeLtPackets,
    findLtPackage,
    ltPacketHint,
    LT_RESTRICTED_WEIGHT,
    type LtPackageOptions,
} from './packets';
import { ltWeightOf } from './weights';

/**
 * Дополнительные пакеты Legal Tech (легаси modules/legal-tech-other): сколько
 * угодно пакетов, у каждого своё наполнение; пакет каталога — по сумме весов.
 * Несобранный пакет подсвечивается, сборка продолжается, строки в наборе нет.
 */

export const ltOtherPacketWeight = (packet: LtOtherPacket, catalog?: Catalog): number =>
    ltWeightOf(packet.services, catalog);

export const resolveLtOtherPackage = (
    catalog: Catalog,
    packet: LtOtherPacket,
    options: LtPackageOptions = {},
): KService | null => findLtPackage(catalog, ltOtherPacketWeight(packet, catalog), options);

/** Пустой пакет, вес без пакета, вес закрыт для отдела. */
export const validateLtOther = (composition: Composition, ctx: CompositionCtx): RuleViolation[] =>
    describeLtPackets(composition, ctx)
        .filter(packet => packet.kind === 'extra')
        .flatMap((packet, index) => {
            const label = `Пакет LT №${index + 1}`;
            if (packet.status === 'empty') {
                return [violation(`lt-other/empty:${packet.id}`, `${label}: сервисы не выбраны`, 'warning')];
            }
            if (packet.status === 'locked') {
                return [
                    violation(
                        `lt-other/invalid-packet-weight:${packet.id}`,
                        `${label}: пакет веса ${LT_RESTRICTED_WEIGHT} доступен только сервисному отделу`,
                        'warning',
                    ),
                ];
            }
            if (packet.status === 'incomplete') {
                return [
                    violation(
                        `lt-other/invalid-packet-weight:${packet.id}`,
                        `${label}. ${ltPacketHint(packet)}`,
                        'warning',
                    ),
                ];
            }
            return [];
        });

const updatePacket = (
    composition: Composition,
    id: string,
    update: (packet: LtOtherPacket) => LtOtherPacket,
): Composition => ({
    ...composition,
    ltOther: composition.ltOther.map(packet => (packet.id === id ? update(packet) : packet)),
});

export const addLtOtherPacket = (composition: Composition, id: string): Composition =>
    composition.ltOther.some(packet => packet.id === id)
        ? composition
        : {
              ...composition,
              ltOther: [...composition.ltOther, { id, services: [], alternativeName: null }],
          };

export const removeLtOtherPacket = (composition: Composition, id: string): Composition => ({
    ...composition,
    ltOther: composition.ltOther.filter(packet => packet.id !== id),
});

export const toggleLtOtherService = (
    composition: Composition,
    id: string,
    code: string,
    checked: boolean,
): Composition =>
    updatePacket(composition, id, packet => ({
        ...packet,
        services: checked ? addUnique(packet.services, code) : remove(packet.services, code),
    }));

export const renameLtOtherPacket = (composition: Composition, id: string, name: string | null): Composition =>
    updatePacket(composition, id, packet => ({
        ...packet,
        alternativeName: name?.trim() ? name.trim() : null,
    }));

const settled = (next: Composition, ctx: CompositionCtx): RuleResult => ({
    composition: next,
    violations: validateLtOther(next, ctx),
    autoFixes: [],
});

export const ltOtherRule: Rule = {
    code: 'lt-other',
    actions: ['addLtOtherPacket', 'removeLtOtherPacket', 'toggleLtOtherService', 'renameLtOtherPacket'],
    apply: (composition, action, ctx) => {
        switch (action.kind) {
            case 'addLtOtherPacket':
                return settled(addLtOtherPacket(composition, action.id), ctx);
            case 'removeLtOtherPacket':
                return settled(removeLtOtherPacket(composition, action.id), ctx);
            case 'toggleLtOtherService':
                return settled(toggleLtOtherService(composition, action.id, action.code, action.checked), ctx);
            case 'renameLtOtherPacket':
                return settled(renameLtOtherPacket(composition, action.id, action.name), ctx);
            default:
                return null;
        }
    },
    validate: validateLtOther,
};
