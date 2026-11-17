import type { StatusTone } from '@workspace/april-ui/tones';
import {
    AI_FORECAST_SHOWN_DETAILS,
    formatAiFullDate,
    formatAiMonthLabel,
    type AiForecast,
    type AiForecastShownDetail,
} from '@/modules/entities/ai-analytics';
import { AI_DAILY_PLAN_FORECAST_FORMS } from './ai-daily-plan-activity.data';
import {
    formatAiDailyCountWith,
    formatAiDailyForecast,
} from './ai-daily-plan-format.util';
import { AI_FORECAST_SHOWN_TEXT, AI_FORECAST_TEXT } from './ai-forecast.texts';

/*
 * Число прогноза, которое карточка показывает, пока вилка не опубликована
 * (решение владельца 16.11.2026: аналитику не прячем за «мало данных» —
 * число с пометкой). Что показать — решает сервер (`shown`), здесь только
 * слова. Простой расчёт подписан как расчёт, а не как прогноз модели:
 * иначе его легко принять за проверенный прогноз.
 */

const T = AI_FORECAST_SHOWN_TEXT;

type AiForecastShown = NonNullable<AiForecast['shown']>;

export interface AiForecastShownView {
    /** «сентябрь 2026 · по данным на 28.09.2026». */
    period: string;
    /** «≈44 продажи». */
    value: string;
    /** Чей расчёт: «Расчёт по темпу с начала месяца». */
    title: string;
    /** Что это за расчёт — подсказка к названию. */
    hint: string;
    /** Короткая метка: «простой расчёт», «точность не подтверждена». */
    badge: string;
    badgeTone: StatusTone;
    /** Почему показан именно он и как к нему относиться. */
    note: string;
    /** «21 продажа»; null — данных нет. */
    done: string | null;
}

const BADGE_TONE: Record<AiForecastShown['note'], StatusTone> = {
    confirmed: 'success',
    'stage-disabled': 'success',
    'model-unconfirmed': 'warning',
    'simple-better': 'info',
    'history-short': 'info',
    'readiness-below': 'warning',
    'no-model': 'info',
};

const DETAIL_TONE: Record<AiForecastShownDetail, StatusTone> = {
    'presentations-missing': 'warning',
    'method-history-short': 'info',
};

/**
 * Уточнение пометки (`shown.detail`, с 18.11.2026): поля нет в клиенте
 * API — читаем терпимо; старый бэкенд его не присылает, чужое значение —
 * как будто его нет.
 */
function detailOf(shown: AiForecastShown): AiForecastShownDetail | null {
    const detail: unknown = (shown as { detail?: unknown }).detail;
    return AI_FORECAST_SHOWN_DETAILS.find(item => item === detail) ?? null;
}

/** Метка и пояснение: уточнение пометки важнее самой пометки. */
function noteOf(
    shown: AiForecastShown,
): Pick<AiForecastShownView, 'badge' | 'badgeTone' | 'note'> {
    const detail = detailOf(shown);
    if (detail !== null) {
        return {
            badge: T.detail[detail].badge,
            badgeTone: DETAIL_TONE[detail],
            note: T.detail[detail].note,
        };
    }
    return {
        badge: T.badge[shown.note],
        badgeTone: BADGE_TONE[shown.note],
        note: T.note[shown.note],
    };
}

/** Вид числа прогноза; сервер не прислал `shown` (журнала дня нет) — null. */
export function buildAiForecastShown(
    forecast: AiForecast,
): AiForecastShownView | null {
    // Старый бэкенд поля не знает — читаем терпимо, без падения карточки.
    const shown = (forecast.shown ?? null) as AiForecastShown | null;
    if (shown === null) return null;
    const month = formatAiMonthLabel(forecast.monthKey);
    return {
        period: forecast.asOf
            ? `${month} · ${AI_FORECAST_TEXT.published.asOf(formatAiFullDate(forecast.asOf))}`
            : month,
        value: formatAiDailyForecast(shown.value),
        title: T.source[shown.source],
        hint: T.sourceHint[shown.source],
        ...noteOf(shown),
        done:
            forecast.done === null
                ? null
                : formatAiDailyCountWith(
                      forecast.done,
                      AI_DAILY_PLAN_FORECAST_FORMS,
                  ),
    };
}
