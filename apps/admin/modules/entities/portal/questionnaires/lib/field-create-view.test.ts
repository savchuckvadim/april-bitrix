import { describe, expect, it } from 'vitest';
import {
    FIELD_CODE_MAX_LENGTH,
    addFieldOption,
    applyFieldTitle,
    buildFieldCreatePayload,
    buildFieldTypeOptions,
    createFieldDraft,
    describeCreatedFieldReject,
    describeFieldCreateBlockReason,
    describeFieldCreateProblem,
    needsFieldOptions,
    toFieldCode,
} from './field-create-view';
import type { QuestionnaireFieldCreateDraft } from './field-create-view';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import type {
    QuestionnaireField,
    QuestionnaireFieldCreateResponse,
    QuestionnaireFieldSource,
} from '../model';

/**
 * Проверки формы «завести поле в носителе».
 *
 * Главное правило: форма предлагает ровно то, что бэк примет. Тип поля
 * берётся из матрицы реестра, множественности здесь нет вовсе, а причины
 * отказа те же, что вернул бы бэк, — владелец читает их до нажатия.
 */

const source = (
    patch: Partial<QuestionnaireFieldSource> = {},
): QuestionnaireFieldSource => ({
    entity: 'smart',
    smartId: 3,
    entityTypeId: 177,
    bitrixId: 7,
    title: 'Презентации',
    ...patch,
});

const draft = (
    patch: Partial<QuestionnaireFieldCreateDraft> = {},
): QuestionnaireFieldCreateDraft => ({
    ...createFieldDraft(schema),
    title: 'Итог презентации',
    code: 'DECISION',
    type: 'string',
    ...patch,
});

const listDraft = (
    patch: Partial<QuestionnaireFieldCreateDraft> = {},
): QuestionnaireFieldCreateDraft =>
    draft({
        type: 'enumeration',
        options: [
            { key: 'opt_1', title: 'Тендер' },
            { key: 'opt_2', title: 'Отказ' },
        ],
        ...patch,
    });

describe('типы поля', () => {
    it('предлагаются только те, что анкета умеет заполнять', () => {
        const types = buildFieldTypeOptions(schema).map(option => option.type);

        expect(types).toContain('string');
        expect(types).toContain('enumeration');
        // Значение такого поля — ссылка на объект портала, а не ответ
        // менеджера: контролов у него в матрице нет.
        expect(types).not.toContain('crm');
        expect(types).not.toContain('file');
    });

    it('у типа есть человеческая подпись и список типов отображения', () => {
        const option = buildFieldTypeOptions(schema).find(
            item => item.type === 'datetime',
        );

        expect(option?.title).toBe('Дата и время');
        expect(option?.controls).toEqual(['datetime', 'date']);
    });

    it('справочник значений спрашивает только тип-список', () => {
        expect(needsFieldOptions(schema, 'enumeration')).toBe(true);
        expect(needsFieldOptions(schema, 'string')).toBe(false);
        expect(needsFieldOptions(schema, 'date')).toBe(false);
    });

    it('без реестра список типов пуст — выбирать не из чего', () => {
        expect(buildFieldTypeOptions(undefined)).toEqual([]);
    });
});

describe('код поля', () => {
    it('собирается транслитом подписи в верхнем регистре', () => {
        expect(toFieldCode('Итог презентации')).toBe('ITOG_PREZENTACII');
    });

    it('обрезается по длине и не оканчивается подчёркиванием', () => {
        const code = toFieldCode('Очень длинная подпись поля для проверки');

        expect(code.length).toBeLessThanOrEqual(FIELD_CODE_MAX_LENGTH);
        expect(code.endsWith('_')).toBe(false);
    });

    it('едет за подписью, пока владелец его не тронул', () => {
        const next = applyFieldTitle(draft(), 'Дата решения', false);

        expect(next.code).toBe('DATA_RESHENIYA');
    });

    it('правку кода подпись больше не затирает', () => {
        const next = applyFieldTitle(
            draft({ code: 'MY_CODE' }),
            'Дата решения',
            true,
        );

        expect(next.code).toBe('MY_CODE');
    });
});

describe('строки справочника', () => {
    it('добавляются со свободным ключом', () => {
        const options = addFieldOption([{ key: 'opt_1', title: 'Тендер' }]);

        expect(options).toHaveLength(2);
        expect(options.map(option => option.key)).toEqual(['opt_1', 'opt_2']);
    });
});

describe('describeFieldCreateProblem', () => {
    it('пустой черновик проходит только с подписью и кодом', () => {
        expect(
            describeFieldCreateProblem(draft({ title: ' ' }), schema),
        ).toContain('Подпись поля обязательна');
        expect(
            describeFieldCreateProblem(draft({ code: '' }), schema),
        ).toContain('Код поля обязателен');
    });

    it('кириллица в коде отклоняется до отправки', () => {
        expect(
            describeFieldCreateProblem(draft({ code: 'РЕШЕНИЕ' }), schema),
        ).toContain('латинские буквы');
    });

    it('слишком длинный код отклоняется до отправки', () => {
        expect(
            describeFieldCreateProblem(
                draft({ code: 'A'.repeat(FIELD_CODE_MAX_LENGTH + 1) }),
                schema,
            ),
        ).toContain('Код длиннее');
    });

    it('тип вне матрицы реестра отклоняется', () => {
        expect(
            describeFieldCreateProblem(draft({ type: 'file' }), schema),
        ).toContain('анкета заполнить не умеет');
    });

    it('список без значений отклоняется', () => {
        expect(
            describeFieldCreateProblem(
                listDraft({ options: [{ key: 'opt_1', title: '' }] }),
                schema,
            ),
        ).toContain('хотя бы одно значение');
    });

    it('пустая строка среди заполненных отклоняется', () => {
        expect(
            describeFieldCreateProblem(
                listDraft({
                    options: [
                        { key: 'opt_1', title: 'Тендер' },
                        { key: 'opt_2', title: ' ' },
                    ],
                }),
                schema,
            ),
        ).toContain('пустая подпись');
    });

    /**
     * У смарт-канала подпись значения это адрес записи: бэк ищет элемент
     * списка по ней. Два одинаковых значения сделали бы ответ
     * неоднозначным ещё до того, как поле появится в Битриксе.
     */
    it('повтор подписи значения отклоняется', () => {
        expect(
            describeFieldCreateProblem(
                listDraft({
                    options: [
                        { key: 'opt_1', title: 'Тендер' },
                        { key: 'opt_2', title: 'тендер ' },
                    ],
                }),
                schema,
            ),
        ).toContain('повторяется');
    });

    it('заполненный черновик замечаний не даёт', () => {
        expect(describeFieldCreateProblem(draft(), schema)).toBeNull();
        expect(describeFieldCreateProblem(listDraft(), schema)).toBeNull();
    });
});

describe('describeFieldCreateBlockReason', () => {
    it('без носителя заводить нечего', () => {
        expect(
            describeFieldCreateBlockReason(undefined, null, false),
        ).toContain('выберите носителя');
    });

    it('повторяет причину, по которой носитель недоступен целиком', () => {
        expect(
            describeFieldCreateBlockReason(
                source(),
                'анкета не привязана к типу события смарта «Презентации»',
                false,
            ),
        ).toContain('не привязана к типу события');
    });

    it('смарт без идентификатора типа: поля адресовать нечем', () => {
        expect(
            describeFieldCreateBlockReason(
                source({ warning: 'У смарта не записан идентификатор типа' }),
                null,
                false,
            ),
        ).toContain('идентификатор типа');
    });

    /**
     * Урезанное чтение означает, что у ключа нет прав администратора CRM.
     * Запись без них невозможна в принципе: фолбэка у неё нет — читающий
     * `crm.item.fields` писать не умеет.
     */
    it('урезанное чтение полей запрещает и запись', () => {
        expect(describeFieldCreateBlockReason(source(), null, true)).toContain(
            'администратора CRM',
        );
    });

    it('исправный носитель ничего не запрещает', () => {
        expect(
            describeFieldCreateBlockReason(source(), null, false),
        ).toBeNull();
    });
});

describe('buildFieldCreatePayload', () => {
    it('смарт уезжает своим smartId, код — в верхнем регистре', () => {
        const payload = buildFieldCreatePayload(
            draft({ code: 'decision' }),
            source(),
            schema,
        );

        expect(payload).toEqual({
            entity: 'smart',
            smartId: 3,
            code: 'DECISION',
            title: 'Итог презентации',
            type: 'string',
            isRequired: false,
        });
    });

    it('у штатной сущности идентификатора смарта в теле нет', () => {
        const payload = buildFieldCreatePayload(
            draft(),
            source({ entity: 'company', smartId: null, bitrixId: null }),
            schema,
        );

        expect(payload.smartId).toBeUndefined();
        expect(payload.entity).toBe('company');
    });

    it('значения списка уезжают с кодами из подписей', () => {
        const payload = buildFieldCreatePayload(listDraft(), source(), schema);

        expect(payload.items).toEqual([
            { title: 'Тендер', code: 'TENDER' },
            { title: 'Отказ', code: 'OTKAZ' },
        ]);
    });

    it('у типа без справочника значения не отправляются вовсе', () => {
        const payload = buildFieldCreatePayload(
            draft({ options: [{ key: 'opt_1', title: 'Тендер' }] }),
            source(),
            schema,
        );

        expect(payload.items).toBeUndefined();
    });
});

/**
 * Ответ на создание поля.
 *
 * Заказ у формы всегда одиночный и типа из матрицы, а вот в ОТВЕТЕ бэка
 * может приехать чужое поле: дубль он не заводит и возвращает найденное
 * по коду как есть.
 */
const createdField = (
    patch: Partial<QuestionnaireField> = {},
): QuestionnaireField => ({
    fieldName: 'UF_CRM_7_DECISION',
    title: 'Итог презентации',
    type: 'string',
    multiple: false,
    mandatory: false,
    bitrixId: 1234,
    xmlId: 'DECISION',
    items: [],
    inPortalDb: false,
    ...patch,
});

const createResult = (
    field: QuestionnaireField,
    created = false,
): QuestionnaireFieldCreateResponse => ({
    source: source(),
    field,
    created,
});

describe('describeCreatedFieldReject', () => {
    it('поле, годное анкете, уезжает в вопрос без разговоров', () => {
        expect(
            describeCreatedFieldReject(
                createResult(createdField(), true),
                schema,
                null,
            ),
        ).toBeNull();
    });

    it('множественное поле с тем же кодом в вопрос не берётся', () => {
        const reject = describeCreatedFieldReject(
            createResult(createdField({ multiple: true })),
            schema,
            null,
        );

        expect(reject).toContain('уже было');
        expect(reject).toContain('Множественное поле');
        expect(reject).toContain('другим кодом');
    });

    it('поле типа вне матрицы в вопрос не берётся', () => {
        expect(
            describeCreatedFieldReject(
                createResult(createdField({ type: 'file' })),
                schema,
                null,
            ),
        ).toContain('«file»');
    });

    it('список без значений в вопрос не берётся', () => {
        expect(
            describeCreatedFieldReject(
                createResult(createdField({ type: 'enumeration', items: [] })),
                schema,
                null,
            ),
        ).toContain('ни одного элемента');
    });

    it('созданное поле чужого типа тоже отклоняется, но своими словами', () => {
        const reject = describeCreatedFieldReject(
            createResult(createdField({ type: 'file' }), true),
            schema,
            null,
        );

        expect(reject).toContain('завелось');
        expect(reject).not.toContain('уже было');
    });
});
