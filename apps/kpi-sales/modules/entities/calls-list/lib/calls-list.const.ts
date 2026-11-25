/**
 * Раздел «Разборы звонков»: адрес страницы, пределы фильтров и параметры
 * адреса (техрешение back/ai/tasks/2026-11-19-call-reviews-design.md, этап 3).
 */
import type { StatusTone } from '@workspace/april-ui/tones';
import type { CallsListBadgeTone, CallsListPageSize } from '../model/types';

/** Страница раздела внутри приложения (без обвязки отчёта). */
export const CALLS_LIST_PATH = '/calls';

/** Ручка списка на бэке kpi-report-sales. */
export const CALLS_LIST_API_URL = '/api/ai-analytics/calls/list';

/** Период по умолчанию — последние столько дней, включая сегодня. */
export const CALLS_LIST_DEFAULT_DAYS = 30;

/** Период не длиннее стольких дней (обе даты включительно) — предел бэка. */
export const CALLS_LIST_MAX_DAYS = 92;

/** Шкала оценки AI в фильтре — как на витрине. */
export const CALLS_LIST_SCORE_RANGE = { min: 1, max: 10 } as const;

export const CALLS_LIST_DEFAULT_PAGE_SIZE: CallsListPageSize = 25;

/** Сколько менеджеров и типов звонка можно выбрать — предел бэка. */
export const CALLS_LIST_FILTER_MAX_ITEMS = 200;

/** Сколько общих бейджей и пунктов методики можно выбрать — предел бэка. */
export const CALLS_LIST_BADGES_MAX = 30;
export const CALLS_LIST_POINTS_MAX = 20;

/**
 * Пауза перед запросом после правки фильтров, бейджей или порядка: серия
 * нажатий уходит одним запросом. Страница и размер страницы — без паузы.
 */
export const CALLS_LIST_DEBOUNCE_MS = 350;

/** Приставка id пункта методики в списке «Добавить фильтр» и в настройках. */
export const CALLS_LIST_POINT_ID_PREFIX = 'm:';

/** Сколько бейджей показывать в строке таблицы; остальные — «+N». */
export const CALLS_LIST_ROW_BADGES_MAX = 4;

/** Окраска бейджа с бэка → тон дизайн-системы. */
export const CALLS_LIST_BADGE_TONE: Record<CallsListBadgeTone, StatusTone> = {
    bad: 'destructive',
    warn: 'warning',
    neutral: 'neutral',
    good: 'success',
};

/** Параметры адреса страницы списка. */
export const CALLS_LIST_PARAMS = {
    from: 'from',
    to: 'to',
    managers: 'managers',
    types: 'types',
    badges: 'badges',
    points: 'points',
    scoreMin: 'scoreMin',
    scoreMax: 'scoreMax',
    review: 'review',
    sort: 'sort',
    page: 'page',
    size: 'size',
} as const;

/**
 * Пометка «пришли из списка разборов» в адресе страницы звонка
 * (`?from=calls`): там вверху появляется «← К списку разборов».
 */
export const CALL_PAGE_FROM_PARAM = 'from';
export const CALL_PAGE_FROM_CALLS = 'calls';
