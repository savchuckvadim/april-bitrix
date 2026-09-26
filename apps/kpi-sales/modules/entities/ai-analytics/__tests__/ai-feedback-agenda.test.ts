import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAiAgenda, sendAiFeedback } from '../model/ai-analytics-thunks';
import type { AiAgenda, AiEnvelope } from '../model';
import { ready } from './ai-fixtures';
import { flush, makeAiStore } from './ai-test-store';

// vi.mock поднимается выше импортов — моки объявляем через vi.hoisted.
const { addFeedback, getAgenda } = vi.hoisted(() => ({
    addFeedback: vi.fn(),
    getAgenda: vi.fn(),
}));

vi.mock('../lib/api/ai-analytics-helper', () => ({
    AiAnalyticsHelper: class {
        addFeedback = addFeedback;
        getAgenda = getAgenda;
    },
}));

/* Локальные фикстуры: повестка до и после «не согласен». */
const agenda = (reasons: string[] = []): AiAgenda => ({
    weekKey: '2026-W39',
    items: [],
    disagreements: reasons.map(reason => ({
        managerId: '7',
        object: 'manager-row:7',
        reason,
    })),
});

const saved = (): AiEnvelope<{ id: string }> => ({
    status: 'ready',
    requestKey: 'k',
    data: { id: '1' },
});

const disagree = () =>
    sendAiFeedback({
        kind: 'disagree',
        object: 'manager-row:7',
        managerId: '7',
        reason: 'Оценка завышена',
    });

describe('«не согласен» обновляет загруженную повестку', () => {
    beforeEach(() => {
        addFeedback.mockReset();
        getAgenda.mockReset();
        addFeedback.mockResolvedValue(saved());
    });

    it('повестка загружена — перечитываем с force, новое несогласие видно', async () => {
        getAgenda
            .mockResolvedValueOnce(ready(agenda()))
            .mockResolvedValueOnce(ready(agenda(['Оценка завышена'])));
        const store = makeAiStore({ leader: true });
        await store.dispatch(fetchAiAgenda());
        expect(getAgenda).toHaveBeenCalledTimes(1);

        expect(await store.dispatch(disagree())).toBe(true);
        await flush();

        expect(getAgenda).toHaveBeenCalledTimes(2);
        expect(
            store.getState().aiAnalytics.agenda.data?.disagreements,
        ).toHaveLength(1);
    });

    it('повестку ещё не грузили — лишнего запроса нет', async () => {
        const store = makeAiStore({ leader: true });
        expect(await store.dispatch(disagree())).toBe(true);
        await flush();
        expect(getAgenda).not.toHaveBeenCalled();
    });

    it('другие реакции и неудачный «не согласен» повестку не трогают', async () => {
        getAgenda.mockResolvedValue(ready(agenda()));
        const store = makeAiStore({ leader: true });
        await store.dispatch(fetchAiAgenda());

        await store.dispatch(
            sendAiFeedback({ kind: 'useful', object: 'agenda' }),
        );
        addFeedback.mockRejectedValueOnce(new Error('сеть'));
        expect(await store.dispatch(disagree())).toBe(false);
        await flush();
        expect(getAgenda).toHaveBeenCalledTimes(1);
    });
});
