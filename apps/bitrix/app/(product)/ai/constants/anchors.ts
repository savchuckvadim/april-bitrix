/**
 * Реестр якорей раздела «AI для отдела продаж»: адрес главы → идентификаторы
 * заголовков, на которые можно сослаться извне (`/ai/analytics#pulse`).
 *
 * На эти идентификаторы жёстко завязана вкладка «AI аналитика» в отчёте
 * KPI (`apps/kpi-sales`): подсказки и кнопки «как это читать» ведут по
 * ним в справочник. Поэтому идентификатор — контракт: переименовать
 * заголовок можно, переименовать якорь — только вместе с отчётом.
 *
 * Тест согласованности проверяет, что каждый якорь из реестра стоит у
 * заголовка соответствующей главы, а внутри главы якоря не повторяются.
 */

import { AI_BASE_PATH } from './section';

/** Адрес главы раздела по её slug. */
const chapter = (slug: string): string =>
    slug ? `${AI_BASE_PATH}/${slug}` : AI_BASE_PATH;

export const AI_THEORY_ANCHORS = {
    [chapter('')]: ['for-whom', 'how-to-read', 'not', 'status', 'errata'],
    [chapter('needs')]: [
        'read-not-listen',
        'discipline',
        'materials',
        'trust',
        'planning',
        'history',
        'not-covered',
    ],
    [chapter('theory/call-analysis')]: [
        'intake',
        'transcription',
        'passport',
        'type',
        'summary',
        'deep-analysis',
        'rubric',
        'checklists',
        'versions',
        'not-doing',
    ],
    [chapter('theory/call-types')]: [
        'nine-types',
        'prior',
        'other-irrelevant',
        'refine',
        'custom-types',
        'distribution',
    ],
    [chapter('smart')]: [
        'where',
        'writers',
        'fields',
        'presentation',
        'links',
        'kpi-binding',
        'timeline',
        'versions',
    ],
    [chapter('analytics')]: [
        'tab',
        'pulse',
        'attention',
        'agenda',
        'matrix',
        'kpi-tables',
        'types',
        'levels',
        'access',
    ],
    [chapter('plans')]: [
        'goal-cascade',
        'daily-plan',
        'ceiling',
        'plan-fact',
        'targets-setup',
    ],
    [chapter('history')]: [
        'trends',
        'goodhart',
        'year-ago',
        'dossier',
        'style',
        'brief',
    ],
    [chapter('theory/numbers')]: [
        'passport',
        'n',
        'interval',
        'low-confidence',
        'norms',
        'no-rating',
        'comparable-history',
        'readiness-modes',
        'not-claimed',
    ],
    [chapter('push')]: [
        'alerts',
        'agenda',
        'digest',
        'digest-all',
        'toggle-check',
        'manager',
    ],
    [chapter('settings')]: [
        'two-circuits',
        'analytics-keys',
        'pipeline-keys',
        'providers',
        'materials',
        'adjacent',
    ],
    [chapter('bitrix')]: [
        'requirements',
        'telephony',
        'permissions',
        'smart',
        'lists-funnels',
        'structure',
        'read-write',
        'data-location',
    ],
    [chapter('setup')]: [
        'part-1',
        'part-2',
        'part-3',
        'part-4',
        'part-5',
        'checklist',
        'troubleshooting',
    ],
    [chapter('calibration')]: [
        'why',
        'time',
        'what-we-ask',
        'three-calls',
        'schedule',
        'results',
        'not-asked',
        'faq',
        'send',
    ],
    [chapter('rop')]: [
        'blind-check',
        'monthly-review',
        'changes',
        'onboarding',
        'not-asked',
        'review-form',
        'after-send',
    ],
    [chapter('glossary')]: [
        'analysis',
        'analytics',
        'plans-history',
        'numbers',
        'settings',
        'readiness',
    ],
    [chapter('roadmap')]: ['status', 'gates', 'timeline', 'open'],
    [chapter('briefs')]: [
        'why-two',
        'onboarding-brief',
        'call-review-brief',
        'after-send',
    ],
} as const satisfies Record<string, readonly string[]>;

export type AiTheoryAnchorPath = keyof typeof AI_THEORY_ANCHORS;

/** Идентификатор якоря: латиница, цифры и дефис — как в адресе. */
export const AI_ANCHOR_ID_PATTERN = /^[a-z0-9-]+$/;
