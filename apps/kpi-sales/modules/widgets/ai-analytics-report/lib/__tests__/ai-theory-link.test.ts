import { describe, expect, it } from 'vitest';
import { AI_CHECKLIST_ITEM } from '../ai-setup-checklist.types';
import {
    AI_CHECKLIST_ITEM_THEORY,
    aiChecklistTheoryTopic,
} from '../ai-setup-checklist.data';
import {
    AI_ABOUT_THEORY_TOPIC,
    AI_THEORY_BASE_URL,
    AI_THEORY_DEFAULT_BASE_URL,
    AI_THEORY_LINK_LABEL,
    AI_THEORY_TOPIC_LIST,
    AI_THEORY_TOPICS,
    aiTheoryUrl,
    isAiTheoryTopic,
    resolveAiTheoryBaseUrl,
} from '../ai-theory-link';

describe('ai-theory-link — база сайта теории', () => {
    it('без переменной окружения — боевой сайт; из окружения — без хвостового «/»', () => {
        expect(resolveAiTheoryBaseUrl(undefined)).toBe(AI_THEORY_DEFAULT_BASE_URL);
        expect(resolveAiTheoryBaseUrl('')).toBe(AI_THEORY_DEFAULT_BASE_URL);
        expect(resolveAiTheoryBaseUrl('   ')).toBe(AI_THEORY_DEFAULT_BASE_URL);
        expect(resolveAiTheoryBaseUrl('http://localhost:3005/')).toBe(
            'http://localhost:3005',
        );
        expect(resolveAiTheoryBaseUrl('https://stage.example//')).toBe(
            'https://stage.example',
        );
        expect(AI_THEORY_DEFAULT_BASE_URL).toBe('https://bitrix.april-app.ru');
        expect(AI_THEORY_BASE_URL).not.toMatch(/\/$/);
    });
});

describe('ai-theory-link — темы и адреса', () => {
    it('адрес — база + страница + якорь; явная база тоже без двойного «/»', () => {
        expect(aiTheoryUrl('pulse', 'https://bitrix.april-app.ru')).toBe(
            'https://bitrix.april-app.ru/ai/analytics#pulse',
        );
        expect(aiTheoryUrl('rubric', 'http://localhost:3005/')).toBe(
            'http://localhost:3005/ai/theory/call-analysis#rubric',
        );
        expect(aiTheoryUrl('readinessModes')).toBe(
            `${AI_THEORY_BASE_URL}/ai/theory/numbers#readiness-modes`,
        );
        expect(aiTheoryUrl('blindCheck')).toContain('/ai/rop#blind-check');
        expect(aiTheoryUrl('calibration')).toContain('/ai/calibration#why');
        expect(aiTheoryUrl('signalsTable')).toContain('/ai/analytics#matrix');
        expect(aiTheoryUrl('kpiTables')).toContain('/ai/analytics#kpi-tables');
        expect(aiTheoryUrl('comparable')).toContain(
            '/ai/theory/numbers#comparable-history',
        );
        expect(aiTheoryUrl('gates')).toContain('/ai/roadmap#gates');
        expect(aiTheoryUrl('settingsKeys')).toContain(
            '/ai/settings#analytics-keys',
        );
    });

    it('главы прогноза и связи качества с исходом — свои якоря', () => {
        const base = 'https://bitrix.april-app.ru';
        const phase4: Record<string, string> = {
            forecast: '/ai/forecast#band',
            forecastShadow: '/ai/forecast#shadow',
            forecastBacktest: '/ai/forecast#backtest',
            forecastMoney: '/ai/forecast#money',
            qualityLink: '/ai/quality-link#beta-sources',
            qualityOutcome: '/ai/quality-link#outcome',
            betaGate: '/ai/quality-link#beta-gate',
            pool: '/ai/quality-link#pool',
            recommendationsEffect: '/ai/quality-link#recommendations-effect',
        };
        for (const [topic, tail] of Object.entries(phase4)) {
            expect(isAiTheoryTopic(topic)).toBe(true);
            if (isAiTheoryTopic(topic)) {
                expect(aiTheoryUrl(topic, base)).toBe(`${base}${tail}`);
            }
        }
    });

    it('у каждой темы путь от /ai/ и непустой якорь из латиницы и дефисов', () => {
        expect(AI_THEORY_TOPIC_LIST).toHaveLength(42);
        for (const topic of AI_THEORY_TOPIC_LIST) {
            const ref = AI_THEORY_TOPICS[topic];
            expect(ref.path).toMatch(/^\/ai(\/[a-z-]+)+$/);
            expect(ref.anchor).toMatch(/^[a-z][a-z0-9-]*$/);
            expect(isAiTheoryTopic(topic)).toBe(true);
        }
        expect(isAiTheoryTopic('toString')).toBe(false);
        expect(AI_THEORY_LINK_LABEL).toBe('Подробнее в теории');
    });

    it('раздел «Как считаем» → тема', () => {
        expect(AI_ABOUT_THEORY_TOPIC).toEqual({
            overview: 'signalsTable',
            'plan/daily': 'dailyPlan',
            'plan-fact': 'planFact',
            brief: 'brief',
            'manager/style': 'style',
            dossier: 'dossier',
            forecast: 'forecast',
        });
    });
});

describe('ai-setup-checklist.data — темы теории у пунктов чек-листа', () => {
    it('ключевые пункты ведут на свои разделы; у неизвестной причины ссылки нет', () => {
        expect(aiChecklistTheoryTopic(AI_CHECKLIST_ITEM.ACCESS)).toBe('access');
        expect(aiChecklistTheoryTopic(AI_CHECKLIST_ITEM.PILOT)).toBe(
            'troubleshooting',
        );
        expect(aiChecklistTheoryTopic(AI_CHECKLIST_ITEM.TARGETS)).toBe(
            'targetsSetup',
        );
        expect(aiChecklistTheoryTopic(AI_CHECKLIST_ITEM.HEAD_PLANS)).toBe(
            'goalCascade',
        );
        expect(aiChecklistTheoryTopic(AI_CHECKLIST_ITEM.YOY)).toBe('yearAgo');
        expect(aiChecklistTheoryTopic(AI_CHECKLIST_ITEM.BETA)).toBe('betaGate');
        expect(aiChecklistTheoryTopic(AI_CHECKLIST_ITEM.HYPOTHESIS)).toBe(
            'qualityLink',
        );
        expect(aiChecklistTheoryTopic(AI_CHECKLIST_ITEM.PORTAL_MODEL)).toBe(
            'gates',
        );
        expect(aiChecklistTheoryTopic(AI_CHECKLIST_ITEM.REASON)).toBeNull();
        for (const topic of Object.values(AI_CHECKLIST_ITEM_THEORY)) {
            expect(isAiTheoryTopic(topic)).toBe(true);
        }
    });
});
