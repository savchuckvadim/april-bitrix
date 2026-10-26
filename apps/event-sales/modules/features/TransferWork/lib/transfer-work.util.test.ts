import { describe, expect, it } from 'vitest';
import { toUserOptions } from '@/modules/features/Departament/lib/user-options';
import {
    buildTransferRequest,
    resolveTransferScope,
    transferAction,
    transferWarnings,
} from './transfer-work.util';

describe('resolveTransferScope', () => {
    it('сделка с компанией — передаём компанию и сделку, владелец — у сделки', () => {
        expect(
            resolveTransferScope({
                company: { ID: '161825', ASSIGNED_BY_ID: '1' },
                deal: { ID: '30379', ASSIGNED_BY_ID: '261' },
            }),
        ).toEqual({ companyId: 161825, dealIds: [30379], ownerId: 261 });
    });

    it('только компания или только сделка — тоже можно', () => {
        expect(
            resolveTransferScope({
                company: { ID: '5', ASSIGNED_BY_ID: '7' },
                deal: null,
            }),
        ).toEqual({ companyId: 5, dealIds: [], ownerId: 7 });
        expect(
            resolveTransferScope({ company: null, deal: { ID: '28073' } }),
        ).toEqual({ companyId: null, dealIds: [28073], ownerId: null });
    });

    it('лид без сделки и компании — передавать нечего', () => {
        expect(resolveTransferScope({ company: null, deal: null })).toBeNull();
    });
});

describe('запрос передачи', () => {
    const scope = { companyId: 5, dealIds: [10], ownerId: 7 };

    it('все задачи, стадии не трогаем, отдельной задачи не ставим', () => {
        expect(
            buildTransferRequest({
                scope,
                domain: 'garant.bitrix24.ru',
                initiatorId: 7,
                newResponsibleId: 9,
            }),
        ).toEqual({
            domain: 'garant.bitrix24.ru',
            initiatorUserId: 7,
            companyId: 5,
            dealIds: [10],
            newResponsibleId: 9,
            includeOverdue: true,
            moveMainDealToCold: false,
            createCallTask: false,
        });
    });

    it('своё — отдаю (give), чужое — передаю (take)', () => {
        expect(transferAction(scope, 7)).toBe('give');
        expect(transferAction(scope, 3)).toBe('take');
        expect(transferAction(scope, null)).toBe('take');
    });

    it('предупреждения из результата — только строки', () => {
        expect(
            transferWarnings({ warnings: ['Задача 1 пропущена', '', 3] }),
        ).toEqual(['Задача 1 пропущена']);
        expect(transferWarnings(null)).toEqual([]);
    });
});

describe('toUserOptions', () => {
    it('нынешнего владельца в списке нет, должность — подсказкой', () => {
        expect(
            toUserOptions(
                [
                    { ID: '261', NAME: 'Екатерина', LAST_NAME: 'Шерих' },
                    {
                        ID: '413',
                        NAME: 'Мария',
                        LAST_NAME: 'Станишевская',
                        WORK_POSITION: 'менеджер',
                    },
                ] as never,
                [261],
            ),
        ).toEqual([
            { value: '413', label: 'Мария Станишевская', hint: 'менеджер' },
        ]);
    });
});
