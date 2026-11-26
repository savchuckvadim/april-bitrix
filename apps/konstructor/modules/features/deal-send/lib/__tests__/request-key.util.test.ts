import { describe, expect, it } from 'vitest';
import { createRequestKey, resolveRequestKey } from '../request-key.util';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('ключ попытки создать сделку', () => {
    it('новый ключ — UUID, каждая попытка получает свой', () => {
        const first = createRequestKey();
        const second = createRequestKey();

        expect(first).toMatch(UUID);
        expect(second).not.toBe(first);
    });

    it('сделки нет и незавершённой попытки нет: заводится новый ключ', () => {
        expect(resolveRequestKey(null, null)).toMatch(UUID);
    });

    it('повтор той же попытки берёт её ключ', () => {
        const key = createRequestKey();

        expect(resolveRequestKey(null, key)).toBe(key);
        expect(resolveRequestKey(null, key)).toBe(key);
    });

    it('у существующей сделки ключа нет', () => {
        expect(resolveRequestKey(129487, createRequestKey())).toBeNull();
    });
});
