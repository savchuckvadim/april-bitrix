import { describe, expect, it } from 'vitest';
import {
    CALLING_BUCKET_IDS,
    callingLabelKey,
    columnLabelKey,
    createIndicatorLabeler,
    defaultIndicatorLabeler,
    eventLabelKey,
    isCallingBucketId,
    normalizeIndicatorName,
    planCodeOfLabelKey,
    planLabelKey,
} from '..';

describe('ключи своих названий', () => {
    it('событие — ev: и innerCode', () => {
        expect(eventLabelKey('presentation_plan')).toBe('ev:presentation_plan');
        expect(eventLabelKey('result_communication_done')).toBe(
            'ev:result_communication_done',
        );
    });

    it('бакет звонков — call: и id строкой', () => {
        expect(callingLabelKey('all')).toBe('call:all');
        expect(callingLabelKey(30)).toBe('call:30');
        expect(callingLabelKey('600')).toBe('call:600');
    });

    it('колонка плана — plan: и код', () => {
        expect(planLabelKey('calls_over_30s')).toBe('plan:calls_over_30s');
    });

    it('код плана из ключа колонки плана; чужой ключ — null', () => {
        expect(planCodeOfLabelKey('plan:calls_over_30s')).toBe('calls_over_30s');
        expect(planCodeOfLabelKey(planLabelKey('presentations_done'))).toBe(
            'presentations_done',
        );
        expect(planCodeOfLabelKey('ev:presentation_done')).toBeNull();
        expect(planCodeOfLabelKey('call:30')).toBeNull();
        expect(planCodeOfLabelKey('plan:')).toBeNull();
    });

    it('бакеты звонков — шесть длительностей', () => {
        expect([...CALLING_BUCKET_IDS]).toEqual([
            'all',
            '30',
            '60',
            '180',
            '300',
            '600',
        ]);
        expect(isCallingBucketId('60')).toBe(true);
        expect(isCallingBucketId('call_done')).toBe(false);
        expect(isCallingBucketId('45')).toBe(false);
    });

    it.each([
        ['all', 'call:all'],
        ['30', 'call:30'],
        [600, 'call:600'],
        ['call_done', 'ev:call_done'],
        ['presentation_done', 'ev:presentation_done'],
    ])('columnLabelKey(%s) → %s', (code, key) => {
        expect(columnLabelKey(code)).toBe(key);
    });
});

describe('normalizeIndicatorName', () => {
    it.each([
        ['План  Презентация', 'План Презентация'],
        [' Презентация', 'Презентация'],
        ['  План   Звонок  ', 'План Звонок'],
        ['Звонки > 30 сек', 'Звонки > 30 сек'],
        ['', ''],
        ['   ', ''],
    ])('«%s» → «%s»', (raw, expected) => {
        expect(normalizeIndicatorName(raw)).toBe(expected);
    });
});

describe('createIndicatorLabeler', () => {
    const labelOf = createIndicatorLabeler({
        'ev:presentation_plan': 'Назначенная презентация',
        'call:30': '  Дозвоны  от 30 с ',
        'ev:call_done': '',
        'ev:call_plan': '   ',
    });

    it('своё название по ключу', () => {
        expect(labelOf('ev:presentation_plan', 'План  Презентация')).toBe(
            'Назначенная презентация',
        );
    });

    it('своё название тоже без лишних пробелов', () => {
        expect(labelOf('call:30', 'Звонки > 30 сек')).toBe('Дозвоны от 30 с');
    });

    it('нет своего — исходное, очищенное от лишних пробелов', () => {
        expect(labelOf('ev:presentation_done', ' Презентация')).toBe(
            'Презентация',
        );
    });

    it('пустое и пробельное своё название — исходное', () => {
        expect(labelOf('ev:call_done', 'Звонок  совершен')).toBe(
            'Звонок совершен',
        );
        expect(labelOf('ev:call_plan', 'План Звонок')).toBe('План Звонок');
    });

    it('своё название ищется только по своему ключу', () => {
        expect(labelOf('call:presentation_plan', 'Исходное')).toBe('Исходное');
    });

    it('без своих названий — только чистка пробелов', () => {
        expect(createIndicatorLabeler({})('ev:x', 'План  Презентация')).toBe(
            'План Презентация',
        );
        expect(defaultIndicatorLabeler('ev:x', ' Презентация ')).toBe(
            'Презентация',
        );
    });
});
