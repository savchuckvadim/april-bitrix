import { describe, expect, it } from 'vitest';
import {
    formatCallDate,
    formatClock,
    formatDuration,
    formatScore,
    groupHighlights,
    isHighlightReachable,
    playingSegmentIndex,
    scoreTone,
    segmentLabels,
    segmentTones,
    selectedHighlights,
    worseTone,
    type CallPageHighlightDto,
    type CallPageSegmentDto,
} from '..';

const highlight = (
    fields: Partial<CallPageHighlightDto> & Pick<CallPageHighlightDto, 'id'>,
): CallPageHighlightDto => ({
    kind: 'objection',
    kindTitle: 'Возражения',
    label: 'Цена: дорого',
    tone: 'bad',
    quote: null,
    note: null,
    segmentIndexes: [],
    startSec: null,
    ...fields,
});

const HIGHLIGHTS: CallPageHighlightDto[] = [
    highlight({ id: 'objection-1', segmentIndexes: [2, 3], startSec: 13 }),
    highlight({
        id: 'objection-2',
        tone: 'good',
        segmentIndexes: [3],
        startSec: 20,
    }),
    highlight({
        id: 'price-1',
        kind: 'price',
        kindTitle: 'Цены',
        tone: 'neutral',
        segmentIndexes: [4],
    }),
    highlight({
        id: 'issue-1',
        kind: 'issue',
        kindTitle: 'Сбои',
        tone: 'warn',
    }),
];

const segment = (index: number, startSec: number | null): CallPageSegmentDto => ({
    index,
    startSec,
    endSec: startSec === null ? null : startSec + 5,
    speaker: null,
    text: `реплика ${index}`,
});

describe('страница звонка: форматирование', () => {
    it('секунда записи: минуты и секунды, с часа — часы', () => {
        expect(formatClock(0)).toBe('0:00');
        expect(formatClock(94.7)).toBe('1:34');
        expect(formatClock(3723)).toBe('1:02:03');
        expect(formatClock(null)).toBe('');
    });

    it('длительность словами; нет данных — null', () => {
        expect(formatDuration(45)).toBe('45 с');
        expect(formatDuration(120)).toBe('2 мин');
        expect(formatDuration(412)).toBe('6 мин 52 с');
        expect(formatDuration(0)).toBeNull();
        expect(formatDuration(null)).toBeNull();
    });

    it('дата звонка — по Москве с пометкой; битая — null', () => {
        const text = formatCallDate('2026-11-12T09:41:00.000Z');
        expect(text).toContain('12 ноября 2026');
        expect(text).toContain('12:41');
        expect(text?.endsWith('МСК')).toBe(true);
        expect(formatCallDate('мусор')).toBeNull();
        expect(formatCallDate(null)).toBeNull();
    });

    it('оценка: запятая в дробной части, без оценки — прочерк', () => {
        expect(formatScore(6.43)).toBe('6,4');
        expect(formatScore(7)).toBe('7');
        expect(formatScore(null)).toBe('—');
    });

    it('тон оценки: от 7 хорошо, от 5 средне, ниже плохо', () => {
        expect(scoreTone(7)).toBe('success');
        expect(scoreTone(5)).toBe('warning');
        expect(scoreTone(4.9)).toBe('destructive');
        expect(scoreTone(null)).toBe('neutral');
    });
});

describe('страница звонка: подсветки', () => {
    it('группы по видам в порядке появления, окраска — самая тревожная', () => {
        const groups = groupHighlights(HIGHLIGHTS);
        expect(groups.map(group => [group.kind, group.title, group.tone])).toEqual(
            [
                ['objection', 'Возражения', 'bad'],
                ['price', 'Цены', 'neutral'],
                ['issue', 'Сбои', 'warn'],
            ],
        );
        expect(groups[0]?.items.map(item => item.id)).toEqual([
            'objection-1',
            'objection-2',
        ]);
    });

    it('более тревожная окраска побеждает', () => {
        expect(worseTone('good', 'bad')).toBe('bad');
        expect(worseTone('warn', 'good')).toBe('warn');
        expect(worseTone('neutral', 'good')).toBe('good');
    });

    it('выделено: одна подсветка важнее вида; ничего не выбрано — пусто', () => {
        const ids = (kind: string | null, highlightId: string | null) =>
            selectedHighlights(HIGHLIGHTS, {
                kind: kind as CallPageHighlightDto['kind'] | null,
                highlightId,
            }).map(item => item.id);
        expect(ids('objection', null)).toEqual(['objection-1', 'objection-2']);
        expect(ids('objection', 'objection-2')).toEqual(['objection-2']);
        expect(ids(null, null)).toEqual([]);
    });

    it('окраска реплик: на общей реплике — самая тревожная', () => {
        const tones = segmentTones(HIGHLIGHTS.slice(0, 2));
        expect([...tones.entries()]).toEqual([
            [2, 'bad'],
            [3, 'bad'],
        ]);
    });

    it('подписи — у первой реплики подсветки; без места в тексте подписи нет', () => {
        const labels = segmentLabels(HIGHLIGHTS);
        expect(labels.get(2)?.map(item => item.id)).toEqual(['objection-1']);
        expect(labels.get(3)?.map(item => item.id)).toEqual(['objection-2']);
        expect(labels.get(4)?.map(item => item.id)).toEqual(['price-1']);
        expect(labels.size).toBe(3);
    });

    it('звучащая реплика — последняя, что началась к этой секунде', () => {
        const transcript = [segment(0, 0), segment(1, 10), segment(2, 20)];
        expect(playingSegmentIndex(transcript, 0)).toBe(0);
        expect(playingSegmentIndex(transcript, 15)).toBe(1);
        expect(playingSegmentIndex(transcript, 99)).toBe(2);
        expect(playingSegmentIndex(transcript, null)).toBeNull();
        expect(playingSegmentIndex([segment(0, null)], 5)).toBeNull();
    });

    it('до подсветки можно дойти по тексту или по записи', () => {
        const [inText, , , nowhere] = HIGHLIGHTS;
        const onlyTime = highlight({ id: 'risk-1', startSec: 30 });
        expect(isHighlightReachable(inText!, false)).toBe(true);
        expect(isHighlightReachable(onlyTime, true)).toBe(true);
        expect(isHighlightReachable(onlyTime, false)).toBe(false);
        expect(isHighlightReachable(nowhere!, true)).toBe(false);
    });
});
