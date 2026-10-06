import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Страховка привязки заявки перед отправкой отчёта.
 *
 * Связи клиента грузятся по требованию; если блок выбора не успел поставить
 * предвыбор, отправка обязана дозапросить связи сама — иначе новая задача
 * уезжала бы без заявки и путь заявки обрывался молча.
 */
const h = vi.hoisted(() => ({
    ensureRelatedDetails: vi.fn(),
}));

vi.mock('@/modules/entities/RelatedCrm/model/RelatedCrmThunk', () => ({
    ensureRelatedDetails: () => h.ensureRelatedDetails,
}));

import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { ensureTaskLeadLinks } from './TaskLeadLinksThunk';

interface FakeState {
    eventTask: { current: { ufCrmTask: string[] } | null };
    eventPlan: { isActive: boolean };
    taskLeadLinks: { isTouched: boolean; selectedIds: number[] };
}

const makeState = (patch: Partial<FakeState> = {}): FakeState => ({
    eventTask: { current: null },
    eventPlan: { isActive: true },
    taskLeadLinks: { isTouched: false, selectedIds: [] },
    ...patch,
});

const run = async (state: FakeState) => {
    const actions: Array<{ type: string; payload?: unknown }> = [];
    const getState = (() => state) as unknown as AppGetState;
    const dispatch = ((action: unknown) => {
        if (typeof action === 'function') {
            return (action as (d: unknown, g: unknown) => unknown)(
                dispatch,
                getState,
            );
        }
        actions.push(action as { type: string; payload?: unknown });
        return action;
    }) as unknown as AppDispatch;

    await ensureTaskLeadLinks()(dispatch, getState);
    return actions;
};

const openLead = (id: number, dateCreate: string, questUrl?: string) => ({
    id,
    title: `Заявка ${id}`,
    statusSemanticId: 'P',
    dateCreate,
    ...(questUrl ? { questUrl } : {}),
});

describe('ensureTaskLeadLinks', () => {
    beforeEach(() => {
        vi.useRealTimers();
        h.ensureRelatedDetails.mockReset();
    });

    it('связи приехали — отмечает самую свежую заявку', async () => {
        h.ensureRelatedDetails.mockResolvedValue({
            leads: [
                openLead(1, '2026-01-01'),
                openLead(2, '2026-08-01', 'https://q/2'),
                { ...openLead(3, '2026-09-01'), statusSemanticId: 'F' },
            ],
        });

        const actions = await run(makeState());

        expect(actions).toEqual([
            { type: 'taskLeadLinks/preselect', payload: [2] },
        ]);
    });

    it('задача уже несёт заявку — связи не запрашиваются вовсе', async () => {
        const actions = await run(
            makeState({ eventTask: { current: { ufCrmTask: ['L_77'] } } }),
        );

        expect(h.ensureRelatedDetails).not.toHaveBeenCalled();
        expect(actions).toEqual([]);
    });

    it('менеджер уже выбирал или снял выбор — ничего не трогаем', async () => {
        await run(
            makeState({ taskLeadLinks: { isTouched: true, selectedIds: [] } }),
        );
        await run(
            makeState({ taskLeadLinks: { isTouched: false, selectedIds: [5] } }),
        );

        expect(h.ensureRelatedDetails).not.toHaveBeenCalled();
    });

    it('открытых заявок нет — отчёт уходит без привязки', async () => {
        h.ensureRelatedDetails.mockResolvedValue({ leads: [] });

        expect(await run(makeState())).toEqual([]);
    });

    it('связи не получены — отправку это не останавливает', async () => {
        h.ensureRelatedDetails.mockResolvedValue(null);
        expect(await run(makeState())).toEqual([]);

        h.ensureRelatedDetails.mockRejectedValue(new Error('сеть'));
        expect(await run(makeState())).toEqual([]);
    });

    it('связи едут дольше потолка — не ждём, отчёт важнее', async () => {
        vi.useFakeTimers();
        h.ensureRelatedDetails.mockReturnValue(new Promise(() => undefined));

        const pending = run(makeState());
        await vi.advanceTimersByTimeAsync(3000);

        await expect(pending).resolves.toEqual([]);
        vi.useRealTimers();
    });
});
