import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import type {
    QuestionnaireCondition,
    QuestionnaireDef,
    QuestionnaireItem,
} from '@/modules/entities/Questionnaire/model/questionnaire.type';
import {
    resolveChecklistFields,
    selectActiveChecklists,
    selectIncompleteInlineChecklists,
} from './checklist-selectors';

/**
 * Портальный каталог в движке: адрес поля, варианты справочника, условия
 * показа и носитель ответа приходят анкетой, а не хардкодом.
 *
 * Поле здесь заведено на портале РУКАМИ: в слепке (`portal.bitrixfields`)
 * его нет вовсе — именно этот случай раньше был невидим до следующего
 * календарного дня, пока не протухнет клиентский кэш слепка.
 */

/** Имя ровно как вернул Битрикс: ключ не собирается, а используется как есть. */
const MANUAL_UF_KEY = 'UF_CRM_1712345678';

const item = (over: Partial<QuestionnaireItem> = {}): QuestionnaireItem => ({
    code: 'client_promise',
    title: 'Обещание клиента',
    placeholder: null,
    hint: null,
    groupTitle: null,
    sort: 10,
    control: 'enumeration',
    isRequired: true,
    requireChange: false,
    staleAfterDays: null,
    channel: 'crm',
    dtoPath: null,
    target: { mode: 'auto', entity: null },
    smart: null,
    isNative: false,
    field: { name: MANUAL_UF_KEY, type: 'enumeration' },
    // Портальная анкета кода pbx-реестра не знает — резолв по слепку ей не
    // нужен.
    legacyFieldCode: null,
    options: [
        { code: 'pay_now', title: 'Оплатит сейчас', bitrixId: 777 },
        { code: 'think', title: 'Думает', bitrixId: 778 },
    ],
    ...over,
});

const def = (over: Partial<QuestionnaireDef> = {}): QuestionnaireDef => ({
    code: 'pay_call',
    title: 'Звонок по оплате',
    hint: null,
    purpose: 'plan',
    presentation: 'inline',
    place: 'plan',
    persist: 'onChange',
    conditions: [{ kind: 'planType', values: ['moneyAwait'] }],
    configKey: null,
    legacyChecklistId: null,
    sort: 10,
    items: [item()],
    ...over,
});

const makeState = (over?: {
    defs?: QuestionnaireDef[];
    planCode?: string | null;
    workStatus?: string;
    company?: Record<string, unknown> | null;
    deal?: Record<string, unknown> | null;
    lead?: Record<string, unknown> | null;
}): RootState =>
    ({
        app: {
            config: {},
            bitrix: {
                company: over?.company ?? null,
                deal:
                    over?.deal === undefined
                        ? { ID: '10', [MANUAL_UF_KEY]: '' }
                        : over.deal,
                lead: over?.lead ?? null,
            },
        },
        eventPlan: {
            isActive: over?.planCode !== null,
            type: {
                current: { id: 6, code: over?.planCode ?? 'moneyAwait' },
            },
        },
        eventTask: { current: null },
        eventReport: {
            report: {
                [EV_REPORT_PROP.WORK_STATUS]: {
                    current: { code: over?.workStatus ?? 'inJob' },
                },
            },
        },
        stagePredict: { status: 'idle', requestKey: null, result: null },
        questionnaireCatalog: { defs: over?.defs ?? [def()] },
        callChecklist: {
            valueByKey: {},
            draftByKey: {},
            savingKeys: {},
            baselineByKey: {},
            confirmed: {},
            error: null,
            baseDeal: { id: null, row: null, status: 'idle' },
        },
        // Слепок портала ПУСТ: поле заведено вручную и в него не попало.
        portal: { portal: { bitrixDeal: { bitrixfields: [] } } },
    }) as unknown as RootState;

describe('Портальная анкета: адрес поля из каталога', () => {
    it('поля нет в слепке — вопрос всё равно адресуется, по имени из каталога', () => {
        const state = makeState();
        const [resolved] = resolveChecklistFields(state, def());

        expect(resolved?.ufKey).toBe(MANUAL_UF_KEY);
        expect(resolved?.entity).toBe('deal');
        expect(resolved?.entityId).toBe(10);
    });

    it('текущее значение читается по тому же имени, подпись — из вариантов каталога', () => {
        const state = makeState({
            deal: { ID: '10', [MANUAL_UF_KEY]: 777 },
        });
        const [resolved] = resolveChecklistFields(state, def());

        // В строке лежит bitrixId варианта, контрол работает с кодом.
        expect(resolved?.currentValue).toBe('pay_now');
        expect(resolved?.currentLabel).toBe('Оплатит сейчас');
        // Значение из CRM закрывает обязательность — вопрос не блокирует.
        expect(selectIncompleteInlineChecklists(state)).toEqual([]);
    });

    it('поля нет ни в одной загруженной строке — вопрос не показывается и не блокирует', () => {
        const state = makeState({ deal: { ID: '10' } });

        expect(resolveChecklistFields(state, def())).toEqual([]);
        expect(selectIncompleteInlineChecklists(state)).toEqual([]);
    });

    it('справочник без вариантов не показывается: закрыть его нечем', () => {
        const empty = def({ items: [item({ options: [] })] });

        expect(resolveChecklistFields(makeState(), empty)).toEqual([]);
    });
});

describe('Портальная анкета: носитель ответа (target)', () => {
    const rows = {
        company: { ID: '5', [MANUAL_UF_KEY]: '' },
        deal: { ID: '10', [MANUAL_UF_KEY]: '' },
        lead: { ID: '7', [MANUAL_UF_KEY]: '' },
    };

    it('mode «auto» — прежний приоритет компания → сделка → лид', () => {
        const state = makeState(rows);
        const [resolved] = resolveChecklistFields(state, def());

        expect(resolved?.entity).toBe('company');
        expect(resolved?.entityId).toBe(5);
    });

    it('носители собираются ВСЕ — запись идёт в каждого (доктрина полей-истин)', () => {
        const state = makeState(rows);
        const [resolved] = resolveChecklistFields(state, def());

        expect(resolved?.carriers).toEqual([
            { entity: 'company', entityId: 5, ufKey: MANUAL_UF_KEY },
            { entity: 'deal', entityId: 10, ufKey: MANUAL_UF_KEY },
            { entity: 'lead', entityId: 7, ufKey: MANUAL_UF_KEY },
        ]);
    });

    it('пустая компания не прячет живое значение сделки («сделка точнее»)', () => {
        const dateDef = def({
            items: [
                item({
                    control: 'date',
                    options: [],
                    field: { name: MANUAL_UF_KEY, type: 'date' },
                }),
            ],
        });
        const state = makeState({
            company: { ID: '5', [MANUAL_UF_KEY]: '' },
            deal: { ID: '10', [MANUAL_UF_KEY]: '05.09.2026' },
        });
        const [resolved] = resolveChecklistFields(state, dateDef);

        // Главный носитель — прежний (компания), но «сейчас» добрано со
        // сделки: раньше пустая компания показывала пустой контрол, хотя
        // дата стояла.
        expect(resolved?.entity).toBe('company');
        expect(resolved?.currentValue).toBe('2026-09-05');
    });

    it('mode «entity» — носитель, названный анкетой, а не первый по приоритету', () => {
        const onLead = def({
            items: [item({ target: { mode: 'entity', entity: 'lead' } })],
        });
        const [resolved] = resolveChecklistFields(makeState(rows), onLead);

        expect(resolved?.entity).toBe('lead');
        expect(resolved?.entityId).toBe(7);
    });

    it('названный носитель не загружен — вопрос не показывается', () => {
        const onLead = def({
            items: [item({ target: { mode: 'entity', entity: 'lead' } })],
        });
        const state = makeState({ ...rows, lead: null });

        expect(resolveChecklistFields(state, onLead)).toEqual([]);
    });
});

describe('Портальная анкета: условия показа', () => {
    const both: QuestionnaireCondition[] = [
        { kind: 'planType', values: ['moneyAwait'] },
        { kind: 'workStatus', values: ['inJob'] },
    ];

    it('две части условия — анкета активна только когда совпали ОБЕ', () => {
        const defs = [def({ conditions: both })];

        expect(
            selectActiveChecklists(
                makeState({
                    defs,
                    planCode: 'moneyAwait',
                    workStatus: 'inJob',
                }),
            ).map(d => d.code),
        ).toEqual(['pay_call']);

        // Тип звонка тот, статус работы другой — анкеты нет.
        expect(
            selectActiveChecklists(
                makeState({
                    defs,
                    planCode: 'moneyAwait',
                    workStatus: 'success',
                }),
            ),
        ).toEqual([]);

        // Статус тот, тип звонка другой — тоже нет.
        expect(
            selectActiveChecklists(
                makeState({ defs, planCode: 'refine', workStatus: 'inJob' }),
            ),
        ).toEqual([]);
    });

    it('значения внутри одного условия — ИЛИ', () => {
        const defs = [
            def({
                conditions: [{ kind: 'planType', values: ['refine', 'hot'] }],
            }),
        ];

        expect(
            selectActiveChecklists(makeState({ defs, planCode: 'hot' })),
        ).toHaveLength(1);
        expect(
            selectActiveChecklists(makeState({ defs, planCode: 'warm' })),
        ).toEqual([]);
    });

    it('вид условия, которого движок не знает, гасит анкету целиком', () => {
        // Реестр бэка расширяется раньше фрейма: показать анкету, условие
        // которой мы не проверили, — это вопросы не вовремя, а при
        // обязательном пункте ещё и заблокированная отправка.
        const unknownKind = {
            kind: 'smartStage',
            values: ['DT1036_17:NEW'],
        } as unknown as QuestionnaireCondition;

        expect(
            selectActiveChecklists(
                makeState({ defs: [def({ conditions: [unknownKind] })] }),
            ),
        ).toEqual([]);

        // И даже рядом с выполненным условием: между условиями И.
        expect(
            selectActiveChecklists(
                makeState({
                    defs: [
                        def({
                            conditions: [
                                { kind: 'planType', values: ['moneyAwait'] },
                                unknownKind,
                            ],
                        }),
                    ],
                }),
            ),
        ).toEqual([]);
    });

    it('«always» показывает анкету без привязки к типу звонка', () => {
        const defs = [def({ conditions: [{ kind: 'always', values: [] }] })];

        expect(
            selectActiveChecklists(makeState({ defs, planCode: 'warm' })),
        ).toHaveLength(1);
    });

    it('анкета без условий не показывается', () => {
        // Пустой список приходит только от сломанных данных; «показывать
        // всегда» — это явный вид `always`.
        expect(
            selectActiveChecklists(
                makeState({ defs: [def({ conditions: [] })] }),
            ),
        ).toEqual([]);
    });

    it('фича-флаг портала: пустой configKey — анкета включена всегда', () => {
        const gated = def({ configKey: 'withChecklistPay' });

        // Флага в конфиге нет — анкета с ним не показывается…
        expect(selectActiveChecklists(makeState({ defs: [gated] }))).toEqual(
            [],
        );
        // …а анкета без флага показывается (у портальной анкеты его нет).
        expect(selectActiveChecklists(makeState())).toHaveLength(1);
    });

    it('незнакомая настройка портала не прячет анкету', () => {
        // Ключа нет в реестре настроек фрейма (опечатка админа или
        // серверная настройка): проверить его нечем, и «нет настройки»
        // раньше означало «анкеты нет» — молча, навсегда.
        const unknown = def({ configKey: 'withChecklistCustom' });

        expect(
            selectActiveChecklists(makeState({ defs: [unknown] })),
        ).toHaveLength(1);
    });
});
