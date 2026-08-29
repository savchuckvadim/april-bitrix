import { describe, expect, it } from 'vitest';
import { buildQuestionnaireMatrix } from './questionnaire-matrix';
import type {
    QuestionnaireMatrix,
    QuestionnaireMatrixCell,
    QuestionnaireMatrixRow,
} from './questionnaire-matrix';
import { questionnairePresetSearch } from './questionnaire-preset';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import { questionnaire } from './questionnaire.fixture';
import { unknownCode } from './unknown-code.fixture';
import type {
    PortalQuestionnaire,
    PortalQuestionnaireCondition,
    PortalQuestionnaireListItem,
    QuestionnairePurpose,
} from '../model';

const listItem = (
    patch: Partial<PortalQuestionnaireListItem> = {},
): PortalQuestionnaireListItem => ({
    id: 'q-1',
    appCode: 'event-sales',
    code: 'plan_basics',
    title: 'Что узнать до звонка',
    purpose: 'plan',
    place: 'plan',
    itemsCount: 3,
    issuesCount: 0,
    isActive: true,
    sort: 500,
    version: 4,
    updatedAt: null,
    ...patch,
});

/**
 * Каталог из пар «строка списка + её условия показа».
 *
 * Условия живут только в составе анкеты (в списке бэка их нет), поэтому
 * `null` здесь означает ровно то же, что в жизни: состав ещё едет.
 */
const matrixOf = (
    entries: [
        Partial<PortalQuestionnaireListItem>,
        PortalQuestionnaireCondition[] | null,
    ][],
): QuestionnaireMatrix => {
    const list = entries.map(([item]) => listItem(item));
    const details = new Map<string, PortalQuestionnaire>();

    entries.forEach(([, conditions], index) => {
        const row = list[index]!;
        if (!conditions) return;
        details.set(
            row.id,
            questionnaire({
                id: row.id,
                purpose: row.purpose,
                conditions,
            }),
        );
    });

    return buildQuestionnaireMatrix(list, details, schema);
};

const rowOf = (
    matrix: QuestionnaireMatrix,
    kind: string,
    code: string,
): QuestionnaireMatrixRow =>
    matrix.groups
        .find(group => group.kind === kind)!
        .rows.find(row => row.code === code)!;

const cellOf = (
    matrix: QuestionnaireMatrix,
    kind: string,
    code: string,
    purpose: QuestionnairePurpose,
): QuestionnaireMatrixCell =>
    rowOf(matrix, kind, code).cells.find(cell => cell.purpose === purpose)!;

/** Названия анкет в клетке — по ним и читается матрица. */
const titlesIn = (
    matrix: QuestionnaireMatrix,
    kind: string,
    code: string,
    purpose: QuestionnairePurpose,
): string[] =>
    cellOf(matrix, kind, code, purpose).cards.map(card => card.title);

describe('buildQuestionnaireMatrix: каркас', () => {
    it('колонки — назначения реестра в его порядке', () => {
        const matrix = matrixOf([]);

        expect(
            matrix.columns.map(column => [column.purpose, column.label]),
        ).toEqual([
            ['plan', 'Для планирования'],
            ['report', 'Для отчётности'],
        ]);
    });

    it('группы строк — только событийные виды условий, подписи бэковские', () => {
        const matrix = matrixOf([]);

        expect(matrix.groups.map(group => group.kind)).toEqual([
            'planType',
            'reportType',
        ]);
        expect(matrix.groups[0]!.title).toBe('Тип планируемого события');
        expect(matrix.groups[1]!.title).toBe('Тип отчётного события');
    });

    it('строки — значения условия в порядке реестра, а не в нашем', () => {
        const matrix = matrixOf([]);

        expect(matrix.groups[0]!.rows.map(row => row.code)).toEqual([
            'warm',
            'presentation',
            'refine',
            'hot',
            'moneyAwait',
            'supply',
        ]);
        expect(rowOf(matrix, 'reportType', 'xoLead').label).toBe(
            'Холодный обзвон: лид',
        );
    });

    it('стадия, статус работы и «всегда» строками не становятся: это не типы события', () => {
        const kinds = matrixOf([]).groups.map(group => group.kind);

        expect(kinds).not.toContain('targetStage');
        expect(kinds).not.toContain('workStatus');
        expect(kinds).not.toContain('always');
    });
});

describe('buildQuestionnaireMatrix: раскладка анкет', () => {
    it('анкета попадает в КАЖДЫЙ свой тип и помечается общей', () => {
        const matrix = matrixOf([
            [
                { id: 'q-hot', purpose: 'report', title: 'Итоги решения' },
                [{ kind: 'reportType', values: ['hot', 'supply'] }],
            ],
        ]);

        expect(titlesIn(matrix, 'reportType', 'hot', 'report')).toEqual([
            'Итоги решения',
        ]);
        expect(titlesIn(matrix, 'reportType', 'supply', 'report')).toEqual([
            'Итоги решения',
        ]);

        const [card] = cellOf(matrix, 'reportType', 'hot', 'report').cards;
        expect(card!.isShared).toBe(true);
        // Подсказка называет ВСЕ типы: правка в одной клетке меняет анкету
        // в каждой из них.
        expect(card!.sharedWith).toEqual(['Решение', 'Поставка']);
        // Других условий у анкеты нет — оговаривать в клетке нечего.
        expect(card!.alsoRequires).toEqual([]);
    });

    it('анкета одного типа общей не считается', () => {
        const matrix = matrixOf([
            [{ purpose: 'plan' }, [{ kind: 'planType', values: ['warm'] }]],
        ]);

        const [card] = cellOf(matrix, 'planType', 'warm', 'plan').cards;
        expect(card!.isShared).toBe(false);
        expect(card!.sharedWith).toEqual(['Звонок']);
    });

    it('анкета попадает в строки обоих видов условий, но каждая клетка называет второе условие', () => {
        const matrix = matrixOf([
            [
                { id: 'q-both', purpose: 'report', title: 'Оба типа' },
                [
                    { kind: 'planType', values: ['warm'] },
                    { kind: 'reportType', values: ['warm'] },
                ],
            ],
        ]);

        expect(titlesIn(matrix, 'planType', 'warm', 'report')).toEqual([
            'Оба типа',
        ]);
        expect(titlesIn(matrix, 'reportType', 'warm', 'report')).toEqual([
            'Оба типа',
        ]);
        expect(matrix.loose).toHaveLength(0);

        // Виды условий требуются ОДНОВРЕМЕННО: анкета сработает не «и на
        // планируемом Звонке, и на отчётном», а только когда оба Звонки.
        // Поэтому «общей» она не считается, а каждая клетка договаривает
        // условие соседнего вида.
        const [planCard] = cellOf(matrix, 'planType', 'warm', 'report').cards;
        expect(planCard!.isShared).toBe(false);
        expect(planCard!.sharedWith).toEqual(['Звонок']);
        expect(planCard!.alsoRequires.map(chip => chip.label)).toEqual([
            'Тип отчётного события: Звонок',
        ]);

        const [reportCard] = cellOf(
            matrix,
            'reportType',
            'warm',
            'report',
        ).cards;
        expect(reportCard!.isShared).toBe(false);
        expect(reportCard!.alsoRequires.map(chip => chip.label)).toEqual([
            'Тип планируемого события: Звонок',
        ]);
    });

    it('анкета стоит в колонке своего назначения и только в ней', () => {
        const matrix = matrixOf([
            [{ purpose: 'plan' }, [{ kind: 'planType', values: ['warm'] }]],
        ]);

        expect(titlesIn(matrix, 'planType', 'warm', 'plan')).toHaveLength(1);
        expect(titlesIn(matrix, 'planType', 'warm', 'report')).toHaveLength(0);
    });

    it('чужие типы остаются пустыми', () => {
        const matrix = matrixOf([
            [{ purpose: 'plan' }, [{ kind: 'planType', values: ['warm'] }]],
        ]);

        expect(titlesIn(matrix, 'planType', 'hot', 'plan')).toHaveLength(0);
    });

    it('в одной клетке живут все её анкеты', () => {
        const matrix = matrixOf([
            [
                { id: 'q-1', purpose: 'report', title: 'Первая' },
                [{ kind: 'reportType', values: ['hot'] }],
            ],
            [
                { id: 'q-2', purpose: 'report', title: 'Вторая' },
                [{ kind: 'reportType', values: ['hot'] }],
            ],
        ]);

        expect(titlesIn(matrix, 'reportType', 'hot', 'report')).toEqual([
            'Первая',
            'Вторая',
        ]);
    });

    it('выключенная анкета видна как выключенная, а не спрятана', () => {
        const matrix = matrixOf([
            [
                { purpose: 'plan', isActive: false, itemsCount: 5 },
                [{ kind: 'planType', values: ['warm'] }],
            ],
        ]);

        const [card] = cellOf(matrix, 'planType', 'warm', 'plan').cards;
        expect(card!.isActive).toBe(false);
        expect(card!.itemsCount).toBe(5);
    });

    it('сломанные привязки видны прямо в клетке', () => {
        const matrix = matrixOf([
            [
                { purpose: 'plan', issuesCount: 2 },
                [{ kind: 'planType', values: ['warm'] }],
            ],
        ]);

        expect(
            cellOf(matrix, 'planType', 'warm', 'plan').cards[0]!.issuesCount,
        ).toBe(2);
    });
});

describe('buildQuestionnaireMatrix: предустановка пустой клетки', () => {
    it('пустая клетка отдаёт свои координаты: назначение, вид условия и тип', () => {
        const cell = cellOf(matrixOf([]), 'reportType', 'hot', 'report');

        expect(cell.cards).toHaveLength(0);
        expect(cell.preset).toEqual({
            purpose: 'report',
            conditionKind: 'reportType',
            conditionValue: 'hot',
        });
        expect(questionnairePresetSearch(cell.preset)).toBe(
            'purpose=report&conditionKind=reportType&conditionValue=hot',
        );
    });

    it('колонка планирования даёт предустановку планирования', () => {
        expect(
            cellOf(matrixOf([]), 'planType', 'supply', 'plan').preset,
        ).toEqual({
            purpose: 'plan',
            conditionKind: 'planType',
            conditionValue: 'supply',
        });
    });

    it('предустановка есть и у занятой клетки — рядом можно завести вторую анкету', () => {
        const matrix = matrixOf([
            [{ purpose: 'plan' }, [{ kind: 'planType', values: ['warm'] }]],
        ]);

        expect(cellOf(matrix, 'planType', 'warm', 'plan').preset).toEqual({
            purpose: 'plan',
            conditionKind: 'planType',
            conditionValue: 'warm',
        });
    });
});

describe('buildQuestionnaireMatrix: анкеты вне разреза', () => {
    it('«всегда» уходит в отдельный блок вместе со своими условиями', () => {
        const matrix = matrixOf([
            [
                { purpose: 'report', title: 'Всегда спрашиваем' },
                [{ kind: 'always' }],
            ],
        ]);

        expect(matrix.loose).toHaveLength(1);
        expect(matrix.loose[0]!.title).toBe('Всегда спрашиваем');
        expect(matrix.loose[0]!.reason).toBe('noEventType');
        expect(matrix.loose[0]!.purposeLabel).toBe('Для отчётности');
        // Условия остаются на виду: иначе блок выглядел бы свалкой.
        expect(matrix.loose[0]!.conditions.map(chip => chip.label)).toEqual([
            'Всегда',
        ]);
    });

    it('условие только по стадии — тоже вне разреза', () => {
        const matrix = matrixOf([
            [
                { purpose: 'report' },
                [{ kind: 'targetStage', values: ['sales_success'] }],
            ],
        ]);

        expect(matrix.loose[0]!.reason).toBe('noEventType');
        expect(matrix.loose[0]!.conditions[0]!.label).toBe(
            'Целевая стадия отправки: Успех',
        );
    });

    it('условие только по статусу работы — тоже вне разреза', () => {
        const matrix = matrixOf([
            [
                { purpose: 'report' },
                [{ kind: 'workStatus', values: ['success'] }],
            ],
        ]);

        expect(matrix.loose[0]!.reason).toBe('noEventType');
    });

    it('стадия рядом с типом события разрез не отменяет', () => {
        const matrix = matrixOf([
            [
                { purpose: 'report', title: 'Продажа по решению' },
                [
                    { kind: 'reportType', values: ['hot'] },
                    { kind: 'targetStage', values: ['sales_success'] },
                ],
            ],
        ]);

        expect(titlesIn(matrix, 'reportType', 'hot', 'report')).toEqual([
            'Продажа по решению',
        ]);
        expect(matrix.loose).toHaveLength(0);

        // Но клетка не молчит про стадию: без предикта «Успех» анкета
        // здесь не спросит ничего, и обещать её всему Решению нельзя.
        const [card] = cellOf(matrix, 'reportType', 'hot', 'report').cards;
        expect(card!.alsoRequires.map(chip => chip.label)).toEqual([
            'Целевая стадия отправки: Успех',
        ]);
    });

    it('незнакомый вид условия рядом с типом события клетка тоже договаривает', () => {
        // Фрейм анкету с неизвестным ему видом условия не покажет вовсе:
        // сырой код в клетке честнее пустоты — по нему видно, почему
        // анкета молчит.
        const matrix = matrixOf([
            [
                { purpose: 'report', title: 'Решение и что-то ещё' },
                [
                    { kind: 'reportType', values: ['hot'] },
                    unknownCode<PortalQuestionnaireCondition>({
                        kind: 'phaseOfMoon',
                        values: ['full'],
                    }),
                ],
            ],
        ]);

        const [card] = cellOf(matrix, 'reportType', 'hot', 'report').cards;
        expect(card!.alsoRequires.map(chip => chip.label)).toEqual([
            'phaseOfMoon: full',
        ]);
    });
});

describe('buildQuestionnaireMatrix: незнакомые коды', () => {
    it('незнакомый вид условия матрицу не роняет — анкета уходит вниз как есть', () => {
        const matrix = matrixOf([
            [
                { purpose: 'report', title: 'Из будущего' },
                [
                    unknownCode<PortalQuestionnaireCondition>({
                        kind: 'phaseOfMoon',
                        values: ['full'],
                    }),
                ],
            ],
        ]);

        expect(matrix.groups).toHaveLength(2);
        expect(matrix.loose).toHaveLength(1);
        expect(matrix.loose[0]!.title).toBe('Из будущего');
        // Чипс показывает сырые коды: реестр бэка мог уехать вперёд
        // админки, и «условий нет» было бы враньём.
        expect(matrix.loose[0]!.conditions[0]!.label).toBe('phaseOfMoon: full');
    });

    it('незнакомое значение известного вида: строки нет, но причина другая', () => {
        const matrix = matrixOf([
            [
                { purpose: 'report', title: 'Новый тип события' },
                [{ kind: 'reportType', values: ['upsell'] }],
            ],
        ]);

        expect(matrix.loose[0]!.reason).toBe('unknownValues');
    });

    it('знакомое значение рядом с незнакомым строку не теряет', () => {
        const matrix = matrixOf([
            [
                { purpose: 'report', title: 'Решение и что-то ещё' },
                [{ kind: 'reportType', values: ['hot', 'upsell'] }],
            ],
        ]);

        expect(titlesIn(matrix, 'reportType', 'hot', 'report')).toEqual([
            'Решение и что-то ещё',
        ]);
        expect(matrix.loose).toHaveLength(0);
    });

    it('назначение вне реестра оставляет анкету без колонки, но не без места', () => {
        const matrix = matrixOf([
            [
                unknownCode<Partial<PortalQuestionnaireListItem>>({
                    purpose: 'retro',
                    title: 'Ретроспектива',
                }),
                [{ kind: 'reportType', values: ['hot'] }],
            ],
        ]);

        expect(matrix.loose).toHaveLength(1);
        expect(matrix.loose[0]!.reason).toBe('unknownPurpose');
    });
});

describe('buildQuestionnaireMatrix: пока данных нет', () => {
    it('состав ещё едет — анкета ждёт, а не встаёт в случайную строку', () => {
        const matrix = matrixOf([
            [{ purpose: 'plan', title: 'Ещё грузится' }, null],
        ]);

        expect(matrix.pending.map(card => card.title)).toEqual([
            'Ещё грузится',
        ]);
        expect(matrix.loose).toHaveLength(0);
        expect(titlesIn(matrix, 'planType', 'warm', 'plan')).toHaveLength(0);
    });

    it('без реестра раскладывать нечем, но анкеты не теряются', () => {
        const list = [listItem()];
        const details = new Map([[list[0]!.id, questionnaire()]]);
        const matrix = buildQuestionnaireMatrix(list, details, undefined);

        expect(matrix.columns).toHaveLength(0);
        expect(matrix.groups).toHaveLength(0);
        expect(matrix.loose).toHaveLength(0);
        // Состав прочитан, а раскладывать по-прежнему нечем: подписи и
        // списки типов живут только в реестре.
        expect(matrix.pending).toHaveLength(1);
    });

    it('пустой каталог даёт пустую матрицу с кнопками во всех клетках', () => {
        const matrix = buildQuestionnaireMatrix(undefined, new Map(), schema);

        expect(matrix.groups[0]!.rows[0]!.cells).toHaveLength(2);
        expect(matrix.loose).toHaveLength(0);
        expect(matrix.pending).toHaveLength(0);
    });
});

describe('buildQuestionnaireMatrix: смарт и выключатель типов события', () => {
    it('помечает строки типов события, у которых есть смарт', () => {
        const matrix = matrixOf([]);

        expect(rowOf(matrix, 'reportType', 'presentation').hasSmart).toBe(true);
        expect(rowOf(matrix, 'reportType', 'hot').hasSmart).toBe(true);
        // У звонка смарта нет: элемента, в который уехал бы ответ, не
        // создаётся, и обещать это владельцу нельзя.
        expect(rowOf(matrix, 'reportType', 'warm').hasSmart).toBe(false);
        // Пометка не зависит от вида условия: смарт у типа события, а не
        // у планирования против отчёта.
        expect(rowOf(matrix, 'planType', 'presentation').hasSmart).toBe(true);
    });

    it('выключатель гасит строку типа события в обоих видах условия', () => {
        const list = [listItem()];
        const details = new Map([[list[0]!.id, questionnaire()]]);
        const matrix = buildQuestionnaireMatrix(list, details, schema, [
            'presentation',
        ]);

        expect(rowOf(matrix, 'reportType', 'presentation').isDisabled).toBe(
            true,
        );
        expect(rowOf(matrix, 'planType', 'presentation').isDisabled).toBe(true);
        expect(rowOf(matrix, 'reportType', 'hot').isDisabled).toBe(false);
    });

    it('гасит анкету, все типы события которой выключены', () => {
        const list = [listItem({ purpose: 'report' })];
        const details = new Map([
            [
                list[0]!.id,
                questionnaire({
                    purpose: 'report',
                    conditions: [
                        { kind: 'reportType', values: ['presentation'] },
                    ],
                }),
            ],
        ]);
        const matrix = buildQuestionnaireMatrix(list, details, schema, [
            'presentation',
        ]);

        expect(
            cellOf(matrix, 'reportType', 'presentation', 'report').cards[0]
                ?.isSilenced,
        ).toBe(true);
    });

    it('анкету с невыключенной альтернативой оставляет работать', () => {
        // Значения условия объединяются по ИЛИ: анкета сработает по
        // Решению и покажется в том числе на презентации.
        const list = [listItem({ purpose: 'report' })];
        const details = new Map([
            [
                list[0]!.id,
                questionnaire({
                    purpose: 'report',
                    conditions: [
                        { kind: 'reportType', values: ['presentation', 'hot'] },
                    ],
                }),
            ],
        ]);
        const matrix = buildQuestionnaireMatrix(list, details, schema, [
            'presentation',
        ]);

        expect(
            cellOf(matrix, 'reportType', 'presentation', 'report').cards[0]
                ?.isSilenced,
        ).toBe(false);
    });
});

describe('buildQuestionnaireMatrix: спонтанная презентация', () => {
    it('уходит вне разреза со своей причиной, а не как «без типа события»', () => {
        // Тип задачи у такой анкеты обычный звонок — строки в матрице нет,
        // но «сработает на любом типе» про неё сказать нельзя.
        const matrix = matrixOf([
            [
                { purpose: 'report', title: 'Спонтанная презентация' },
                [{ kind: 'presentationDone', values: [] }],
            ],
        ]);

        expect(matrix.loose).toHaveLength(1);
        expect(matrix.loose[0]!.reason).toBe('presentationDone');
    });

    it('гасится выключением презентации', () => {
        const matrix = buildQuestionnaireMatrix(
            [listItem({ purpose: 'report' })],
            new Map([
                [
                    'q-1',
                    questionnaire({
                        purpose: 'report',
                        conditions: [{ kind: 'presentationDone', values: [] }],
                    }),
                ],
            ]),
            schema,
            ['presentation'],
        );

        expect(matrix.loose[0]!.isSilenced).toBe(true);
    });
});
