import type { Catalog, KService } from '../../../catalog';
import {
    violation,
    type Composition,
    type CompositionCtx,
    type LtOtherPacket,
    type Rule,
    type RuleResult,
    type RuleViolation,
} from '../../model/types';
import { addUnique, remove } from '../utils';
import { ltServiceWeight } from './lt';

/**
 * Дополнительные пакеты Legal Tech (легаси modules/legal-tech-other):
 * - пакет — произвольный набор LT-сервисов, подбирается из каталога по
 *   суммарному весу (2 / 4 / 5 / 10);
 * - вес 4 («Средний пакет (Устаревший)») — только сервисному отделу;
 *   без правил (mode free) доступен всем — единственное, что меняет режим;
 * - несобранный пакет (вес не совпал ни с одним пакетом, пусто) — подсветка
 *   warning, сборка продолжается, строки в сете у такого пакета нет.
 */

/** Вес среднего пакета, закрытого для отдела продаж */
export const LT_OTHER_MEDIUM_WEIGHT = 4;

export const ltOtherPacketWeight = (
    packet: LtOtherPacket,
    catalog?: Catalog,
): number =>
    packet.services.reduce(
        (sum, code) => sum + ltServiceWeight(code, catalog),
        0,
    );

export interface ResolveLtOtherOptions {
    serviceDepartment?: boolean;
    mode?: Composition['mode'];
}

/**
 * Пакет каталога для набора сервисов. Средний пакет (вес 4) отдел продаж
 * получает только без правил.
 */
export const resolveLtOtherPackage = (
    catalog: Catalog,
    packet: LtOtherPacket,
    options: ResolveLtOtherOptions = {},
): KService | null => {
    const weight = ltOtherPacketWeight(packet, catalog);
    if (weight === 0) return null;
    const mediumLocked =
        weight === LT_OTHER_MEDIUM_WEIGHT &&
        !options.serviceDepartment &&
        options.mode !== 'free';
    if (mediumLocked) return null;
    return catalog.services.ltPackages.find(pkg => pkg.weight === weight) ?? null;
};

/** Имя пакета для строки и карточки: своё → каталожное → заглушка */
export const ltOtherPacketTitle = (
    packet: LtOtherPacket,
    pkg: KService | null,
): string =>
    packet.alternativeName?.trim() || pkg?.fullName || pkg?.name || 'Пакет LT не собран';

const resolveOptions = (
    composition: Composition,
    ctx: CompositionCtx,
): ResolveLtOtherOptions => ({
    serviceDepartment: ctx.serviceDepartment,
    mode: composition.mode,
});

/** Нарушения по пакетам LT-other: пустой, вес без пакета, средний у продаж */
export const validateLtOther = (
    composition: Composition,
    ctx: CompositionCtx,
): RuleViolation[] => {
    const violations: RuleViolation[] = [];
    composition.ltOther.forEach((packet, index) => {
        const label = `Пакет LT №${index + 1}`;
        const weight = ltOtherPacketWeight(packet, ctx.catalog);
        if (weight === 0) {
            violations.push(
                violation(`lt-other/empty:${packet.id}`, `${label}: сервисы не выбраны`, 'warning'),
            );
            return;
        }
        if (resolveLtOtherPackage(ctx.catalog, packet, resolveOptions(composition, ctx))) return;
        const mediumLocked =
            weight === LT_OTHER_MEDIUM_WEIGHT &&
            !ctx.serviceDepartment &&
            composition.mode !== 'free';
        violations.push(
            violation(
                `lt-other/invalid-packet-weight:${packet.id}`,
                mediumLocked
                    ? `${label}: средний пакет (вес 4) доступен только сервисному отделу`
                    : `${label}: вес ${weight} не соответствует ни одному пакету`,
                'warning',
            ),
        );
    });
    return violations;
};

const updatePacket = (
    composition: Composition,
    id: string,
    update: (packet: LtOtherPacket) => LtOtherPacket,
): Composition => ({
    ...composition,
    ltOther: composition.ltOther.map(packet =>
        packet.id === id ? update(packet) : packet,
    ),
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

export const renameLtOtherPacket = (
    composition: Composition,
    id: string,
    name: string | null,
): Composition =>
    updatePacket(composition, id, packet => ({
        ...packet,
        alternativeName: name?.trim() ? name.trim() : null,
    }));

const applyLtOther = (
    composition: Composition,
    next: Composition,
    ctx: CompositionCtx,
): RuleResult => ({
    composition: next,
    violations: validateLtOther(next, ctx),
    autoFixes: [],
});

export const ltOtherRule: Rule = {
    code: 'lt-other',
    actions: [
        'addLtOtherPacket',
        'removeLtOtherPacket',
        'toggleLtOtherService',
        'renameLtOtherPacket',
    ],
    apply: (composition, action, ctx) => {
        switch (action.kind) {
            case 'addLtOtherPacket':
                return applyLtOther(composition, addLtOtherPacket(composition, action.id), ctx);
            case 'removeLtOtherPacket':
                return applyLtOther(composition, removeLtOtherPacket(composition, action.id), ctx);
            case 'toggleLtOtherService':
                return applyLtOther(
                    composition,
                    toggleLtOtherService(composition, action.id, action.code, action.checked),
                    ctx,
                );
            case 'renameLtOtherPacket':
                return applyLtOther(
                    composition,
                    renameLtOtherPacket(composition, action.id, action.name),
                    ctx,
                );
            default:
                return null;
        }
    },
    validate: validateLtOther,
};
