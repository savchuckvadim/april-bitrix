/**
 * Лимит на посетителя: окно на ключ и честный ключ. Ошибка в ключе тихая —
 * лимит просто перестаёт работать, а бэк отдаёт весь потолок одному скрипту.
 */

import { describe, expect, it } from 'vitest';
import {
    createVisitorRateLimiter,
    resolveVisitorKey,
} from '../visitor-rate-limit';

const headersOf = (values: Record<string, string>) => new Headers(values);

describe('createVisitorRateLimiter', () => {
    it('пускает до лимита, потом отказывает до конца окна', () => {
        const allow = createVisitorRateLimiter({ limit: 2, windowMs: 1000, maxKeys: 10 });
        expect(allow('a', 0)).toBe(true);
        expect(allow('a', 10)).toBe(true);
        expect(allow('a', 20)).toBe(false);
        expect(allow('b', 20)).toBe(true);
        expect(allow('a', 1000)).toBe(true);
    });

    it('карта ключей не растёт бесконечно', () => {
        const allow = createVisitorRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 3 });
        for (const key of ['a', 'b', 'c', 'd', 'e']) {
            expect(allow(key, 0)).toBe(true);
        }
    });
});

describe('resolveVisitorKey', () => {
    it('берёт X-Real-IP, который ставит nginx', () => {
        expect(resolveVisitorKey(headersOf({ 'x-real-ip': '198.51.100.1', 'x-forwarded-for': '1.1.1.1' }))).toBe('198.51.100.1');
    });

    it('без X-Real-IP — последний адрес цепочки, а не присланный клиентом первый', () => {
        expect(resolveVisitorKey(headersOf({ 'x-forwarded-for': 'spoofed-by-client, 198.51.100.2' }))).toBe('198.51.100.2');
    });

    it('без заголовков — общий ключ', () => {
        expect(resolveVisitorKey(headersOf({}))).toBe('unknown');
    });
});
