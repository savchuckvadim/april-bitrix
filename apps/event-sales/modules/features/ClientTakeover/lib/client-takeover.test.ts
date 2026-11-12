import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import type { TakeoverPreview } from '../model/types';
import { describeTakeover } from './client-takeover-view';
import {
    selectClientTakeoverLoading,
    selectNeedClientTakeover,
} from './client-takeover.selectors';
import { parseUserIdsCsv } from './parse-user-ids';

/** Перехват клиента: вопрос «Забрать работу коллег себе?» перед отправкой. */
const preview = (over: Partial<TakeoverPreview> = {}): TakeoverPreview => ({
    ask: true,
    takenDeal: {
        id: 217611,
        title: 'Прозвон: ООО «Би Хай»',
        ownerName: 'Марина Гончар',
        kind: 'base',
    },
    closeDeals: [
        { id: 217823, title: 'Прозвон: ООО «Би Хай»', ownerName: 'без ответственного', kind: 'base' },
        { id: 215241, title: 'Холодный обзвон', ownerName: 'Бот Манго', kind: 'xo' },
    ],
    movedTasks: 1,
    closedTasks: 2,
    closedPresentations: 0,
    closedZpr: 1,
    protectedDeals: [],
    ...over,
});

describe('describeTakeover', () => {
    it('что перейдёт, что закроется — человеческими словами, без кодов', () => {
        const view = describeTakeover(preview());

        expect(view.taken).toBe(
            'сделка «Прозвон: ООО «Би Хай»» — Марина Гончар и её задачи (1)',
        );
        expect(view.closes).toEqual([
            'сделка «Прозвон: ООО «Би Хай»» — без ответственного',
            'сделка холодного обзвона «Холодный обзвон» — Бот Манго',
            'а также задачи: 2, ЗПР: 1',
        ]);
        expect(view.kept).toEqual([]);
    });

    it('своя сделка у менеджера — «перейдёт к вам» пусто; защищённые — отдельным списком', () => {
        const view = describeTakeover(
            preview({
                takenDeal: null,
                closeDeals: [],
                closedTasks: 0,
                closedZpr: 0,
                protectedDeals: [
                    { id: 9, title: 'Договор', ownerName: 'Иван Иванов', kind: 'base' },
                ],
            }),
        );

        expect(view.taken).toBeNull();
        expect(view.closes).toEqual([]);
        expect(view.kept).toEqual(['сделка «Договор» — Иван Иванов']);
    });
});

const state = (
    config: { reportTakeoverForce: boolean; reportTakeoverConfirm: boolean },
    takeover: { resolved: boolean; status: 'idle' | 'loading' | 'ready' },
): RootState =>
    ({
        app: { config },
        clientTakeover: { ...takeover, isOpen: false, pendingSend: false, preview: null, confirmed: null },
    }) as unknown as RootState;

describe('selectNeedClientTakeover', () => {
    it('спрашиваем, только когда включены перехват и подтверждение и вопрос не закрыт', () => {
        const on = { reportTakeoverForce: true, reportTakeoverConfirm: true };

        expect(selectNeedClientTakeover(state(on, { resolved: false, status: 'idle' }))).toBe(true);
        expect(selectNeedClientTakeover(state(on, { resolved: true, status: 'ready' }))).toBe(false);
        expect(
            selectNeedClientTakeover(
                state({ ...on, reportTakeoverConfirm: false }, { resolved: false, status: 'idle' }),
            ),
        ).toBe(false);
        expect(
            selectNeedClientTakeover(
                state({ ...on, reportTakeoverForce: false }, { resolved: false, status: 'idle' }),
            ),
        ).toBe(false);
    });

    it('предпросмотр уже летит — повторное «Отправить» ждёт', () => {
        const on = { reportTakeoverForce: true, reportTakeoverConfirm: true };

        expect(selectClientTakeoverLoading(state(on, { resolved: false, status: 'loading' }))).toBe(true);
        expect(selectClientTakeoverLoading(state(on, { resolved: true, status: 'loading' }))).toBe(false);
    });
});

describe('parseUserIdsCsv', () => {
    it('как у бэка: разделители, мусор и дубли', () => {
        expect(parseUserIdsCsv('643, 39;643 abc 0 -5')).toEqual([643, 39]);
        expect(parseUserIdsCsv('')).toEqual([]);
        expect(parseUserIdsCsv(null)).toEqual([]);
    });
});
