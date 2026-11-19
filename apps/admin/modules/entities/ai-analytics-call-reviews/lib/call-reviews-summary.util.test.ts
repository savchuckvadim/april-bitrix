import { describe, expect, it } from 'vitest';
import type { CallReviewsSummary } from '../model';
import { toSummaryView } from './call-reviews-summary.util';

const summary = (fields: Partial<CallReviewsSummary> = {}): CallReviewsSummary => ({
    total: 23,
    disagree: 9,
    disagreePct: 39.1,
    avgAiScore: 6.4,
    avgLeaderScore: 5.2,
    avgScoreDiff: -1.2,
    itemKinds: [
        { kind: 'section', title: 'раздел', count: 4 },
        { kind: 'objection', title: 'возражение', count: 0 },
        { kind: 'methodology', title: 'пункт методики', count: 2 },
        { kind: 'fact', title: 'факт', count: 0 },
        { kind: 'call_type', title: 'тип звонка', count: 1 },
    ],
    topItems: [{ kind: 'section', kindTitle: 'раздел', label: 'Выявление потребности', count: 3 }],
    ...fields,
});

describe('сводка отзывов для показа', () => {
    it('карточки: всего, несогласные с долей, средние и разница с пояснением', () => {
        const view = toSummaryView(summary());

        expect(view.stats.map(stat => [stat.label, stat.value])).toEqual([
            ['Отзывов', '23'],
            ['Не согласны', '9 (39,1 %)'],
            ['Оценка AI в среднем', '6,4'],
            ['Оценка руководителей', '5,2'],
            ['Разница', '−1,2'],
        ]);
        expect(view.stats[1]?.tone).toBe('destructive');
        expect(view.stats[4]?.tone).toBe('warning');
        expect(view.stats[4]?.hint).toBeTruthy();
    });

    it('виды «не так» — только ненулевые, с заглавной; топ — подпись с видом', () => {
        const view = toSummaryView(summary());

        expect(view.kinds.map(kind => [kind.label, kind.count])).toEqual([
            ['Раздел', 4],
            ['Пункт методики', 2],
            ['Тип звонка', 1],
        ]);
        expect(view.top).toEqual([
            { key: 'section:Выявление потребности', label: 'Выявление потребности (раздел)', count: 3 },
        ]);
    });

    it('пустой период: прочерки, без тонов, пустые списки', () => {
        const view = toSummaryView(
            summary({
                total: 0,
                disagree: 0,
                disagreePct: null,
                avgAiScore: null,
                avgLeaderScore: null,
                avgScoreDiff: null,
                itemKinds: [],
                topItems: [],
            }),
        );

        expect(view.stats.map(stat => stat.value)).toEqual(['0', '0', '—', '—', '—']);
        expect(view.stats.every(stat => stat.tone === undefined)).toBe(true);
        expect(view.kinds).toEqual([]);
        expect(view.top).toEqual([]);
    });
});
