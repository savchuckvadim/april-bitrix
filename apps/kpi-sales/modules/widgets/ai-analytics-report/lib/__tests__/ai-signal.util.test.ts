import { describe, expect, it } from 'vitest';
import type { AiRiskCall } from '@/modules/entities/ai-analytics/model';
import { AI_DISAGREE_REASON_MAX } from '@/modules/entities/ai-analytics/lib/ai-feedback.util';
import {
    managerTrends,
    yoy,
} from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import {
    AI_LEVER_NO_EFFECT,
    AI_NOT_ANALYZED_HINT,
    AI_SIGNAL_FIXED_COLUMNS,
    AI_TENURE_UNKNOWN,
    AI_TENURE_UNKNOWN_HINT,
    aiAnalyzedLabel,
    aiSignalColumnCount,
    aiSignalColumns,
    aiTenureLabel,
    isAiRowOutOfAnalysis,
    aiDisagreeCommentMax,
    aiLeverHintLines,
    aiLeverTitle,
    aiRiskCallsRestLabel,
    clampAiDisagreeComment,
    composeAiDisagreeReason,
    formatAiDateRu,
    formatAiDisagreeCommentCounter,
    formatAiLeverCost,
    formatAiLeverEffect,
    formatAiSince,
    isAiDisagreeReasonCode,
    pickAiLevers,
    pickAiRiskCalls,
    type AiRecommendation,
} from '../ai-signal.util';

const recommendation = (
    overrides: Partial<AiRecommendation> = {},
): AiRecommendation => ({
    lever: 'quality',
    callType: 'presentation',
    section: 'NEEDS',
    deltaSales: 1.5,
    cost: 2,
    evidence: 'E1',
    basis: ['Оценка раздела 4,1 против 6,0 нормы'],
    ruleCode: 'quality-section-gap',
    ...overrides,
});

const riskCall = (overrides: Partial<AiRiskCall> = {}): AiRiskCall => ({
    transcriptionId: 't-1',
    kind: 'promise',
    callStartedAt: '2026-09-10T10:00:00Z',
    ...overrides,
});

describe('ai-signal.util — рычаги', () => {
    it('pickAiLevers — первые три', () => {
        const levers = [1, 2, 3, 4].map(index =>
            recommendation({ ruleCode: `r${index}` }),
        );
        expect(pickAiLevers(levers).map(item => item.ruleCode)).toEqual([
            'r1',
            'r2',
            'r3',
        ]);
        expect(pickAiLevers([])).toEqual([]);
    });

    it('aiLeverTitle: тип · раздел · категория, иначе подпись рычага', () => {
        expect(aiLeverTitle(recommendation(), code => `[${code}]`)).toBe(
            '[presentation] · NEEDS',
        );
        expect(
            aiLeverTitle(
                recommendation({
                    lever: 'objection',
                    callType: undefined,
                    section: undefined,
                    category: 'price',
                }),
            ),
        ).toBe('Цена');
        expect(
            aiLeverTitle(
                recommendation({
                    lever: 'volume',
                    callType: undefined,
                    section: undefined,
                }),
            ),
        ).toBe('Объём');
    });

    it('эффект: «+1,5 продаж», без deltaSales — честно без числа', () => {
        expect(formatAiLeverEffect({ deltaSales: 1.5 })).toBe('+1,5 продаж');
        expect(formatAiLeverEffect({ deltaSales: 2 })).toBe('+2 продаж');
        expect(formatAiLeverEffect({})).toBe(AI_LEVER_NO_EFFECT);
    });

    it('стоимость в единицах рычага', () => {
        expect(formatAiLeverCost({ cost: 30, lever: 'volume' })).toBe(
            '30 мин активности',
        );
        expect(formatAiLeverCost({ cost: 1.5, lever: 'quality' })).toBe(
            '1,5 ч коучинга',
        );
    });

    it('строки подсказки рычага', () => {
        expect(aiLeverHintLines(recommendation())).toEqual([
            'Рычаг: Качество — presentation · NEEDS',
            'Ожидаемый эффект: +1,5 продаж',
            'Стоимость: 2 ч коучинга',
            'Доказательность: E1 — связь в данных',
            'Оценка раздела 4,1 против 6,0 нормы',
            'Правило: quality-section-gap',
        ]);
    });
});

describe('ai-signal.util — стаж и риск-звонки', () => {
    it('formatAiDateRu: YYYY-MM-DD → dd.mm.yyyy', () => {
        expect(formatAiDateRu('2025-03-01')).toBe('01.03.2025');
        expect(formatAiDateRu('2025-03-01T10:00:00Z')).toBe('01.03.2025');
        expect(formatAiDateRu('мусор')).toBe('мусор');
    });

    it('formatAiSince: стаж с датой и источником, с датой, только стаж, ничего', () => {
        expect(formatAiSince('2025-03-01', 9, 'employment')).toBe(
            'стаж 9 мес. (с 01.03.2025, по дате приёма)',
        );
        expect(formatAiSince('2025-03-01', 9, 'register')).toBe(
            'стаж 9 мес. (с 01.03.2025, по регистрации в Bitrix)',
        );
        expect(formatAiSince(undefined, 9, 'proxy')).toBe(
            'стаж 9 мес. (по первому событию)',
        );
        expect(formatAiSince('2025-03-01', 9, 'manual')).toBe(
            'стаж 9 мес. (с 01.03.2025, задан вручную)',
        );
        expect(formatAiSince('2025-03-01', 9)).toBe(
            'стаж 9 мес. (с 01.03.2025)',
        );
        expect(formatAiSince('2025-03-01', null)).toBe('с 01.03.2025');
        expect(formatAiSince(undefined, 9)).toBe('стаж 9 мес.');
        expect(formatAiSince(undefined, null)).toBe(AI_TENURE_UNKNOWN);
    });

    it('aiTenureLabel: «стаж не задан» — с подсказкой «задайте дату в «Уровни»»', () => {
        expect(aiTenureLabel({ since: undefined, tenureMonths: null })).toEqual(
            { text: AI_TENURE_UNKNOWN, hint: AI_TENURE_UNKNOWN_HINT },
        );
        expect(
            aiTenureLabel({
                since: '2025-11-03',
                sinceSource: 'employment',
                tenureMonths: 10,
            }),
        ).toEqual({
            text: 'стаж 10 мес. (с 03.11.2025, по дате приёма)',
            hint: null,
        });
        // Дата есть, стаж ещё не посчитан — это не «стаж не задан».
        expect(
            aiTenureLabel({ since: '2026-10-01', tenureMonths: null }),
        ).toEqual({ text: 'с 01.10.2026', hint: null });
    });

    it('aiAnalyzedLabel: «разобрано 0 из 0» при звонках в CRM — подсказка про готовность', () => {
        const discipline = (callDone: number) => ({
            callPlan: 0,
            callDone,
            presentationPlan: 0,
            presentationDone: 0,
        });
        expect(
            aiAnalyzedLabel({
                analyzedCalls: 0,
                callsTotal: 0,
                discipline: discipline(12),
            }),
        ).toEqual({ text: 'разобрано 0 из 0', hint: AI_NOT_ANALYZED_HINT });
        expect(
            aiAnalyzedLabel({
                analyzedCalls: 0,
                callsTotal: 0,
                discipline: discipline(0),
            }).hint,
        ).toBeNull();
        expect(
            isAiRowOutOfAnalysis({ callsTotal: 5, discipline: discipline(12) }),
        ).toBe(false);
    });

    it('aiSignalColumns: «Тренды» и «Год назад» — только при данных; число колонок', () => {
        const none = aiSignalColumns([{ trends: null, yoy: null }, {}]);
        expect(none).toEqual({ trends: false, yoy: false });
        expect(aiSignalColumnCount(none)).toBe(AI_SIGNAL_FIXED_COLUMNS);
        expect(AI_SIGNAL_FIXED_COLUMNS).toBe(13);
        const both = aiSignalColumns([
            { trends: managerTrends(), yoy: null },
            { yoy: yoy() },
        ]);
        expect(both).toEqual({ trends: true, yoy: true });
        expect(aiSignalColumnCount(both)).toBe(15);
        expect(aiSignalColumnCount({ trends: true, yoy: false })).toBe(14);
    });

    it('pickAiRiskCalls: свежие первыми, не больше трёх; «ещё N»', () => {
        const calls = [
            riskCall({
                transcriptionId: 'old',
                callStartedAt: '2026-09-01T10:00:00Z',
            }),
            riskCall({
                transcriptionId: 'new',
                callStartedAt: '2026-09-20T10:00:00Z',
            }),
            riskCall({
                transcriptionId: 'mid',
                callStartedAt: '2026-09-10T10:00:00Z',
            }),
            riskCall({
                transcriptionId: 'older',
                callStartedAt: '2026-08-01T10:00:00Z',
            }),
        ];
        expect(
            pickAiRiskCalls(calls).map(call => call.transcriptionId),
        ).toEqual(['new', 'mid', 'old']);
        expect(calls.map(call => call.transcriptionId)[0]).toBe('old');
        expect(aiRiskCallsRestLabel(calls.length)).toBe('ещё 1');
        expect(aiRiskCallsRestLabel(3)).toBeNull();
        expect(aiRiskCallsRestLabel(0)).toBeNull();
    });
});

describe('ai-signal.util — причина «Не согласен»', () => {
    it('коды причин', () => {
        expect(isAiDisagreeReasonCode('score')).toBe(true);
        expect(isAiDisagreeReasonCode('other')).toBe(true);
        expect(isAiDisagreeReasonCode('nope')).toBe(false);
    });

    it('лимит комментария учитывает подпись причины и разделитель', () => {
        expect(aiDisagreeCommentMax(null)).toBe(AI_DISAGREE_REASON_MAX);
        expect(aiDisagreeCommentMax('other')).toBe(
            AI_DISAGREE_REASON_MAX - 'Другое'.length - 2,
        );
        expect(clampAiDisagreeComment('other', 'a'.repeat(400))).toHaveLength(
            aiDisagreeCommentMax('other'),
        );
    });

    it('composeAiDisagreeReason: подпись + комментарий, по отдельности, пусто', () => {
        expect(composeAiDisagreeReason('score', '  не так  ')).toBe(
            'Оценка не соответствует звонкам: не так',
        );
        expect(composeAiDisagreeReason('signal', '')).toBe('Сигнал не по делу');
        expect(composeAiDisagreeReason(null, ' комментарий ')).toBe(
            'комментарий',
        );
        expect(composeAiDisagreeReason(null, '   ')).toBeUndefined();
        expect(composeAiDisagreeReason(null, '')).toBeUndefined();
    });

    it('итоговая причина не длиннее лимита бэка', () => {
        const long = composeAiDisagreeReason('other', 'б'.repeat(500));
        expect(long).toBeDefined();
        expect(long?.length).toBeLessThanOrEqual(AI_DISAGREE_REASON_MAX);
        expect(long?.startsWith('Другое: ')).toBe(true);
    });

    it('счётчик «введено / доступно»', () => {
        expect(formatAiDisagreeCommentCounter(null, 'abc')).toBe(
            `3 / ${AI_DISAGREE_REASON_MAX}`,
        );
        expect(formatAiDisagreeCommentCounter('other', '')).toBe(
            `0 / ${aiDisagreeCommentMax('other')}`,
        );
    });
});
