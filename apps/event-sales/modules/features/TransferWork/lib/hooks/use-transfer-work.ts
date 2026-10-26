'use client';

import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { reinitApp } from '@/modules/app/model/thunk/AppThunk';
import { toUserOptions } from '@/modules/features/Departament/lib/user-options';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';
import { reportFrontError } from '@/modules/shared/front-error';
import { TransferWorkHelper } from '../api/transfer-work-helper';
import {
    TRANSFER_WORK_TEXT,
    buildTransferRequest,
    resolveTransferScope,
    transferAction,
    transferWarnings,
} from '../transfer-work.util';

const helper = new TransferWorkHelper();

export type TransferWorkStatus = 'idle' | 'working' | 'done' | 'error';

/**
 * Состояние окна «Передать работу»: кому, ход операции и итог. Компонент
 * только рисует — что передаём и как, решают transfer-work.util и хук бэка.
 */
export const useTransferWork = () => {
    const dispatch = useAppDispatch();
    const domain = useAppSelector(s => s.app.domain);
    const company = useAppSelector(s => s.app.bitrix.company);
    const deal = useAppSelector(s => s.app.bitrix.deal);
    const myId = useAppSelector(s => Number(s.app.bitrix.user?.ID) || null);
    const users = useAppSelector(selectAllDepartmentUsers);

    const scope = useMemo(
        () =>
            resolveTransferScope({
                company: company as unknown as Record<string, unknown> | null,
                deal: deal as unknown as Record<string, unknown> | null,
            }),
        [company, deal],
    );
    const candidates = useMemo(
        () => toUserOptions(users, scope?.ownerId ? [scope.ownerId] : []),
        [users, scope],
    );

    const [userId, setUserId] = useState<string>();
    const [status, setStatus] = useState<TransferWorkStatus>('idle');
    const [warnings, setWarnings] = useState<string[]>([]);

    const transfer = async (): Promise<void> => {
        if (!scope || !domain || !userId) return;
        setStatus('working');
        setWarnings([]);
        try {
            const operation = await helper.transfer(
                transferAction(scope, myId),
                buildTransferRequest({
                    scope,
                    domain,
                    initiatorId: myId,
                    newResponsibleId: Number(userId),
                }),
            );
            if (operation.status === 'failed') {
                throw new Error(operation.error ?? 'операция не выполнена');
            }
            setWarnings(transferWarnings(operation.result));
            setStatus('done');
        } catch (error) {
            setStatus('error');
            reportFrontError({
                place: 'transfer-work',
                message: error instanceof Error ? error.message : String(error),
                domain,
                userId: myId,
                context: { scope, newResponsibleId: Number(userId) },
            });
        }
    };

    return {
        isAvailable: Boolean(scope && domain),
        candidates,
        userId,
        setUserId,
        chosenName:
            candidates.find(option => option.value === userId)?.label ?? '',
        status,
        warnings,
        transfer,
        reset: () => {
            setUserId(undefined);
            setStatus('idle');
            setWarnings([]);
        },
        /** Данные клиента сменились — перечитать приложение, кэш портала цел. */
        reload: () => void dispatch(reinitApp()),
        text: TRANSFER_WORK_TEXT,
    };
};
