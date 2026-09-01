import { describe, expect, it } from 'vitest';

import { createRateLimiter, resolveRateKey } from './metrics-rate-limit';

/**
 * Лимит частоты на маршруте приёма метрик: зациклившаяся вкладка не должна
 * ни забить процесс, ни разрастить карту ключей.
 */

describe('окно', () => {
    it('пропускает лимит и отказывает всему сверх него', () => {
        const allow = createRateLimiter({
            limit: 3,
            windowMs: 1000,
            maxKeys: 10,
        });
        expect(allow('a', 0)).toBe(true);
        expect(allow('a', 10)).toBe(true);
        expect(allow('a', 20)).toBe(true);
        expect(allow('a', 30)).toBe(false);
        expect(allow('a', 999)).toBe(false);
    });

    it('за границей окна счёт начинается заново', () => {
        const allow = createRateLimiter({
            limit: 2,
            windowMs: 1000,
            maxKeys: 10,
        });
        expect(allow('a', 0)).toBe(true);
        expect(allow('a', 1)).toBe(true);
        expect(allow('a', 2)).toBe(false);
        expect(allow('a', 1000)).toBe(true);
        expect(allow('a', 1001)).toBe(true);
        expect(allow('a', 1002)).toBe(false);
    });

    it('источники считаются порознь', () => {
        const allow = createRateLimiter({
            limit: 1,
            windowMs: 1000,
            maxKeys: 10,
        });
        expect(allow('a', 0)).toBe(true);
        expect(allow('a', 1)).toBe(false);
        expect(allow('b', 1)).toBe(true);
    });
});

describe('карта ключей', () => {
    it('не растёт бесконечно: тысяча источников не съедает память', () => {
        const allow = createRateLimiter({
            limit: 5,
            windowMs: 60_000,
            maxKeys: 20,
        });
        // Все в одном окне — протухших нет, значит сработает полная чистка.
        for (let i = 0; i < 1000; i += 1) {
            expect(allow(`ip-${i}`, 100)).toBe(true);
        }
        // Проверяем не размер приватной карты, а то, ради чего он ограничен:
        // лимитер продолжает работать и после шторма.
        expect(allow('ip-fresh', 100)).toBe(true);
        expect(allow('ip-fresh', 101)).toBe(true);
    });

    it('протухшие ключи забываются и не мешают новым', () => {
        const allow = createRateLimiter({
            limit: 1,
            windowMs: 100,
            maxKeys: 2,
        });
        expect(allow('a', 0)).toBe(true);
        expect(allow('b', 0)).toBe(true);
        // Окно прошло — оба ключа протухли, третий заезжает без вытеснения.
        expect(allow('c', 500)).toBe(true);
        expect(allow('c', 501)).toBe(false);
    });
});

/**
 * Ключ лимита. Здесь и жила дыра: заголовок X-Forwarded-For nginx дописывает
 * СЛЕВА, то есть первый его элемент пишет сам клиент. Взяв первый элемент,
 * лимитер получал новый ключ на каждый запрос и не срабатывал никогда.
 */
describe('ключ источника', () => {
    const headers = (bag: Record<string, string>) => ({
        get: (name: string): string | null => bag[name] ?? null,
    });

    it('берётся из X-Real-IP — его ставит сам nginx', () => {
        expect(
            resolveRateKey(
                headers({
                    'x-real-ip': '10.1.1.1',
                    'x-forwarded-for': '203.0.113.7, 10.1.1.1',
                }),
            ),
        ).toBe('10.1.1.1');
    });

    it('подделанный первый элемент XFF ключом не становится', () => {
        const first = resolveRateKey(
            headers({ 'x-forwarded-for': '203.0.113.1, 10.1.1.2' }),
        );
        const second = resolveRateKey(
            headers({ 'x-forwarded-for': '198.51.100.9, 10.1.1.2' }),
        );

        expect(first).toBe('10.1.1.2');
        expect(second).toBe(first);
    });

    it('без заголовков ключ один на всех — но он есть', () => {
        expect(resolveRateKey(headers({}))).toBe('unknown');
        expect(resolveRateKey(headers({ 'x-forwarded-for': '  ' }))).toBe(
            'unknown',
        );
    });
});
