import { afterEach, describe, expect, it } from 'vitest';
import { fetchRenewalOffer, toRenewalOffer } from './renewal-offer.api';
import {
    DEFAULT_RENEWAL_OFFER,
    calcMonthlyTotal,
} from './renewal-offer.model';

describe('toRenewalOffer: ответ бэкенда → предложение', () => {
    it('переносит цены и состав', () => {
        const offer = toRenewalOffer({
            clientName: 'ООО Ромашка',
            salesIncluded: true,
            salesPrice: 6500,
            aiIncluded: true,
            aiEmployees: 7,
            managerIncluded: true,
            managerPrice: 10000,
            adjustment: -2000,
            adjustmentLabel: 'Скидка за год вперёд',
            extras: [{ title: 'Телефония', price: 3000, period: 'month' }],
        });

        expect(offer.clientName).toBe('ООО Ромашка');
        expect(offer.salesPrice).toBe(6500);
        expect(offer.aiEmployees).toBe(7);
        expect(offer.adjustment).toBe(-2000);
        // 6500 + 11500 + 10000 + 3000 − 2000
        expect(calcMonthlyTotal(offer)).toBe(29_000);
    });

    it('процент скидки доходит до расчёта', () => {
        const offer = toRenewalOffer({
            clientName: 'ООО Ромашка',
            salesPrice: 30_000,
            aiBasePrice: 10_000,
            aiEmployees: 3,
            discountPercent: 10,
        });
        expect(offer.discountPercent).toBe(10);
        expect(calcMonthlyTotal(offer)).toBe(36_000);
    });

    it('бэк без процента скидки: показываем без неё, а не падаем', () => {
        // Старый бэк поля не присылает, а рублёвая скидка должна работать.
        const offer = toRenewalOffer({
            clientName: 'ООО Ромашка',
            salesPrice: 30_000,
            aiBasePrice: 10_000,
            aiEmployees: 3,
            adjustment: -4000,
        });
        expect(offer.discountPercent).toBe(0);
        expect(calcMonthlyTotal(offer)).toBe(36_000);
    });

    it('выключенные услуги остаются выключенными', () => {
        const offer = toRenewalOffer({
            clientName: 'Только AI',
            salesIncluded: false,
            managerIncluded: false,
            devIncluded: false,
        });
        expect(offer.salesIncluded).toBe(false);
        expect(offer.devIncluded).toBe(false);
    });

    it('недостающая цена берётся из прайса, а не становится нулём', () => {
        // Ошибка контракта не должна превращаться в услугу за 0 ₽ у клиента.
        const offer = toRenewalOffer({ clientName: 'ООО Ромашка' });
        expect(offer.salesPrice).toBe(DEFAULT_RENEWAL_OFFER.salesPrice);
        expect(offer.aiBasePrice).toBe(DEFAULT_RENEWAL_OFFER.aiBasePrice);
    });

    it('цена 0 с бэкенда сохраняется: это решение, а не отсутствие данных', () => {
        const offer = toRenewalOffer({ clientName: 'Х', salesPrice: 0 });
        expect(offer.salesPrice).toBe(0);
    });

    it('мусор вместо тела даёт предложение по прайсу, а не падение', () => {
        expect(toRenewalOffer(null).salesPrice).toBe(
            DEFAULT_RENEWAL_OFFER.salesPrice,
        );
        expect(toRenewalOffer('строка').aiBasePrice).toBe(
            DEFAULT_RENEWAL_OFFER.aiBasePrice,
        );
    });

    it('строка вместо числа не превращается в NaN', () => {
        const offer = toRenewalOffer({
            clientName: 'Х',
            salesPrice: 'дорого',
        });
        expect(offer.salesPrice).toBe(DEFAULT_RENEWAL_OFFER.salesPrice);
    });

    it('услуги без названия отбрасываются', () => {
        const offer = toRenewalOffer({
            clientName: 'Х',
            extras: [
                { title: '  ', price: 100, period: 'month' },
                { title: 'Телефония', price: 3000, period: 'month' },
            ],
        });
        expect(offer.extras).toEqual([
            { title: 'Телефония', price: 3000, period: 'month' },
        ]);
    });

    it('неизвестная периодичность считается месячной', () => {
        const offer = toRenewalOffer({
            clientName: 'Х',
            extras: [{ title: 'Телефония', price: 100, period: 'quarter' }],
        });
        expect(offer.extras[0]?.period).toBe('month');
    });

    it('не массив вместо услуг даёт пустой список', () => {
        expect(toRenewalOffer({ clientName: 'Х', extras: 'нет' }).extras).toEqual(
            [],
        );
    });

    it('больше десяти услуг не берём', () => {
        const extras = Array.from({ length: 20 }, (_, i) => ({
            title: `Услуга ${i}`,
            price: 10,
            period: 'month',
        }));
        expect(toRenewalOffer({ clientName: 'Х', extras }).extras).toHaveLength(
            10,
        );
    });
});

describe('fetchRenewalOffer: как разбираем ответ сервера', () => {
    const originalFetch = globalThis.fetch;

    afterEach(() => {
        globalThis.fetch = originalFetch;
    });

    /** Подменяет fetch ответом с заданным кодом и телом. */
    function mockFetch(status: number, body?: unknown): void {
        globalThis.fetch = (() =>
            Promise.resolve({
                status,
                ok: status >= 200 && status < 300,
                json: () => Promise.resolve(body),
            } as Response)) as typeof globalThis.fetch;
    }

    it('410 — ссылка недействительна', async () => {
        // Так ручка отвечает на отозванную, истёкшую и неизвестную ссылку.
        mockFetch(410);
        const result = await fetchRenewalOffer('t');
        expect(result).toEqual({ ok: false, reason: 'gone' });
    });

    it('404 — это сбой, а НЕ недействительная ссылка', async () => {
        // 404 означает, что ручки нет на сервере (бэк не выложен или сменился
        // адрес). Живую ссылку уводить на главную нельзя: клиент решил бы, что
        // предложение отменили.
        mockFetch(404);
        const result = await fetchRenewalOffer('t');
        expect(result).toEqual({ ok: false, reason: 'error' });
    });

    it('500 — сбой', async () => {
        mockFetch(500);
        expect(await fetchRenewalOffer('t')).toEqual({
            ok: false,
            reason: 'error',
        });
    });

    it('сеть не ответила — сбой, а не редирект', async () => {
        globalThis.fetch = (() =>
            Promise.reject(new Error('ECONNREFUSED'))) as typeof globalThis.fetch;
        expect(await fetchRenewalOffer('t')).toEqual({
            ok: false,
            reason: 'error',
        });
    });

    it('разбирает конверт ResponseInterceptor', async () => {
        mockFetch(200, {
            resultCode: 0,
            data: { clientName: 'ООО Ромашка', salesPrice: 6500 },
        });
        const result = await fetchRenewalOffer('t');
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.offer.clientName).toBe('ООО Ромашка');
    });

    it('принимает тело и без конверта', async () => {
        mockFetch(200, { clientName: 'ООО Ромашка' });
        const result = await fetchRenewalOffer('t');
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.offer.clientName).toBe('ООО Ромашка');
    });

    it('не-json в теле — сбой', async () => {
        globalThis.fetch = (() =>
            Promise.resolve({
                status: 200,
                ok: true,
                json: () => Promise.reject(new Error('not json')),
            } as Response)) as typeof globalThis.fetch;
        expect(await fetchRenewalOffer('t')).toEqual({
            ok: false,
            reason: 'error',
        });
    });
});
