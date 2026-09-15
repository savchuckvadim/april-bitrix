import { describe, expect, it } from 'vitest';
import {
    AI_BY_TYPE_HIDDEN_NOTE,
    aiByTypeDescription,
    aiByTypeHiddenNote,
    applyAiByTypeVisibility,
    groupAiRowsByManager,
    pickAiByTypeVisibleLongRows,
    pickAiByTypeVisibleRows,
    pickAiVisibleTypeTotals,
} from '../lib/ai-by-type.util';
import {
    AI_ALL_TYPES_LABEL,
    aiCallTypeLabel,
    isAiByTypeAll,
    isAiCallTypeSelection,
} from '../lib/ai-call-types.data';
import {
    byType,
    cell,
    longRow,
    metric,
    typeTotals,
    wideRow,
} from './ai-fixtures';

describe('groupAiRowsByManager', () => {
    it('строки менеджера подряд, порядок менеджеров и строк — как пришёл', () => {
        const groups = groupAiRowsByManager([
            { managerId: '7', callType: 'cold' },
            { managerId: '7', callType: 'presentation' },
            { managerId: '3', callType: 'cold' },
            { managerId: '3', callType: 'presentation' },
        ]);
        expect(groups.map(group => group.managerId)).toEqual(['7', '3']);
        expect(groups[0]?.rows.map(row => row.callType)).toEqual([
            'cold',
            'presentation',
        ]);
        expect(groups[1]?.rows.map(row => row.callType)).toEqual([
            'cold',
            'presentation',
        ]);
    });

    it('разнесённые строки одного менеджера попадают в одну группу', () => {
        const groups = groupAiRowsByManager([
            { managerId: '7', indicator: 'a' },
            { managerId: '3', indicator: 'b' },
            { managerId: '7', indicator: 'c' },
        ]);
        expect(groups).toHaveLength(2);
        expect(groups[0]?.rows.map(row => row.indicator)).toEqual(['a', 'c']);
    });

    it('обычный тип: строка на менеджера — группа на строку; пусто — пусто', () => {
        expect(
            groupAiRowsByManager([{ managerId: '7' }, { managerId: '3' }]),
        ).toHaveLength(2);
        expect(groupAiRowsByManager([])).toEqual([]);
    });
});

describe('режим «все типы»', () => {
    it('гард all, подпись и валидность значения blob', () => {
        expect(isAiByTypeAll('all')).toBe(true);
        expect(isAiByTypeAll('cold')).toBe(false);
        expect(isAiByTypeAll(null)).toBe(false);
        expect(aiCallTypeLabel('all')).toBe(AI_ALL_TYPES_LABEL);
        expect(isAiCallTypeSelection('all')).toBe(true);
    });

    it('подзаголовок drawer: без данных — назначение, с данными — тип и период', () => {
        expect(aiByTypeDescription(null)).toContain('по всем типам сразу');
        expect(aiByTypeDescription(byType())).toBe(
            'Презентация: срез обзора за 2026-08-01 – 2026-08-31',
        );
        expect(
            aiByTypeDescription(byType({ callType: 'all', title: 'Все типы' })),
        ).toBe(
            'Все типы: строка на каждую пару менеджер × тип, срез обзора за 2026-08-01 – 2026-08-31',
        );
    });
});

describe('отсев пустых типов в режиме «все типы»', () => {
    it('широкая раскладка: остаются пары с разобранными звонками, скрытые посчитаны', () => {
        const rows = [
            wideRow({
                cell: cell({ callType: 'cold', n: 0, score: metric(null, 0) }),
            }),
            wideRow({ cell: cell({ callType: 'presentation', n: 12 }) }),
            wideRow({
                managerId: '3',
                cell: cell({ callType: 'other', n: 0 }),
            }),
        ];
        const result = pickAiByTypeVisibleRows(rows);
        expect(result.visible.map(row => row.cell.callType)).toEqual([
            'presentation',
        ]);
        expect(result.hidden).toBe(2);
    });

    it('чипы «Итоги по типам»: только типы со звонками', () => {
        const result = pickAiVisibleTypeTotals([
            typeTotals({ callType: 'cold', n: 5 }),
            typeTotals({ callType: 'irrelevant', n: 0 }),
        ]);
        expect(result.visible.map(total => total.callType)).toEqual(['cold']);
        expect(result.hidden).toBe(1);
    });

    it('длинная раскладка: пара скрывается целиком по строке score с n = 0; пара без score остаётся', () => {
        const rows = [
            longRow({
                callType: 'cold',
                kind: 'score',
                metric: metric(null, 0),
            }),
            longRow({
                callType: 'cold',
                kind: 'section',
                indicator: 'NEEDS',
                metric: metric(null, 0),
            }),
            longRow({
                callType: 'presentation',
                kind: 'score',
                metric: metric(6.4, 12),
            }),
            longRow({
                callType: 'presentation',
                kind: 'section',
                indicator: 'PRICE',
                metric: metric(5, 12),
            }),
            longRow({
                managerId: '3',
                callType: 'call',
                kind: 'kpi',
                indicator: 'call_done',
                metric: metric(4, 0),
            }),
        ];
        const result = pickAiByTypeVisibleLongRows(rows);
        expect(
            result.visible.map(
                row => `${row.managerId}|${row.callType}|${row.kind}`,
            ),
        ).toEqual([
            '7|presentation|score',
            '7|presentation|section',
            '3|call|kpi',
        ]);
        expect(result.hidden).toBe(1);
    });

    it('гард: при обычном типе список возвращается как есть, при all — отсев', () => {
        const rows = [
            wideRow({ cell: cell({ n: 0 }) }),
            wideRow({ cell: cell({ n: 9 }) }),
        ];
        const asIs = applyAiByTypeVisibility({
            callType: 'presentation',
            rows,
            pick: pickAiByTypeVisibleRows,
        });
        expect(asIs.visible).toBe(rows);
        expect(asIs.hidden).toBe(0);
        const filtered = applyAiByTypeVisibility({
            callType: 'all',
            rows,
            pick: pickAiByTypeVisibleRows,
        });
        expect(filtered.visible).toHaveLength(1);
        expect(filtered.hidden).toBe(1);
    });

    it('подпись под таблицей только при скрытых', () => {
        expect(aiByTypeHiddenNote(0)).toBeNull();
        expect(aiByTypeHiddenNote(2)).toBe(AI_BY_TYPE_HIDDEN_NOTE);
    });
});
