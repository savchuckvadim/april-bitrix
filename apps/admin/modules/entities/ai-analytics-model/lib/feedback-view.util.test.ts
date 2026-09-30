import { describe, expect, it } from 'vitest';
import { plain } from './plain-text.test-helper';
import type { ModelFeedbackResult } from '../model';
import { toFeedbackView } from './feedback-view.util';

const result = (patch: Partial<ModelFeedbackResult> = {}): ModelFeedbackResult => ({
    domain: 'april.bitrix24.ru',
    from: '2026-09-01',
    to: '2026-09-29',
    total: 14,
    skipped: 1,
    superseded: 2,
    byKind: [
        { kind: 'useful', count: 3 },
        { kind: 'view', count: 9 },
        { kind: 'not_useful', count: 2 },
    ],
    byManager: [
        {
            managerId: '17',
            total: 10,
            byKind: [
                { kind: 'view', count: 6 },
                { kind: 'useful', count: 3 },
                { kind: 'disagree', count: 1 },
            ],
        },
        { managerId: null, total: 4, byKind: [{ kind: 'view', count: 4 }] },
    ],
    usefulRatePct: 60,
    ...patch,
});

describe('toFeedbackView: сводка обратной связи', () => {
    it('итоги: всего, доля «полезно», заменённые и чужая форма', () => {
        const view = toFeedbackView(result());

        expect(view.period).toBe('01.09.2026 – 29.09.2026');
        expect(view.metrics.map(metric => [metric.label, plain(metric.value)])).toEqual([
            ['Всего записей', '14'],
            ['Доля «полезно»', '60,0 %'],
            ['Заменённых', '2'],
            ['Чужой формы', '1'],
        ]);
        expect(view.isEmpty).toBe(false);
    });

    it('виды — по убыванию числа, с русскими подписями', () => {
        const view = toFeedbackView(result());

        expect(view.kinds.map(kind => [kind.code, kind.label, kind.count])).toEqual([
            ['view', 'Просмотр витрины', '9'],
            ['useful', 'Полезно', '3'],
            ['not_useful', 'Не полезно', '2'],
        ]);
    });

    it('менеджеры: реакции отдельно, прочее — остатком; без менеджера подписан', () => {
        const [named, none] = toFeedbackView(result()).managers;

        expect(named).toEqual({
            key: '17',
            manager: 'Менеджер 17',
            total: '10',
            useful: '3',
            notUseful: '0',
            disagree: '1',
            other: '6',
        });
        expect(none?.manager).toBe('Без менеджера');
        expect(none?.other).toBe('4');
    });

    it('null доли — «оценок не было», а не ноль', () => {
        const view = toFeedbackView(result({ usefulRatePct: null }));

        expect(view.metrics[1]?.value).toBe('оценок не было');
    });

    it('пустой период — isEmpty; заменённые записи пустоту отменяют', () => {
        const empty = result({
            total: 0,
            skipped: 0,
            superseded: 0,
            byKind: [],
            byManager: [],
            usefulRatePct: null,
        });

        expect(toFeedbackView(empty).isEmpty).toBe(true);
        expect(toFeedbackView({ ...empty, superseded: 1 }).isEmpty).toBe(false);
    });
});
