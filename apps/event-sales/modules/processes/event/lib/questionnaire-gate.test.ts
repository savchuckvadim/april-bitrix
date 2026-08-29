import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppGetState, RootState } from '@/modules/app/model/store';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { FALLBACK_CATALOG } from '@/modules/entities/Questionnaire/data/fallback-catalog';
import type {
    QuestionnaireCatalogSource,
    QuestionnaireCatalogStatus,
} from '@/modules/entities/Questionnaire/model/QuestionnaireCatalogSlice';
import type {
    QuestionnaireDef,
    QuestionnaireItem,
} from '@/modules/entities/Questionnaire/model/questionnaire.type';
import { answerKey } from '@/modules/entities/Questionnaire/lib/answer-key';
import {
    awaitQuestionnaireCatalog,
    getChecklistGateError,
} from './questionnaire-gate';
import { validateSend } from './send-validation';

/**
 * Гейт каталога анкет перед отправкой.
 *
 * Проверяется ровно то, ради чего гейт сделан ожиданием, а не блокировкой:
 * недоступный каталог отчёт не задерживает (сегодня это рабочий режим —
 * миграция не накатана, эндпоинт отвечает ошибкой), а доехавший каталог
 * ловит незаполненный обязательный вопрос там же, где ловил встроенный.
 *
 * Политика одна на два места, поэтому каждый случай проверяется и через
 * `getChecklistGateError` (её зовёт send-validation), и через сам
 * `validateSend`: расхождение между ними и есть та ошибка, которую тест
 * обязан поймать.
 */

/** Поле заведено на портале руками: в слепке его нет, адрес — из каталога. */
const MANUAL_UF_KEY = 'UF_CRM_1712345678';

const PORTAL_ITEM: QuestionnaireItem = {
    code: 'objection',
    title: 'Возражение клиента',
    placeholder: null,
    hint: null,
    groupTitle: null,
    sort: 10,
    control: 'string',
    isRequired: true,
    requireChange: false,
    staleAfterDays: null,
    channel: 'crm',
    dtoPath: null,
    target: { mode: 'auto', entity: null },
    smart: null,
    isNative: false,
    field: { name: MANUAL_UF_KEY, type: 'string' },
    legacyFieldCode: null,
    options: [],
};

const PORTAL_DEF: QuestionnaireDef = {
    code: 'portalRefine',
    title: 'Доработка портала',
    hint: null,
    purpose: 'plan',
    presentation: 'inline',
    place: 'plan',
    persist: 'onChange',
    conditions: [{ kind: 'planType', values: ['refine'] }],
    configKey: null,
    legacyChecklistId: 'refine',
    sort: 10,
    items: [PORTAL_ITEM],
};

const makeState = (over?: {
    status?: QuestionnaireCatalogStatus;
    source?: QuestionnaireCatalogSource;
    defs?: QuestionnaireDef[];
    valueByKey?: Record<string, string>;
    config?: Record<string, boolean>;
}): RootState =>
    ({
        // Форма заполнена: остаётся ровно один повод не отправить — анкета.
        eventReport: {
            report: {
                [EV_REPORT_PROP.COMMENT]: 'поговорили',
                [EV_REPORT_PROP.WORK_STATUS]: { current: { code: 'inJob' } },
            },
        },
        eventPlan: {
            isActive: true,
            name: 'Доработка',
            date: '2026-08-28 15:00',
            type: { items: [], current: { id: 3, code: 'refine' } },
        },
        eventItemMenu: { type: 'CURRENT' },
        eventPostFail: { postFailDate: null },
        eventTask: { current: null },
        leadRequest: { finalSync: { notCaTypeCode: null } },
        company: { color: { isChanged: false } },
        stagePredict: { status: 'idle', requestKey: null, result: null },
        questionnaireCatalog: {
            status: over?.status ?? 'ready',
            domain: 'gsr.bitrix24.ru',
            contract: 1,
            version: 1,
            hash: 'sha1',
            defs: over?.defs ?? [PORTAL_DEF],
            source: over?.source ?? 'server',
        },
        callChecklist: {
            valueByKey: over?.valueByKey ?? {},
            draftByKey: {},
            savingKeys: {},
            baselineByKey: {},
            confirmed: {},
            error: null,
            baseDeal: { id: null, row: null, status: 'idle' },
        },
        // Слепок портала пуст, поле в сделке пустое: вопрос адресуется по
        // имени из каталога и ответа пока не имеет.
        portal: { portal: { bitrixDeal: { bitrixfields: [] } } },
        app: {
            config: over?.config ?? {},
            bitrix: {
                company: null,
                deal: { ID: '10', [MANUAL_UF_KEY]: '' },
                lead: null,
            },
        },
    }) as unknown as RootState;

const stateOf = (status: QuestionnaireCatalogStatus): AppGetState =>
    (() => ({ questionnaireCatalog: { status } })) as unknown as AppGetState;

afterEach(() => {
    vi.useRealTimers();
});

describe('ожидание каталога в send()', () => {
    it('каталог всё ещё грузится — гейт отпускает по дедлайну, а не держит отправку', async () => {
        vi.useFakeTimers();
        const started = Date.now();
        // Момент снимается ВНУТРИ промиса: часы теста уедут дальше сами.
        let settledAt = 0;

        const waiting = awaitQuestionnaireCatalog(stateOf('loading')).then(
            () => {
                settledAt = Date.now();
            },
        );
        await vi.advanceTimersByTimeAsync(2000);
        await waiting;

        expect(settledAt - started).toBeLessThanOrEqual(1600);
    });

    it('каталог провалился — ждать нечего, отправка идёт сразу', async () => {
        vi.useFakeTimers();
        const started = Date.now();

        await awaitQuestionnaireCatalog(stateOf('error'));

        expect(Date.now() - started).toBe(0);
    });
});

describe('каталог не доехал — отправку не блокируем', () => {
    it('встроенный набор без включённых флагов портала анкет не требует', () => {
        // Каталог ещё в пути: гейт отпустил по дедлайну, действует fallback.
        const state = makeState({
            status: 'loading',
            source: 'fallback',
            defs: FALLBACK_CATALOG,
        });

        expect(getChecklistGateError(state)).toBeNull();
        const { result } = validateSend(state);
        expect(result.errors.planChecklist).toBeFalsy();
        expect(result.isError).toBe(false);
    });

    it('ошибка бэка — тот же результат, что и у таймаута', () => {
        const state = makeState({
            status: 'error',
            source: 'fallback',
            defs: FALLBACK_CATALOG,
        });

        expect(getChecklistGateError(state)).toBeNull();
        expect(validateSend(state).result.isError).toBe(false);
    });

    it('встроенный набор включён флагом, но полей нет на портале — вопрос не блокирует', () => {
        // Боевой портал со включённым withChecklistRefine, у которого
        // pbx-поля чек-листа не установлены: адреса у вопроса нет, и
        // требовать его нельзя.
        const state = makeState({
            status: 'error',
            source: 'fallback',
            defs: FALLBACK_CATALOG,
            config: { withChecklistRefine: true },
        });

        expect(getChecklistGateError(state)).toBeNull();
        expect(validateSend(state).result.isError).toBe(false);
    });
});

describe('каталог доехал — обязательный вопрос ловится валидацией', () => {
    it('пункт портальной анкеты пуст — отправка блокируется', () => {
        const state = makeState();

        expect(getChecklistGateError(state)).toBe(
            'Заполните: доработка портала',
        );
        const { result } = validateSend(state);
        expect(result.errors.planChecklist).toBe(
            'Заполните: доработка портала',
        );
        expect(result.isError).toBe(true);
    });

    it('ответ дан — отправка проходит', () => {
        const state = makeState({
            valueByKey: {
                [answerKey(PORTAL_DEF.code, PORTAL_ITEM.code)]: 'дорого',
            },
        });

        expect(getChecklistGateError(state)).toBeNull();
        expect(validateSend(state).result.isError).toBe(false);
    });

    it('условие анкеты не выполнено — вопрос не задаётся и не блокирует', () => {
        const state = makeState({
            defs: [
                {
                    ...PORTAL_DEF,
                    conditions: [{ kind: 'planType', values: ['moneyAwait'] }],
                },
            ],
        });

        expect(getChecklistGateError(state)).toBeNull();
        expect(validateSend(state).result.isError).toBe(false);
    });

    it('анкета отчёта блокирует так же, как анкета плана', () => {
        // Место показа берёт каталог (колонка отчёта), а блокирует отправку
        // обязательный вопрос ЛЮБОЙ колонки.
        const state = makeState({
            defs: [
                {
                    ...PORTAL_DEF,
                    code: 'portalReport',
                    title: 'Вопросы отчёта',
                    purpose: 'report',
                    place: null,
                    legacyChecklistId: null,
                    conditions: [{ kind: 'always', values: [] }],
                },
            ],
        });

        expect(getChecklistGateError(state)).toBe('Заполните: вопросы отчёта');
        expect(validateSend(state).result.isError).toBe(true);
    });
});
