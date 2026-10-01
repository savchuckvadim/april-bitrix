import { describe, expect, it } from 'vitest';
import type { ClientWork, ClientWorkDeal } from '../model';
import {
    canSubmitJoin,
    chooseMain,
    confirmJoinText,
    initialSelection,
    summarizeJoin,
    toggleSelected,
} from './client-work-selection';

const deal = (id: number, patch: Partial<ClientWorkDeal> = {}): ClientWorkDeal => ({
    id,
    title: `Сделка ${id}`,
    stageName: 'Холодные',
    responsibleId: 11,
    responsibleName: 'Иван Петров',
    responsibleWorking: true,
    ownWork: false,
    opportunity: 0,
    openTasks: 0,
    createdAt: null,
    modifiedAt: null,
    origin: 'новая заявка',
    isMain: false,
    isFreshest: false,
    isCurrent: false,
    ...patch,
});

const work = (patch: Partial<ClientWork> = {}): ClientWork => ({
    client: { kind: 'company', id: 100, title: 'ООО Ромашка', inn: '' },
    deals: [deal(1, { isMain: true }), deal(2), deal(3)],
    suggestedMainDealId: 1,
    freshestDealId: 2,
    notes: [],
    howWorked: null,
    canJoin: true,
    hint: null,
    ...patch,
});

describe('«Открытые сделки по клиенту»: выбор руководителя', () => {
    it('по умолчанию: основная — предложенная, отмечены все остальные', () => {
        expect(initialSelection(work())).toEqual({
            mainDealId: 1,
            selectedIds: [2, 3],
        });
    });

    it('сервер просит разобраться (два менеджера, разные ИНН) — ничего не отмечено', () => {
        expect(
            initialSelection(work({ notes: ['У сделок разные ИНН…'] }))
                .selectedIds,
        ).toEqual([]);
    });

    it('не руководитель — ничего не отмечено', () => {
        expect(initialSelection(work({ canJoin: false })).selectedIds).toEqual(
            [],
        );
    });

    it('новая основная уходит из отмеченных; основную отметить нельзя', () => {
        expect(chooseMain({ mainDealId: 1, selectedIds: [2, 3] }, 2)).toEqual({
            mainDealId: 2,
            selectedIds: [3],
        });
        expect(toggleSelected([3], 2, 2)).toEqual([3]);
        expect(toggleSelected([3], 1, 2)).toEqual([3, 1]);
        expect(toggleSelected([3, 1], 1, 2)).toEqual([3]);
    });

    it('кнопка активна, только когда есть что присоединять и можно', () => {
        expect(canSubmitJoin(work(), { mainDealId: 1, selectedIds: [2] })).toBe(
            true,
        );
        expect(canSubmitJoin(work(), { mainDealId: 1, selectedIds: [] })).toBe(
            false,
        );
        expect(
            canSubmitJoin(work({ canJoin: false }), {
                mainDealId: 1,
                selectedIds: [2],
            }),
        ).toBe(false);
    });

    it('подтверждение: сколько, куда и что будет — по-русски', () => {
        expect(
            confirmJoinText(work(), { mainDealId: 1, selectedIds: [2, 3] }),
        ).toContain('Присоединить 2 сделки к №1 «Сделка 1» (Иван Петров)?');
    });

    it('итог: присоединено, пропущено, перенесено задач и дел', () => {
        const base = {
            mainDealId: 1,
            companyId: null,
            contactsLinked: 0,
            leadsRelinked: 0,
            closedAsDuplicate: true,
        };
        expect(
            summarizeJoin(1, {
                implemented: true,
                message: '',
                items: [
                    {
                        ...base,
                        dealId: 2,
                        tasksMoved: 2,
                        activitiesMoved: 1,
                        skipped: false,
                        warnings: [],
                    },
                    {
                        ...base,
                        dealId: 3,
                        tasksMoved: 0,
                        activitiesMoved: 0,
                        skipped: true,
                        warnings: ['сделка уже закрыта'],
                    },
                ],
            }),
        ).toEqual({
            mainDealId: 1,
            joined: 1,
            skippedIds: [3],
            tasksMoved: 2,
            activitiesMoved: 1,
            warnings: ['сделка уже закрыта'],
        });
    });
});
