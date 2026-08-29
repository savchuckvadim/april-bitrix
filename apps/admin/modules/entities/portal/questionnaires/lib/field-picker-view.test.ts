import { describe, expect, it } from 'vitest';
import {
    buildFieldPickerRows,
    buildFieldSourceOptions,
    countSelectableRows,
    describeDegradedNotice,
    describeFieldUsage,
    describeSmartSource,
    describeSourceNotice,
    fieldSourceKey,
} from './field-picker-view';
import { buildItemFromField } from './build-item-from-field';
import { portalSmart } from './questionnaire.fixture';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import type { QuestionnaireField, QuestionnaireFieldSource } from '../model';

const field = (
    patch: Partial<QuestionnaireField> = {},
): QuestionnaireField => ({
    fieldName: 'UF_CRM_DECISION_DATE',
    title: 'Дата решения',
    type: 'date',
    multiple: false,
    mandatory: false,
    bitrixId: 1234,
    xmlId: 'DECISION_DATE',
    items: [],
    inPortalDb: false,
    usedIn: [],
    ...patch,
});

const source = (
    patch: Partial<QuestionnaireFieldSource> = {},
): QuestionnaireFieldSource => ({
    entity: 'company',
    smartId: null,
    entityTypeId: 4,
    bitrixId: null,
    title: 'Компания',
    ...patch,
});

/** Поле установщика и поле, заведённое владельцем руками. */
const installed = field({
    fieldName: 'UF_CRM_PBX_STAGE',
    title: 'Стадия pbx',
    inPortalDb: true,
    portalCode: 'pbx_stage',
});
const manual = field();

describe('buildFieldPickerRows', () => {
    it('фильтр «только созданные вручную» оставляет поля владельца', () => {
        const rows = buildFieldPickerRows([installed, manual], schema, null, {
            onlyManual: true,
        });

        expect(rows.map(row => row.field.fieldName)).toEqual([
            'UF_CRM_DECISION_DATE',
        ]);
        expect(rows[0]?.isManual).toBe(true);
    });

    it('без фильтра показывает и поля установщика — с честной меткой', () => {
        const rows = buildFieldPickerRows([installed, manual], schema, null);

        expect(rows).toHaveLength(2);
        expect(rows[0]?.isManual).toBe(false);
        expect(rows[1]?.isManual).toBe(true);
    });

    it('ищет и по названию, и по UF-имени, и по коду из слепка', () => {
        const byTitle = buildFieldPickerRows(
            [installed, manual],
            schema,
            null,
            { search: 'дата' },
        );
        const byName = buildFieldPickerRows([installed, manual], schema, null, {
            search: 'uf_crm_pbx',
        });
        const byCode = buildFieldPickerRows([installed, manual], schema, null, {
            search: 'pbx_stage',
        });

        expect(byTitle.map(row => row.field.fieldName)).toEqual([
            'UF_CRM_DECISION_DATE',
        ]);
        expect(byName.map(row => row.field.fieldName)).toEqual([
            'UF_CRM_PBX_STAGE',
        ]);
        expect(byCode.map(row => row.field.fieldName)).toEqual([
            'UF_CRM_PBX_STAGE',
        ]);
    });

    it('поля недостижимого носителя показывает, но выбрать не даёт', () => {
        const blocked = describeSmartSource(
            source({ entity: 'smart', smartId: 7, entityTypeId: 177 }),
            [portalSmart()],
            [{ kind: 'reportType', values: ['warm'] }],
            schema,
        );
        const rows = buildFieldPickerRows(
            [manual],
            schema,
            blocked?.blockReason,
        );

        // Поле не спрятано: владелец завёл его сам и искал бы пропажу.
        expect(rows).toHaveLength(1);
        expect(rows[0]?.rejectReason).toContain(
            'не привязана к типу события смарта',
        );
        expect(countSelectableRows(rows)).toBe(0);
    });

    it('поля смарта отмечаются, когда анкета привязана к его типу события', () => {
        const open = describeSmartSource(
            source({ entity: 'smart', smartId: 7, entityTypeId: 177 }),
            [portalSmart()],
            [{ kind: 'reportType', values: ['presentation'] }],
            schema,
        );
        const rows = buildFieldPickerRows([manual], schema, open?.blockReason);

        expect(open?.blockReason).toBeNull();
        expect(rows[0]?.rejectReason).toBeNull();
        expect(countSelectableRows(rows)).toBe(1);
    });

    it('множественное поле показывает с причиной и отметить не даёт', () => {
        const rows = buildFieldPickerRows(
            [manual, field({ fieldName: 'UF_CRM_TAGS', multiple: true })],
            schema,
            null,
        );

        expect(rows[1]?.rejectReason).toContain('Множественное поле');
        expect(countSelectableRows(rows)).toBe(1);
    });

    it('гасит поле-список, у элементов которого нет идентификаторов', () => {
        // Так приходит degraded-режим: подписи есть, id элементов нет — а в
        // CRM уезжает именно id, и бэк такой вопрос отклонит.
        const rows = buildFieldPickerRows(
            [
                field({
                    fieldName: 'UF_CRM_DECISION',
                    type: 'enumeration',
                    items: [{ id: null, value: 'Согласовал', xmlId: null }],
                }),
            ],
            schema,
            null,
        );

        expect(rows[0]?.rejectReason).toContain('Идентификаторы элементов');
    });

    it('считает, в скольких вопросах поле уже занято', () => {
        const rows = buildFieldPickerRows(
            [
                field({
                    usedIn: [
                        {
                            questionnaireId: 'q-1',
                            questionnaireCode: 'plan_basics',
                            questionnaireTitle: 'Что узнать до звонка',
                            itemCode: 'decision_date',
                            itemTitle: 'Когда решение',
                        },
                    ],
                }),
            ],
            schema,
            null,
        );

        expect(rows[0]?.usedCount).toBe(1);
        expect(rows[0]?.usedIn[0]?.questionnaireTitle).toBe(
            'Что узнать до звонка',
        );
    });
});

describe('describeFieldUsage', () => {
    it('называет анкету и вопрос, где поле уже используется', () => {
        expect(
            describeFieldUsage([
                {
                    questionnaireId: 'q-1',
                    questionnaireCode: 'plan_basics',
                    questionnaireTitle: 'Что узнать до звонка',
                    itemCode: 'decision_date',
                    itemTitle: 'Когда решение',
                },
            ]),
        ).toBe('Уже используется: «Что узнать до звонка» → Когда решение');
    });

    it('молчит, когда поле свободно', () => {
        expect(describeFieldUsage([])).toBeNull();
    });
});

describe('describeSourceNotice', () => {
    it('объясняет, почему поля смарта сейчас недоступны', () => {
        const notice = describeSourceNotice(
            source({ entity: 'smart', smartId: 7, title: 'Презентации' }),
            describeSmartSource(
                source({ entity: 'smart', smartId: 7 }),
                [portalSmart()],
                [{ kind: 'reportType', values: ['warm'] }],
                schema,
            ),
        );

        expect(notice?.tone).toBe('warning');
        expect(notice?.title).toContain('Презентации');
        expect(notice?.title).toContain('Добавьте условие показа');
    });

    it('у доступного смарта говорит, в чей элемент уедет ответ', () => {
        const notice = describeSourceNotice(
            source({ entity: 'smart', smartId: 7, title: 'Презентации' }),
            describeSmartSource(
                source({ entity: 'smart', smartId: 7 }),
                [portalSmart()],
                [{ kind: 'presentationDone', values: [] }],
                schema,
            ),
        );

        expect(notice?.tone).toBe('info');
        expect(notice?.title).toContain('Ответ уедет в элемент смарта');
    });

    it('у штатного носителя плашки нет', () => {
        expect(describeSourceNotice(source())).toBeNull();
    });

    it('показывает предупреждение сломанного носителя как есть', () => {
        const notice = describeSourceNotice(
            source({ warning: 'Тип не найден в crm.type.list' }),
        );

        expect(notice?.description).toBe('Тип не найден в crm.type.list');
    });
});

describe('describeDegradedNotice', () => {
    it('объясняет неполное чтение полей и чем оно грозит привязке', () => {
        const notice = describeDegradedNotice({
            degraded: true,
            error: 'У REST-ключа портала нет прав администратора CRM',
        });

        expect(notice?.title).toContain('crm.item.fields');
        expect(notice?.title).toContain('UF-имени');
        expect(notice?.description).toBe(
            'У REST-ключа портала нет прав администратора CRM',
        );
    });

    it('плашки нет, когда поля прочитаны полностью', () => {
        expect(describeDegradedNotice({ degraded: false })).toBeNull();
        expect(describeDegradedNotice(undefined)).toBeNull();
    });
});

describe('поле из пикера → вопрос анкеты', () => {
    it('переносит варианты справочника вместе с bitrixId элементов', () => {
        const rows = buildFieldPickerRows(
            [
                field({
                    fieldName: 'UF_CRM_DECISION',
                    title: 'Решение',
                    type: 'enumeration',
                    items: [
                        {
                            id: 555,
                            value: 'Отложил решение',
                            xmlId: 'POSTPONED',
                        },
                        { id: 556, value: 'Согласовал', xmlId: null },
                    ],
                }),
            ],
            schema,
            null,
        );
        const row = rows[0];

        expect(row?.rejectReason).toBeNull();

        const item = buildItemFromField(
            row?.field as QuestionnaireField,
            schema,
            { source: 'deal' },
        );

        expect(item.control).toBe('enumeration');
        // Именно bitrixId уходит в crm.*.update: без него бэк отклонит
        // вариант, а ответ менеджера записать было бы нечем.
        expect(item.options?.map(option => option.bitrixId)).toEqual([
            555, 556,
        ]);
        expect(item.options?.map(option => option.title)).toEqual([
            'Отложил решение',
            'Согласовал',
        ]);
        expect(item.fieldSource).toBe('deal');
        expect(item.fieldName).toBe('UF_CRM_DECISION');
    });
});

describe('fieldSourceKey', () => {
    it('различает смарты одного портала по их идентификаторам', () => {
        expect(fieldSourceKey(source({ entity: 'smart', smartId: 7 }))).toBe(
            'smart:7',
        );
        expect(fieldSourceKey(source({ entity: 'smart', smartId: 9 }))).toBe(
            'smart:9',
        );
        expect(fieldSourceKey(source())).toBe('company:');
    });
});

describe('buildFieldSourceOptions', () => {
    it('помечает смарт, поля которого анкете сейчас недоступны', () => {
        const options = buildFieldSourceOptions(
            [
                source(),
                source({ entity: 'smart', smartId: 7, title: 'Презентации' }),
            ],
            [portalSmart()],
            [{ kind: 'reportType', values: ['warm'] }],
            schema,
        );

        // Носитель из списка не пропадает: его поля владелец завёл сам.
        expect(options.map(option => option.title)).toEqual([
            'Компания',
            'Презентации',
        ]);
        expect(options[0]?.blockReason).toBeNull();
        expect(options[1]?.blockReason).toContain(
            'не привязана к типу события смарта',
        );
    });

    it('снимает пометку, как только тип события выбран в условиях', () => {
        const options = buildFieldSourceOptions(
            [source({ entity: 'smart', smartId: 7, title: 'Презентации' })],
            [portalSmart()],
            [{ kind: 'planType', values: ['presentation'] }],
            schema,
        );

        expect(options[0]?.blockReason).toBeNull();
    });
});
