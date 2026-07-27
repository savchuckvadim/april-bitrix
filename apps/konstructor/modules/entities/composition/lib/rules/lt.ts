import type { Catalog } from '../../../catalog';
import { LT_CODE_WEIGHT, LT_PACKAGE_BY_WEIGHT } from '../../../catalog';
import type {
    Composition,
    CompositionCtx,
    RuleResult,
    RuleViolation,
} from '../../model/types';
import { addUnique, remove } from '../utils';

/**
 * Legal Tech (legacy fillingLt):
 * - «Офис» / «Эксперт в закупках» (exzak): минимум 5 бесплатных LT;
 *   лишние — в платный пакет; при падении ниже 5 сервис поднимается из пакета;
 * - прочие PROF (кроме «Эксперт PRO»): ровно 2 бесплатных, сверх — платно;
 * - «Эксперт PRO» (expert): при опустошении остаётся ltdisk;
 * - универсальная линейка: весь LT платный (ltInPacket);
 * - платный пакет подбирается по суммарному весу ltInPacket (2/5/10),
 *   иной вес — нарушение «LT собран неверно».
 */

const MIN_FIVE_COMPLECTS = ['office', 'exzak'];
const EXPERT_CODE = 'expert';
const EXPERT_FALLBACK = 'ltdisk';

/**
 * Вес LT-сервиса: источник истины — каталог (БД); статическая таблица —
 * только fallback для тестов и маппинга легаси-слепков.
 */
export const ltServiceWeight = (code: string, catalog?: Catalog): number =>
    catalog?.services.lt.find(service => service.code === code)?.weight ??
    LT_CODE_WEIGHT[code] ??
    1;

export const ltPacketWeight = (
    composition: Composition,
    catalog?: Catalog,
): number =>
    composition.ltInPacket.reduce(
        (sum, code) => sum + ltServiceWeight(code, catalog),
        0,
    );

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
        {
            code: 'lt/invalid-packet-weight',
            message: `LT собран неверно: суммарный вес платных сервисов ${weight} не соответствует ни одному пакету`,
        },
    ];
};

const freeLimit = (ctx: CompositionCtx): number => {
    if (ctx.complect.type === 'universal') return 0;
    if (MIN_FIVE_COMPLECTS.includes(ctx.complect.code)) return Infinity; // минимум 5, сверху не ограничено
    return 2;
};

export const applyLtToggle = (
    composition: Composition,
    code: string,
    checked: boolean,
    ctx: CompositionCtx,
): RuleResult => {
    const violations: RuleViolation[] = [];
    const autoFixes: string[] = [];
    const isMinFive = MIN_FIVE_COMPLECTS.includes(ctx.complect.code);
    const limit = freeLimit(ctx);

    let next: Composition = composition;

    if (checked) {
        if (ctx.complect.type === 'universal') {
            // Универсал: всё платно
            next = {
                ...composition,
                ltInPacket: addUnique(composition.ltInPacket, code),
            };
        } else if (
            composition.lt.length < (isMinFive ? 5 : limit) ||
            isMinFive
        ) {
            // Бесплатный слот доступен (для office/exzak первые 5 бесплатны)
            const target =
                isMinFive && composition.lt.length >= 5 ? 'ltInPacket' : 'lt';
            if (!isMinFive && composition.lt.length >= limit) {
                next = {
                    ...composition,
                    ltInPacket: addUnique(composition.ltInPacket, code),
                };
                autoFixes.push('Лимит бесплатных LT исчерпан — сервис добавлен платно');
            } else if (target === 'lt') {
                next = { ...composition, lt: addUnique(composition.lt, code) };
            } else {
                next = {
                    ...composition,
                    ltInPacket: addUnique(composition.ltInPacket, code),
                };
            }
        } else {
            next = {
                ...composition,
                ltInPacket: addUnique(composition.ltInPacket, code),
            };
            autoFixes.push('Лимит бесплатных LT исчерпан — сервис добавлен платно');
        }
    } else {
        const wasFree = composition.lt.includes(code);
        next = {
            ...composition,
            lt: remove(composition.lt, code),
            ltInPacket: remove(composition.ltInPacket, code),
        };

        if (wasFree && isMinFive && next.lt.length < 5) {
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
                        {
                            code: 'lt/min-five-required',
                            message: `В комплекте «${ctx.complect.title}» должно быть минимум 5 сервисов Legal Tech`,
                        },
                    ],
                    autoFixes: [],
                };
            }
        }

        if (
            wasFree &&
            !isMinFive &&
            ctx.complect.type === 'prof' &&
            ctx.complect.code !== EXPERT_CODE &&
            next.lt.length < 2
        ) {
            return {
                composition,
                violations: [
                    {
                        code: 'lt/two-required',
                        message: `В комплекте «${ctx.complect.title}» должно быть 2 сервиса Legal Tech`,
                    },
                ],
                autoFixes: [],
            };
        }

        if (
            ctx.complect.code === EXPERT_CODE &&
            next.lt.length === 0 &&
            next.ltInPacket.length === 0
        ) {
            next = { ...next, lt: [EXPERT_FALLBACK] };
            autoFixes.push('Эксперт PRO: возвращён сервис Гарант Диск');
        }
    }

    violations.push(...validateLtPacket(next, ctx.catalog));
    return { composition: next, violations, autoFixes };
};
