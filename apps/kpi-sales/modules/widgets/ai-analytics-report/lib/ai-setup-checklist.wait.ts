import { isAiKpiOnly } from '@/modules/entities/ai-analytics';
import {
    AI_BETA_SOURCE_LABELS,
    AI_READINESS_GATED_REASON,
    AI_READINESS_REASON_CODE,
    aiReadinessGate,
    isAiKnownReadinessReason,
    type AiReadinessGatedReason,
} from './ai-readiness-banner.util';
import { formatAiDateRu } from './ai-signal.util';
import {
    AI_CHECKLIST_BETA_FROM_DATA,
    AI_CHECKLIST_MODEL_WINDOW_MONTHS,
    AI_CHECKLIST_SCHEDULE,
    AI_CHECKLIST_TREND_MIN_WEEKS,
    AI_CHECKLIST_YOY_MONTHS,
} from './ai-setup-checklist.data';
import { AI_CHECKLIST_TEXT } from './ai-setup-checklist.texts';
import {
    aiAddDaysIso,
    aiAddMonthsIso,
    aiNextMonthDay,
    aiRoughEta,
    aiWeeksSince,
} from './ai-setup-checklist.eta';
import {
    aiDoneItem,
    aiOverviewUnknownItem,
    aiTodoItem,
    type AiChecklistContext,
} from './ai-setup-checklist.context';
import {
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    type AiChecklistItem,
    type AiChecklistItemCode,
} from './ai-setup-checklist.types';

/*
 * «Подождать»: то, что копится само — модель портала, история и
 * презентации до гейтов, ряды после смены версии, тренды, «год назад»,
 * связь «качество → исход». У каждого — прогресс и срок, где срок честно
 * считается. readiness.historyMonths — глубина истории данных портала
 * (стадии CRM, до 12 мес.), а не месяцы разборов: темп презентаций и срок
 * истории по нему не считаем — только прогресс.
 */

const T = AI_CHECKLIST_TEXT;
const WAIT = AI_CHECKLIST_GROUP.WAIT;
const DAYS_PER_WEEK = 7;

/** Сравнимость версий: дата из обзора, иначе из готовности. */
const comparableFromOf = (ctx: AiChecklistContext): string =>
    ctx.overview?.comparableFrom || ctx.readiness.comparableFrom;

/**
 * Модели портала нет. Шаг модели идёт и в ночном догоне истории, и 3-го
 * числа — поэтому срок примерный (≈ ближайшее 3-е), без точного времени.
 */
export const aiPortalModelItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    if (!ctx.reasons.has(AI_READINESS_REASON_CODE.NO_PORTAL_MODEL)) return null;
    const { dayOfMonth } = AI_CHECKLIST_SCHEDULE.PORTAL_MODEL;
    const date = aiNextMonthDay(ctx.today, dayOfMonth);
    return aiTodoItem(AI_CHECKLIST_ITEM.PORTAL_MODEL, WAIT, {
        title: T.portalModel.title,
        detail: T.portalModel.detail(
            date ? formatAiDateRu(date) : '3-го числа',
        ),
        unlocks: T.portalModel.unlocks,
        eta: aiRoughEta(date),
    });
};

/**
 * Гейт истории (history-months-below-N): только прогресс. Глубину истории
 * подтягивает ночной догон — она может вырасти скачком, срок не оценить.
 */
export const aiHistoryItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    const gate = aiReadinessGate(
        ctx.reasons,
        AI_READINESS_GATED_REASON.HISTORY_MONTHS,
    );
    if (gate === null) return null;
    const months = ctx.readiness.historyMonths;
    return aiTodoItem(AI_CHECKLIST_ITEM.HISTORY, WAIT, {
        title: T.history.title(months, gate),
        detail: T.history.detail(gate),
        unlocks: T.history.unlocks,
        progress: { value: months, target: gate },
    });
};

interface PresentationTexts {
    title: (count: number, gate: number) => string;
    detail: (gate: number) => string;
    unlocks: string;
}

/** Гейт по презентациям: только прогресс «N из гейта», без темпа и срока. */
const presentationsItem = (
    ctx: AiChecklistContext,
    prefix: AiReadinessGatedReason,
    code: AiChecklistItemCode,
    texts: PresentationTexts,
): AiChecklistItem | null => {
    const gate = aiReadinessGate(ctx.reasons, prefix);
    if (gate === null) return null;
    const count = ctx.readiness.presentations;
    return aiTodoItem(code, WAIT, {
        title: texts.title(count, gate),
        detail: texts.detail(gate),
        unlocks: texts.unlocks,
        progress: { value: count, target: gate },
    });
};

/** Калибровочный гейт презентаций (presentations-below-N). */
export const aiPresentationsItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null =>
    presentationsItem(
        ctx,
        AI_READINESS_GATED_REASON.PRESENTATIONS,
        AI_CHECKLIST_ITEM.PRESENTATIONS,
        T.presentations,
    );

/** Гейт норм (norms-presentations-below-N). */
export const aiNormsPresentationsItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null =>
    presentationsItem(
        ctx,
        AI_READINESS_GATED_REASON.NORMS_PRESENTATIONS,
        AI_CHECKLIST_ITEM.NORMS_PRESENTATIONS,
        T.normsPresentations,
    );

/**
 * Разборы до comparableFrom не входят в оценки (сменилась версия). Срок —
 * когда окно такой же длины целиком уйдёт за дату сопоставимости.
 */
export const aiComparableItem = (
    ctx: AiChecklistContext,
): AiChecklistItem | null => {
    const code = AI_CHECKLIST_ITEM.COMPARABLE;
    if (!ctx.overview) {
        return aiOverviewUnknownItem(ctx, code, WAIT, T.comparable.checkTitle);
    }
    const excluded = ctx.overview.meta.excludedBeforeComparable ?? 0;
    if (excluded <= 0) return null;
    const from = comparableFromOf(ctx);
    const clears = from ? aiAddDaysIso(from, ctx.overview.period.days) : null;
    return aiTodoItem(code, WAIT, {
        title: T.comparable.title,
        detail: T.comparable.detail(
            from ? formatAiDateRu(from) : '—',
            excluded,
        ),
        unlocks: T.comparable.unlocks,
        eta: aiRoughEta(clears && clears > ctx.today ? clears : null),
    });
};

/** Тренды: 8 сравнимых недельных точек после даты сопоставимости. */
export const aiTrendsItem = (ctx: AiChecklistContext): AiChecklistItem => {
    const code = AI_CHECKLIST_ITEM.TRENDS;
    if (!ctx.overview) {
        return aiOverviewUnknownItem(ctx, code, WAIT, T.trends.checkTitle);
    }
    if (ctx.overview.managers.some(row => !!row.trends)) {
        return aiDoneItem(code, WAIT, {
            title: T.trends.doneTitle,
            detail: T.trends.doneDetail,
        });
    }
    const gate = AI_CHECKLIST_TREND_MIN_WEEKS;
    const from = comparableFromOf(ctx);
    const weeks = from ? aiWeeksSince(from, ctx.today) : null;
    if (!from || weeks === null || weeks >= gate) {
        return aiTodoItem(code, WAIT, {
            title: T.trends.checkTitle,
            detail:
                weeks === null
                    ? T.trends.detailNoDate(gate)
                    : T.trends.detailVolume,
            unlocks: T.trends.unlocks,
        });
    }
    return aiTodoItem(code, WAIT, {
        title: T.trends.title(weeks, gate),
        detail: T.trends.detail(formatAiDateRu(from), gate),
        unlocks: T.trends.unlocks,
        progress: { value: weeks, target: gate },
        eta: aiRoughEta(aiAddDaysIso(from, gate * DAYS_PER_WEEK)),
    });
};

/**
 * «Год назад» — нужен снапшот месяца M−12 (13 мес. истории). Глубину выше
 * окна модели (12 мес.) готовность не показывает — тогда без срока.
 */
export const aiYoyItem = (ctx: AiChecklistContext): AiChecklistItem => {
    const code = AI_CHECKLIST_ITEM.YOY;
    const overview = ctx.overview;
    if (overview?.yoy || overview?.managers.some(row => !!row.yoy)) {
        return aiDoneItem(code, WAIT, {
            title: T.yoy.doneTitle,
            detail: T.yoy.doneDetail,
        });
    }
    const months = ctx.readiness.historyMonths;
    const gate = AI_CHECKLIST_YOY_MONTHS;
    if (months < AI_CHECKLIST_MODEL_WINDOW_MONTHS) {
        return aiTodoItem(code, WAIT, {
            title: T.yoy.title(months, gate),
            detail: T.yoy.detail(gate),
            unlocks: T.yoy.unlocks,
            progress: { value: months, target: gate },
            eta: aiRoughEta(aiAddMonthsIso(ctx.today, gate - months)),
        });
    }
    if (!overview)
        return aiOverviewUnknownItem(ctx, code, WAIT, T.yoy.checkTitle);
    return aiTodoItem(code, WAIT, {
        title: T.yoy.checkTitle,
        detail: T.yoy.detailLong,
        unlocks: T.yoy.unlocks,
    });
};

/**
 * Связь «качество → исход»: по данным — готово; иначе счётчик до оценки.
 * Счётчика нет — источник всё равно показываем (раньше его писал баннер);
 * в kpi-only оценок нет вовсе — там пункт не нужен.
 */
export const aiBetaItem = (ctx: AiChecklistContext): AiChecklistItem | null => {
    const { betaSource, betaCountdown } = ctx.readiness;
    if (betaSource === AI_CHECKLIST_BETA_FROM_DATA) {
        return aiDoneItem(AI_CHECKLIST_ITEM.BETA, WAIT, {
            title: T.beta.doneTitle,
            detail: T.beta.doneDetail,
        });
    }
    const source = AI_BETA_SOURCE_LABELS[betaSource];
    if (!betaCountdown) {
        return isAiKpiOnly(ctx.readiness.mode)
            ? null
            : aiTodoItem(AI_CHECKLIST_ITEM.BETA, WAIT, {
                  title: T.beta.title,
                  detail: T.beta.detailNoCountdown(source),
                  unlocks: T.beta.unlocks,
              });
    }
    const left = Math.max(0, Math.ceil(betaCountdown.presentationsLeft));
    const months = betaCountdown.monthsLeft;
    return aiTodoItem(AI_CHECKLIST_ITEM.BETA, WAIT, {
        title: T.beta.title,
        detail:
            left > 0
                ? T.beta.detail(source, left)
                : T.beta.detailReached(source),
        unlocks: T.beta.unlocks,
        eta: aiRoughEta(
            left > 0 && months !== null && months > 0
                ? aiAddMonthsIso(ctx.today, months)
                : null,
        ),
    });
};

/**
 * Причины, которых фронт не знает, — отдельным пунктом с нейтральной
 * подписью: сам код на экран не выводим (ключ пункта его сохраняет).
 */
export const aiUnknownReasonItems = (
    ctx: AiChecklistContext,
): AiChecklistItem[] =>
    [...ctx.reasons]
        .filter(code => !isAiKnownReadinessReason(code))
        .map(code =>
            aiTodoItem(AI_CHECKLIST_ITEM.REASON, WAIT, {
                key: `${AI_CHECKLIST_ITEM.REASON}:${code}`,
                title: T.reason.title,
                detail: T.reason.detail,
            }),
        );
