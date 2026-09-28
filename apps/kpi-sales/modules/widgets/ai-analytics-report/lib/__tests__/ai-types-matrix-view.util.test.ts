import { describe, expect, it } from 'vitest';
import type { AiTypeTotals } from '@/modules/entities/ai-analytics/model';
import { aiMatrixPresentTypes } from '@/modules/entities/ai-analytics/lib/ai-types-matrix.util';
import {
    AI_SECTIONS_MATRIX_ALL,
    aiMatrixSections,
} from '@/modules/entities/ai-analytics/lib/ai-sections-matrix.util';
import { typeTotals } from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import {
    CALL_TYPES,
    matrixRows,
} from '@/modules/entities/ai-analytics/__tests__/ai-types-matrix-fixtures';
import {
    aiMatrixPresentUserIds,
    aiMatrixVisibleTotals,
    aiSectionsScoreIndicators,
    aiTypesScoreIndicators,
    buildAiTypeChips,
    resolveAiSectionsType,
} from '../ai-types-matrix-view.util';

const rows = matrixRows();
const presentTypes = aiMatrixPresentTypes(rows, CALL_TYPES);

describe('buildAiTypeChips', () => {
    it('чип на каждый тип периода: подпись, тон портала, флаг скрытия', () => {
        const state = buildAiTypeChips(presentTypes, ['cold'], CALL_TYPES);
        expect(state.chips.map(chip => chip.code)).toEqual([
            'cold',
            'presentation',
            'decision',
            'other',
        ]);
        expect(state.chips[0]).toEqual({
            code: 'cold',
            label: 'Холодный',
            tone: 'event-cold',
            hidden: true,
        });
        expect(state.chips[2]).toMatchObject({
            label: 'Решение',
            tone: 'neutral',
            hidden: false,
        });
        expect(state.hiddenCount).toBe(1);
    });

    it('скрытые коды, которых в периоде нет, в счётчик не входят', () => {
        const state = buildAiTypeChips(
            presentTypes,
            ['payment', 'presentation'],
            CALL_TYPES,
        );
        expect(state.hiddenCount).toBe(1);
        expect(state.chips.filter(chip => chip.hidden)).toHaveLength(1);
    });
});

describe('aiMatrixPresentUserIds', () => {
    it('менеджеры с n > 0 уникально в порядке появления', () => {
        expect(aiMatrixPresentUserIds(rows)).toEqual([7, 3]);
    });

    it('по типу — только менеджеры со звонками этого типа', () => {
        expect(aiMatrixPresentUserIds(rows, 'cold')).toEqual([7]);
        expect(aiMatrixPresentUserIds(rows, 'presentation')).toEqual([7, 3]);
        expect(aiMatrixPresentUserIds(rows, 'payment')).toEqual([]);
    });
});

describe('aiMatrixVisibleTotals', () => {
    const totals: AiTypeTotals[] = [
        typeTotals({ callType: 'cold', n: 3 }),
        typeTotals({ callType: 'presentation', n: 37 }),
        typeTotals({ callType: 'decision', n: 0 }),
    ];

    it('только видимые типы со звонками, порядок бэка', () => {
        const visible = presentTypes.filter(type => type.code !== 'cold');
        expect(
            aiMatrixVisibleTotals(totals, visible).map(total => total.callType),
        ).toEqual(['presentation']);
    });

    it('без итогов — пусто', () => {
        expect(aiMatrixVisibleTotals(null, presentTypes)).toEqual([]);
    });
});

describe('resolveAiSectionsType', () => {
    it('сохранённый тип есть в периоде — он', () => {
        expect(resolveAiSectionsType('decision', presentTypes)).toBe(
            'decision',
        );
    });

    it('сохранённого нет или пусто — первый тип периода', () => {
        expect(resolveAiSectionsType('payment', presentTypes)).toBe('cold');
        expect(resolveAiSectionsType('', presentTypes)).toBe('cold');
    });

    it('типов нет — null', () => {
        expect(resolveAiSectionsType('cold', [])).toBeNull();
    });
});

describe('показатели графиков оценок', () => {
    it('типы: код и подпись', () => {
        expect(aiTypesScoreIndicators(presentTypes.slice(0, 2))).toEqual([
            { code: 'cold', name: 'Холодный' },
            { code: 'presentation', name: 'Презентация' },
        ]);
    });

    it('разделы типа + «Все разборы» последним', () => {
        const indicators = aiSectionsScoreIndicators(
            aiMatrixSections(rows, 'presentation'),
        );
        expect(indicators.map(item => item.code)).toEqual([
            'GREETING',
            'NEEDS',
            'CLOSING',
            AI_SECTIONS_MATRIX_ALL.code,
        ]);
        expect(indicators[0]?.name).toBe('Приветствие');
        expect(indicators.at(-1)).toEqual(AI_SECTIONS_MATRIX_ALL);
    });
});
