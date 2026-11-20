import { addDays, format, isValid, parseISO } from 'date-fns';
import {
    AI_DEAL_MOVEMENT_MAX_DAYS,
    aiErrorMessage,
    aiErrorStatus,
    type AiDealMovementOverviewQuery,
    type AiOverviewFilters,
} from '@/modules/entities/ai-analytics';
import { AI_DEAL_MOVEMENT_TEXT } from './ai-deal-movement.texts';

/*
 * Запрос обзора «Движения сделок» из фильтра отчёта и разбор ошибок ручек.
 * Период — тот же, что у остальной витрины (уже не длиннее трёх месяцев),
 * плюс страховка предела ручки: не длиннее 92 дней.
 */

const T = AI_DEAL_MOVEMENT_TEXT.state;
const DATE_FORMAT = 'yyyy-MM-dd';
const HTTP_FORBIDDEN = 403;

const parseDay = (value: string): Date | null => {
    const date = parseISO(value.slice(0, 10));
    return isValid(date) ? date : null;
};

/**
 * Период не длиннее maxDays (обе даты включительно): начало подтягивается
 * к концу. Битые даты или начало позже конца — null (запрос не шлём).
 */
export const aiDmPeriod = (
    from: string,
    to: string,
    maxDays: number = AI_DEAL_MOVEMENT_MAX_DAYS,
): { from: string; to: string } | null => {
    const fromDate = parseDay(from);
    const toDate = parseDay(to);
    if (!fromDate || !toDate || fromDate > toDate) return null;
    const minFrom = addDays(toDate, -(maxDays - 1));
    return {
        from: format(fromDate < minFrom ? minFrom : fromDate, DATE_FORMAT),
        to: format(toDate, DATE_FORMAT),
    };
};

/** Разделитель ключа менеджеров фильтра (селектор отдаёт строку, не новый массив). */
const MANAGER_KEY_SEPARATOR = ',';

/**
 * Менеджеры фильтра отчёта одной строкой «447,512» (ручка ждёт id
 * строками): строка не меняется между рендерами, пока не сменится фильтр.
 */
export const aiDmScopeManagerKey = (
    filters: Pick<AiOverviewFilters, 'managerIds'> | null | undefined,
): string => (filters?.managerIds ?? []).map(String).join(MANAGER_KEY_SEPARATOR);

/** Ключ менеджеров обратно в список; пустой ключ — пусто (все, кого видно). */
export const aiDmManagerIdsOfKey = (key: string): string[] =>
    key ? key.split(MANAGER_KEY_SEPARATOR) : [];

/** Тело обзора: период фильтра и его менеджеры; дат нет или битые — null. */
export const aiDmOverviewQuery = (
    from: string | null,
    to: string | null,
    managerIds: readonly string[],
): AiDealMovementOverviewQuery | null => {
    if (!from || !to) return null;
    const period = aiDmPeriod(from, to);
    if (!period) return null;
    return {
        ...period,
        ...(managerIds.length ? { managerIds: [...managerIds] } : {}),
    };
};

/**
 * Ошибка ручки на экран: 403 — «Раздел доступен руководителям» (повтор не
 * поможет, forbidden), иначе понятный текст сервера или запасной.
 */
export const aiDmLoadError = (
    error: unknown,
): { error: string; forbidden: boolean } =>
    aiErrorStatus(error) === HTTP_FORBIDDEN
        ? { error: T.forbidden, forbidden: true }
        : { error: aiErrorMessage(error, T.fallback), forbidden: false };
