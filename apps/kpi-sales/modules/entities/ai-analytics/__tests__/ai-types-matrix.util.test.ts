import { describe, expect, it } from 'vitest';
import {
    AI_CALL_TYPE_OUTSIDE_SCORE_HINT,
    aiCallTypeScoreHint,
} from '../lib/ai-call-types.data';
import { AI_MATRIX_TEXT } from '../lib/ai-matrix.texts';
import {
    aiMatrixPresentTypes,
    aiMatrixVisibleTypes,
    aiTypesBackendTotals,
    aiTypesMatrixColumns,
    buildAiTypesMatrixFor,
    isAiTypesMatrixMode,
    parseAiHiddenTypes,
    serializeAiHiddenTypes,
    toggleAiHiddenType,
} from '../lib/ai-types-matrix.util';
import { cell, metric, typeTotals, wideRow } from './ai-fixtures';
import {
    CALL_TYPES,
    managerName,
    matrixRows,
    matrixRowsWithInvites,
} from './ai-types-matrix-fixtures';

const codes = (items: { code: string }[]): string[] =>
    items.map(item => item.code);

const presentTypes = (rows = matrixRows()) =>
    aiMatrixPresentTypes(rows, CALL_TYPES);

describe('aiMatrixPresentTypes — типы со звонками и их порядок', () => {
    it('порядок подвкладок, other в конце; подписи — портал, иначе фолбэк', () => {
        const types = presentTypes();
        expect(codes(types)).toEqual(['cold', 'presentation', 'decision', 'other']);
        expect(types.map(type => type.label)).toEqual([
            'Холодный',
            'Презентация',
            'Решение',
            'Прочее',
        ]);
    });

    it('тип без звонков у всех менеджеров не попадает в список', () => {
        const rows = [
            ...matrixRows(),
            wideRow({ cell: cell({ callType: 'payment', n: 0 }) }),
        ];
        expect(codes(aiMatrixPresentTypes(rows, CALL_TYPES))).not.toContain(
            'payment',
        );
        expect(aiMatrixPresentTypes([], CALL_TYPES)).toEqual([]);
    });

    it('скрытые типы исключаются из видимых', () => {
        expect(
            codes(aiMatrixVisibleTypes(presentTypes(), ['cold', 'other'])),
        ).toEqual(['presentation', 'decision']);
    });

    it('приглашение на мероприятие — своя колонка после оплаты с подсказкой «вне средней оценки»', () => {
        const types = presentTypes(matrixRowsWithInvites());
        expect(codes(types)).toEqual([
            'cold',
            'presentation',
            'decision',
            'event_invite',
            'other',
        ]);
        expect(types.find(type => type.code === 'event_invite')).toEqual({
            code: 'event_invite',
            label: 'Мероприятие',
            hint: AI_CALL_TYPE_OUTSIDE_SCORE_HINT,
        });
        // Без карты портала подсказка берётся по коду — тип не теряется.
        expect(
            aiMatrixPresentTypes(matrixRowsWithInvites(), []).find(
                type => type.code === 'event_invite',
            )?.hint,
        ).toBe(AI_CALL_TYPE_OUTSIDE_SCORE_HINT);
    });
});

describe('aiCallTypeScoreHint — тип вне средней оценки', () => {
    it('по карте портала: корзины нет и колонка есть; «прочее» без колонки — без подсказки', () => {
        expect(aiCallTypeScoreHint('event_invite', CALL_TYPES)).toBe(
            AI_CALL_TYPE_OUTSIDE_SCORE_HINT,
        );
        expect(aiCallTypeScoreHint('presentation', CALL_TYPES)).toBeNull();
        expect(
            aiCallTypeScoreHint('other', [
                {
                    code: 'other',
                    title: 'Прочее',
                    tone: 'neutral',
                    bucket: null,
                    column: false,
                    kpiPrimaryEventTypeCode: null,
                },
            ]),
        ).toBeNull();
        expect(aiCallTypeScoreHint(null, CALL_TYPES)).toBeNull();
    });
});

describe('скрытые типы — localStorage; режим колонок', () => {
    it('parse: разделитель запятая, пробелы и дубли отбрасываются', () => {
        expect(parseAiHiddenTypes('cold, other,,cold')).toEqual(['cold', 'other']);
        expect(parseAiHiddenTypes('')).toEqual([]);
    });

    it('toggle добавляет и снимает код, не мутируя список; serialize — через запятую', () => {
        const initial = ['cold'];
        const added = toggleAiHiddenType(initial, 'other');
        expect(added).toEqual(['cold', 'other']);
        expect(initial).toEqual(['cold']);
        expect(toggleAiHiddenType(added, 'cold')).toEqual(['other']);
        expect(serializeAiHiddenTypes(added)).toBe('cold,other');
    });

    it('гард режима колонок', () => {
        expect(isAiTypesMatrixMode('buckets')).toBe(true);
        expect(isAiTypesMatrixMode('types')).toBe(true);
        expect(isAiTypesMatrixMode('')).toBe(false);
    });
});

describe('aiTypesMatrixColumns', () => {
    it('«по типам»: видимые типы с callType для клика по шапке + хвост продаж', () => {
        const columns = aiTypesMatrixColumns(presentTypes(), 'types', CALL_TYPES);
        expect(codes(columns)).toEqual([
            'cold',
            'presentation',
            'decision',
            'other',
            'sales_count',
            'advance_amount',
            'monthly_amount',
        ]);
        expect(columns[0]).toEqual({ code: 'cold', name: 'Холодный', callType: 'cold' });
        expect(columns[4]?.plain).toBe(true);
    });

    it('«корзины»: корзины с видимыми типами, затем типы вне корзин (с прежней подсказкой), хвост продаж', () => {
        const columns = aiTypesMatrixColumns(
            presentTypes(matrixRowsWithInvites()),
            'buckets',
            CALL_TYPES,
        );
        expect(codes(columns)).toEqual([
            'bucket:contact',
            'bucket:presentation',
            'bucket:closing',
            'event_invite',
            'other',
            'sales_count',
            'advance_amount',
            'monthly_amount',
        ]);
        expect(columns.slice(0, 3).map(column => column.name)).toEqual([
            'Контакт',
            'Презентация',
            'Закрытие',
        ]);
        expect(columns[3]?.hint).toBe(AI_CALL_TYPE_OUTSIDE_SCORE_HINT);
        // Скрытый тип уходит и из корзины: без презентации нет и её корзины.
        const without = aiTypesMatrixColumns(
            aiMatrixVisibleTypes(presentTypes(), ['presentation']),
            'buckets',
            CALL_TYPES,
        );
        expect(codes(without)).not.toContain('bucket:presentation');
    });
});

describe('buildAiTypesMatrixFor — «AI: типы звонков» по типам', () => {
    const build = (hidden: string[] = [], userIds?: ReadonlySet<number>) =>
        buildAiTypesMatrixFor(
            matrixRows(),
            aiMatrixVisibleTypes(presentTypes(), hidden),
            { managerName, userIds, callTypes: CALL_TYPES, mode: 'types' },
        );

    it('строка на менеджера: value = разборов, крупно оценка / «ещё N» / прочерк, хвост продаж числами', () => {
        const { table, columns } = build();
        expect(table.code).toBe('ai-types-matrix');
        expect(table.firstCellName).toBe('Менеджер');
        expect(table.data.map(row => [row.id, row.name])).toEqual([
            [7, 'Иванов Иван'],
            [3, 'Петров Пётр'],
        ]);
        const first = table.data[0];
        expect(first?.actions.map(action => action.code)).toEqual(codes(columns));
        expect(first?.actions.map(action => action.value)).toEqual([
            3, 12, 0, 2, 3, 150000, 42000,
        ]);
        expect(first?.actions.map(action => action.display)).toEqual([
            'ещё 5',
            '6,4',
            '—',
            'ещё 6',
            undefined,
            undefined,
            undefined,
        ]);
        expect(table.data[1]?.actions.map(action => action.display)).toEqual([
            '—',
            '7,1',
            '5,5',
            '—',
            undefined,
            undefined,
            undefined,
        ]);
    });

    it('аннотации: предварительно при 8–19, «до оценки» при нехватке, без звонков — нет', () => {
        const { annotations } = build();
        expect(annotations.get('7:presentation')).toEqual({
            text: 'предварительно · по 12 звонкам',
            score: 6.4,
            n: 12,
            remaining: 0,
        });
        expect(annotations.get('7:cold')).toEqual({
            text: 'до оценки · по 3 звонкам',
            score: null,
            n: 3,
            remaining: 5,
        });
        expect(annotations.get('3:presentation')?.text).toBe('по 25 звонкам');
        expect(annotations.has('7:decision')).toBe(false);
        expect(annotations.has('7:sales_count')).toBe(false);
    });

    it('итоги колонок — норма ячеек: взвешенная оценка, объём, сотрудников; подсказка «около среднего»', () => {
        const { totals, table } = build();
        expect(totals.get('presentation')).toEqual({
            code: 'presentation',
            n: 37,
            score: 6.9,
            managers: 2,
            partial: false,
        });
        expect(totals.get('cold')).toMatchObject({ n: 3, score: null, managers: 1 });
        expect(totals.get('sales_count')).toMatchObject({ n: 4, score: null });
        // Текст бэка в подсказке ячейки важнее подсказки по норме.
        const petrov = table.data[1]?.actions.find(a => a.code === 'presentation');
        expect(petrov?.tooltip).toBe('Оценка 6,4/10 (n = 12).');
        expect(petrov?.className).toBeUndefined();
    });

    it('скрытые типы уходят из колонок и аннотаций; userIds и onlyWithReviews режут строки', () => {
        const hidden = build(['cold', 'other']);
        expect(codes(hidden.columns)).toEqual([
            'presentation',
            'decision',
            'sales_count',
            'advance_amount',
            'monthly_amount',
        ]);
        expect(hidden.annotations.has('7:cold')).toBe(false);
        expect(build([], new Set([3])).table.data.map(row => row.id)).toEqual([3]);

        const rows = [
            ...matrixRows(),
            wideRow({ managerId: '9', cell: cell({ callType: 'cold', n: 0 }) }),
        ];
        const onlyWith = buildAiTypesMatrixFor(rows, presentTypes(), {
            managerName,
            onlyWithReviews: true,
        });
        expect(onlyWith.table.data.map(row => row.id)).toEqual([7, 3]);
        expect(onlyWith.hiddenUserIds).toEqual([9]);
        expect(
            buildAiTypesMatrixFor(rows, presentTypes(), { managerName }).table.data,
        ).toHaveLength(3);
    });

    it('подсказка колонки приглашений в columnHints; без помеченных колонок поля нет', () => {
        const { table } = buildAiTypesMatrixFor(
            matrixRowsWithInvites(),
            presentTypes(matrixRowsWithInvites()),
            { managerName },
        );
        expect([...(table.columnHints?.entries() ?? [])]).toEqual([
            ['event_invite', AI_CALL_TYPE_OUTSIDE_SCORE_HINT],
        ]);
        expect(build().table.columnHints).toBeUndefined();
    });
});

describe('buildAiTypesMatrixFor — корзины', () => {
    const buildBuckets = (
        bucketsOf?: Parameters<typeof buildAiTypesMatrixFor>[2]['bucketsOf'],
    ) =>
        buildAiTypesMatrixFor(matrixRows(), presentTypes(), {
            managerName,
            callTypes: CALL_TYPES,
            mode: 'buckets',
            bucketsOf,
        });

    it('корзина складывается из ячеек типов: контакт без оценки — «ещё», презентация — оценка', () => {
        const { table, annotations } = buildBuckets();
        const ivanov = table.data[0]?.actions.map(action => action.display);
        expect(ivanov?.slice(0, 4)).toEqual(['ещё 5', '6,4', '—', 'ещё 6']);
        expect(annotations.get('7:bucket:contact')).toMatchObject({
            score: null,
            n: 3,
            remaining: 5,
        });
        expect(annotations.get('3:bucket:closing')).toMatchObject({
            score: 5.5,
            n: 9,
        });
        // Подсказка по корзине без текста бэка: только пометка «предварительно».
        expect(
            table.data[0]?.actions.find(a => a.code === 'bucket:presentation')?.tooltip,
        ).toBe(AI_MATRIX_TEXT.hint.low(20));
    });

    it('точные оценки корзин из обзора в приоритете над ячейками', () => {
        const { annotations } = buildBuckets(managerId =>
            managerId === '7'
                ? [{ bucket: 'contact', n: 9, score: metric(6, 9) }]
                : null,
        );
        expect(annotations.get('7:bucket:contact')).toMatchObject({
            score: 6,
            n: 9,
        });
        expect(annotations.get('3:bucket:closing')?.n).toBe(9);
    });
});

describe('aiTypesBackendTotals — итоги сводной из totalsByType', () => {
    const totalsByType = [
        typeTotals({
            callType: 'presentation',
            n: 40,
            score: metric(6.8, 40),
            managers: 3,
        }),
        typeTotals({ callType: 'cold', n: 15, score: metric(5.9, 15), managers: 3 }),
    ];

    it('тип — как есть, с объяснением бэка; корзина — сумма и взвешенная оценка типов', () => {
        const typesColumns = aiTypesMatrixColumns(presentTypes(), 'types', CALL_TYPES);
        const byType = aiTypesBackendTotals(totalsByType, typesColumns, CALL_TYPES);
        expect(byType.get('presentation')).toEqual({
            n: 40,
            score: 6.8,
            managers: 3,
            explanation: 'Оценка 6,4/10 (n = 12).',
        });
        expect(byType.has('decision')).toBe(false);
        expect(byType.has('sales_count')).toBe(false);

        const bucketColumns = aiTypesMatrixColumns(presentTypes(), 'buckets', CALL_TYPES);
        const byBucket = aiTypesBackendTotals(totalsByType, bucketColumns, CALL_TYPES);
        expect(byBucket.get('bucket:contact')).toEqual({
            n: 15,
            score: 5.9,
            partial: false,
        });
        expect(byBucket.has('bucket:closing')).toBe(false);
        expect(aiTypesBackendTotals(null, typesColumns, CALL_TYPES).size).toBe(0);
    });

    it('итоги бэка перекрывают посчитанные по строкам, сотрудники корзины — по строкам', () => {
        const columns = aiTypesMatrixColumns(presentTypes(), 'buckets', CALL_TYPES);
        const { totals } = buildAiTypesMatrixFor(matrixRows(), presentTypes(), {
            managerName,
            callTypes: CALL_TYPES,
            mode: 'buckets',
            totals: aiTypesBackendTotals(totalsByType, columns, CALL_TYPES),
        });
        expect(totals.get('bucket:presentation')).toMatchObject({
            n: 40,
            score: 6.8,
            managers: 2,
        });
        expect(totals.get('bucket:closing')).toMatchObject({ n: 9, score: 5.5 });
    });
});
