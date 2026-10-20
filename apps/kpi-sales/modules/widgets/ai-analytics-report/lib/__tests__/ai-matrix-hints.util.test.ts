import { describe, expect, it } from 'vitest';
import { AI_CALL_TYPE_OUTSIDE_SCORE_HINT } from '@/modules/entities/ai-analytics/lib/ai-call-types.data';
import {
    aiMatrixPresentTypes,
    aiTypesMatrixColumns,
} from '@/modules/entities/ai-analytics/lib/ai-types-matrix.util';
import {
    aiMatrixSections,
    aiSectionsMatrixColumns,
} from '@/modules/entities/ai-analytics/lib/ai-sections-matrix.util';
import {
    CALL_TYPES,
    matrixRows,
    matrixRowsWithInvites,
} from '@/modules/entities/ai-analytics/__tests__/ai-types-matrix-fixtures';
import { aiSectionsColumnHints, aiTypesColumnHints } from '../ai-matrix-hints.util';
import { AI_MATRIX_BLOCK_TEXT } from '../ai-matrix-texts';

const T = AI_MATRIX_BLOCK_TEXT;

describe('aiTypesColumnHints — подсказки шапки «AI: типы звонков»', () => {
    it('корзина, тип (с сохранённой пометкой «вне средней оценки») и хвост продаж', () => {
        const rows = matrixRowsWithInvites();
        const columns = aiTypesMatrixColumns(
            aiMatrixPresentTypes(rows, CALL_TYPES),
            'buckets',
            CALL_TYPES,
        );
        const hints = aiTypesColumnHints(columns);
        expect(hints.get('bucket:contact')).toBe(
            `${T.types.bucketHint.contact} ${T.types.bucketAction}`,
        );
        expect(hints.get('event_invite')).toBe(
            `${AI_CALL_TYPE_OUTSIDE_SCORE_HINT}. ${T.types.typeHint('Мероприятие')}`,
        );
        expect(hints.get('other')).toBe(T.types.typeHint('Прочее'));
        expect(hints.get('sales_count')).toBe(T.types.salesHint);
        expect(hints.size).toBe(columns.length);
    });
});

describe('aiSectionsColumnHints — подсказки шапки разделов', () => {
    const columns = aiSectionsMatrixColumns(aiMatrixSections(matrixRows(), 'presentation'));

    it('раздел: описание по коду и важность из итогов; «Итог» — по режиму', () => {
        const hints = aiSectionsColumnHints(columns, new Map([['NEEDS', 72]]), false);
        expect(hints.get('NEEDS')).toBe(
            T.sections.sectionHint(
                'Выявление потребностей',
                T.sections.sectionDescription.NEEDS,
                72,
            ),
        );
        expect(hints.get('GREETING')).not.toContain('важен');
        expect(hints.get('all')).toBe(T.sections.totalHint(false));
        expect(aiSectionsColumnHints(columns, new Map(), true).get('all')).toBe(
            T.sections.totalHint(true),
        );
    });

    it('незнакомый раздел — нейтральное описание без кода', () => {
        const hints = aiSectionsColumnHints(
            [{ code: 'CUSTOM', name: 'Своё' }],
            new Map(),
            false,
        );
        expect(hints.get('CUSTOM')).toContain(T.sections.sectionDescriptionFallback);
        expect(hints.get('CUSTOM')).not.toContain('CUSTOM');
    });
});
