import type { AiAboutEndpoint } from '@/modules/entities/ai-analytics/model';

/*
 * Ссылки из вкладки «AI аналитика» на сайт теории (публичный, без входа):
 * база — NEXT_PUBLIC_AI_THEORY_BASE_URL, по умолчанию боевой сайт. Тема →
 * страница и якорь; якоря совпадают с id блоков на сайте. Всё, что
 * строится в ссылку, — здесь; вёрстка — ui/components/AiTheoryLink.
 */

export const AI_THEORY_DEFAULT_BASE_URL = 'https://bitrix.april-app.ru';

/** База из окружения без хвостового «/»; пусто — боевой сайт. */
export const resolveAiTheoryBaseUrl = (env: string | undefined): string => {
    const trimmed = env?.trim().replace(/\/+$/, '') ?? '';
    return trimmed || AI_THEORY_DEFAULT_BASE_URL;
};

export const AI_THEORY_BASE_URL = resolveAiTheoryBaseUrl(
    process.env.NEXT_PUBLIC_AI_THEORY_BASE_URL,
);

export interface AiTheoryTopicRef {
    /** Путь страницы сайта теории от корня. */
    path: string;
    /** id блока на странице. */
    anchor: string;
}

const ANALYTICS = '/ai/analytics';
const PLANS = '/ai/plans';
const HISTORY = '/ai/history';
const NUMBERS = '/ai/theory/numbers';
const CALL_ANALYSIS = '/ai/theory/call-analysis';
const PUSH = '/ai/push';
const SETTINGS = '/ai/settings';
const SETUP = '/ai/setup';
const ROADMAP = '/ai/roadmap';
const FORECAST = '/ai/forecast';
const QUALITY_LINK = '/ai/quality-link';

/** Темы вкладки → страница и якорь сайта теории. */
export const AI_THEORY_TOPICS = {
    overview: { path: ANALYTICS, anchor: 'tab' },
    pulse: { path: ANALYTICS, anchor: 'pulse' },
    attention: { path: ANALYTICS, anchor: 'attention' },
    agenda: { path: ANALYTICS, anchor: 'agenda' },
    signalsTable: { path: ANALYTICS, anchor: 'matrix' },
    kpiTables: { path: ANALYTICS, anchor: 'kpi-tables' },
    types: { path: ANALYTICS, anchor: 'types' },
    rubric: { path: CALL_ANALYSIS, anchor: 'rubric' },
    levels: { path: ANALYTICS, anchor: 'levels' },
    access: { path: ANALYTICS, anchor: 'access' },
    readinessModes: { path: NUMBERS, anchor: 'readiness-modes' },
    norms: { path: NUMBERS, anchor: 'norms' },
    comparable: { path: NUMBERS, anchor: 'comparable-history' },
    dailyPlan: { path: PLANS, anchor: 'daily-plan' },
    goalCascade: { path: PLANS, anchor: 'goal-cascade' },
    ceiling: { path: PLANS, anchor: 'ceiling' },
    planFact: { path: PLANS, anchor: 'plan-fact' },
    targetsSetup: { path: PLANS, anchor: 'targets-setup' },
    trends: { path: HISTORY, anchor: 'trends' },
    goodhart: { path: HISTORY, anchor: 'goodhart' },
    yearAgo: { path: HISTORY, anchor: 'year-ago' },
    dossier: { path: HISTORY, anchor: 'dossier' },
    style: { path: HISTORY, anchor: 'style' },
    brief: { path: HISTORY, anchor: 'brief' },
    blindCheck: { path: '/ai/rop', anchor: 'blind-check' },
    calibration: { path: '/ai/calibration', anchor: 'why' },
    push: { path: PUSH, anchor: 'alerts' },
    digest: { path: PUSH, anchor: 'digest' },
    settingsKeys: { path: SETTINGS, anchor: 'analytics-keys' },
    setupChecklist: { path: SETUP, anchor: 'checklist' },
    troubleshooting: { path: SETUP, anchor: 'troubleshooting' },
    roadmap: { path: ROADMAP, anchor: 'status' },
    gates: { path: ROADMAP, anchor: 'gates' },
    forecast: { path: FORECAST, anchor: 'band' },
    forecastShadow: { path: FORECAST, anchor: 'shadow' },
    forecastBacktest: { path: FORECAST, anchor: 'backtest' },
    forecastMoney: { path: FORECAST, anchor: 'money' },
    qualityLink: { path: QUALITY_LINK, anchor: 'beta-sources' },
    qualityOutcome: { path: QUALITY_LINK, anchor: 'outcome' },
    betaGate: { path: QUALITY_LINK, anchor: 'beta-gate' },
    pool: { path: QUALITY_LINK, anchor: 'pool' },
    recommendationsEffect: { path: QUALITY_LINK, anchor: 'recommendations-effect' },
} as const satisfies Record<string, AiTheoryTopicRef>;

export type AiTheoryTopic = keyof typeof AI_THEORY_TOPICS;

export const AI_THEORY_TOPIC_LIST = Object.keys(
    AI_THEORY_TOPICS,
) as AiTheoryTopic[];

export const isAiTheoryTopic = (value: string): value is AiTheoryTopic =>
    Object.prototype.hasOwnProperty.call(AI_THEORY_TOPICS, value);

/** Полный адрес темы: база + страница + «#якорь». */
export const aiTheoryUrl = (
    topic: AiTheoryTopic,
    baseUrl: string = AI_THEORY_BASE_URL,
): string => {
    const { path, anchor } = AI_THEORY_TOPICS[topic];
    return `${baseUrl.replace(/\/+$/, '')}${path}#${anchor}`;
};

/** Подпись ссылки по умолчанию. */
export const AI_THEORY_LINK_LABEL = 'Подробнее в теории';

/** Раздел «Как считаем» → тема теории для подвала диалога. */
export const AI_ABOUT_THEORY_TOPIC: Record<AiAboutEndpoint, AiTheoryTopic> = {
    overview: 'signalsTable',
    'plan/daily': 'dailyPlan',
    'plan-fact': 'planFact',
    brief: 'brief',
    'manager/style': 'style',
    dossier: 'dossier',
    forecast: 'forecast',
};
