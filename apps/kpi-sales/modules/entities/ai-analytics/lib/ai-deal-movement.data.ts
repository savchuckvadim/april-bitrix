/*
 * Витрина «Движение сделок» (бэк: apps/kpi-report-sales,
 * ai-analytics/deal-movement/*): коды статусов, пределы запроса и маршруты.
 * Подписи статусов для людей приходят с бэка (title / statusTitle) — здесь
 * только коды, их порядок и то, что бэк проверяет у запроса.
 */

/**
 * Статусы открытой сделки в порядке важности (так же их отдаёт бэк):
 * «Вернулась назад», «Без внимания», «Без продвижения», «Под риском»,
 * «Движется».
 */
export const AI_DEAL_MOVEMENT_STATUSES = [
    'rolled_back',
    'abandoned',
    'stuck',
    'at_risk',
    'moving',
] as const;

/** Тревожные статусы — всё, кроме «Движется»: из них список проблемных сделок. */
export const AI_DEAL_MOVEMENT_ALARM_STATUSES = [
    'rolled_back',
    'abandoned',
    'stuck',
    'at_risk',
] as const;

/** Откуда срок стадии: обычный срок по истории портала или общий порог. */
export const AI_DEAL_MOVEMENT_LIMIT_SOURCES = ['history', 'default'] as const;

/** Полосы оценки звонка — строки матрицы. */
export const AI_DEAL_MOVEMENT_SCORE_BANDS = ['low', 'mid', 'high'] as const;

/** Пометка клетки матрицы «клиент купил бы и без менеджера». */
export const AI_DEAL_MOVEMENT_BUY_ANYWAY = 'buy_anyway' as const;

/** Период обзора — не длиннее стольких дней (обе даты включительно). */
export const AI_DEAL_MOVEMENT_MAX_DAYS = 92;

/** Размеры страницы списка проблемных сделок; потолок бэка — 100. */
export const AI_DEAL_MOVEMENT_PAGE_SIZES = [25, 50, 100] as const;
export const AI_DEAL_MOVEMENT_DEFAULT_PAGE_SIZE = 25;

/** Маршруты ручек (POST, сессия портала). */
export const AI_DEAL_MOVEMENT_ROUTES = {
    overview: '/api/ai-analytics/deal-movement/overview',
    deals: '/api/ai-analytics/deal-movement/deals',
} as const;

const ALARM_SET = new Set<string>(AI_DEAL_MOVEMENT_ALARM_STATUSES);

/** Код — тревожный статус (не «Движется» и не незнакомый). */
export const isAiDealMovementAlarm = (
    value: unknown,
): value is (typeof AI_DEAL_MOVEMENT_ALARM_STATUSES)[number] =>
    typeof value === 'string' && ALARM_SET.has(value);
