import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Сбор контактов батчем и дедуп источников (todo Б4).
 *
 * Что здесь защищается:
 * 1. три сетевых источника (contactItems компании, contactItems сделки,
 *    crm.lead.list) уезжают ОДНИМ callBatch, статические id — тем же батчем,
 *    открывшиеся из ответа контакты — вторым; одиночные методы не зовутся;
 * 2. повторный прогон (листенеры зовут сбор 2–3 раза за старт) не
 *    переопрашивает уже опрошенные источники — только новые (появилась
 *    сделка → только её contactItems, новый лид задачи → только его id);
 * 3. reload (reset слайса) сбрасывает реестр — источники опрашиваются заново;
 * 4. сорвавшийся батч снимает пометки: следующий прогон переопрашивает;
 * 5. ручной выбор контакта переживает пополнение списка из батчей;
 * 6. параллельные сборы не смешивают команды в общем cmdBatch (очередь).
 *
 * Bitrix подменён на уровне пакета: фейк повторяет контракт общего cmdBatch
 * (batch.* наполняет, api.callBatch снимает снимок и чистит) — тест ловит и
 * смешение команд, и лишние отправки.
 */

const h = vi.hoisted(() => {
    type Cmd = { method: string; params: Record<string, unknown> };
    /** Наполняемый cmdBatch — как общее поле BitrixService. */
    const pending: Record<string, Cmd> = {};
    /** Журнал отправок: команды каждого callBatch. */
    const batches: Array<Record<string, Cmd>> = [];
    /** Одиночные (не батч) вызовы — их быть не должно. */
    const plainCalls: string[] = [];

    const state = {
        /** Ответчик батча; тест подменяет под сценарий. */
        respond: (async () => ({}) as Record<string, unknown>) as (
            cmds: Record<string, Cmd>,
        ) => Record<string, unknown> | Promise<Record<string, unknown>>,
    };

    const add = (
        cmd: string,
        method: string,
        params: Record<string, unknown>,
    ) => {
        pending[cmd] = { method, params };
    };
    const plain = (name: string) => {
        return () => {
            plainCalls.push(name);
            throw new Error(`одиночный вызов ${name} запрещён — только батч`);
        };
    };

    const service = {
        api: {
            callBatch: async () => {
                const cmds = { ...pending };
                for (const key of Object.keys(pending)) delete pending[key];
                batches.push(cmds);
                return state.respond(cmds);
            },
        },
        batch: {
            company: {
                contactItemsGet: (cmd: string, id: unknown) =>
                    add(cmd, 'crm.company.contact.items.get', { id }),
            },
            deal: {
                contactItemsGet: (cmd: string, id: unknown) =>
                    add(cmd, 'crm.deal.contact.items.get', { id }),
            },
            lead: {
                getList: (cmd: string, filter: unknown, select: unknown) =>
                    add(cmd, 'crm.lead.list', { filter, select }),
            },
            contact: {
                getList: (cmd: string, filter: unknown, select: unknown) =>
                    add(cmd, 'crm.contact.list', { filter, select }),
            },
        },
        company: { contactItemsGet: plain('company.contactItemsGet') },
        deal: { contactItemsGet: plain('deal.contactItemsGet') },
        lead: { getList: plain('lead.getList') },
        contact: { getList: plain('contact.getList') },
    };

    return { pending, batches, plainCalls, state, service };
});

vi.mock('@workspace/bitrix', () => ({
    Bitrix: { getService: () => h.service },
    // Фейковый callBatch отдаёт уже плоскую мапу cmd → значение; разбор
    // конвертов транспорта — забота настоящего flattenBatchResults.
    flattenBatchResults: (raw: unknown) => raw as Record<string, unknown>,
}));

vi.mock('@/modules/shared/front-error', () => ({
    reportFrontError: () => undefined,
}));

import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import type { Portal } from '@/modules/app/types/portal/portal-type';
import {
    eventContactActions,
    eventContactReducer,
    type EventContactState,
} from './EventContactSlice';
import { collectRelatedContacts } from './EventContactThunk';

type Cmd = { method: string; params: Record<string, unknown> };

const portal = { contact: { bitrixfields: [] } } as unknown as Portal;

/** id из фильтра команды crm.contact.list / crm.lead.list. */
const filterIds = (cmd: Cmd | undefined): number[] =>
    ((cmd?.params.filter as { ID?: number[] } | undefined)?.ID ?? [])
        .slice()
        .sort((a, b) => a - b);

/** Эхо-ответчик: страницы контактов возвращают запрошенные id. */
const respondWith =
    (over: Record<string, unknown> = {}) =>
    (cmds: Record<string, Cmd>): Record<string, unknown> => {
        const out: Record<string, unknown> = { ...over };
        for (const [cmd, def] of Object.entries(cmds)) {
            if (!cmd.startsWith('contact_page_') || cmd in out) continue;
            out[cmd] = filterIds(def).map(id => ({ ID: String(id) }));
        }
        return out;
    };

interface Entities {
    company: Record<string, unknown> | null;
    deal: Record<string, unknown> | null;
    lead: Record<string, unknown> | null;
}

/**
 * Мини-стор: thunk'и исполняются, экшены контактного слайса прогоняются
 * через НАСТОЯЩИЙ редьюсер — реестр опрошенных и список контактов живут
 * между прогонами, как в приложении.
 */
const makeStore = (init: Partial<Entities> = {}, taskUf?: string[]) => {
    const bitrix: Entities = {
        company: null,
        deal: null,
        lead: null,
        ...init,
    };
    let task: { ufCrmTask?: string[] } | null = taskUf
        ? { ufCrmTask: taskUf }
        : null;
    let contactState: EventContactState = eventContactReducer(undefined, {
        type: '@@INIT',
    } as never);
    const actions: Array<{ type: string; payload?: unknown }> = [];

    const getState = (() => ({
        app: { bitrix, domain: 'test.bitrix24.ru' },
        eventTask: { current: task },
        portal: { portal },
        contact: contactState,
    })) as unknown as AppGetState;

    const dispatch = ((action: unknown) => {
        if (typeof action === 'function') {
            return (action as (d: AppDispatch, g: AppGetState) => unknown)(
                dispatch,
                getState,
            );
        }
        const typed = action as { type: string; payload?: unknown };
        actions.push(typed);
        contactState = eventContactReducer(contactState, typed as never);
        return action;
    }) as unknown as AppDispatch;

    return {
        dispatch,
        actions,
        bitrix,
        setTask: (uf: string[]) => {
            task = { ufCrmTask: uf };
        },
        contact: () => contactState,
    };
};

const cmdsOf = (batch: Record<string, Cmd>) => Object.keys(batch).sort();

/** Батч по индексу (отрицательный — с конца); нет батча — ошибка теста. */
const batchAt = (index: number): Record<string, Cmd> => {
    const batch = h.batches.at(index);
    if (!batch) throw new Error(`батча №${index} не было`);
    return batch;
};

const contactIds = (state: EventContactState) =>
    state.contacts.map(contact => Number(contact.ID)).sort((a, b) => a - b);

beforeEach(() => {
    for (const key of Object.keys(h.pending)) delete h.pending[key];
    h.batches.length = 0;
    h.plainCalls.length = 0;
    h.state.respond = respondWith();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('collectRelatedContacts: один батч вместо трёх запросов', () => {
    it('источники и статические id уезжают первым батчем, открывшиеся контакты — вторым', async () => {
        const store = makeStore(
            {
                company: { ID: '1' },
                deal: { ID: '5', LEAD_ID: '7', CONTACT_ID: '100' },
            },
            ['L_8', 'C_200'],
        );
        h.state.respond = respondWith({
            contact_company_items: [{ CONTACT_ID: '11' }],
            contact_deal_items: [{ CONTACT_ID: '100' }, { CONTACT_ID: '12' }],
            contact_related_leads: [
                { ID: '7', CONTACT_ID: '13' },
                { ID: '8', CONTACT_ID: '13' },
            ],
        });

        await store.dispatch(collectRelatedContacts(portal));

        expect(h.batches).toHaveLength(2);
        expect(cmdsOf(batchAt(0))).toEqual([
            'contact_company_items',
            'contact_deal_items',
            'contact_page_0',
            'contact_related_leads',
        ]);
        expect(filterIds(batchAt(0).contact_related_leads)).toEqual([7, 8]);
        // Статические id (контакт сделки, привязка задачи) — тем же батчем.
        expect(filterIds(batchAt(0).contact_page_0)).toEqual([100, 200]);
        // Второй батч — только открывшиеся из ответа, одной пачкой.
        expect(cmdsOf(batchAt(1))).toEqual(['contact_page_0']);
        expect(filterIds(batchAt(1).contact_page_0)).toEqual([11, 12, 13]);
        // Одиночные методы не звались вовсе.
        expect(h.plainCalls).toEqual([]);

        const state = store.contact();
        expect(contactIds(state)).toEqual([11, 12, 13, 100, 200]);
        expect(state.sourceById[11]).toEqual(['company']);
        expect(state.sourceById[12]).toEqual(['deal']);
        expect(state.sourceById[13]).toEqual(['relatedLead']);
        expect(state.sourceById[100]).toEqual(['deal']);
        expect(state.sourceById[200]).toEqual(['task']);
        // Пометка источников ушла ПЕРВЫМ экшеном — до всякой сети.
        const mark = store.actions.at(0);
        expect(mark?.type).toBe('eventContactSlice/markSourcesRequested');
        expect((mark?.payload as { keys: string[] }).keys.sort()).toEqual([
            'company:1',
            'deal:5',
            'lead:7',
            'lead:8',
        ]);
    });

    it('без сущностей и привязок в сеть не ходит и стор не трогает', async () => {
        const store = makeStore();

        await store.dispatch(collectRelatedContacts(portal));

        expect(h.batches).toHaveLength(0);
        expect(store.contact().isFetched).toBe(false);
    });
});

describe('collectRelatedContacts: дедуп источников между прогонами', () => {
    it('повторный прогон не переопрашивает старые источники', async () => {
        const store = makeStore({ company: { ID: '1' } }, ['C_200']);
        h.state.respond = respondWith({
            contact_company_items: [{ CONTACT_ID: '11' }],
        });
        await store.dispatch(collectRelatedContacts(portal));
        const sent = h.batches.length;

        await store.dispatch(collectRelatedContacts(portal));

        // Ни одного нового батча: источник опрошен, контакты известны.
        expect(h.batches.length).toBe(sent);
        // Подписи статических источников и перелинковка — обновились штатно.
        const fetches = store.actions.filter(
            action => action.type === 'eventContactSlice/setFetchedContacts',
        );
        expect(fetches.length).toBeGreaterThanOrEqual(3);
        expect(store.contact().sourceById[200]).toEqual(['task']);
    });

    it('появилась сделка — дозапрашивается только её contactItems', async () => {
        const store = makeStore({ company: { ID: '1' } });
        h.state.respond = respondWith({
            contact_company_items: [{ CONTACT_ID: '11' }],
            contact_deal_items: [{ CONTACT_ID: '100' }],
        });
        await store.dispatch(collectRelatedContacts(portal));
        const sent = h.batches.length;

        store.bitrix.deal = { ID: '5', CONTACT_ID: '100' };
        await store.dispatch(collectRelatedContacts(portal));

        // Один новый батч: contactItems сделки + её статический контакт;
        // компания повторно не опрашивается, второй волны нет (100 уже
        // спрошен тем же батчем).
        expect(h.batches.length).toBe(sent + 1);
        const last = batchAt(-1);
        expect(cmdsOf(last)).toEqual(['contact_deal_items', 'contact_page_0']);
        expect(filterIds(last.contact_page_0)).toEqual([100]);
    });

    it('новый лид задачи — в crm.lead.list только его id', async () => {
        const store = makeStore({ deal: { ID: '5', LEAD_ID: '7' } });
        await store.dispatch(collectRelatedContacts(portal));
        expect(filterIds(batchAt(0).contact_related_leads)).toEqual([7]);
        const sent = h.batches.length;

        store.setTask(['L_8']);
        await store.dispatch(collectRelatedContacts(portal));

        expect(h.batches.length).toBe(sent + 1);
        const last = batchAt(-1);
        expect(cmdsOf(last)).toEqual(['contact_related_leads']);
        expect(filterIds(last.contact_related_leads)).toEqual([8]);
    });

    it('reload (reset) сбрасывает реестр — источники опрашиваются заново', async () => {
        const store = makeStore({ company: { ID: '1' } });
        h.state.respond = respondWith({
            contact_company_items: [{ CONTACT_ID: '11' }],
        });
        await store.dispatch(collectRelatedContacts(portal));
        expect(store.contact().requestedSources).toEqual({ 'company:1': true });

        store.dispatch(eventContactActions.reset());
        expect(store.contact().requestedSources).toEqual({});
        const sent = h.batches.length;

        await store.dispatch(collectRelatedContacts(portal));

        const first = batchAt(sent);
        expect(cmdsOf(first)).toContain('contact_company_items');
        expect(contactIds(store.contact())).toEqual([11]);
    });

    it('сорвавшийся батч снимает пометки: следующий прогон переопрашивает', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const store = makeStore({ company: { ID: '1' } }, ['C_200']);
        let calls = 0;
        h.state.respond = cmds => {
            calls += 1;
            if (calls === 1) throw new Error('портал упал');
            return respondWith({
                contact_company_items: [{ CONTACT_ID: '11' }],
            })(cmds);
        };

        await store.dispatch(collectRelatedContacts(portal));

        // Пометка снята, статический контакт привязки доехал вторым заходом.
        expect(store.contact().requestedSources).toEqual({});
        expect(contactIds(store.contact())).toEqual([200]);

        await store.dispatch(collectRelatedContacts(portal));

        const last = batchAt(-2);
        expect(cmdsOf(last)).toContain('contact_company_items');
        expect(contactIds(store.contact())).toEqual([11, 200]);
    });
});

describe('collectRelatedContacts: инварианты списка', () => {
    it('ручной выбор контакта переживает пополнение из батчей', async () => {
        const store = makeStore({ company: { ID: '1' } }, ['C_200']);
        h.state.respond = respondWith({
            contact_company_items: [{ CONTACT_ID: '11' }],
            contact_deal_items: [{ CONTACT_ID: '12' }],
        });
        await store.dispatch(collectRelatedContacts(portal));

        store.dispatch(
            eventContactActions.setCurrentContact({
                type: 'report',
                contactId: 200,
            } as never),
        );
        expect(Number(store.contact().current.report?.ID)).toBe(200);

        store.bitrix.deal = { ID: '5' };
        await store.dispatch(collectRelatedContacts(portal));

        expect(Number(store.contact().current.report?.ID)).toBe(200);
        expect(store.contact().manualCurrentId).toBe(200);
        expect(contactIds(store.contact())).toEqual([11, 12, 200]);
    });

    it('больше 50 недостающих id — чанки едут командами одного батча', async () => {
        const store = makeStore({ company: { ID: '1' } });
        h.state.respond = respondWith({
            contact_company_items: Array.from({ length: 60 }, (_, i) => ({
                CONTACT_ID: String(i + 1),
            })),
        });

        await store.dispatch(collectRelatedContacts(portal));

        expect(h.batches).toHaveLength(2);
        expect(cmdsOf(batchAt(1))).toEqual([
            'contact_page_0',
            'contact_page_1',
        ]);
        expect(filterIds(batchAt(1).contact_page_0)).toHaveLength(50);
        expect(filterIds(batchAt(1).contact_page_1)).toHaveLength(10);
        expect(contactIds(store.contact())).toHaveLength(60);
    });
});

describe('collectRelatedContacts: очередь отправок', () => {
    it('параллельные сборы не смешивают команды в одном cmdBatch', async () => {
        const store = makeStore({ company: { ID: '1' } });
        let release!: () => void;
        const gate = new Promise<void>(resolve => {
            release = resolve;
        });
        h.state.respond = async cmds => {
            // Первый батч (компания) висит, пока тест его не отпустит.
            if (cmds.contact_company_items) await gate;
            return respondWith({
                contact_company_items: [{ CONTACT_ID: '11' }],
                contact_deal_items: [{ CONTACT_ID: '12' }],
            })(cmds);
        };

        const first = store.dispatch(collectRelatedContacts(portal));
        store.bitrix.deal = { ID: '5' };
        const second = store.dispatch(collectRelatedContacts(portal));
        await Promise.resolve();

        // Пока первый батч в полёте, второй сбор не наполняет общий cmdBatch.
        expect(h.batches).toHaveLength(1);
        expect(cmdsOf(batchAt(0))).toEqual(['contact_company_items']);
        expect(Object.keys(h.pending)).toEqual([]);

        release();
        await Promise.all([first, second]);

        // Ни один батч не смешал команды двух сборов.
        for (const batch of h.batches) {
            expect(
                'contact_company_items' in batch &&
                    'contact_deal_items' in batch,
            ).toBe(false);
        }
        expect(contactIds(store.contact())).toEqual([11, 12]);
    });
});
