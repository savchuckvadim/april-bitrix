import { describe, expect, it } from 'vitest';
import type {
    AiRefreshScenarioDto,
    AiRefreshStepDto,
} from '@workspace/nest-admin-api';
import { currentStepOf, shortDateTime, summaryOf } from './ai-refresh-view';

const step = (
    code: AiRefreshStepDto['code'],
    state: AiRefreshStepDto['state'],
): AiRefreshStepDto => ({
    code,
    title: code,
    state,
    phase: null,
    startedAt: null,
    finishedAt: null,
    text: null,
});

const scenario = (
    states: AiRefreshStepDto['state'][],
    finished: boolean,
): AiRefreshScenarioDto => ({
    id: 's1',
    domain: 'gsr.bitrix24.ru',
    monthKey: '2026-10',
    from: '2026-10-01',
    to: '2026-10-31',
    withReanalysis: true,
    steps: (
        ['reanalyze', 'rebuild', 'cache', 'forecast', 'owner-report'] as const
    ).map((code, index) => step(code, states[index] ?? 'pending')),
    startedAt: '2026-11-08T15:00:00.000Z',
    updatedAt: '2026-11-08T15:05:00.000Z',
    finished,
    requestedBy: null,
});

describe('ход сценария «обновить всё»', () => {
    it('идёт — номер текущего шага из пяти и его название', () => {
        const s = scenario(['done', 'running'], false);
        expect(currentStepOf(s)?.code).toBe('rebuild');
        expect(summaryOf(s)).toEqual({
            text: 'Идёт шаг 2 из 5: rebuild',
            tone: 'info',
        });
    });

    it('закончено — чисто или с сорвавшимися шагами', () => {
        expect(
            summaryOf(scenario(['done', 'done', 'done', 'skipped', 'done'], true))
                .tone,
        ).toBe('success');
        expect(
            summaryOf(scenario(['error', 'done', 'done', 'skipped', 'done'], true)),
        ).toEqual({
            text: 'Закончено, есть сорвавшиеся шаги',
            tone: 'warning',
        });
    });

    it('дата коротко; не дата — как есть', () => {
        expect(shortDateTime('нет')).toBe('нет');
        expect(shortDateTime('2026-11-08T15:05:00.000Z')).toMatch(
            /^08\.11, \d\d:05$/,
        );
    });
});
