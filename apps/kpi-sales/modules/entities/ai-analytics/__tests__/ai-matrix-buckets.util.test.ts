import { describe, expect, it } from 'vitest';
import type { AiBucketScore } from '../model';
import {
    aiBucketColumnCode,
    aiBucketOfColumnCode,
    aiBucketOfType,
    aiBucketScoreSource,
    aiPresentBuckets,
} from '../lib/ai-matrix-buckets.util';
import { cell, metric } from './ai-fixtures';
import { CALL_TYPES } from './ai-types-matrix-fixtures';

describe('aiBucketOfType — корзина типа', () => {
    it('по карте портала; без карты — фолбэк по коду (зеркало бэка)', () => {
        expect(aiBucketOfType('cold', CALL_TYPES)).toBe('contact');
        expect(aiBucketOfType('event_invite', CALL_TYPES)).toBeNull();
        // decision в карте нет — фолбэк.
        expect(aiBucketOfType('decision', CALL_TYPES)).toBe('closing');
        expect(aiBucketOfType('site_lead')).toBe('contact');
        expect(aiBucketOfType('call')).toBe('contact');
        expect(aiBucketOfType('presentation')).toBe('presentation');
        expect(aiBucketOfType('refine')).toBe('closing');
        expect(aiBucketOfType('payment')).toBe('closing');
        expect(aiBucketOfType('other')).toBeNull();
        expect(aiBucketOfType('irrelevant')).toBeNull();
        expect(aiBucketOfType('unknown')).toBeNull();
    });

    it('карта портала важнее фолбэка', () => {
        expect(
            aiBucketOfType('decision', [
                {
                    code: 'decision',
                    title: 'Решение',
                    tone: 'neutral',
                    bucket: null,
                    column: true,
                    kpiPrimaryEventTypeCode: null,
                },
            ]),
        ).toBeNull();
    });
});

describe('коды колонок-корзин', () => {
    it('префикс не пересекается с кодом типа presentation', () => {
        expect(aiBucketColumnCode('presentation')).toBe('bucket:presentation');
        expect(aiBucketOfColumnCode('bucket:presentation')).toBe('presentation');
        expect(aiBucketOfColumnCode('presentation')).toBeNull();
        expect(aiBucketOfColumnCode('bucket:unknown')).toBeNull();
    });

    it('присутствующие корзины — в порядке контакт, презентация, закрытие', () => {
        expect(
            aiPresentBuckets(['decision', 'presentation', 'other'], CALL_TYPES),
        ).toEqual(['presentation', 'closing']);
        expect(aiPresentBuckets(['event_invite'], CALL_TYPES)).toEqual([]);
    });
});

describe('aiBucketScoreSource — оценка корзины у менеджера', () => {
    const cells = [
        cell({ callType: 'cold', n: 3, score: metric(5, 3) }),
        cell({ callType: 'site_lead', n: 10, score: metric(6, 10) }),
        cell({ callType: 'call', n: 20, score: metric(7, 20) }),
        cell({ callType: 'presentation', n: 12, score: metric(6.4, 12) }),
    ];

    it('точная оценка из обзора в приоритете', () => {
        const exact: AiBucketScore[] = [
            { bucket: 'contact', n: 33, score: metric(6.5, 33) },
        ];
        expect(aiBucketScoreSource(cells, 'contact', CALL_TYPES, exact)).toEqual({
            n: 33,
            score: 6.5,
        });
        // Точная оценка скрыта по доверию — n есть, оценки нет.
        expect(
            aiBucketScoreSource(cells, 'contact', CALL_TYPES, [
                { bucket: 'contact', n: 5, score: metric(null, 5) },
            ]),
        ).toEqual({ n: 5, score: null });
    });

    it('без точной — сложена из ячеек: Σn, взвешенная оценка типов с оценкой, partial', () => {
        // cold (n = 3) без оценки входит в объём, но не в среднее.
        expect(aiBucketScoreSource(cells, 'contact', CALL_TYPES)).toEqual({
            n: 33,
            score: 6.7,
            partial: true,
            composed: true,
        });
        expect(aiBucketScoreSource(cells, 'presentation', CALL_TYPES)).toEqual({
            n: 12,
            score: 6.4,
            partial: false,
            composed: true,
        });
        expect(aiBucketScoreSource(cells, 'closing', CALL_TYPES)).toEqual({
            n: 0,
            score: null,
            partial: false,
            composed: true,
        });
    });
});
