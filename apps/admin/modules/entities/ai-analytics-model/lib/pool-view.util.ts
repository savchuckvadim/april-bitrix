import {
    POOL_BETA_LABEL,
    POOL_PORTAL_REASON_LABEL,
    POOL_REASON_LABEL,
    POOL_STATUS_LABEL,
    type ModelStatusLabel,
} from '../consts/ai-analytics-model.labels.const';
import type { ModelPoolBeta, ModelPoolPortal, ModelPoolSnapshot } from '../model';
import {
    codeViewOf,
    reasonViewsOf,
    statusViewOf,
    type ModelCodeView,
} from './model-code-label.util';
import {
    formatCount,
    formatDateTime,
    formatDecimal,
    formatMonthKey,
    formatOutOf,
    formatShare,
    formatWithRange,
} from './model-format.util';
import { triStateOf } from './model-tri-state.util';
import type { ModelMetricView } from './model-view.types';

/** Вердикт по порталу пула — только обезличенный ключ. */
export interface PoolVerdictRow {
    key: string;
    shortKey: string;
    isSelf: boolean;
    included: boolean;
    reason: ModelCodeView;
}

export interface PoolView {
    status: ModelStatusLabel;
    month: string;
    generatedAt: string;
    metrics: ModelMetricView[];
    /** Оценка связи качества по пулу; null — порталов с оценкой мало. */
    beta: ModelMetricView[] | null;
    reasons: ModelCodeView[];
    verdicts: PoolVerdictRow[];
}

const SHORT_KEY_LENGTH = 10;

/** Длинный хэш → первые символы с многоточием; короткий — как есть. */
export const shortPoolKey = (key: string): string =>
    key.length > SHORT_KEY_LENGTH + 2 ? `${key.slice(0, SHORT_KEY_LENGTH)}…` : key;

/** Свой портал первым, затем вошедшие, внутри — по ключу. */
const verdictOrder = (selfKey: string) => (left: ModelPoolPortal, right: ModelPoolPortal): number => {
    const bySelf = Number(right.key === selfKey) - Number(left.key === selfKey);
    if (bySelf !== 0) return bySelf;
    const byIncluded = Number(right.included) - Number(left.included);
    return byIncluded !== 0 ? byIncluded : left.key.localeCompare(right.key);
};

const betaViewOf = (beta: ModelPoolBeta): ModelMetricView[] => [
    {
        label: 'Оценка связи качества',
        value: formatWithRange(beta.value, beta.ci90, value => formatDecimal(value, 2)),
    },
    {
        label: 'Расхождение порталов',
        value: formatShare(beta.iSquared),
        hint: 'Какая часть разброса оценок объясняется различием порталов, а не случайностью. Много — общая оценка слабо подходит отдельному порталу.',
    },
    { label: 'Порталов в оценке', value: formatCount(beta.portals) },
    { label: 'Метка оценки', value: codeViewOf(POOL_BETA_LABEL, beta.label).label },
];

/** Последний снапшот пула порталов → карточка. */
export const toPoolView = (pool: ModelPoolSnapshot): PoolView => {
    const self = triStateOf(pool.selfIncluded, {
        yes: 'участвует',
        no: 'не участвует',
        unknown: 'нет в вердиктах',
    });
    const evidence = triStateOf(pool.evidenceReady, {
        yes: 'готов',
        no: 'не готов',
        unknown: 'не считалось',
    });

    return {
        status: statusViewOf(POOL_STATUS_LABEL, pool.status),
        month: formatMonthKey(pool.monthKey),
        generatedAt: formatDateTime(pool.generatedAt),
        metrics: [
            { label: 'Этот портал', ...self },
            {
                label: 'Участников',
                value: `${formatCount(pool.participants)} из ${formatCount(pool.eligible)} подходящих`,
                hint: 'Подходящие — порталы с согласием и достаточной историей.',
            },
            { label: 'Шагов воронки с нормой пула', value: formatCount(pool.edges) },
            {
                label: 'Порталов с оценкой связи качества',
                value: formatOutOf(pool.betaPortals, pool.minPortalsE2),
                hint: 'Из минимума, нужного для следующего уровня доказательности.',
            },
            { label: 'Следующий уровень доказательности', ...evidence },
        ],
        beta: pool.beta === null ? null : betaViewOf(pool.beta),
        reasons: reasonViewsOf(POOL_REASON_LABEL, pool.reasons),
        verdicts: [...pool.portals].sort(verdictOrder(pool.selfKey)).map(portal => ({
            key: portal.key,
            shortKey: shortPoolKey(portal.key),
            isSelf: portal.key === pool.selfKey,
            included: portal.included,
            reason: codeViewOf(POOL_PORTAL_REASON_LABEL, portal.reason),
        })),
    };
};
