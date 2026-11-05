import { describe, expect, it } from 'vitest';
import { aiPulseRatioWords, type AiPulse } from '@/modules/entities/ai-analytics';
import { aiPulseCoachRows, aiPulseSummary } from '../ai-pulse-coach.util';

type Manager = AiPulse['byManager'][number];

const metric = (value: number | null, n: number): AiPulse['nextStepDateRate'] => ({
    value,
    n,
    confidence: { level: value === null ? 'none' : 'low' },
});

const link = (id: string) => `https://garant.bitrix24.ru/crm/type/1058/details/${id}/`;

const manager = (managerId: string, value: number | null, analyzed: number): Manager => ({
    managerId,
    analyzed,
    nextStepDateRate: metric(value, analyzed),
    examples: {
        noDate: [
            { transcriptionId: `${managerId}-a`, callStartedAt: null, link: link(`${managerId}1`) },
            { transcriptionId: `${managerId}-b`, callStartedAt: null, link: null },
        ],
        withDate: { transcriptionId: `${managerId}-d`, callStartedAt: null, link: link(`${managerId}9`) },
    },
});

describe('aiPulseRatioWords', () => {
    it('до половины — «1 из N», больше — «N из 10», ноль — «ни одного»', () => {
        expect(aiPulseRatioWords(0.21)).toBe('1 из 5');
        expect(aiPulseRatioWords(0.5)).toBe('1 из 2');
        expect(aiPulseRatioWords(0.74)).toBe('7 из 10');
        expect(aiPulseRatioWords(0)).toBe('ни одного');
    });
});

describe('aiPulseSummary', () => {
    const base = {
        nextStepDateRate: metric(0.21, 91),
        window: { from: '2026-10-29', to: '2026-11-04', workdays: ['a', 'b', 'c', 'd', 'e'] },
        analyzedCalls: 91,
    };

    it('итог словами и «неделей раньше»: лучше, хуже, так же', () => {
        const worse = aiPulseSummary({
            ...base,
            previous: { from: '2026-10-22', to: '2026-10-28', analyzedCalls: 84, nextStepDateRate: metric(0.26, 84) },
        });
        expect(worse.headline).toBe(
            '21 % разговоров закончились договорённостью о следующем шаге с датой: 19 из 91, примерно 1 из 5.',
        );
        expect(worse.trend).toEqual({ text: 'Неделей раньше было 26 % — стало хуже.', tone: 'worse' });

        const same = aiPulseSummary({
            ...base,
            previous: { from: 'x', to: 'y', analyzedCalls: 80, nextStepDateRate: metric(0.22, 80) },
        });
        expect(same.trend?.tone).toBe('same');
        expect(aiPulseSummary({ ...base, previous: null }).trend).toBeNull();
    });

    it('мало разговоров — без процента, с подсказкой', () => {
        const few = aiPulseSummary({ ...base, nextStepDateRate: metric(null, 5), previous: null });
        expect(few.headline).toBeNull();
        expect(few.few).toBe(true);
    });
});

describe('aiPulseCoachRows', () => {
    it('от слабого к сильному: ниже отдела — звонки без даты, лучший — образец', () => {
        const rows = aiPulseCoachRows({
            nextStepDateRate: metric(0.21, 87),
            byManager: [
                manager('sova', 0.29, 28),
                manager('voropaeva', 0.17, 29),
                manager('kvashnina', 0.2, 30),
            ],
        });

        expect(rows.map(row => row.managerId)).toEqual(['voropaeva', 'kvashnina', 'sova']);
        expect(rows[0]).toMatchObject({
            tone: 'below',
            share: '5 из 29 с датой, 17 %',
            noDateLinks: [link('voropaeva1')],
            exampleLink: null,
        });
        expect(rows[1]?.tone).toBe('level');
        expect(rows[1]?.noDateLinks).toEqual([]);
        expect(rows[2]).toMatchObject({ tone: 'best', exampleLink: link('sova9') });
    });

    it('доля скрыта — в конце, без тона и ссылок; лучший — только заметно выше отдела', () => {
        const rows = aiPulseCoachRows({
            nextStepDateRate: metric(0.3, 40),
            byManager: [manager('a', null, 6), manager('b', 0.31, 20)],
        });

        expect(rows.map(row => row.managerId)).toEqual(['b', 'a']);
        expect(rows[0]?.tone).toBe('level');
        expect(rows[1]).toMatchObject({ share: null, tone: 'level', noDateLinks: [] });
    });
});
