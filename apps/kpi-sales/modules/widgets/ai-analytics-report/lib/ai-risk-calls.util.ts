import type { AiRiskCall } from '@/modules/entities/ai-analytics/model';
import { AI_ALERT_NO_LINK_TEXT } from '@/modules/entities/ai-analytics/lib/ai-pulse.data';
import { aiCardLink } from './ai-card-link.util';
import { AI_RISK_CALLS_MAX, pickAiRiskCalls } from './ai-signal.util';

/*
 * Риск-звонки строки таблицы сигналов: ссылка на карточку разбора и
 * список «первые три — ещё N — свернуть». Отбор и порядок (свежие
 * первыми) — pickAiRiskCalls из ai-signal.util.
 */

/** Подпись ссылки на карточку разбора риск-звонка. */
export const AI_RISK_CALL_LINK_LABEL = 'разбор';
export const AI_RISK_CALL_LINK_TITLE = 'Открыть разбор звонка';
/** Ссылки нет: карточка разбора ещё не создана (та же подпись, что у сигналов пульса). */
export const AI_RISK_CALL_NO_LINK_TEXT = AI_ALERT_NO_LINK_TEXT;
export const AI_RISK_CALLS_COLLAPSE_LABEL = 'свернуть';

/**
 * Ссылка на карточку разбора риск-звонка; null — ссылки нет. Обзор,
 * сохранённый до появления ссылок, поля не имеет — это тоже «нет ссылки».
 */
export const aiRiskCallLink = (call: { link?: string | null }): string | null =>
    aiCardLink(call.link);

/**
 * Подпись на месте ссылки. Сервер ответил, что карточки разбора нет
 * (null или пустая строка), — «разбор ещё не создан». Поля нет совсем
 * (обзор сохранён до появления ссылок) или пришёл не адрес страницы —
 * про разбор ничего не известно, поэтому ничего не утверждаем: null.
 */
export const aiRiskCallNoLinkText = (call: {
    link?: string | null;
}): string | null => {
    if (call.link === undefined || aiRiskCallLink(call)) return null;
    return call.link === null || call.link.trim() === ''
        ? AI_RISK_CALL_NO_LINK_TEXT
        : null;
};

export interface AiRiskCallsView {
    /** Звонки к показу: свежие первыми. */
    rows: AiRiskCall[];
    /** Сколько спрятано в свёрнутом виде. */
    hidden: number;
    /** Есть что разворачивать и сворачивать. */
    canToggle: boolean;
}

/** Строки списка: свёрнуто — первые max, развёрнуто — все. */
export const buildAiRiskCallsView = (
    calls: readonly AiRiskCall[] | null | undefined,
    expanded: boolean,
    max = AI_RISK_CALLS_MAX,
): AiRiskCallsView => {
    const list = [...(calls ?? [])];
    const rows = pickAiRiskCalls(list, expanded ? list.length : max);
    return {
        rows,
        hidden: list.length - rows.length,
        canToggle: list.length > max,
    };
};

/** Подпись переключателя: «ещё 2» в свёрнутом виде, «свернуть» в развёрнутом. */
export const aiRiskCallsToggleLabel = (
    view: Pick<AiRiskCallsView, 'hidden'>,
    expanded: boolean,
): string => (expanded ? AI_RISK_CALLS_COLLAPSE_LABEL : `ещё ${view.hidden}`);
