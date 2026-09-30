import {
    BACKTEST_REASON_LABEL,
    BACKTEST_STATUS_LABEL,
    type ModelStatusLabel,
} from '../consts/ai-analytics-model.labels.const';
import type { ModelForecastBacktest } from '../model';
import {
    reasonViewsOf,
    statusViewOf,
    type ModelCodeView,
} from './model-code-label.util';
import {
    NO_VALUE,
    formatCount,
    formatDateTime,
    formatDecimal,
    formatMonthKey,
    formatOutOf,
    formatShare,
    formatWithRange,
    pluralRu,
} from './model-format.util';
import type { ModelMetricView } from './model-view.types';

/** Строка таблицы проверок по закрытым месяцам. */
export interface BacktestRow {
    key: string;
    month: string;
    generatedAt: string;
    status: ModelStatusLabel;
    coverage: string;
    coverageTarget: string;
    maseNaive: string;
    maseMean3: string;
    maseMax: string;
    shadow: string;
    volume: string;
    reasons: ModelCodeView[];
}

export interface BacktestView {
    /** Сводка по свежей проверке; null — проверок нет. */
    latest: ModelMetricView[] | null;
    rows: BacktestRow[];
}

const two = (value: number): string => formatDecimal(value, 2);
const pct = (value: number): string => formatShare(value, 0);

/** «3 мес., 62 дня»; проверять не на чем — «нет данных». */
const volumeOf = (item: ModelForecastBacktest): string =>
    item.months === 0
        ? 'нет данных'
        : `${formatCount(item.months)} мес., ${formatCount(item.days)} ${pluralRu(item.days, ['день', 'дня', 'дней'])}`;

const rowOf = (item: ModelForecastBacktest): BacktestRow => ({
    key: `${item.monthKey}:${item.generatedAt}`,
    month: formatMonthKey(item.monthKey),
    generatedAt: formatDateTime(item.generatedAt),
    status: statusViewOf(BACKTEST_STATUS_LABEL, item.status),
    coverage: formatWithRange(item.coverageShare, item.coverageCi90, pct),
    coverageTarget: item.coverageTarget === null ? NO_VALUE : pct(item.coverageTarget),
    maseNaive: formatWithRange(item.maseNaive, item.maseNaiveCi90, two),
    maseMean3: formatWithRange(item.maseMean3, item.maseMean3Ci90, two),
    maseMax: item.maseMax === null ? NO_VALUE : two(item.maseMax),
    shadow: formatOutOf(item.shadowMonths, item.shadowMinMonths),
    volume: volumeOf(item),
    reasons: reasonViewsOf(BACKTEST_REASON_LABEL, item.reasons),
});

/** Проверки точности прогноза (свежие первыми) → сводка и таблица. */
export const toBacktestView = (
    items: readonly ModelForecastBacktest[],
): BacktestView => {
    const rows = items.map(rowOf);
    const first = items[0];
    if (!first) return { latest: null, rows };
    const status = statusViewOf(BACKTEST_STATUS_LABEL, first.status);

    return {
        latest: [
            {
                label: 'Последняя проверка',
                value: `${formatMonthKey(first.monthKey)}: ${status.label.toLowerCase()}`,
                tone: status.tone,
            },
            {
                label: 'Теневые месяцы',
                value: formatOutOf(first.shadowMonths, first.shadowMinMonths),
                hint: 'Сколько закрытых месяцев прогноз уже вёлся «в тени» и сверен с фактом, из нужного числа.',
            },
            {
                label: 'Попадание факта в вилку',
                value: formatWithRange(first.coverageShare, first.coverageCi90, pct),
                hint: 'Доля дней, когда итог месяца попал в вилку прогноза. В скобках — интервал 90 %.',
            },
            {
                label: 'Средняя потеря по границам вилки',
                value: first.pinballMean === null ? NO_VALUE : two(first.pinballMean),
                hint: 'Чем меньше, тем точнее границы вилки. Сравнивать только между месяцами одного портала.',
            },
        ],
        rows,
    };
};
