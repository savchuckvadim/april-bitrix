import { describe, expect, it } from 'vitest';
import {
    ropMarkCall,
    ropMarkWeek,
} from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import type { AiFeedbackItem, AiFeedbackList } from '@/modules/entities/ai-analytics/model';
import {
    aiEmployeeFeedbackGroups,
    aiEmployeeFeedbackItems,
    aiEmployeeFeedbackPeriod,
    aiEmployeeRopMarkCalls,
} from '../ai-employee-feedback.util';

const item = (overrides: Partial<AiFeedbackItem>): AiFeedbackItem => ({
    id: 'f',
    kind: 'useful',
    object: 'attention:7:risk',
    managerId: '7',
    transcriptionId: null,
    requesterUserId: '42',
    reason: null,
    createdAt: '2026-09-10T08:00:00.000Z',
    ...overrides,
});

const list = (items: AiFeedbackItem[]): AiFeedbackList => ({
    items,
    disagreementSharePct: null,
});

describe('aiEmployeeFeedbackPeriod — период списка реакций', () => {
    it('период обзора как есть; без него — с первого дня позапрошлого месяца до сегодня', () => {
        expect(
            aiEmployeeFeedbackPeriod({ from: '2026-08-01', to: '2026-08-31' }, '2026-09-15'),
        ).toEqual({ from: '2026-08-01', to: '2026-08-31' });
        expect(aiEmployeeFeedbackPeriod(null, '2026-09-15')).toEqual({
            from: '2026-07-01',
            to: '2026-09-15',
        });
        expect(aiEmployeeFeedbackPeriod(null, '2026-01-10')).toEqual({
            from: '2025-11-01',
            to: '2026-01-10',
        });
    });
});

describe('aiEmployeeFeedbackGroups — счётчики по видам', () => {
    it('порядок справочника, незнакомые виды — «прочее» в конце, пусто без списка', () => {
        const groups = aiEmployeeFeedbackGroups(
            list([
                item({ id: '1', kind: 'disagree' }),
                item({ id: '2', kind: 'useful' }),
                item({ id: '3', kind: 'useful' }),
                item({ id: '4', kind: 'recommendation_done' }),
            ]),
        );
        expect(groups.map(group => `${group.label} ${group.count}`)).toEqual([
            'полезно 2',
            'не согласен 1',
            'прочее 1',
        ]);
        expect(aiEmployeeFeedbackGroups(null)).toEqual([]);
    });
});

describe('aiEmployeeFeedbackItems — последние реакции словами', () => {
    it('новые первыми, объект по-русски, причина без пробелов, лишние — в «ещё»', () => {
        const { items, hidden } = aiEmployeeFeedbackItems(
            list([
                item({ id: 'old', createdAt: '2026-09-01T08:00:00.000Z', object: 'overview:7', reason: '  не так  ' }),
                item({ id: 'new', createdAt: '2026-09-12T08:00:00.000Z', object: 'call:10' }),
                item({ id: 'mid', createdAt: '2026-09-05T08:00:00.000Z', object: 'pulse' }),
            ]),
            2,
        );
        expect(items.map(view => view.id)).toEqual(['new', 'mid']);
        expect(items[0]).toMatchObject({ kindLabel: 'полезно', objectLabel: 'звонок', reason: null });
        expect(hidden).toBe(1);
        expect(aiEmployeeFeedbackItems(null)).toEqual({ items: [], hidden: 0 });
        expect(
            aiEmployeeFeedbackItems(list([item({ object: 'overview:7', reason: '  не так  ' })])).items[0]?.reason,
        ).toBe('не так');
    });
});

describe('aiEmployeeRopMarkCalls — звонки подбора недели по сотруднику', () => {
    it('только звонки своего менеджера; подбора нет — пусто', () => {
        const week = ropMarkWeek({
            calls: [
                ropMarkCall({ transcriptionId: 'a', managerId: '7' }),
                ropMarkCall({ transcriptionId: 'b', managerId: '9' }),
            ],
        });
        expect(aiEmployeeRopMarkCalls(week, '7').map(call => call.transcriptionId)).toEqual(['a']);
        expect(aiEmployeeRopMarkCalls(null, '7')).toEqual([]);
    });
});
