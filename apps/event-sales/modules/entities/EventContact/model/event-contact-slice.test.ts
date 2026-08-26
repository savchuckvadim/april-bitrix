import { describe, expect, it } from 'vitest';
import {
    eventContactActions,
    eventContactReducer,
    type EventContactState,
} from './EventContactSlice';
import { EV_CONTACT_TYPE } from '../type/event-contact-type';

/**
 * Ручной выбор контакта против reload: сброс слайса + повторная
 * авто-инициализация из привязки задачи не должны подменять человека,
 * которого менеджер выбрал в отчёте руками. Авто-режим (ручного выбора
 * не было) при этом работает как раньше.
 */

const contact = (id: number) => ({ ID: id }) as never;

const run = (
    state: EventContactState | undefined,
    action: Parameters<typeof eventContactReducer>[1],
) => eventContactReducer(state, action);

/** Бут: приехали контакты, привязка задачи указала на контакт 1. */
const boot = (): EventContactState => {
    let state = run(
        undefined,
        eventContactActions.setFetchedContacts({
            contacts: [contact(1), contact(2)],
        }),
    );
    state = run(
        state,
        eventContactActions.setInitCurrentContact({
            type: 'init',
            contactId: 1,
        }),
    );
    return state;
};

/** Reload: сброс слайса, контакты приехали заново, задача перепривязалась. */
const reload = (
    state: EventContactState,
    contactIds: number[] = [1, 2],
): EventContactState => {
    let next = run(state, eventContactActions.reset());
    next = run(
        next,
        eventContactActions.setFetchedContacts({
            contacts: contactIds.map(contact),
        }),
    );
    next = run(
        next,
        eventContactActions.setInitCurrentContact({
            type: 'init',
            contactId: 1,
        }),
    );
    return next;
};

describe('EventContactSlice: ручной выбор переживает reload', () => {
    it('ручной выбор в отчёте не затирается перепривязкой после reload', () => {
        let state = boot();
        state = run(
            state,
            eventContactActions.setCurrentContact({
                type: 'report',
                contactId: 2,
            }),
        );
        expect(Number(state.current.report?.ID)).toBe(2);

        state = reload(state);

        expect(Number(state.current.report?.ID)).toBe(2);
        expect(state.pendingCurrentId).toBe(2);
    });

    it('авто-режим (ручного выбора не было) работает как раньше', () => {
        let state = boot();
        expect(Number(state.current.report?.ID)).toBe(1);

        state = reload(state);

        expect(Number(state.current.report?.ID)).toBe(1);
        expect(state.pendingCurrentId).toBe(1);
    });

    it('созданный и подставленный контакт — тоже ручной выбор', () => {
        let state = boot();
        state = run(
            state,
            eventContactActions.setCreatedContact({
                type: EV_CONTACT_TYPE.REPORT,
                contact: contact(9),
            }),
        );

        // Созданный контакт привязан к сущности — после reload он приедет
        // в списке вместе с остальными.
        state = reload(state, [1, 2, 9]);

        expect(Number(state.current.report?.ID)).toBe(9);
    });

    it('снятие контакта отменяет ручной выбор — дальше снова авто', () => {
        let state = boot();
        state = run(
            state,
            eventContactActions.setCurrentContact({
                type: 'report',
                contactId: 2,
            }),
        );
        state = run(
            state,
            eventContactActions.clearCurrentContact({
                type: EV_CONTACT_TYPE.REPORT,
            }),
        );

        state = reload(state);

        expect(Number(state.current.report?.ID)).toBe(1);
    });

    it('открытие другой карточки (clearManualCurrent) возвращает авто', () => {
        let state = boot();
        state = run(
            state,
            eventContactActions.setCurrentContact({
                type: 'report',
                contactId: 2,
            }),
        );
        state = run(state, eventContactActions.clearManualCurrent());
        state = run(
            state,
            eventContactActions.setInitCurrentContact({
                type: 'init',
                contactId: 1,
            }),
        );

        expect(Number(state.current.report?.ID)).toBe(1);
    });

    it('cleanEvent (contactId: null) гасит и ручной выбор', () => {
        let state = boot();
        state = run(
            state,
            eventContactActions.setCurrentContact({
                type: 'report',
                contactId: 2,
            }),
        );
        state = run(
            state,
            eventContactActions.setInitCurrentContact({
                type: 'init',
                contactId: null,
            }),
        );

        expect(state.manualCurrentId).toBeNull();
        expect(state.current.report).toBeNull();
        expect(state.pendingCurrentId).toBeNull();
    });
});
