import { describe, expect, it } from 'vitest';
import type {
    QuestionnaireCatalogEntryWire,
    QuestionnaireCatalogItemWire,
    QuestionnaireCatalogWire,
} from '../model/questionnaire-dto.type';
import { normalizeQuestionnaireCatalog } from './questionnaire-normalize';

/**
 * Отсев нормализатора: правило «нераспознанное НЕ показываем».
 *
 * Проверяется именно фронтовая половина контракта — то, что бэк не
 * гарантирует (чужой контракт, вариант без bitrixId, носитель `contact`,
 * путь dto без исполнителя во фрейме) и то, что могла бы принести чужая
 * версия сервиса (неизвестный контрол/канал/условие, множественное поле).
 *
 * Слепки собираются в `*Wire`, а не в сгенерированном DTO: коды вроде
 * `control: 'file'` — это ровно тот случай «реестр бэка уехал вперёд
 * фрейма», ради которого нормализатор и существует, и описать его типом,
 * который такого не допускает, нечем.
 */

const rawItem = (
    over: Partial<QuestionnaireCatalogItemWire> = {},
): QuestionnaireCatalogItemWire => ({
    code: 'objection',
    title: 'Возражение',
    placeholder: null,
    hint: null,
    groupTitle: null,
    sort: 10,
    control: 'string',
    isRequired: false,
    requireChange: false,
    staleAfterDays: null,
    channel: 'crm',
    dtoPath: null,
    target: { mode: 'auto', entity: null },
    // Смарт-носитель есть только у канала «Поле элемента смарта»: у
    // остальных каналов бэк отдаёт null.
    smart: null,
    isNative: false,
    field: { name: 'UF_CRM_1712345678', type: 'string' },
    options: [],
    ...over,
});

const rawEntry = (
    over: Partial<QuestionnaireCatalogEntryWire> = {},
): QuestionnaireCatalogEntryWire => ({
    code: 'refine',
    title: 'Чек-лист доработки',
    hint: null,
    purpose: 'plan',
    presentation: 'inline',
    place: 'plan',
    persist: 'onChange',
    conditions: [{ kind: 'planType', values: ['refine'] }],
    configKey: null,
    legacyChecklistId: null,
    sort: 10,
    version: 3,
    items: [rawItem()],
    ...over,
});

const rawCatalog = (
    questionnaires: QuestionnaireCatalogEntryWire[],
    over: Partial<QuestionnaireCatalogWire> = {},
): QuestionnaireCatalogWire => ({
    contract: 1,
    version: 3,
    hash: 'a1b2',
    questionnaires,
    ...over,
});

describe('нормализатор каталога анкет', () => {
    it('разбирает исполнимую анкету целиком', () => {
        const { defs, warnings } = normalizeQuestionnaireCatalog(
            rawCatalog([
                rawEntry({
                    configKey: 'withChecklistRefine',
                    legacyChecklistId: 'refine',
                }),
            ]),
        );

        expect(warnings).toEqual([]);
        expect(defs).toHaveLength(1);
        expect(defs[0]).toMatchObject({
            code: 'refine',
            purpose: 'plan',
            presentation: 'inline',
            place: 'plan',
            configKey: 'withChecklistRefine',
            legacyChecklistId: 'refine',
            conditions: [{ kind: 'planType', values: ['refine'] }],
        });
        expect(defs[0]?.items[0]).toMatchObject({
            code: 'objection',
            control: 'string',
            channel: 'crm',
            field: { name: 'UF_CRM_1712345678', type: 'string' },
            // Портальный пункт резолвится по имени поля, а не по слепку.
            legacyFieldCode: null,
        });
    });

    it('незнакомая настройка портала: анкета остаётся, но с предупреждением', () => {
        // Ключ портал вписывает руками. Раньше такая анкета не показывалась
        // никогда и молча — теперь она живёт без флага, а опечатка видна.
        const { defs, warnings } = normalizeQuestionnaireCatalog(
            rawCatalog([rawEntry({ configKey: 'withChecklistCustom' })]),
        );

        expect(defs).toHaveLength(1);
        expect(defs[0]?.configKey).toBe('withChecklistCustom');
        expect(warnings.join(' ')).toContain('withChecklistCustom');
    });

    it('чужой контракт отменяет каталог целиком', () => {
        const { defs, warnings } = normalizeQuestionnaireCatalog(
            rawCatalog([rawEntry()], { contract: 2 }),
        );

        expect(defs).toEqual([]);
        expect(warnings.join(' ')).toContain('контракт');
    });

    it('неразобранный ответ не роняет разбор', () => {
        const { defs, warnings } = normalizeQuestionnaireCatalog(
            undefined as unknown as QuestionnaireCatalogWire,
        );

        expect(defs).toEqual([]);
        expect(warnings).toHaveLength(1);
    });

    it('пустой каталог портала — не ошибка', () => {
        const { defs, warnings } = normalizeQuestionnaireCatalog(
            rawCatalog([]),
        );

        expect(defs).toEqual([]);
        expect(warnings).toEqual([]);
    });
});

describe('отсев вопросов', () => {
    /** Анкета из одного мусорного вопроса + предупреждение о ней. */
    const normalizeSingleItem = (item: QuestionnaireCatalogItemWire) =>
        normalizeQuestionnaireCatalog(
            rawCatalog([rawEntry({ items: [item] })]),
        );

    it('неизвестный контрол — вопрос выброшен', () => {
        const { defs, warnings } = normalizeSingleItem(
            rawItem({ control: 'file' }),
        );

        expect(defs).toEqual([]);
        expect(warnings.join(' ')).toContain('неизвестный контрол');
    });

    it('неизвестный канал — вопрос выброшен', () => {
        const { warnings } = normalizeSingleItem(rawItem({ channel: 'sms' }));

        expect(warnings.join(' ')).toContain('неизвестный канал');
    });

    it('множественное значение — вопрос выброшен (запись массивов не чинена)', () => {
        const multiple = {
            ...rawItem(),
            isMultiple: true,
        } as QuestionnaireCatalogItemWire;

        const { defs, warnings } = normalizeSingleItem(multiple);

        expect(defs).toEqual([]);
        expect(warnings.join(' ')).toContain('множественное значение');
    });

    it('канал crm без привязки к полю — вопрос выброшен', () => {
        const { warnings } = normalizeSingleItem(
            rawItem({ channel: 'crm', field: null }),
        );

        expect(warnings.join(' ')).toContain('нет привязки к полю');
    });

    it('путь dto без исполнителя во фрейме — вопрос выброшен', () => {
        const { warnings } = normalizeSingleItem(
            rawItem({
                channel: 'dto',
                field: null,
                control: 'money',
                dtoPath: 'sale.discount',
            }),
        );

        expect(warnings.join(' ')).toContain('не исполняет');
    });

    it('известный путь dto проходит', () => {
        const { defs } = normalizeSingleItem(
            rawItem({
                channel: 'dto',
                field: null,
                control: 'money',
                dtoPath: 'sale.opportunity',
                isNative: true,
            }),
        );

        expect(defs[0]?.items[0]).toMatchObject({
            channel: 'dto',
            dtoPath: 'sale.opportunity',
            isNative: true,
        });
    });

    it('недостижимый носитель (контакт) — вопрос выброшен', () => {
        const { warnings } = normalizeSingleItem(
            rawItem({ target: { mode: 'entity', entity: 'contact' } }),
        );

        expect(warnings.join(' ')).toContain('недостижим');
    });

    it('вариант без bitrixId в CRM записать нечем — вариант выброшен', () => {
        const { defs } = normalizeSingleItem(
            rawItem({
                control: 'enumeration',
                options: [
                    { code: 'expensive', title: 'Дорого', bitrixId: 555 },
                    { code: 'later', title: 'Потом', bitrixId: null },
                ],
            }),
        );

        expect(defs[0]?.items[0]?.options).toEqual([
            { code: 'expensive', title: 'Дорого', bitrixId: 555 },
        ]);
    });

    it('у строки со своим списком варианты живут без bitrixId', () => {
        // Список объявил сам вопрос: справочника в Битриксе за ним нет, в
        // поле уходит текст варианта — требовать bitrixId было бы нечем.
        const { defs } = normalizeSingleItem(
            rawItem({
                control: 'string',
                options: [
                    {
                        code: 'pay_now',
                        title: 'Оплатит сейчас',
                        bitrixId: null,
                    },
                ],
            }),
        );

        expect(defs[0]?.items[0]?.options).toEqual([
            { code: 'pay_now', title: 'Оплатит сейчас', bitrixId: null },
        ]);
    });

    it('справочник, у которого не осталось вариантов, — вопрос выброшен', () => {
        const { defs, warnings } = normalizeSingleItem(
            rawItem({
                control: 'enumeration',
                options: [{ code: 'later', title: 'Потом', bitrixId: null }],
            }),
        );

        expect(defs).toEqual([]);
        expect(warnings.join(' ')).toContain('без вариантов');
    });

    it('справочник без вариантов вовсе — вопрос выброшен', () => {
        const { defs } = normalizeSingleItem(
            rawItem({ control: 'enumeration', options: [] }),
        );

        expect(defs).toEqual([]);
    });

    it('срок годности и «требовать новое значение» сужаются по смыслу', () => {
        const { defs } = normalizeSingleItem(
            rawItem({
                control: 'string',
                staleAfterDays: 30,
                requireChange: true,
                channel: 'crm',
            }),
        );

        // Отметки времени у строки нет — срок годности не применим.
        expect(defs[0]?.items[0]?.staleAfterDays).toBeNull();
        expect(defs[0]?.items[0]?.requireChange).toBe(true);
    });

    it('«требовать новое значение» вне канала crm гасится', () => {
        const { defs } = normalizeSingleItem(
            rawItem({
                channel: 'dto',
                field: null,
                control: 'date',
                dtoPath: 'sale.firstPayDate',
                requireChange: true,
            }),
        );

        expect(defs[0]?.items[0]?.requireChange).toBe(false);
    });

    it('повторяющийся код вопроса — второй выброшен (ключ ответа обязан быть один)', () => {
        const { defs, warnings } = normalizeQuestionnaireCatalog(
            rawCatalog([
                rawEntry({
                    items: [
                        rawItem({ code: 'objection', sort: 10 }),
                        rawItem({ code: 'objection', sort: 20 }),
                    ],
                }),
            ]),
        );

        expect(defs[0]?.items).toHaveLength(1);
        expect(warnings.join(' ')).toContain('повторяется');
    });

    it('вопросы отсортированы по sort', () => {
        const { defs } = normalizeQuestionnaireCatalog(
            rawCatalog([
                rawEntry({
                    items: [
                        rawItem({ code: 'second', sort: 20 }),
                        rawItem({ code: 'first', sort: 10 }),
                    ],
                }),
            ]),
        );

        expect(defs[0]?.items.map(item => item.code)).toEqual([
            'first',
            'second',
        ]);
    });
});

describe('отсев анкет', () => {
    it('неизвестный вид условия — анкета не показывается вовсе', () => {
        const { defs, warnings } = normalizeQuestionnaireCatalog(
            rawCatalog([
                rawEntry({
                    conditions: [{ kind: 'moonPhase', values: ['full'] }],
                }),
            ]),
        );

        expect(defs).toEqual([]);
        expect(warnings.join(' ')).toContain('неизвестное условие');
    });

    it('условие без значений — анкета не показывается', () => {
        const { defs, warnings } = normalizeQuestionnaireCatalog(
            rawCatalog([
                rawEntry({ conditions: [{ kind: 'planType', values: [] }] }),
            ]),
        );

        expect(defs).toEqual([]);
        expect(warnings.join(' ')).toContain('без значений');
    });

    it('условие «всегда» значений не требует', () => {
        const { defs } = normalizeQuestionnaireCatalog(
            rawCatalog([
                rawEntry({ conditions: [{ kind: 'always', values: [] }] }),
            ]),
        );

        expect(defs[0]?.conditions).toEqual([{ kind: 'always', values: [] }]);
    });

    it('пустой список условий — анкета не показывается', () => {
        const { defs } = normalizeQuestionnaireCatalog(
            rawCatalog([rawEntry({ conditions: [] })]),
        );

        expect(defs).toEqual([]);
    });

    it('неизвестное назначение/показ/режим записи — анкета выброшена', () => {
        expect(
            normalizeQuestionnaireCatalog(
                rawCatalog([rawEntry({ purpose: 'billing' })]),
            ).defs,
        ).toEqual([]);
        expect(
            normalizeQuestionnaireCatalog(
                rawCatalog([rawEntry({ presentation: 'popover' })]),
            ).defs,
        ).toEqual([]);
        expect(
            normalizeQuestionnaireCatalog(
                rawCatalog([rawEntry({ persist: 'onExit' })]),
            ).defs,
        ).toEqual([]);
    });

    it('анкета без исполнимых вопросов не показывается', () => {
        const { defs, warnings } = normalizeQuestionnaireCatalog(
            rawCatalog([
                rawEntry({ items: [rawItem({ control: 'iblock_element' })] }),
            ]),
        );

        expect(defs).toEqual([]);
        expect(warnings.join(' ')).toContain('не осталось исполнимых');
    });

    it('у модалки колонки нет, у инлайна мусор заменяется назначением', () => {
        const { defs } = normalizeQuestionnaireCatalog(
            rawCatalog([
                rawEntry({
                    code: 'sale',
                    presentation: 'modal',
                    place: 'plan',
                    conditions: [
                        { kind: 'targetStage', values: ['sales_success'] },
                    ],
                    sort: 20,
                }),
                rawEntry({
                    code: 'reportRefine',
                    purpose: 'report',
                    presentation: 'inline',
                    place: 'sidebar',
                    conditions: [{ kind: 'reportType', values: ['refine'] }],
                    sort: 10,
                }),
            ]),
        );

        // Заодно проверяется сортировка анкет по sort.
        expect(defs.map(def => [def.code, def.place])).toEqual([
            ['reportRefine', 'report'],
            ['sale', null],
        ]);
    });

    it('повторяющийся код анкеты — вторая выброшена', () => {
        const { defs, warnings } = normalizeQuestionnaireCatalog(
            rawCatalog([rawEntry(), rawEntry()]),
        );

        expect(defs).toHaveLength(1);
        expect(warnings.join(' ')).toContain('повторяется');
    });

    it('одна сломанная анкета не отменяет остальные', () => {
        const { defs } = normalizeQuestionnaireCatalog(
            rawCatalog([
                rawEntry({
                    code: 'broken',
                    conditions: [{ kind: '?', values: [] }],
                }),
                rawEntry({ code: 'alive' }),
            ]),
        );

        expect(defs.map(def => def.code)).toEqual(['alive']);
    });
});

/**
 * Канал `smart` — ответ в поле ЭЛЕМЕНТА смарта, который создаст или закроет
 * поток этого отчёта.
 *
 * Отсев здесь решает деградацию из требования: смарта нет на портале (бэк
 * выбросил адрес), тип события без смарта, чужая версия сервиса — вопрос
 * просто не показывается, и отправка от этого не ломается.
 */
describe('нормализатор: канал smart', () => {
    /**
     * Поля `smart` в сгенерированном пакете ещё нет — orval прогоняет
     * владелец, — поэтому адрес дописывается к слепку кастом, ровно как его
     * читает нормализатор.
     */
    const rawSmartItem = (
        over: Partial<QuestionnaireCatalogItemWire> = {},
        smart: unknown = { kind: 'presentation', entityTypeId: 1058 },
    ): QuestionnaireCatalogItemWire =>
        ({
            ...rawItem({
                channel: 'smart',
                target: { mode: 'entity', entity: 'smart' },
                field: { name: 'UF_CRM_94_CLIENT_PROMISE', type: 'string' },
                ...over,
            }),
            smart,
        }) as QuestionnaireCatalogItemWire;

    const normalizeSmart = (item: QuestionnaireCatalogItemWire) =>
        normalizeQuestionnaireCatalog(
            rawCatalog([rawEntry({ items: [item] })]),
        );

    it('разбирает смарт-вопрос целиком', () => {
        const { defs, warnings } = normalizeSmart(rawSmartItem());

        expect(warnings).toEqual([]);
        expect(defs[0]?.items[0]).toMatchObject({
            channel: 'smart',
            target: { mode: 'entity', entity: 'smart' },
            smart: { kind: 'presentation', entityTypeId: 1058 },
            field: { name: 'UF_CRM_94_CLIENT_PROMISE', type: 'string' },
        });
    });

    it('смарта-носителя нет — вопрос выброшен', () => {
        // Так выглядит «смарт не установлен на портале»: бэк выбрасывает
        // такие пункты при компиляции, фрейм повторяет проверку сам.
        const { defs, warnings } = normalizeSmart(rawSmartItem({}, null));

        expect(defs).toEqual([]);
        expect(warnings.join(' ')).toContain('смарта-носителя нет');
    });

    it('половина адреса смарта — тоже не адрес', () => {
        const { defs } = normalizeSmart(
            rawSmartItem({}, { kind: 'presentation' }),
        );

        expect(defs).toEqual([]);
    });

    it('без имени поля писать в элемент нечего — вопрос выброшен', () => {
        const { warnings } = normalizeSmart(rawSmartItem({ field: null }));

        expect(warnings.join(' ')).toContain('нет привязки к полю смарта');
    });

    it('носитель smart без своего канала — вопрос выброшен', () => {
        // В такой носитель не пишет никто: фрейм в смарт не ходит, а поток
        // отчёта об этом вопросе не знает.
        const { warnings } = normalizeSmart(
            rawSmartItem({
                channel: 'crm',
                target: { mode: 'entity', entity: 'smart' },
            }),
        );

        expect(warnings.join(' ')).toContain('носитель «smart» без канала');
    });

    it('прежний носитель в строке смарт-вопроса не оживает', () => {
        // У анкеты могла остаться привязка к сделке. Оставить её — значит
        // дать резолву искать поле в строке CRM: одноимённое поле там
        // прочиталось бы как «текущее значение».
        const { defs } = normalizeSmart(
            rawSmartItem({ target: { mode: 'auto', entity: null } }),
        );

        expect(defs[0]?.items[0]?.target).toEqual({
            mode: 'entity',
            entity: 'smart',
        });
    });

    it('вариант справочника живёт без bitrixId', () => {
        // На канале `crm` такой вариант выбрасывается: записывать нечем. В
        // элемент смарта уезжает КОД варианта — id элемента списка резолвит
        // бэк по живому справочнику.
        const { defs } = normalizeSmart(
            rawSmartItem({
                control: 'enumeration',
                field: { name: 'UF_CRM_94_RESULT', type: 'enumeration' },
                options: [
                    { code: 'deal', title: 'Договорились', bitrixId: null },
                ],
            }),
        );

        expect(defs[0]?.items[0]?.options).toEqual([
            { code: 'deal', title: 'Договорились', bitrixId: null },
        ]);
    });

    it('«требовать новое значение» на смарте гасится', () => {
        // Прежнего значения у ещё не созданного элемента нет вовсе: флаг
        // запер бы отправку требованием, которое нечем закрыть. Модель
        // запрещает его на сохранении, нормализатор — второй рубеж.
        const { defs } = normalizeSmart(rawSmartItem({ requireChange: true }));

        expect(defs[0]?.items[0]?.requireChange).toBe(false);
    });

    it('условие «презентация проведена» значений не требует', () => {
        const { defs, warnings } = normalizeQuestionnaireCatalog(
            rawCatalog([
                rawEntry({
                    conditions: [{ kind: 'presentationDone', values: [] }],
                    items: [rawSmartItem()],
                }),
            ]),
        );

        expect(warnings).toEqual([]);
        expect(defs[0]?.conditions).toEqual([
            { kind: 'presentationDone', values: [] },
        ]);
    });
});
