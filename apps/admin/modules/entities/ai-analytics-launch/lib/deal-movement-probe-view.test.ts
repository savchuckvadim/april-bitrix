import { describe, expect, it } from 'vitest';
import type { DealMovementProbeResult } from '../model';
import {
    parseProbeDealId,
    probeResultHeadline,
    probeResultLines,
    probeRunOutcome,
} from './deal-movement-probe-view';

const result = (
    over: Partial<DealMovementProbeResult> = {},
): DealMovementProbeResult => ({
    domain: 'april-garant.bitrix24.ru',
    dealId: 9041,
    phase: 'done',
    startedAt: '2026-11-18T10:00:00.000Z',
    finishedAt: '2026-11-18T10:00:20.000Z',
    moments: {
        before: '2026-11-10T08:12:00.000Z',
        afterLogMessage: '2026-11-10T08:12:00.000Z',
        afterComment: '2026-11-18T10:00:11.000Z',
        logMessageAt: '2026-11-18T10:00:04.000Z',
        commentAt: '2026-11-18T10:00:10.000Z',
    },
    logMessageShifts: false,
    commentShifts: true,
    conclusions: ['Запись журнала активность не сдвигает.'],
    error: null,
    ...over,
});

describe('parseProbeDealId', () => {
    it('принимает целое число больше нуля, с пробелами по краям', () => {
        expect(parseProbeDealId(' 9041 ')).toBe(9041);
    });

    it('отказывает пустому, нулю, дроби, минусу и тексту', () => {
        for (const input of ['', '0', '12.5', '-3', 'сделка 5', '9 041']) {
            expect(parseProbeDealId(input)).toBeNull();
        }
    });
});

describe('probeResultLines', () => {
    it('три момента активности и два ответа «сдвигает ли»', () => {
        const lines = probeResultLines(result());
        expect(lines).toHaveLength(5);
        expect(lines[3]).toEqual({
            label: 'Запись журнала сдвигает активность',
            value: 'нет',
        });
        expect(lines[4]).toEqual({
            label: 'Комментарий сдвигает активность',
            value: 'да',
        });
    });

    it('не дошли до записи — «не дошли», пустой момент — «пусто»', () => {
        const lines = probeResultLines(
            result({
                phase: 'failed',
                moments: {
                    before: null,
                    afterLogMessage: null,
                    afterComment: null,
                    logMessageAt: null,
                    commentAt: null,
                },
                logMessageShifts: null,
                commentShifts: null,
            }),
        );
        expect(lines[0]?.value).toBe('пусто');
        expect(lines[3]?.value).toBe('не дошли');
    });
});

describe('probeResultHeadline', () => {
    it('сделка и чем закончилась проверка — словами', () => {
        expect(probeResultHeadline(result({ phase: 'refused' }))).toBe(
            'Последняя проверка — сделка 9041, отказ',
        );
    });
});

describe('probeRunOutcome', () => {
    it('поставлена — ждать итог', () => {
        const outcome = probeRunOutcome({
            domain: 'april-garant.bitrix24.ru',
            dealId: 9041,
            dispatched: true,
            jobId: 'april-garant.bitrix24.ru:deal-movement:probe',
            reason: null,
        });
        expect(outcome.ok).toBe(true);
        expect(outcome.text).toContain('около минуты');
    });

    it('не поставлена — причина от сервера', () => {
        const outcome = probeRunOutcome({
            domain: 'april-garant.bitrix24.ru',
            dealId: 9041,
            dispatched: false,
            jobId: null,
            reason: 'По этому порталу проверка уже идёт',
        });
        expect(outcome.ok).toBe(false);
        expect(outcome.text).toBe(
            'Проверка не поставлена: По этому порталу проверка уже идёт',
        );
    });
});
