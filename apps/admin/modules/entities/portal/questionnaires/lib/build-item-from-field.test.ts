import { describe, expect, it } from 'vitest';
import {
    applyFieldToItem,
    buildItemCodeFromFieldName,
    buildItemFromField,
    getFieldControls,
    getFieldRejectReason,
    syncFieldInItem,
    uniqueItemCode,
} from './build-item-from-field';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import type { QuestionnaireField } from '../model';

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
    ...patch,
});

describe('buildItemCodeFromFieldName', () => {
    it('срезает префикс носителя у штатной сущности', () => {
        expect(buildItemCodeFromFieldName('UF_CRM_DECISION_DATE')).toBe(
            'decision_date',
        );
    });

    it('срезает префикс смарта вместе с его номером', () => {
        expect(buildItemCodeFromFieldName('UF_CRM_7_SALE_DATE')).toBe(
            'sale_date',
        );
    });

    it('не оставляет код, начинающийся с цифры', () => {
        expect(buildItemCodeFromFieldName('UF_CRM_1712345678')).toBe(
            'uf_1712345678',
        );
    });
});

describe('uniqueItemCode', () => {
    it('разводит одинаковые коды номером', () => {
        expect(uniqueItemCode('decision_date', ['decision_date'])).toBe(
            'decision_date_2',
        );
        expect(
            uniqueItemCode('decision_date', [
                'decision_date',
                'decision_date_2',
            ]),
        ).toBe('decision_date_3');
    });
});

describe('getFieldControls', () => {
    it('берёт контролы из матрицы схемы, а не из кодов фронта', () => {
        expect(getFieldControls(schema, 'datetime')).toEqual([
            'datetime',
            'date',
        ]);
    });

    it('тип вне матрицы и тип с пустым списком одинаково запрещены', () => {
        expect(getFieldControls(schema, 'crm')).toEqual([]);
        expect(getFieldControls(schema, 'unknown_type')).toEqual([]);
    });
});

describe('getFieldRejectReason', () => {
    it('пропускает поле, пригодное для анкеты', () => {
        expect(getFieldRejectReason(field(), schema)).toBeNull();
    });

    it('гасит множественное поле', () => {
        expect(
            getFieldRejectReason(field({ multiple: true }), schema),
        ).toContain('Множественное поле');
    });

    it('гасит поле неподдержанного типа', () => {
        expect(getFieldRejectReason(field({ type: 'file' }), schema)).toContain(
            'file',
        );
    });

    it('поле смарта само по себе больше не отклоняется', () => {
        // Носитель поля приговором быть перестал: у смарта свой канал
        // записи, и отклоняет только недостижимость его элемента.
        expect(getFieldRejectReason(field(), schema, null)).toBeNull();
    });

    it('приговор носителя целиком становится причиной строки', () => {
        expect(
            getFieldRejectReason(
                field(),
                schema,
                'Анкета не привязана к типу события смарта «Презентации»',
            ),
        ).toContain('не привязана к типу события смарта');
    });
});

describe('buildItemFromField', () => {
    it('берёт контрол из матрицы схемы: у datetime первым идёт «Дата и время»', () => {
        const item = buildItemFromField(field({ type: 'datetime' }), schema, {
            source: 'company',
        });

        expect(item.control).toBe('datetime');
        expect(item.fieldType).toBe('datetime');
        expect(item.channel).toBe('crm');
        expect(item.fieldSource).toBe('company');
        expect(item.targetMode).toBe('auto');
        expect(item.targetEntity).toBeNull();
    });

    it('переносит множественность поля как есть — врать про неё нельзя', () => {
        const item = buildItemFromField(field({ multiple: true }), schema, {
            source: 'company',
        });

        expect(item.isMultiple).toBe(true);
    });

    it('предлагает обязательность по обязательности поля в Битриксе', () => {
        expect(
            buildItemFromField(field({ mandatory: true }), schema, {
                source: 'company',
            }).isRequired,
        ).toBe(true);
        expect(
            buildItemFromField(field({ mandatory: false }), schema, {
                source: 'company',
            }).isRequired,
        ).toBe(false);
    });

    it('собирает варианты справочника с bitrixId элемента списка', () => {
        const item = buildItemFromField(
            field({
                type: 'enumeration',
                fieldName: 'UF_CRM_DECISION',
                items: [
                    { id: 555, value: 'Отложил решение', xmlId: 'POSTPONED' },
                    { id: 556, value: 'Согласовал', xmlId: null },
                ],
            }),
            schema,
            { source: 'deal' },
        );

        expect(item.control).toBe('enumeration');
        expect(item.options).toEqual([
            {
                code: 'postponed',
                title: 'Отложил решение',
                bitrixId: 555,
                xmlId: 'POSTPONED',
                sort: 10,
                isDefault: false,
                isActive: true,
            },
            {
                code: 'opt_556',
                title: 'Согласовал',
                bitrixId: 556,
                xmlId: null,
                sort: 20,
                isDefault: false,
                isActive: true,
            },
        ]);
    });

    it('не тащит варианты в поле, которое не список', () => {
        const item = buildItemFromField(
            field({ items: [{ id: 1, value: 'мусор', xmlId: null }] }),
            schema,
            { source: 'company' },
        );

        expect(item.options).toEqual([]);
    });

    it('ставит контакту жёсткий носитель: цепочкой auto его не достать', () => {
        const item = buildItemFromField(field(), schema, {
            source: 'contact',
        });

        expect(item.targetMode).toBe('entity');
        expect(item.targetEntity).toBe('contact');
        expect(item.fieldSource).toBe('contact');
    });

    it('разводит код вопроса с уже занятыми в анкете', () => {
        const item = buildItemFromField(field(), schema, {
            source: 'company',
            takenCodes: ['decision_date'],
        });

        expect(item.code).toBe('decision_date_2');
    });

    it('поле недоступного типа собирает вопрос, который бракует проверка', () => {
        // Матрица для `file` пуста — такое поле пикер отметить не даёт.
        // Если оно всё же дошло, вопрос собирается с первым типом
        // отображения контракта: проверка черновика скажет «тип
        // отображения «string» несовместим с полем типа «file»», а это
        // точнее, чем вопрос с пустым типом отображения.
        const item = buildItemFromField(field({ type: 'file' }), schema, {
            source: 'company',
        });

        expect(item.control).toBe('string');
        expect(getFieldControls(schema, 'file')).toEqual([]);
    });
});

describe('buildItemFromField: поле смарта', () => {
    const smartField = field({
        fieldName: 'UF_CRM_7_PRES_RESULT',
        title: 'Итог презентации',
        type: 'string',
    });

    it('собирает вопрос своим каналом и запоминает адрес смарта', () => {
        const item = buildItemFromField(smartField, schema, {
            source: 'smart',
            smartId: 7,
        });

        expect(item.channel).toBe('smart');
        expect(item.fieldSource).toBe('smart');
        expect(item.smartId).toBe(7);
    });

    it('ставит самоописывающего носителя: выбирать элемент не из чего', () => {
        const item = buildItemFromField(smartField, schema, {
            source: 'smart',
            smartId: 7,
        });

        expect(item.targetMode).toBe('entity');
        expect(item.targetEntity).toBe('smart');
    });

    it('у поля CRM адреса смарта не появляется', () => {
        const item = buildItemFromField(field(), schema, { source: 'company' });

        expect(item.channel).toBe('crm');
        expect(item.smartId).toBeNull();
    });
});

describe('applyFieldToItem: перепривязка между CRM и смартом', () => {
    it('переносит вопрос на канал смарта вместе с адресом', () => {
        const crmItem = buildItemFromField(field(), schema, {
            source: 'company',
        });
        const moved = applyFieldToItem(
            { ...crmItem, requireChange: true },
            field({ fieldName: 'UF_CRM_7_PRES_RESULT', type: 'string' }),
            schema,
            { source: 'smart', smartId: 7 },
        );

        expect(moved.code).toBe(crmItem.code);
        expect(moved.channel).toBe('smart');
        expect(moved.smartId).toBe(7);
        // Требование нового значения умеет сравнивать только запись в CRM:
        // на смарт-канале бэк такой вопрос отклонил бы.
        expect(moved.requireChange).toBe(false);
    });

    it('возвращает вопрос в CRM и стирает адрес смарта', () => {
        const smartItem = buildItemFromField(
            field({ fieldName: 'UF_CRM_7_PRES_RESULT', type: 'string' }),
            schema,
            { source: 'smart', smartId: 7 },
        );
        const moved = applyFieldToItem(smartItem, field(), schema, {
            source: 'company',
        });

        expect(moved.channel).toBe('crm');
        expect(moved.smartId).toBeNull();
        expect(moved.fieldSource).toBe('company');
    });
});

describe('syncFieldInItem: перечитывание того же поля', () => {
    const listField = (
        items: { id: number | null; value: string; xmlId: string | null }[],
    ): QuestionnaireField =>
        field({
            fieldName: 'UF_CRM_DEAL_KIND',
            title: 'Тип сотрудничества',
            type: 'enumeration',
            items,
        });

    const live = [
        { id: 301, value: 'Прямая', xmlId: 'DIRECT' },
        { id: 302, value: 'Тендер', xmlId: 'TENDER' },
    ];

    /** Вопрос с авторскими правками поверх привязки. */
    const ourItem = () => {
        const bound = buildItemFromField(listField(live), schema, {
            source: 'deal',
        });

        return {
            ...bound,
            title: 'Как работаем с клиентом?',
            options: (bound.options ?? []).map(option =>
                option.code === 'direct'
                    ? { ...option, title: 'Прямые продажи' }
                    : { ...option, isActive: false },
            ),
        };
    };

    it('не переписывает подписи вариантов подписями Битрикса', () => {
        const next = syncFieldInItem(
            ourItem(),
            listField([
                { id: 301, value: 'Прямая', xmlId: 'DIRECT' },
                { id: 302, value: 'Тендер (44-ФЗ)', xmlId: 'TENDER' },
            ]),
            schema,
            { source: 'deal' },
        );

        // Подписи владелец писал под менеджера: кнопка «Синхронизировать»
        // их не трогает — переименование показывает карточка живого поля.
        expect(
            next.options?.map(option => [option.title, option.isActive]),
        ).toEqual([
            ['Прямые продажи', true],
            ['Тендер', false],
        ]);
        expect(next.title).toBe('Как работаем с клиентом?');
    });

    it('обновляет адрес записи: id элемента, прочитанный только сейчас', () => {
        // Прошлое чтение шло без прав администратора CRM: id элементов не
        // приехали, и без них вопрос не сохранить. Ради этого кнопку и
        // жмут.
        const degraded = ourItem();
        const next = syncFieldInItem(
            {
                ...degraded,
                options: (degraded.options ?? []).map(option => ({
                    ...option,
                    bitrixId: null,
                })),
            },
            listField(live),
            schema,
            { source: 'deal' },
        );

        expect(
            next.options?.map(option => [option.code, option.bitrixId]),
        ).toEqual([
            ['direct', 301],
            ['tender', 302],
        ]);
    });

    it('исчезнувший вариант остаётся: ответы по нему уже собраны', () => {
        const next = syncFieldInItem(
            ourItem(),
            listField([{ id: 301, value: 'Прямая', xmlId: 'DIRECT' }]),
            schema,
            { source: 'deal' },
        );

        expect(next.options?.map(option => option.code)).toEqual([
            'direct',
            'tender',
        ]);
    });

    it('новое значение справочника берёт сразу: оно ничего не затирает', () => {
        const next = syncFieldInItem(
            ourItem(),
            listField([
                ...live,
                { id: 303, value: 'Партнёр', xmlId: 'PARTNER' },
            ]),
            schema,
            { source: 'deal' },
        );

        expect(
            next.options?.map(option => [
                option.code,
                option.bitrixId,
                option.sort,
            ]),
        ).toEqual([
            ['direct', 301, 10],
            ['tender', 302, 20],
            ['partner', 303, 30],
        ]);
    });

    it('привязку перечитывает: тип поля и адрес смарта', () => {
        const item = buildItemFromField(
            field({ fieldName: 'UF_CRM_7_PRES_RESULT', type: 'string' }),
            schema,
            { source: 'smart', smartId: 7 },
        );
        const next = syncFieldInItem(
            item,
            field({
                fieldName: 'UF_CRM_7_PRES_RESULT',
                type: 'text',
                bitrixId: 999,
            }),
            schema,
            { source: 'smart', smartId: 7 },
        );

        expect(next.fieldType).toBe('text');
        expect(next.fieldBitrixId).toBe(999);
        expect(next.channel).toBe('smart');
        expect(next.smartId).toBe(7);
    });
});
