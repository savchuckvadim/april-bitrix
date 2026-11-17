import { describe, expect, it } from 'vitest';
import {
    allHighlights,
    groupHighlights,
    highlightIdOf,
    scoreCells,
    sectionAnchorId,
    selectedHighlights,
    type CallPageHighlightDto,
    type CallPageSectionDto,
} from '..';

const highlight = (
    id: string,
    kind: CallPageHighlightDto['kind'],
    kindTitle: string,
): CallPageHighlightDto => ({
    id,
    kind,
    kindTitle,
    label: id,
    tone: 'bad',
    quote: null,
    note: null,
    segmentIndexes: [1],
    startSec: null,
});

const OBJECTION = highlight('objection-1', 'objection', 'Возражения');
// Вид «раздел» сервер отдаёт отдельным списком; в сгенерированных типах
// клиента его ещё нет — приводим через string.
const SECTION_KIND = 'section' as string as CallPageHighlightDto['kind'];
const SECTION = highlight('section-1', SECTION_KIND, 'Разделы разговора');

const section = (
    title: string,
    score: number | null,
    highlightId?: string | null,
): CallPageSectionDto => ({
    title,
    score,
    analysis: null,
    asWas: null,
    weaknesses: null,
    advice: null,
    alternatives: [],
    ...(highlightId === undefined ? {} : { highlightId }),
});

describe('страница звонка: места разбора', () => {
    it('ссылка на подсветку: нет поля (старый сервер), null или пусто — кнопки нет', () => {
        expect(highlightIdOf(section('Презентация', 6))).toBeNull();
        expect(highlightIdOf(section('Презентация', 6, null))).toBeNull();
        expect(highlightIdOf(section('Презентация', 6, ''))).toBeNull();
        expect(highlightIdOf(section('Презентация', 6, 'section-1'))).toBe(
            'section-1',
        );
        expect(highlightIdOf({ highlightId: 'price-1' })).toBe('price-1');
    });

    it('подсветки разделов ищутся по id, но в бейджи не попадают', () => {
        const data = { highlights: [OBJECTION], sectionHighlights: [SECTION] };
        const all = allHighlights(data);
        expect(all.map(item => item.id)).toEqual(['objection-1', 'section-1']);
        expect(
            selectedHighlights(all, {
                kind: SECTION.kind,
                highlightId: 'section-1',
            }).map(item => item.id),
        ).toEqual(['section-1']);
        expect(groupHighlights(data.highlights).map(group => group.kind)).toEqual(
            ['objection'],
        );
    });

    it('старый сервер без подсветок разделов — только бейджевые', () => {
        expect(allHighlights({ highlights: [OBJECTION] })).toEqual([OBJECTION]);
        expect(
            allHighlights({ highlights: [OBJECTION], sectionHighlights: [] }),
        ).toEqual([OBJECTION]);
    });

    it('сводка оценок: сначала звонок, затем разделы с якорями по порядку', () => {
        const cells = scoreCells(6.4, [
            section('Выявление потребностей', 8),
            section('Презентация', null),
        ]);
        expect(cells).toEqual([
            { key: 'call', title: 'Оценка звонка', score: 6.4, anchorId: null },
            {
                key: 'section-0',
                title: 'Выявление потребностей',
                score: 8,
                anchorId: sectionAnchorId(0),
            },
            {
                key: 'section-1',
                title: 'Презентация',
                score: null,
                anchorId: 'call-section-1',
            },
        ]);
        expect(scoreCells(null, [])).toEqual([
            { key: 'call', title: 'Оценка звонка', score: null, anchorId: null },
        ]);
    });
});
