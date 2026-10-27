import type { BadgeCatalogDto } from '@workspace/nest-event-sales-api';
import type { EV_PLAN_CODE } from '@/modules/entities/EventPlan/type/event-plan-type';
import {
    BADGE_OUTCOMES,
    BADGE_PLAN_TYPES,
    BADGE_TARGETS,
    BADGE_TONES,
    type BadgeCatalogMode,
    type BadgeItem,
    type BadgeOutcome,
    type BadgeTarget,
    type BadgeTone,
} from '../model/badge-catalog.type';

export interface BadgeCatalogNormalizeResult {
    mode: BadgeCatalogMode;
    items: BadgeItem[];
    /** Что отсеяли и почему — в консоль фрейма, не на экран. */
    warnings: string[];
}

const isOneOf = <Value extends string>(
    value: unknown,
    allowed: readonly Value[],
): value is Value =>
    typeof value === 'string' && (allowed as readonly string[]).includes(value);

/**
 * Разбор ответа `GET /api/badges` в доменный каталог.
 *
 * Правило «нераспознанное не показываем»: бейджик с неизвестной целью
 * выбрасывается целиком, неизвестный итог или тип события — выбрасывается
 * из привязок (бейджик остаётся, но с меньшей областью), неизвестный цвет
 * → обычный. Так новая версия бэка не ломает старый фрейм: он показывает
 * то, что умеет, и пишет в консоль, чего не понял.
 */
export const normalizeBadgeCatalog = (
    dto: BadgeCatalogDto,
): BadgeCatalogNormalizeResult => {
    const warnings: string[] = [];
    const mode: BadgeCatalogMode = dto.mode === 'own' ? 'own' : 'default';
    const items: BadgeItem[] = [];

    for (const raw of dto.items ?? []) {
        const code = String(raw.code ?? '').trim();
        const text = String(raw.text ?? '').trim();
        if (!code || !text) {
            warnings.push(`бейджик без кода или текста пропущен (${code || '?'})`);
            continue;
        }
        if (!isOneOf<BadgeTarget>(raw.target, BADGE_TARGETS)) {
            warnings.push(`бейджик ${code}: неизвестная цель «${String(raw.target)}»`);
            continue;
        }

        let tone: BadgeTone = 'neutral';
        if (isOneOf<BadgeTone>(raw.tone, BADGE_TONES)) tone = raw.tone;
        else if (raw.tone) warnings.push(`бейджик ${code}: неизвестный цвет «${String(raw.tone)}»`);

        const outcomes: BadgeOutcome[] = [];
        for (const outcome of raw.outcomes ?? []) {
            if (isOneOf<BadgeOutcome>(outcome, BADGE_OUTCOMES)) outcomes.push(outcome);
            else warnings.push(`бейджик ${code}: неизвестный итог «${String(outcome)}»`);
        }

        const planTypes: EV_PLAN_CODE[] = [];
        for (const planType of raw.planTypes ?? []) {
            if (isOneOf<EV_PLAN_CODE>(planType, BADGE_PLAN_TYPES)) planTypes.push(planType);
            else warnings.push(`бейджик ${code}: неизвестный тип события «${String(planType)}»`);
        }

        items.push({
            code,
            text,
            target: raw.target,
            tone,
            outcomes,
            planTypes,
            isDefault: raw.isDefault === true,
            sort: Number.isFinite(raw.sort) ? raw.sort : 0,
        });
    }

    items.sort((a, b) => a.sort - b.sort || a.code.localeCompare(b.code));
    return { mode, items, warnings };
};
