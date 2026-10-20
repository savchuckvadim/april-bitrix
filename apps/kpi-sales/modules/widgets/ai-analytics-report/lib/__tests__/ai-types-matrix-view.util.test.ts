import { describe, expect, it } from 'vitest';
import { AI_CALL_TYPE_OUTSIDE_SCORE_HINT } from '@/modules/entities/ai-analytics/lib/ai-call-types.data';
import {
    aiMatrixPresentTypes,
    aiTypesMatrixColumns,
} from '@/modules/entities/ai-analytics/lib/ai-types-matrix.util';
import {
    aiSectionsMatrixColumns,
    aiMatrixSections,
} from '@/modules/entities/ai-analytics/lib/ai-sections-matrix.util';
import {
    CALL_TYPES,
    matrixRows,
    matrixRowsWithInvites,
} from '@/modules/entities/ai-analytics/__tests__/ai-types-matrix-fixtures';
import {
    aiMatrixPresentUserIds,
    aiMatrixScoreIndicators,
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
        const state = buildAiTypeChips(presentTypes, ['payment', 'presentation'], CALL_TYPES);
        expect(state.hiddenCount).toBe(1);
        expect(state.footnote).toBeNull();
    });

    it('чип приглашения на мероприятие несёт подсказку «вне средней оценки» и общую сноску', () => {
        const withInvites = aiMatrixPresentTypes(matrixRowsWithInvites(), CALL_TYPES);
        const state = buildAiTypeChips(withInvites, [], CALL_TYPES);
        expect(state.chips.find(chip => chip.code === 'event_invite')).toEqual({
            code: 'event_invite',
            label: 'Мероприятие',
            tone: 'info',
            hidden: false,
            hint: AI_CALL_TYPE_OUTSIDE_SCORE_HINT,
        });
        expect(state.footnote).toBe(AI_CALL_TYPE_OUTSIDE_SCORE_HINT);
    });
});

describe('aiMatrixPresentUserIds', () => {
    it('менеджеры с n > 0 уникально в порядке появления; «все типы» — как без типа', () => {
        expect(aiMatrixPresentUserIds(rows)).toEqual([7, 3]);
        expect(aiMatrixPresentUserIds(rows, 'all')).toEqual([7, 3]);
    });

    it('по типу — только менеджеры со звонками этого типа', () => {
        expect(aiMatrixPresentUserIds(rows, 'cold')).toEqual([7]);
        expect(aiMatrixPresentUserIds(rows, 'presentation')).toEqual([7, 3]);
        expect(aiMatrixPresentUserIds(rows, 'payment')).toEqual([]);
    });
});

describe('resolveAiSectionsType', () => {
    it('сохранённый тип есть в периоде — он; «все типы» — всегда допустимы', () => {
        expect(resolveAiSectionsType('decision', presentTypes)).toBe('decision');
        expect(resolveAiSectionsType('all', presentTypes)).toBe('all');
    });

    it('сохранённого нет или пусто — «все типы» по умолчанию', () => {
        expect(resolveAiSectionsType('payment', presentTypes)).toBe('all');
        expect(resolveAiSectionsType('', presentTypes)).toBe('all');
    });

    it('типов нет — null', () => {
        expect(resolveAiSectionsType('cold', [])).toBeNull();
        expect(resolveAiSectionsType('all', [])).toBeNull();
    });
});

describe('aiMatrixScoreIndicators — показатели графиков оценок', () => {
    it('колонки-оценки без хвоста продаж: типы или корзины', () => {
        expect(
            aiMatrixScoreIndicators(aiTypesMatrixColumns(presentTypes.slice(0, 2), 'types', CALL_TYPES)),
        ).toEqual([
            { code: 'cold', name: 'Холодный' },
            { code: 'presentation', name: 'Презентация' },
        ]);
        expect(
            aiMatrixScoreIndicators(aiTypesMatrixColumns(presentTypes, 'buckets', CALL_TYPES)).map(
                item => item.code,
            ),
        ).toEqual(['bucket:contact', 'bucket:presentation', 'bucket:closing', 'other']);
    });

    it('разделы типа + «Итог» последним', () => {
        const indicators = aiMatrixScoreIndicators(
            aiSectionsMatrixColumns(aiMatrixSections(rows, 'presentation')),
        );
        expect(indicators.map(item => item.code)).toEqual(['GREETING', 'NEEDS', 'CLOSING', 'all']);
        expect(indicators.at(-1)?.name).toBe('Итог');
    });
});
