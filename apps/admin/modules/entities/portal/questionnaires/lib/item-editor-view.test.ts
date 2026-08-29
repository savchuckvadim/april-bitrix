import { describe, expect, it } from 'vitest';
import {
    getFieldStatusProblem,
    getItemControlOptions,
    getRequireChangeLock,
    getStaleAfterDaysLock,
    getTargetEntityLock,
    issuesForItem,
    withGroupDividers,
} from './item-editor-view';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import { unknownCode } from './unknown-code.fixture';
import type { PortalQuestionnaireItemSave } from '../model';
import type { QuestionnaireDraftIssue } from './validate-questionnaire-draft';

const item = (
    patch: Partial<PortalQuestionnaireItemSave> = {},
): PortalQuestionnaireItemSave => ({
    code: 'decision_date',
    title: 'Когда решение',
    control: 'date',
    channel: 'crm',
    targetMode: 'auto',
    fieldName: 'UF_CRM_DECISION_DATE',
    fieldType: 'date',
    fieldSource: 'company',
    ...patch,
});

const codes = (options: { code: string }[]): string[] =>
    options.map(option => option.code);

describe('getItemControlOptions', () => {
    it('оставляет только типы, исполнимые для поля такого типа', () => {
        expect(codes(getItemControlOptions(item(), schema))).toEqual(['date']);
    });

    it('поле даты-времени принимает и «Дату и время», и «Дату»', () => {
        const options = getItemControlOptions(
            item({ fieldType: 'datetime', control: 'datetime' }),
            schema,
        );

        expect(codes(options)).toEqual(['date', 'datetime']);
    });

    it('строковое поле принимает «Строку» и «Текст»', () => {
        const options = getItemControlOptions(
            item({ fieldType: 'string', control: 'string' }),
            schema,
        );

        expect(codes(options)).toEqual(['string', 'text']);
    });

    it('поле, которое анкета заполнить не умеет, не даёт ни одного типа', () => {
        // `address` есть в матрице с пустым списком — вопрос из него бэк
        // отклонил бы, поэтому выбирать нечего.
        expect(
            getItemControlOptions(item({ fieldType: 'address' }), schema),
        ).toEqual([]);
    });

    it('тип поля вне матрицы равнозначен пустому списку', () => {
        expect(
            getItemControlOptions(item({ fieldType: 'unknown_type' }), schema),
        ).toEqual([]);
    });

    it('пока поле не выбрано, доступен весь реестр типов', () => {
        const options = getItemControlOptions(
            item({ fieldName: null, fieldType: null }),
            schema,
        );

        expect(codes(options)).toEqual(codes(schema.controls));
    });

    it('штатное поле матрицей не ограничено — типа поля у него нет', () => {
        const options = getItemControlOptions(
            item({ isNative: true, fieldType: null }),
            schema,
        );

        expect(codes(options)).toEqual(codes(schema.controls));
    });

    it('ответ в комментарий события матрицей не ограничен', () => {
        // Канал сменился, а поле осталось в черновике: фильтровать по нему
        // нельзя — ответ туда всё равно не пойдёт.
        const options = getItemControlOptions(
            item({ channel: 'text', fieldType: 'date' }),
            schema,
        );

        expect(codes(options)).toEqual(codes(schema.controls));
    });

    it('путь в отчёте фиксирует ровно один тип отображения', () => {
        const options = getItemControlOptions(
            item({
                channel: 'dto',
                dtoPath: 'sale.opportunity',
                control: 'money',
                fieldType: null,
                fieldName: null,
            }),
            schema,
        );

        expect(codes(options)).toEqual(['money']);
    });

    it('пока путь в отчёте не выбран, доступен весь реестр', () => {
        const options = getItemControlOptions(
            item({ channel: 'dto', dtoPath: null }),
            schema,
        );

        expect(codes(options)).toEqual(codes(schema.controls));
    });

    it('без реестра выбирать нечего', () => {
        expect(getItemControlOptions(item(), undefined)).toEqual([]);
    });
});

describe('getRequireChangeLock', () => {
    it('у ответа в поле CRM флаг доступен', () => {
        expect(getRequireChangeLock(item())).toBeNull();
    });

    it('канал по умолчанию — «Поле CRM», флаг доступен', () => {
        expect(getRequireChangeLock(item({ channel: undefined }))).toBeNull();
    });

    it('у ответа в комментарий события флаг заперт с объяснением', () => {
        const lock = getRequireChangeLock(item({ channel: 'text' }));

        expect(lock).not.toBeNull();
        expect(lock).toContain('поле CRM');
    });

    it('у ответа в отчёт флаг заперт: прежнего значения нет', () => {
        expect(getRequireChangeLock(item({ channel: 'dto' }))).not.toBeNull();
    });
});

describe('getStaleAfterDaysLock', () => {
    it('срок годности доступен датам', () => {
        expect(getStaleAfterDaysLock(item({ control: 'date' }))).toBeNull();
        expect(getStaleAfterDaysLock(item({ control: 'datetime' }))).toBeNull();
    });

    it('у остальных типов заперт с объяснением', () => {
        const lock = getStaleAfterDaysLock(item({ control: 'string' }));

        expect(lock).not.toBeNull();
        expect(lock).toContain('Дата');
    });
});

describe('getTargetEntityLock', () => {
    it('жёсткому носителю сущность выбирают руками', () => {
        expect(getTargetEntityLock(item({ targetMode: 'entity' }))).toBeNull();
    });

    it('в режиме «Автоматически» сущность не задаётся', () => {
        expect(getTargetEntityLock(item())).not.toBeNull();
        expect(
            getTargetEntityLock(item({ targetMode: undefined })),
        ).not.toBeNull();
    });
});

describe('issuesForItem', () => {
    const issues: QuestionnaireDraftIssue[] = [
        { scope: 'header', message: 'Код анкеты: значение обязательно' },
        { scope: 'item', itemCode: 'decision_date', message: 'первое' },
        { scope: 'item', itemCode: 'sale_sum', message: 'чужое' },
    ];

    it('берёт нарушения только своего вопроса', () => {
        expect(issuesForItem(issues, 'decision_date')).toEqual([
            { scope: 'item', itemCode: 'decision_date', message: 'первое' },
        ]);
    });
});

describe('withGroupDividers', () => {
    it('ставит разделитель там, где сменился заголовок группы', () => {
        const rows = withGroupDividers([
            item({ code: 'a', groupTitle: 'О клиенте' }),
            item({ code: 'b', groupTitle: 'О клиенте' }),
            item({ code: 'c', groupTitle: 'О деньгах' }),
        ]);

        expect(rows.map(row => row.isGroupStart)).toEqual([true, false, true]);
        expect(rows.map(row => row.groupTitle)).toEqual([
            'О клиенте',
            'О клиенте',
            'О деньгах',
        ]);
    });

    it('вопросы без группы разделителем не открываются', () => {
        const rows = withGroupDividers([
            item({ code: 'a' }),
            item({ code: 'b' }),
        ]);

        expect(rows.map(row => row.isGroupStart)).toEqual([false, false]);
    });

    it('выход из группы тоже виден разделителем', () => {
        const rows = withGroupDividers([
            item({ code: 'a', groupTitle: 'О клиенте' }),
            item({ code: 'b', groupTitle: null }),
        ]);

        expect(rows.map(row => row.isGroupStart)).toEqual([true, true]);
        expect(rows[1]?.groupTitle).toBeNull();
    });

    it('пустая строка заголовка — это отсутствие группы', () => {
        const rows = withGroupDividers([
            item({ code: 'a', groupTitle: '   ' }),
        ]);

        expect(rows[0]?.groupTitle).toBeNull();
        expect(rows[0]?.isGroupStart).toBe(false);
    });
});

describe('getFieldStatusProblem', () => {
    it('поле на месте проблемой не считается', () => {
        expect(
            getFieldStatusProblem(item({ fieldStatus: 'ok' }), schema),
        ).toBeNull();
        expect(getFieldStatusProblem(item(), schema)).toBeNull();
    });

    it('пропавшее поле объясняет, почему вопрос не уедет во фрейм', () => {
        const problem = getFieldStatusProblem(
            item({ fieldStatus: 'missing' }),
            schema,
        );

        expect(problem?.label).toBe('Поле не найдено');
        expect(problem?.reason).toContain('в каталог фрейма он не попадёт');
    });

    it('смену типа подписывает названием из реестра', () => {
        expect(
            getFieldStatusProblem(item({ fieldStatus: 'type_changed' }), schema)
                ?.label,
        ).toBe('Тип поля изменился');
    });

    it('неизвестный статус показывает кодом, а не пустотой', () => {
        expect(
            getFieldStatusProblem(
                item(unknownCode({ fieldStatus: 'renamed' })),
                schema,
            )?.label,
        ).toBe('renamed');
    });

    it('у ответа не в поле CRM ломаться нечему', () => {
        expect(
            getFieldStatusProblem(
                item({ channel: 'text', fieldStatus: 'missing' }),
                schema,
            ),
        ).toBeNull();
    });
});
