import { describe, expect, it } from 'vitest';
import {
    EDGE_LABEL,
    MODEL_FUNNEL_EDGE_CODES,
} from '../consts/ai-analytics-model.labels.const';
import { plain } from './plain-text.test-helper';
import type { ModelRecommendationEffect } from '../model';
import {
    diffToneOf,
    formatModelShare,
    formatTransitions,
    toEffectView,
} from './recommendation-effect-view.util';

const effect = (
    patch: Partial<ModelRecommendationEffect> = {},
): ModelRecommendationEffect => ({
    monthKey: '2026-09',
    generatedAt: '2026-10-02T01:00:00.000Z',
    issuedMonths: ['2026-07', '2026-08'],
    issued: 40,
    completedWindows: 30,
    done: 18,
    disagree: 3,
    doneShare: { value: 0.6, ci90: [0.45, 0.73], n: 30 },
    disagreeShare: { value: null, ci90: null, n: 4 },
    gateStatus: 'insufficient',
    gateReasons: ['issued-below-min'],
    byLever: [
        {
            lever: 'quality',
            issued: 20,
            completedWindows: 15,
            done: 9,
            disagree: 1,
            doneShare: { value: 0.6, ci90: [0.4, 0.77], n: 15 },
        },
    ],
    beforeAfter: [
        {
            edge: 'presentation_to_offer',
            beforeS: 12,
            beforeN: 40,
            afterS: 18,
            afterN: 40,
            diff: 0.15,
            ci90: [0.02, 0.28],
            windows: 6,
        },
        {
            edge: 'e9',
            beforeS: 0,
            beforeN: 0,
            afterS: 0,
            afterN: 0,
            diff: null,
            ci90: null,
            windows: 0,
        },
    ],
    goodhartFlags: 0,
    goodhartManagers: 0,
    ...patch,
});

describe('toEffectView: эффект советов', () => {
    it('гейт, месяцы выдачи и причины по-русски', () => {
        const view = toEffectView(effect());

        expect(view.gate.label).toBe('Мало данных');
        expect(view.issuedMonths).toBe('июль 2026, август 2026');
        expect(view.reasons[0]?.label).toBe(
            'Советов с закрытым окном меньше минимума',
        );
    });

    it('выполнено — с долей и интервалом; мало наблюдений — «мало данных»', () => {
        const { metrics } = toEffectView(effect());

        expect(plain(metrics[2]?.value ?? '')).toBe('18: 60 % (45 % – 73 %) из 30');
        expect(plain(metrics[3]?.value ?? '')).toBe('3: мало данных (из 4)');
        expect(metrics[4]?.value).toBe('нет');
    });

    it('признаки подгонки подсвечиваются', () => {
        const { metrics } = toEffectView(
            effect({ goodhartFlags: 2, goodhartManagers: 1 }),
        );

        expect(metrics[4]).toMatchObject({
            value: '2 признака у 1 менеджера',
            tone: 'warning',
        });
        expect(
            toEffectView(effect({ goodhartFlags: 5, goodhartManagers: 3 }))
                .metrics[4]?.value,
        ).toBe('5 признаков у 3 менеджеров');
    });

    it('до/после по шагам воронки: переходы, разность в п. п., цвет', () => {
        const [known, unknown] = toEffectView(effect()).edges;

        expect(known?.edge.label).toBe('От презентации к КП');
        expect(plain(known?.before ?? '')).toBe('12 из 40 (30 %)');
        expect(plain(known?.after ?? '')).toBe('18 из 40 (45 %)');
        expect(plain(known?.diff ?? '')).toBe('+15,0 п. п. (+2,0 п. п. – +28,0 п. п.)');
        expect(known?.tone).toBe('success');
        expect(unknown?.edge.known).toBe(false);
        expect(unknown?.edge.code).toBe('e9');
        expect(unknown?.diff).toBe('нет данных');
        expect(unknown?.before).toBe('0 из 0');
    });

    it('переходы есть, но меньше минимума выборки — разности нет, «мало данных»', () => {
        const [small] = toEffectView(
            effect({
                beforeAfter: [
                    {
                        edge: 'presentation_to_offer',
                        beforeS: 0,
                        beforeN: 1,
                        afterS: 1,
                        afterN: 1,
                        diff: null,
                        ci90: null,
                        windows: 1,
                    },
                ],
            }),
        ).edges;
        expect(small?.diff).toBe('мало данных');
        expect(small?.tone).toBe('neutral');
    });

    it('направления советов по-русски', () => {
        const [lever] = toEffectView(effect()).levers;

        expect(lever?.lever.label).toBe('Качество разговора');
        expect(plain(lever?.doneShare ?? '')).toBe('60 % (40 % – 77 %) из 15');
    });
});

const edgeRow = (edge: string) =>
    toEffectView(
        effect({
            beforeAfter: [
                {
                    edge,
                    beforeS: 1,
                    beforeN: 2,
                    afterS: 1,
                    afterN: 2,
                    diff: 0,
                    ci90: null,
                    windows: 1,
                },
            ],
        }),
    ).edges[0]?.edge;

describe('шаги воронки: коды бэка', () => {
    it('коды витрины, которые отдаёт эффект советов, подписаны', () => {
        const views = ['presentation_to_offer', 'offer_to_invoice'].map(edgeRow);

        expect(views.map(view => view?.known)).toEqual([true, true]);
        expect(views.map(view => view?.label)).toEqual([
            'От презентации к КП',
            'От КП к счёту',
        ]);
    });

    it('канонический код реестра (e2) в эффект не приходит и подписи не имеет', () => {
        expect(edgeRow('e2')?.known).toBe(false);
    });

    it('словарь покрывает все коды витрины', () => {
        expect(Object.keys(EDGE_LABEL).sort()).toEqual(
            [...MODEL_FUNNEL_EDGE_CODES].sort(),
        );
    });
});

describe('вспомогательные форматтеры эффекта', () => {
    it('formatModelShare и formatTransitions', () => {
        expect(formatModelShare({ value: null, ci90: null, n: 0 })).toBe(
            'мало данных (из 0)',
        );
        expect(formatTransitions(0, 0)).toBe('0 из 0');
    });

    it('diffToneOf: рост, падение, неясно', () => {
        expect(diffToneOf([0.01, 0.2])).toBe('success');
        expect(diffToneOf([-0.2, -0.01])).toBe('destructive');
        expect(diffToneOf([-0.1, 0.1])).toBe('neutral');
        expect(diffToneOf(null)).toBe('neutral');
    });
});
