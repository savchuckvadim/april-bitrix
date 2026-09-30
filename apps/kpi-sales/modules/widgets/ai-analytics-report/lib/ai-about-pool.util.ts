import type {
    AiAboutPool,
    AiAboutPoolSelfReason,
    AiAboutPoolStatus,
} from '@/modules/entities/ai-analytics/model';
import { pluralRu } from '@/modules/entities/ai-analytics/lib/ai-readiness.data';
import {
    AI_ABOUT_UNKNOWN_BADGE,
    aiAboutFact as fact,
    aiAboutLabelOf,
    aiAboutLinkSentence,
    formatAiAboutOdds,
    formatAiAboutSectionMonth,
    type AiAboutBadge,
    type AiAboutSectionView,
} from './ai-about-phase4.util';

/*
 * «Как считаем» → «Общая статистика порталов»: участвует ли портал,
 * сколько порталов, насколько они расходятся, общая связь качества с КП
 * (метка «предварительно», пока порталов мало) и что взято в расчёт.
 */

/** Порог «заметно различаются» по доле различий между порталами (0..1). */
export const AI_ABOUT_POOL_HETEROGENEITY_HIGH = 0.5;

export const formatAiAboutHeterogeneity = (value: number | null): string => {
    if (value === null) return 'не оценено';
    return value >= AI_ABOUT_POOL_HETEROGENEITY_HIGH
        ? 'заметно различаются'
        : 'похожи';
};

const POOL_BADGE: Record<AiAboutPoolStatus, AiAboutBadge> = {
    insufficient: { label: 'порталов пока мало', tone: 'muted' },
    estimated: { label: 'общие оценки есть', tone: 'success' },
};

export const AI_ABOUT_POOL_PRELIMINARY: AiAboutBadge = {
    label: 'предварительно',
    tone: 'warning',
};

const POOL_SELF_KEYS = [
    'included',
    'no-consent',
    'consent-not-yet',
    'short-history',
    'missing',
    'other',
] as const;

/** Участие портала: коды DTO, «не найден» (null) и незнакомый код. */
export type AiAboutPoolSelfKey = (typeof POOL_SELF_KEYS)[number];

const isPoolSelfKey = (value: string): value is AiAboutPoolSelfKey =>
    (POOL_SELF_KEYS as readonly string[]).includes(value);

export const aiAboutPoolSelfKey = (
    reason: AiAboutPoolSelfReason | string | null,
): AiAboutPoolSelfKey => {
    if (reason === null) return 'missing';
    return isPoolSelfKey(reason) ? reason : 'other';
};

const poolSelfWords = (
    pool: AiAboutPool,
): Record<AiAboutPoolSelfKey, string> => ({
    included: 'участвует',
    'no-consent': 'не участвует — согласия нет',
    'consent-not-yet':
        'согласие дано позже месяца расчёта — войдёт со следующего',
    'short-history': `пока не участвует — нужно не меньше ${pool.minHistoryMonths} мес. истории`,
    missing: 'в общей статистике не найден',
    other: 'участие уточняется',
});

const CHECK_CONSENT_TODO =
    'Проверьте согласие: настройки витрины, вкладка «Пул порталов».';

const POOL_SELF_TODO: Record<
    Exclude<AiAboutPoolSelfKey, 'included'>,
    string
> = {
    'no-consent':
        'Чтобы участвовать, дайте согласие: настройки витрины, вкладка «Пул порталов».',
    'consent-not-yet':
        'Ничего делать не нужно: портал войдёт в статистику со следующего расчёта.',
    'short-history':
        'Ничего делать не нужно: портал войдёт, когда накопится история.',
    missing: CHECK_CONSENT_TODO,
    other: CHECK_CONSENT_TODO,
};

const poolTodo = (pool: AiAboutPool, key: AiAboutPoolSelfKey): string => {
    if (key !== 'included') return POOL_SELF_TODO[key];
    return pool.status === 'estimated'
        ? 'Ничего делать не нужно: общие оценки уже уточняют ваши нормы.'
        : 'Ничего делать не нужно: общие оценки появятся, когда порталов с согласием станет больше.';
};

/** Что из общей статистики попало в расчёт портала. */
export const aiAboutPoolUsage = (pool: AiAboutPool): string => {
    const parts = [
        pool.edgesFromPool > 0
            ? `подтягивание к норме на ${pool.edgesFromPool} ${pluralRu(pool.edgesFromPool, ['шаге', 'шагах', 'шагах'])} воронки`
            : null,
        pool.lagFromPool ? 'срок оплаты' : null,
        pool.seasonFromPool ? 'сезонность' : null,
    ].filter((part): part is string => part !== null);
    return parts.length
        ? parts.join(', ')
        : 'ничего — считаем только по своим данным';
};

/** Карточка «Общая статистика порталов». */
export const buildAiAboutPool = (pool: AiAboutPool): AiAboutSectionView => {
    const hybrid = pool.label === 'hybrid';
    const selfKey = aiAboutPoolSelfKey(pool.selfReason);
    return {
        title: 'Общая статистика порталов',
        month: formatAiAboutSectionMonth(pool.monthKey),
        badge: hybrid
            ? AI_ABOUT_POOL_PRELIMINARY
            : aiAboutLabelOf(POOL_BADGE, pool.status, AI_ABOUT_UNKNOWN_BADGE),
        facts: [
            fact('Этот портал', poolSelfWords(pool)[selfKey]),
            fact(
                'Порталов в статистике',
                pool.participants >= pool.minParticipants
                    ? String(pool.participants)
                    : `${pool.participants} из нужных ${pool.minParticipants}`,
            ),
            fact(
                'Насколько порталы расходятся',
                formatAiAboutHeterogeneity(pool.heterogeneity),
                [
                    'Чем сильнее порталы различаются, тем меньше общая статистика влияет на ваши цифры.',
                ],
            ),
            fact(
                'Общая связь качества с КП',
                hybrid && pool.qualityLink
                    ? `${aiAboutLinkSentence(pool.qualityLink)} (предварительно)`
                    : aiAboutLinkSentence(pool.qualityLink),
                [
                    ...(pool.qualityLink
                        ? [
                              `В среднем по порталам ${formatAiAboutOdds(pool.qualityLink)}.`,
                          ]
                        : []),
                    ...(hybrid
                        ? [
                              'Порталов пока мало: разброс между ними взят по умолчанию.',
                          ]
                        : []),
                ],
            ),
            fact('Что взято из общей статистики', aiAboutPoolUsage(pool)),
        ],
        reasons: [],
        todo: poolTodo(pool, selfKey),
    };
};
