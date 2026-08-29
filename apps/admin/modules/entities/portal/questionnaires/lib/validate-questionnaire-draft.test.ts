import { describe, expect, it } from 'vitest';
import { validateQuestionnaireDraft } from './validate-questionnaire-draft';
import { portalSmart } from './questionnaire.fixture';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import { unknownCode } from './unknown-code.fixture';
import type { QuestionnaireDraft } from './questionnaire-draft';
import type { PortalQuestionnaireItemSave } from '../model';

const item = (
    patch: Partial<PortalQuestionnaireItemSave> = {},
): PortalQuestionnaireItemSave => ({
    code: 'decision_date',
    title: 'Когда клиент примет решение?',
    control: 'date',
    channel: 'crm',
    targetMode: 'auto',
    targetEntity: null,
    isMultiple: false,
    isRequired: false,
    requireChange: false,
    staleAfterDays: null,
    fieldName: 'UF_CRM_DECISION_DATE',
    fieldType: 'date',
    fieldSource: 'company',
    fieldStatus: 'ok',
    isActive: true,
    options: [],
    ...patch,
});

const draft = (
    patch: Partial<QuestionnaireDraft> = {},
): QuestionnaireDraft => ({
    appCode: 'event-sales',
    code: 'refine',
    title: 'Доработка',
    purpose: 'plan',
    presentation: 'inline',
    place: 'plan',
    persist: 'onChange',
    conditions: [{ kind: 'planType', values: ['refine'] }],
    isActive: true,
    sort: 500,
    items: [item()],
    ...patch,
});

/** Все тексты одной строкой — так проверка читается как претензия бэка. */
const messages = (issues: { message: string }[]) =>
    issues.map(issue => issue.message).join('\n');

/** Первое замечание — там, где правило обязано сработать ровно одно. */
const firstMessage = (issues: { message: string }[]) =>
    issues[0]?.message ?? '';

describe('validateQuestionnaireDraft: шапка анкеты', () => {
    it('исполнимый черновик проходит без замечаний', () => {
        expect(validateQuestionnaireDraft(draft(), schema)).toEqual([]);
    });

    it('без реестра не проверяет ничего и говорит об этом прямо', () => {
        const issues = validateQuestionnaireDraft(draft(), undefined);

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain('Реестр значений');
    });

    it('требует код и название анкеты', () => {
        const issues = validateQuestionnaireDraft(
            draft({ code: '  ', title: '' }),
            schema,
        );

        expect(messages(issues)).toContain('Код анкеты: значение обязательно');
        expect(messages(issues)).toContain(
            'Название анкеты: значение обязательно',
        );
    });

    it('не пускает назначение вне реестра', () => {
        const issues = validateQuestionnaireDraft(
            draft(unknownCode({ purpose: 'retro' })),
            schema,
        );

        expect(messages(issues)).toContain(
            'Назначение анкеты: значение «retro» не из реестра',
        );
    });

    it('запрещает колонку у анкеты-модалки', () => {
        const issues = validateQuestionnaireDraft(
            draft({ presentation: 'modal', place: 'plan' }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            'Колонка задаётся только для анкеты-карточки',
        );
    });
});

describe('validateQuestionnaireDraft: условия показа', () => {
    it('требует хотя бы одно условие', () => {
        const issues = validateQuestionnaireDraft(
            draft({ conditions: [] }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(issues[0]?.scope).toBe('conditions');
        expect(firstMessage(issues)).toContain('Нужно хотя бы одно условие');
    });

    it('не совмещает «Всегда» с другими условиями', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                conditions: [
                    { kind: 'always' },
                    { kind: 'planType', values: ['refine'] },
                ],
            }),
            schema,
        );

        expect(messages(issues)).toContain(
            'Условие «Всегда» не совмещается с другими условиями',
        );
    });

    it('не принимает значения у «Всегда»', () => {
        const issues = validateQuestionnaireDraft(
            draft({ conditions: [{ kind: 'always', values: ['refine'] }] }),
            schema,
        );

        expect(messages(issues)).toContain(
            'Условие «Всегда» значений не принимает',
        );
    });

    it('не принимает значение вне справочника условия', () => {
        const issues = validateQuestionnaireDraft(
            draft({ conditions: [{ kind: 'planType', values: ['cold'] }] }),
            schema,
        );

        expect(messages(issues)).toContain(
            'Условие «planType»: значение «cold» не из реестра',
        );
    });

    it('ловит повтор вида условия', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                conditions: [
                    { kind: 'planType', values: ['refine'] },
                    { kind: 'planType', values: ['hot'] },
                ],
            }),
            schema,
        );

        expect(messages(issues)).toContain('указано дважды');
    });
});

describe('validateQuestionnaireDraft: вопрос', () => {
    it('не пускает неизвестный тип отображения', () => {
        const issues = validateQuestionnaireDraft(
            draft({ items: [item(unknownCode({ control: 'slider' }))] }),
            schema,
        );

        expect(messages(issues)).toContain(
            'тип отображения: значение «slider» не из реестра',
        );
    });

    it('не пускает множественное поле', () => {
        const issues = validateQuestionnaireDraft(
            draft({ items: [item({ isMultiple: true })] }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(issues[0]?.itemCode).toBe('decision_date');
        expect(firstMessage(issues)).toContain(
            'множественные поля в этой версии не поддержаны',
        );
    });

    it('не пускает «требовать новое значение» вне канала CRM', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                items: [
                    item({
                        channel: 'text',
                        control: 'string',
                        requireChange: true,
                        fieldName: null,
                        fieldType: null,
                        fieldSource: undefined,
                    }),
                ],
            }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            '«требовать новое значение» работает только для канала «Поле CRM»',
        );
    });

    it('не пускает срок годности у контрола, который не дата', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                items: [
                    item({
                        control: 'string',
                        fieldType: 'string',
                        staleAfterDays: 30,
                    }),
                ],
            }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            'срок годности ответа считается только по дате',
        );
    });

    it('требует от срока годности целое число больше нуля', () => {
        const issues = validateQuestionnaireDraft(
            draft({ items: [item({ staleAfterDays: 0 })] }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            'срок годности — целое число дней больше нуля',
        );
    });

    it('не пускает поле смарта на канал «Поле CRM»', () => {
        // Этот ответ пишет сам фрейм, а элемента смарта в тот момент ещё
        // нет: для смарта есть свой канал, и текст должен вести к нему.
        const issues = validateQuestionnaireDraft(
            draft({
                items: [
                    item({
                        fieldSource: 'smart',
                        fieldName: 'UF_CRM_7_SALE_DATE',
                    }),
                ],
            }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain('поле смарта в CRM не пишется');
        expect(firstMessage(issues)).toContain('«Поле элемента смарта»');
    });

    it('не пускает поле контакта в режиме «Автоматически»', () => {
        const issues = validateQuestionnaireDraft(
            draft({ items: [item({ fieldSource: 'contact' })] }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            'цепочкой компания → сделка → лид не достать',
        );
    });

    it('требует, чтобы жёсткий носитель совпал с источником поля', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                items: [
                    item({
                        targetMode: 'entity',
                        targetEntity: 'deal',
                        fieldSource: 'company',
                    }),
                ],
            }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            'поле выбрано у носителя «company», а ответ адресован «deal»',
        );
    });

    it('требует носителя: в ответе чтения его нет, а на сохранении он обязателен', () => {
        const issues = validateQuestionnaireDraft(
            draft({ items: [item({ fieldSource: undefined })] }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain('не указан носитель');
    });

    it('сверяет тип отображения с типом поля по матрице реестра', () => {
        const issues = validateQuestionnaireDraft(
            draft({ items: [item({ control: 'string' })] }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            'тип отображения «string» несовместим с полем типа «date»',
        );
    });

    it('требует поле для канала CRM', () => {
        const issues = validateQuestionnaireDraft(
            draft({ items: [item({ fieldName: null })] }),
            schema,
        );

        expect(messages(issues)).toContain(
            'для записи в CRM нужно выбрать поле',
        );
    });

    it('ловит повтор кода вопроса', () => {
        const issues = validateQuestionnaireDraft(
            draft({ items: [item(), item()] }),
            schema,
        );

        expect(messages(issues)).toContain(
            'Код вопроса «decision_date» повторяется',
        );
    });
});

describe('validateQuestionnaireDraft: каналы записи', () => {
    it('канал отчёта принимает только пути из реестра', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                items: [
                    item({
                        channel: 'dto',
                        control: 'money',
                        dtoPath: 'sale.margin',
                        fieldName: null,
                        fieldType: null,
                        fieldSource: undefined,
                    }),
                ],
            }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            'путь в отчёте «sale.margin» не из реестра',
        );
    });

    it('канал отчёта фиксирует тип отображения пути', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                items: [
                    item({
                        channel: 'dto',
                        control: 'string',
                        dtoPath: 'sale.opportunity',
                        fieldName: null,
                        fieldType: null,
                        fieldSource: undefined,
                    }),
                ],
            }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            'поле отчёта «sale.opportunity» заполняется типом «money»',
        );
    });

    it('канал комментария не терпит ни поля, ни пути в отчёте', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                items: [
                    item({
                        channel: 'text',
                        control: 'string',
                        fieldType: null,
                        fieldSource: undefined,
                    }),
                ],
            }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            'ответ в комментарий события никуда больше не пишется',
        );
    });
});

describe('validateQuestionnaireDraft: варианты справочника', () => {
    it('требует bitrixId у варианта, который уедет в CRM', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                items: [
                    item({
                        control: 'enumeration',
                        fieldType: 'enumeration',
                        options: [
                            {
                                code: 'postponed',
                                title: 'Отложил решение',
                                bitrixId: null,
                            },
                        ],
                    }),
                ],
            }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain('нет bitrixId элемента списка');
    });

    it('требует хотя бы один вариант у списка', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                items: [
                    item({
                        control: 'enumeration',
                        fieldType: 'enumeration',
                        options: [],
                    }),
                ],
            }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            'у списка должен быть хотя бы один вариант',
        );
    });

    it('не разрешает варианты у типа отображения, который не список', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                items: [
                    item({
                        options: [{ code: 'a', title: 'А', bitrixId: 1 }],
                    }),
                ],
            }),
            schema,
        );

        expect(issues).toHaveLength(1);
        expect(firstMessage(issues)).toContain(
            'варианты справочника есть только у типа «Список»',
        );
    });
});

/**
 * Ответ в элемент смарта: правила бэка повторены до отправки, потому что
 * иначе владелец собирал бы такой вопрос вслепую — фрейм его не пишет,
 * пишет бэк отчёта, и адрес у ответа совсем другой.
 */
describe('validateQuestionnaireDraft: канал «Поле элемента смарта»', () => {
    const smartItem = (
        patch: Partial<PortalQuestionnaireItemSave> = {},
    ): PortalQuestionnaireItemSave =>
        item({
            code: 'pres_result',
            control: 'string',
            channel: 'smart',
            targetMode: 'entity',
            targetEntity: 'smart',
            fieldName: 'UF_CRM_7_PRES_RESULT',
            fieldType: 'string',
            fieldSource: 'smart',
            smartId: 7,
            ...patch,
        });

    /** Анкета отчёта по презентации — тип события со смартом. */
    const smartDraft = (patch: Partial<PortalQuestionnaireItemSave> = {}) =>
        draft({
            purpose: 'report',
            place: 'report',
            conditions: [{ kind: 'reportType', values: ['presentation'] }],
            items: [smartItem(patch)],
        });

    it('исполнимый смарт-вопрос замечаний не собирает', () => {
        expect(
            validateQuestionnaireDraft(smartDraft(), schema, {
                smarts: [portalSmart()],
            }),
        ).toEqual([]);
    });

    it('требует адрес смарта — без него ответ некуда положить', () => {
        const issues = validateQuestionnaireDraft(
            smartDraft({ smartId: null }),
            schema,
            { smarts: [portalSmart()] },
        );

        expect(firstMessage(issues)).toContain('не указан смарт');
    });

    it('без условия по типу события смарта запирает сохранение', () => {
        const issues = validateQuestionnaireDraft(
            {
                ...smartDraft(),
                conditions: [{ kind: 'reportType', values: ['warm'] }],
            },
            schema,
            { smarts: [portalSmart()] },
        );

        expect(firstMessage(issues)).toContain(
            'не привязана к типу события смарта',
        );
    });

    it('требует поле и не пускает штатное', () => {
        const issues = validateQuestionnaireDraft(
            smartDraft({ fieldName: null, isNative: true }),
            schema,
            { smarts: [portalSmart()] },
        );

        expect(messages(issues)).toContain(
            'для записи в элемент смарта нужно выбрать поле',
        );
        expect(messages(issues)).toContain(
            'штатных полей у элемента смарта нет',
        );
    });

    it('не пускает поле другого носителя на этот канал', () => {
        const issues = validateQuestionnaireDraft(
            smartDraft({ fieldSource: 'company' }),
            schema,
            { smarts: [portalSmart()] },
        );

        expect(messages(issues)).toContain(
            'принимает только поле смарта, а поле выбрано у носителя «company»',
        );
    });

    it('проверяет тип отображения по матрице реестра', () => {
        const issues = validateQuestionnaireDraft(
            smartDraft({ control: 'date' }),
            schema,
            { smarts: [portalSmart()] },
        );

        expect(firstMessage(issues)).toContain('несовместим с полем типа');
    });

    it('без списка смартов проверяет только наличие адреса', () => {
        // Достижимость элемента считать нечем — это правило остаётся за
        // бэком, и выдумывать его вердикт здесь нельзя.
        expect(validateQuestionnaireDraft(smartDraft(), schema)).toEqual([]);
        expect(
            firstMessage(
                validateQuestionnaireDraft(
                    smartDraft({ smartId: null }),
                    schema,
                ),
            ),
        ).toContain('не указан смарт');
    });

    it('носитель «элемент смарта» без своего канала не работает', () => {
        const issues = validateQuestionnaireDraft(
            draft({
                items: [
                    item({
                        channel: 'crm',
                        targetMode: 'entity',
                        targetEntity: 'smart',
                        fieldSource: 'company',
                    }),
                ],
            }),
            schema,
        );

        expect(messages(issues)).toContain(
            'носитель «элемент смарта» работает только с каналом',
        );
    });
});

describe('validateQuestionnaireDraft: условия без значений', () => {
    it('«Презентация проведена» значений не принимает и не требует', () => {
        // Бэк принимает такое условие с пустым списком: запрет на него
        // запер бы анкету, которую он готов сохранить.
        expect(
            validateQuestionnaireDraft(
                draft({
                    conditions: [{ kind: 'presentationDone', values: [] }],
                }),
                schema,
            ),
        ).toEqual([]);

        expect(
            firstMessage(
                validateQuestionnaireDraft(
                    draft({
                        conditions: [
                            {
                                kind: 'presentationDone',
                                values: ['presentation'],
                            },
                        ],
                    }),
                    schema,
                ),
            ),
        ).toContain('значений не принимает');
    });
});
