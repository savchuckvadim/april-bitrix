import { describe, expect, it } from 'vitest';
import {
    normalizePortalIds,
    resolveCreatePortalId,
} from './word-template-portals-payload';

describe('normalizePortalIds', () => {
    it('create: пустой список не отправляется', () => {
        expect(normalizePortalIds([], 'create')).toBeUndefined();
        expect(normalizePortalIds(undefined, 'create')).toBeUndefined();
        expect(normalizePortalIds(null, 'create')).toBeUndefined();
    });

    it('update: undefined — не трогать, [] — снять все привязки', () => {
        expect(normalizePortalIds(undefined, 'update')).toBeUndefined();
        expect(normalizePortalIds([], 'update')).toEqual([]);
    });

    it('дубли, пробелы и нечисловые значения отбрасываются, порядок сохраняется', () => {
        expect(
            normalizePortalIds(['12', ' 7 ', '12', '', 'abc', '7', '3'], 'create'),
        ).toEqual(['12', '7', '3']);
    });

    it('id остаются строками (BIGINT не влезает в number)', () => {
        const big = '9007199254740993';
        expect(normalizePortalIds([big], 'create')).toEqual([big]);
    });

    it('список из одного мусора в update — это сброс, а не «не трогать»', () => {
        expect(normalizePortalIds(['abc'], 'update')).toEqual([]);
    });
});

describe('resolveCreatePortalId', () => {
    it('явный portal_id важнее мультиселекта', () => {
        expect(resolveCreatePortalId(5, ['7', '12'])).toBe(5);
    });

    it('без portal_id берётся первый выбранный портал', () => {
        expect(resolveCreatePortalId(undefined, ['7', '12'])).toBe(7);
        expect(resolveCreatePortalId(0, ['7'])).toBe(7);
    });

    it('ничего не выбрано — 0, как шлёт сгенерированный клиент', () => {
        expect(resolveCreatePortalId(undefined, undefined)).toBe(0);
        expect(resolveCreatePortalId(undefined, [])).toBe(0);
    });
});
