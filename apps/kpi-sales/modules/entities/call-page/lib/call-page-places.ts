/**
 * Места разбора на странице звонка: ссылка пункта на подсветку, все
 * подсветки для поиска по id (вместе с подсветками разделов), якоря
 * разделов и сводка оценок под шапкой.
 */
import type {
    CallPageDto,
    CallPageHighlightDto,
    CallPageScoreCell,
    CallPageSectionDto,
} from '../model/types';

/** Подсветка пункта; поля нет (старый сервер) или оно пустое — null. */
export const highlightIdOf = (item: {
    highlightId?: string | null;
}): string | null => item.highlightId || null;

/**
 * Все подсветки страницы: бейджевые и подсветки разделов. По ним ищется
 * подсветка по id и раскрашиваются реплики; бейджи строятся только из
 * `highlights`.
 */
export const allHighlights = (
    data: Pick<CallPageDto, 'highlights' | 'sectionHighlights'>,
): CallPageHighlightDto[] =>
    data.sectionHighlights && data.sectionHighlights.length > 0
        ? [...data.highlights, ...data.sectionHighlights]
        : data.highlights;

/** id раздела на странице — к нему прокручивает сводка оценок. */
export const sectionAnchorId = (position: number): string =>
    `call-section-${position}`;

/** Сводка оценок: сначала оценка звонка, затем разделы по порядку. */
export function scoreCells(
    score: number | null,
    sections: readonly CallPageSectionDto[],
): CallPageScoreCell[] {
    return [
        { key: 'call', title: 'Оценка звонка', score, anchorId: null },
        ...sections.map((section, position) => ({
            key: `section-${position}`,
            title: section.title,
            score: section.score,
            anchorId: sectionAnchorId(position),
        })),
    ];
}
