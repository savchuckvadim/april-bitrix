import type { Catalog } from '../../../catalog';
import {
    getComplectRuleFlags,
    LT_CODE_WEIGHT,
    LT_PACKAGE_BY_WEIGHT,
} from '../../../catalog';
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
 * Legal Tech (legacy fillingLt + weightLt), пороги — из флагов комплекта:
 * - minFreeLt (Офис / Эксперт в закупках: 5): первые 5 бесплатно, сверх —
 *   в платный пакет; при падении ниже — сервис поднимается из пакета;
 * - exactFreeLt (прочие PROF: 2): ровно 2 бесплатных, сверх — платно, ниже
 *   нельзя; keepLtCode (Эксперт PRO: ltdisk) — при опустошении остаётся он;
 * - универсал: весь LT платный (ltInPacket);
 * - «ЧекДок» и прочие тяжёлые сервисы (вес 2) занимают два бесплатных слота
 *   (легаси withDoubleLt);
 * - платный пакет подбирается по суммарному весу ltInPacket (2/5/10),
 *   иной вес — нарушение «LT собран неверно».
 */

/**
 * Вес LT-сервиса: источник истины — каталог (БД); статическая таблица —
 * только fallback для тестов и маппинга легаси-слепков.
 */
export const ltServiceWeight = (code: string, catalog?: Catalog): number =>
    catalog?.services.lt.find(service => service.code === code)?.weight ??
    LT_CODE_WEIGHT[code] ??
    1;

const weightOf = (codes: readonly string[], catalog?: Catalog): number =>
    codes.reduce((sum, code) => sum + ltServiceWeight(code, catalog), 0);

export const ltPacketWeight = (
    composition: Composition,
    catalog?: Catalog,
): number => weightOf(composition.ltInPacket, catalog);

/** Занятые бесплатные слоты: сумма весов бесплатных сервисов (ЧекДок = 2) */
export const ltFreeWeight = (composition: Composition, catalog?: Catalog): number =>
    weightOf(composition.lt, catalog);

/** Нарушения по платному пакету LT (вес должен соответствовать пакету из каталога) */
export const validateLtPacket = (
    composition: Composition,
    catalog?: Catalog,
): RuleViolation[] => {
    const weight = ltPacketWeight(composition, catalog);
    if (weight === 0) return [];
    const packageExists = catalog
        ? catalog.services.ltPackages.some(pkg => pkg.weight === weight)
        : Boolean(LT_PACKAGE_BY_WEIGHT[weight]);
    if (packageExists) return [];
    return [
        violation(
            'lt/invalid-packet-weight',
            `LT собран неверно: суммарный вес платных сервисов ${weight} не соответствует ни одному пакету`,
            // подсветка: сборка продолжается, пакет менеджер добивает сам
            'warning',
        ),
    ];
};

/** Лимит бесплатных слотов по весу; 0 — всё платно (универсал) */
const freeLimit = (ctx: CompositionCtx): number => {
    const flags = getComplectRuleFlags(ctx.complect);
    if (ctx.complect.type === 'universal') return 0;
    return flags.minFreeLt ?? flags.exactFreeLt ?? 0;
};

export const applyLtToggle = (
    composition: Composition,
    code: string,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    const autoFixes: string[] = [];
    const flags = getComplectRuleFlags(ctx.complect);
    const limit = freeLimit(ctx);
    const { catalog } = ctx;

    let next: Composition = {
        ...composition,
        lt: remove(composition.lt, code),
        ltInPacket: remove(composition.ltInPacket, code),
    };

    if (checked) {
        const freeWeight = ltFreeWeight(next, catalog);
        const fitsFree =
            limit > 0 && freeWeight + ltServiceWeight(code, catalog) <= limit;
        if (fitsFree) {
            next = { ...next, lt: addUnique(next.lt, code) };
        } else {
            next = { ...next, ltInPacket: addUnique(next.ltInPacket, code) };
            if (limit > 0) {
                autoFixes.push('Лимит бесплатных LT исчерпан — сервис добавлен платно');
            }
        }
    } else {
        const wasFree = composition.lt.includes(code);
        const freeWeight = ltFreeWeight(next, catalog);

        if (wasFree && flags.minFreeLt && freeWeight < flags.minFreeLt) {
            // Поднимаем сервис из платного пакета в бесплатные
            const promoted = next.ltInPacket[0];
            if (promoted) {
                next = {
                    ...next,
                    lt: addUnique(next.lt, promoted),
                    ltInPacket: remove(next.ltInPacket, promoted),
                };
                autoFixes.push('Сервис из платного пакета переведён в бесплатные');
            } else {
                return {
                    composition,
                    violations: [
                        violation(
                            'lt/min-five-required',
                            `В комплекте «${ctx.complect.title}» должно быть минимум ${flags.minFreeLt} сервисов Legal Tech`,
                        ),
                    ],
                    autoFixes: [],
                };
            }
        }

        if (
            wasFree &&
            flags.exactFreeLt &&
            freeWeight < flags.exactFreeLt &&
            !flags.keepLtCode
        ) {
            return {
                composition,
                violations: [
                    violation(
                        'lt/two-required',
                        `В комплекте «${ctx.complect.title}» должно быть ${flags.exactFreeLt} сервиса Legal Tech`,
                    ),
                ],
                autoFixes: [],
            };
        }

        if (flags.keepLtCode && next.lt.length === 0 && next.ltInPacket.length === 0) {
            next = { ...next, lt: [flags.keepLtCode] };
            const kept = catalog.services.lt.find(service => service.code === flags.keepLtCode);
            autoFixes.push(
                `${ctx.complect.title}: возвращён сервис «${kept?.name ?? flags.keepLtCode}»`,
            );
        }
    }

    return {
        composition: next,
        violations: validateLtPacket(next, catalog),
        autoFixes,
    };
};

export const ltRule: Rule = {
    code: 'lt',
    actions: ['toggleLt'],
    apply: (composition, action, ctx) =>
        action.kind === 'toggleLt'
            ? applyLtToggle(composition, action.code, action.checked, ctx)
            : null,
    validate: (composition, ctx) => validateLtPacket(composition, ctx.catalog),
};
