import { describe, expect, it } from 'vitest';
import type {
    AiAboutPool,
    AiAboutQualityLink,
    AiReadiness,
} from '@/modules/entities/ai-analytics/model';
import {
    AI_ABOUT_UNKNOWN_BADGE,
    AI_ABOUT_UNKNOWN_REASON,
    aiAboutLabelOf,
    aiAboutLinkSentence,
    aiAboutReasons,
    formatAiAboutOdds,
    formatAiAboutShare,
} from '../lib/ai-about-phase4.util';
import {
    aiAboutCalibrationCheck,
    buildAiAboutQualityLink,
    formatAiAboutCountdown,
    formatAiAboutGateStreak,
} from '../lib/ai-about-quality-link.util';
import {
    aiAboutPoolSelfKey,
    aiAboutPoolUsage,
    buildAiAboutPool,
    formatAiAboutHeterogeneity,
} from '../lib/ai-about-pool.util';
import { expectClientTexts, valueOf } from './ai-about-phase4.fixtures';

const link = (over: Partial<AiAboutQualityLink> = {}): AiAboutQualityLink => ({
    monthKey: '2026-09',
    status: 'estimated',
    published: false,
    within: { value: 0.26, low: 0.1, high: 0.41 },
    between: null,
    pooled: { value: 0.262, low: 0.095, high: 0.405 },
    reliability: 0.72,
    calibrationSlope: { value: 0.95, low: 0.8, high: 1.1 },
    placeboPassed: true,
    gatePassedMonths: 1,
    gateMonths: 2,
    n: 240,
    events: 80,
    managers: 6,
    ...over,
});

const readiness = (over: Partial<AiReadiness> = {}): AiReadiness => ({
    mode: 'norms',
    historyMonths: 6,
    presentations: 300,
    sales: 20,
    comparableFrom: '',
    reasons: [],
    betaSource: 'none',
    betaCountdown: { seNow: 0.1, presentationsLeft: 120, monthsLeft: 2.6 },
    ...over,
});

describe('ai-about-phase4 — общие форматтеры', () => {
    it('незнакомый код → запасная подпись, причины без повторов', () => {
        expect(aiAboutLabelOf({ a: 'А' }, 'b', 'нет')).toBe('нет');
        expect(aiAboutLabelOf({ a: 'А' }, null, 'нет')).toBe('нет');
        expect(aiAboutLabelOf({ a: 'А' }, 'toString', 'нет')).toBe('нет');
        expect(aiAboutReasons({ a: 'А' }, ['a', 'x', 'y', 'a'])).toEqual([
            'А',
            AI_ABOUT_UNKNOWN_REASON,
        ]);
    });

    it('доля: с интервалом словами; мало данных — честно, не 0', () => {
        expect(
            formatAiAboutShare(
                { value: 0.4, low: 0.28, high: 0.53, n: 30 },
                'advices',
            ),
        ).toBe('40 % (вероятно от 28 до 53 %)');
        expect(
            formatAiAboutShare(
                { value: null, low: null, high: null, n: 5 },
                'advices',
            ),
        ).toBe('мало данных: 5 советов');
    });

    it('связь словами: уверенная / неуверенная / не видна / не оценена', () => {
        expect(aiAboutLinkSentence({ value: 0.3, low: 0.1, high: 0.5 })).toBe(
            'чем выше качество, тем чаще КП: связь уверенная',
        );
        expect(aiAboutLinkSentence({ value: 0.3, low: -0.1, high: 0.5 })).toBe(
            'чем выше качество, тем чаще КП: связь неуверенная',
        );
        expect(
            aiAboutLinkSentence({ value: -0.3, low: -0.5, high: -0.1 }),
        ).toBe('чем выше качество, тем реже КП: связь уверенная');
        expect(
            aiAboutLinkSentence({ value: -0.01, low: null, high: null }),
        ).toBe('связь качества с КП не видна: оценка неуверенная');
        expect(aiAboutLinkSentence(null)).toBe('не оценена');
    });

    it('шансы на КП за балл — процентом со знаком, интервал словами', () => {
        expect(
            formatAiAboutOdds({ value: 0.262, low: 0.095, high: -0.105 }),
        ).toBe(
            'шансы на КП за каждый балл качества: +30 % (вероятно от +10 до −10 %)',
        );
        expect(formatAiAboutOdds({ value: 0, low: null, high: 0.1 })).toBe(
            'шансы на КП за каждый балл качества: 0 %',
        );
    });
});

describe('Связь качества с результатом', () => {
    it('оценена, ещё проверяется: источник, серия 1 из 2, счётчик до оценки', () => {
        const view = buildAiAboutQualityLink(link(), readiness());
        expect(view.badge.label).toBe('оценена, ещё проверяется');
        expect(view.month).toBe('сентябрь 2026');
        expect(valueOf(view, 'Откуда берём связь')).toBe(
            'пока ниоткуда — план дня считаем без неё',
        );
        // До проверки чисел связи нет, даже если они пришли в ответе.
        expect(valueOf(view, 'Оценка связи')).toBe(
            'посчитана, покажем после проверки',
        );
        expect(
            view.facts.find(item => item.label === 'Оценка связи')?.hint
                .length ?? 0,
        ).toBe(0);
        expect(valueOf(view, 'Проверка')).toBe(
            'пройдена 1 из 2 месяцев подряд',
        );
        expect(valueOf(view, 'Прогноз шансов сходится с фактом')).toBe(
            'пройдена',
        );
        expect(valueOf(view, 'Будущее не предсказывает прошлое')).toBe(
            'пройдена',
        );
        expect(valueOf(view, 'Надёжность оценки разговора')).toBe('0,72 из 1');
        expect(valueOf(view, 'До оценки')).toBe('≈ 120 презентаций / ≈ 3 мес.');
        expect(view.todo).toContain('2 мес. подряд');
        expectClientTexts(view);
    });

    it('опубликована: без счётчика, «ничего делать не нужно»', () => {
        const view = buildAiAboutQualityLink(
            link({ status: 'published', published: true, gatePassedMonths: 2 }),
            readiness({ betaSource: 'data' }),
        );
        expect(view.badge.tone).toBe('success');
        expect(valueOf(view, 'Откуда берём связь')).toBe('по данным портала');
        expect(valueOf(view, 'Оценка связи')).toBe(
            'чем выше качество, тем чаще КП: связь уверенная',
        );
        expect(valueOf(view, 'До оценки')).toBeUndefined();
        expect(view.todo).toContain('уже учтена');
    });

    it('данных мало, модели нет: без источника; не проверялось — честно; совет задать гипотезу', () => {
        const view = buildAiAboutQualityLink(
            link({
                status: 'insufficient',
                within: null,
                pooled: null,
                reliability: null,
                calibrationSlope: null,
                placeboPassed: null,
                gatePassedMonths: 0,
            }),
            null,
        );
        expect(valueOf(view, 'Откуда берём связь')).toBeUndefined();
        expect(valueOf(view, 'Оценка связи')).toBe('не оценена');
        expect(valueOf(view, 'Надёжность оценки разговора')).toContain(
            'не измерена',
        );
        expect(valueOf(view, 'Прогноз шансов сходится с фактом')).toBe(
            'не проверялась',
        );
        expect(valueOf(view, 'Будущее не предсказывает прошлое')).toBe(
            'не проверялась',
        );
        expect(
            buildAiAboutQualityLink(
                link({ status: 'insufficient' }),
                readiness({ betaSource: 'none' }),
            ).todo,
        ).toContain('«Гипотеза качества»');
        expectClientTexts(view);
    });

    it('незнакомый статус — нейтральный бэйдж, не крэш', () => {
        const unknown = {
            ...link(),
            status: 'future',
        } as unknown as AiAboutQualityLink;
        expect(buildAiAboutQualityLink(unknown, null).badge).toEqual(
            AI_ABOUT_UNKNOWN_BADGE,
        );
    });

    it('согласие с фактом: интервал накрывает 1 — пройдена, нет — не пройдена', () => {
        expect(
            aiAboutCalibrationCheck({ value: 0.6, low: 0.4, high: 0.8 }),
        ).toBe('fail');
        expect(
            aiAboutCalibrationCheck({ value: 1, low: null, high: null }),
        ).toBe('unknown');
        expect(formatAiAboutGateStreak(0, 1)).toBe(
            'пройдена 0 из 1 месяца подряд',
        );
        expect(
            formatAiAboutCountdown({
                seNow: null,
                presentationsLeft: 0,
                monthsLeft: null,
            }),
        ).toBe('объём набран — ждём ближайшего пересчёта');
        expect(
            formatAiAboutCountdown({
                seNow: null,
                presentationsLeft: 21,
                monthsLeft: null,
            }),
        ).toBe('≈ 21 презентация');
        expect(formatAiAboutCountdown(null)).toBeNull();
    });
});

const pool = (over: Partial<AiAboutPool> = {}): AiAboutPool => ({
    monthKey: '2026-09',
    status: 'estimated',
    participants: 4,
    minParticipants: 3,
    minHistoryMonths: 6,
    selfReason: 'included',
    qualityLink: { value: 0.2, low: 0.05, high: 0.35 },
    heterogeneity: 0.2,
    label: 'estimated',
    edgesFromPool: 2,
    lagFromPool: true,
    seasonFromPool: false,
    ...over,
});

describe('Общая статистика порталов', () => {
    it('участвует, порталы похожи, что взято в расчёт', () => {
        const view = buildAiAboutPool(pool());
        expect(view.badge.label).toBe('общие оценки есть');
        expect(valueOf(view, 'Этот портал')).toBe('участвует');
        expect(valueOf(view, 'Порталов в статистике')).toBe('4');
        expect(valueOf(view, 'Насколько порталы расходятся')).toBe('похожи');
        expect(valueOf(view, 'Что взято из общей статистики')).toBe(
            'подтягивание к норме на 2 шагах воронки, срок оплаты',
        );
        expect(view.todo).toContain('уже уточняют');
        expectClientTexts(view);
    });

    it('гибрид — «предварительно»; порталов мало — «N из нужных M»', () => {
        const view = buildAiAboutPool(
            pool({ status: 'insufficient', label: 'hybrid', participants: 2 }),
        );
        expect(view.badge.label).toBe('предварительно');
        expect(valueOf(view, 'Порталов в статистике')).toBe('2 из нужных 3');
        expect(valueOf(view, 'Общая связь качества с КП')).toContain(
            '(предварительно)',
        );
        expectClientTexts(view);
    });

    it('участие портала: нет согласия → «дайте согласие»; неизвестно/незнакомо — нейтрально', () => {
        const noConsent = buildAiAboutPool(pool({ selfReason: 'no-consent' }));
        expect(valueOf(noConsent, 'Этот портал')).toBe(
            'не участвует — согласия нет',
        );
        expect(noConsent.todo).toContain('дайте согласие');
        expect(
            valueOf(
                buildAiAboutPool(pool({ selfReason: 'short-history' })),
                'Этот портал',
            ),
        ).toBe('пока не участвует — нужно не меньше 6 мес. истории');
        expect(aiAboutPoolSelfKey(null)).toBe('missing');
        expect(aiAboutPoolSelfKey('brand-new')).toBe('other');
        expect(formatAiAboutHeterogeneity(0.7)).toBe('заметно различаются');
        expect(formatAiAboutHeterogeneity(null)).toBe('не оценено');
        expect(
            aiAboutPoolUsage(pool({ edgesFromPool: 0, lagFromPool: false })),
        ).toBe('ничего — считаем только по своим данным');
    });
});
