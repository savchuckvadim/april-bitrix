import { describe, expect, it } from 'vitest';
import {
    buildNewContactTarget,
    pickBaseDealForContact,
} from './new-contact-target';

/**
 * Решение владельца 25.10.2026: новый контакт — в компанию клиента и в
 * сделку работы, ответственный — как у сделки.
 */
describe('pickBaseDealForContact', () => {
    const rows = [
        { ID: 30379, ASSIGNED_BY_ID: '261', DATE_MODIFY: '2026-10-14T11:40:00+03:00' },
        { ID: 28073, ASSIGNED_BY_ID: '413', DATE_MODIFY: '2026-10-22T13:48:00+03:00' },
        { ID: 31000, ASSIGNED_BY_ID: '261', DATE_MODIFY: '2026-10-10T10:00:00+03:00' },
    ];

    it('своя сделка важнее чужой, из своих — самая свежая', () => {
        expect(pickBaseDealForContact(rows, 261)?.ID).toBe(30379);
    });

    it('своей нет — самая свежая из открытых', () => {
        expect(pickBaseDealForContact(rows, 999)?.ID).toBe(28073);
    });

    it('одинаковое время изменения — больший ID; пусто — null', () => {
        expect(
            pickBaseDealForContact(
                [
                    { ID: 5, DATE_MODIFY: '2026-10-01T10:00:00+03:00' },
                    { ID: 9, DATE_MODIFY: '2026-10-01T10:00:00+03:00' },
                ],
                null,
            )?.ID,
        ).toBe(9);
        expect(pickBaseDealForContact([], 1)).toBeNull();
    });
});

describe('buildNewContactTarget', () => {
    const none = {
        deal: null,
        companyId: null,
        baseDeal: null,
        leadResponsibleId: null,
        workOwnerId: 7,
    };

    it('из сделки — её компания, она сама, ответственный сделки', () => {
        expect(
            buildNewContactTarget({
                ...none,
                deal: { ID: '104459', ASSIGNED_BY_ID: '459' },
                companyId: '161825',
            }),
        ).toEqual({ companyId: 161825, dealId: 104459, responsibleId: 459 });
    });

    it('сделка без компании — компании нет, сделка и ответственный есть', () => {
        expect(
            buildNewContactTarget({
                ...none,
                deal: { ID: 28073, ASSIGNED_BY_ID: 413 },
            }),
        ).toEqual({ companyId: null, dealId: 28073, responsibleId: 413 });
    });

    it('из компании — её основная сделка и её ответственный', () => {
        expect(
            buildNewContactTarget({
                ...none,
                companyId: 177317,
                baseDeal: { ID: 99687, ASSIGNED_BY_ID: 69 },
            }),
        ).toEqual({ companyId: 177317, dealId: 99687, responsibleId: 69 });
    });

    it('из компании без основной сделки — тот, за кого идёт работа', () => {
        expect(buildNewContactTarget({ ...none, companyId: 177317 })).toEqual({
            companyId: 177317,
            dealId: null,
            responsibleId: 7,
        });
    });

    it('лид — ответственный лида', () => {
        expect(
            buildNewContactTarget({ ...none, leadResponsibleId: '437' }),
        ).toEqual({ companyId: null, dealId: null, responsibleId: 437 });
    });
});
