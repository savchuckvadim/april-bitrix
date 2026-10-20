import { describe, expect, it } from 'vitest';
import {
    attention,
    attentionItem,
    managerRow,
} from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import type { AiManagerRow, AiPulse } from '@/modules/entities/ai-analytics/model';
import {
    aiEmployeeLowScoreMax,
    buildAiEmployeeLinkMap,
    buildAiEmployeeLowCalls,
    buildAiEmployeeRiskCalls,
    isAiEmployeeQualityMissing,
} from '../ai-employee-calls.util';

const pulse = (alerts: AiPulse['alerts']): AiPulse => ({
    periodDate: '2026-09-04',
    window: { from: '2026-08-31', to: '2026-09-04', workdays: [] },
    nextStepDateRate: { value: 0.4, n: 20, confidence: { level: 'ok' } },
    xmr: null,
    analyzedCalls: 20,
    shortCallsSharePct: 10,
    byManager: [],
    alerts,
});

const quality: NonNullable<AiManagerRow['quality']> = {
    thresholds: {
        weakSectionScoreMax: 5,
        weakSectionGap: 1,
        lowScoreCallMax: 4,
        weakFollowupShareMin: 0.3,
    },
    presentation: { n: 5, sections: [], weakCallIds: [] },
    followup: {
        n: 5,
        objectionsKnown: 2,
        objectionsUnhandled: 1,
        nextStepSet: 3,
        nextStepNoDate: 1,
        sections: [],
        weakCallIds: [],
    },
    lowScoreCalls: [
        { transcriptionId: 't-low-2', callType: 'presentation', score: 3.9 },
        { transcriptionId: 't-low-1', callType: null, score: 2.5 },
    ],
};

describe('buildAiEmployeeLinkMap — ссылки на карточки разбора', () => {
    it('собирает адреса из строки, карточек «Внимания» своего менеджера и пульса; не адреса пропускает', () => {
        const row = managerRow({
            riskCalls: [
                { transcriptionId: 't-1', kind: 'conflict', callStartedAt: '2026-09-03T10:00:00Z', link: 'https://p.bitrix24.ru/crm/type/1/details/1/' },
                { transcriptionId: 't-2', kind: 'conflict', callStartedAt: '2026-09-02T10:00:00Z', link: null },
            ],
        });
        const links = buildAiEmployeeLinkMap({
            row,
            attention: attention([
                attentionItem({ managerId: '7', link: { managerId: '7', calls: [{ transcriptionId: 't-low-1', link: 'https://p.bitrix24.ru/x/' }] } }),
                attentionItem({ managerId: '9', link: { managerId: '9', calls: [{ transcriptionId: 't-other', link: 'https://p.bitrix24.ru/y/' }] } }),
            ]),
            pulse: pulse([
                { managerId: '7', transcriptionId: 't-3', kind: 'conflict', quote: 'Цитата', callStartedAt: '2026-09-04T10:00:00Z', handled: false, link: 'ссылки нет' },
            ]),
            managerId: '7',
        });
        expect(links.get('t-1')).toBe('https://p.bitrix24.ru/crm/type/1/details/1/');
        expect(links.get('t-low-1')).toBe('https://p.bitrix24.ru/x/');
        expect(links.has('t-other')).toBe(false);
        expect(links.has('t-2')).toBe(false);
        expect(links.has('t-3')).toBe(false);
    });
});

describe('buildAiEmployeeRiskCalls — риск-звонки с цитатами', () => {
    it('сигналы пульса своего менеджера с цитатой, риск-звонки обзора без дублей, свежие первыми', () => {
        const row = managerRow({
            riskCalls: [
                { transcriptionId: 't-1', kind: 'conflict', callStartedAt: '2026-09-03T10:00:00Z', link: null },
                { transcriptionId: 't-old', kind: 'conflict', callStartedAt: '2026-08-20T10:00:00Z', link: null },
            ],
        });
        const calls = buildAiEmployeeRiskCalls({
            row,
            pulse: pulse([
                { managerId: '7', transcriptionId: 't-1', kind: 'conflict', quote: ' Да вы меня не слушаете ', callStartedAt: '2026-09-03T10:00:00Z', handled: true, link: null },
                { managerId: '9', transcriptionId: 't-9', kind: 'conflict', quote: 'чужой', callStartedAt: '2026-09-04T10:00:00Z', handled: false, link: null },
            ]),
            managerId: '7',
            links: new Map([['t-1', 'https://p.bitrix24.ru/a/']]),
        });
        expect(calls.map(call => call.transcriptionId)).toEqual(['t-1', 't-old']);
        expect(calls[0]).toMatchObject({
            quote: 'Да вы меня не слушаете',
            handled: true,
            link: 'https://p.bitrix24.ru/a/',
        });
        expect(calls[1]).toMatchObject({ quote: null, handled: null, link: null });
    });

    it('без строки и пульса — пусто', () => {
        expect(
            buildAiEmployeeRiskCalls({ row: null, pulse: null, managerId: '7', links: new Map() }),
        ).toEqual([]);
    });
});

describe('buildAiEmployeeLowCalls — звонки с низкой оценкой', () => {
    it('худшие первыми, ссылка из карты; порог — из фактов качества', () => {
        const row = managerRow({ quality });
        const calls = buildAiEmployeeLowCalls(row, new Map([['t-low-1', 'https://p.bitrix24.ru/l/']]));
        expect(calls.map(call => call.transcriptionId)).toEqual(['t-low-1', 't-low-2']);
        expect(calls[0]?.link).toBe('https://p.bitrix24.ru/l/');
        expect(calls[1]?.link).toBeNull();
        expect(aiEmployeeLowScoreMax(row)).toBe(4);
    });

    it('старый кэш без блока качества — пусто, порога нет, пометка «старый кэш»', () => {
        const row = managerRow();
        expect(buildAiEmployeeLowCalls(row, new Map())).toEqual([]);
        expect(aiEmployeeLowScoreMax(row)).toBeNull();
        expect(isAiEmployeeQualityMissing(row)).toBe(true);
        expect(isAiEmployeeQualityMissing(managerRow({ quality }))).toBe(false);
        expect(isAiEmployeeQualityMissing(null)).toBe(false);
    });
});
