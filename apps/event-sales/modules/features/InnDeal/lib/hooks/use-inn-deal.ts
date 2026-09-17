'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { SectionStatus } from '@/modules/shared/SectionState';
import type { InnCandidate, InnSnapshot } from '../../model';
import { InnDealHelper } from '../api/inn-deal-helper';
import { innWriteErrorText, splitInnCandidates } from '../inn-deal-view';

const helper = new InnDealHelper();

/** Корень ключей react-query слайса — по нему инвалидируем снимок. */
export const INN_DEAL_QUERY_ROOT = 'inn-deal';

/** Снимок живёт минуту: карточку открывают и закрывают по нескольку раз. */
const SNAPSHOT_STALE_TIME_MS = 60 * 1000;

export interface InnDealState {
    /** Слайса нет на экране: сделки в контексте нет. */
    isSilent: boolean;
    status: SectionStatus;
    snapshot: InnSnapshot | null;
    /** Видимые варианты (скрытые вынесены отдельно). */
    candidates: InnCandidate[];
    hidden: InnCandidate[];
    /** Идёт запись: кнопки заблокированы. */
    isSaving: boolean;
    /** Человеческий текст последней неудачи (в том числе 409). */
    error: string | null;
    /** Сделка закрыта — карточка только для чтения. */
    readOnly: boolean;
    refetch: () => void;
    choose: (inn: string) => void;
    hide: (inn: string) => void;
    restore: (inn: string) => void;
}

/**
 * Данные вкладки «ИНН» одной сделки.
 *
 * Запись всегда возвращает НОВЫЙ снимок — его и кладём в кэш, без второго
 * запроса. Версия снимка уезжает на бэк вместе с выбором: если состояние
 * успел изменить робот, крон или соседняя вкладка, бэк отвечает 409, и
 * менеджер видит просьбу обновить карточку, а не молча перетирает чужую
 * запись.
 */
export const useInnDeal = (): InnDealState => {
    const domain = useAppSelector(state => state.app.domain);
    const deal = useAppSelector(state => state.app.bitrix.deal);
    const user = useAppSelector(state => state.app.bitrix.user);
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    const dealId = Number(deal?.ID) || 0;
    const userId = Number(user?.ID) || undefined;
    const queryKey = useMemo(
        () => [INN_DEAL_QUERY_ROOT, domain, dealId],
        [domain, dealId],
    );

    const snapshotQuery = useQuery({
        queryKey,
        queryFn: () => helper.getSnapshot(domain, dealId),
        enabled: Boolean(domain) && dealId > 0,
        staleTime: SNAPSHOT_STALE_TIME_MS,
    });

    const applySnapshot = useCallback(
        (snapshot: InnSnapshot) => {
            setError(null);
            queryClient.setQueryData(queryKey, snapshot);
        },
        [queryClient, queryKey],
    );

    /**
     * Причина отказа приходит текстом с бэка (409 «данные изменились»,
     * «сделка закрыта») — показываем её, а не «status code 409». Снимок при
     * этом не трогаем: менеджер сам решит, обновлять или нет.
     */
    const onWriteError = useCallback((cause: unknown) => {
        setError(innWriteErrorText(cause));
    }, []);

    const chooseMutation = useMutation({
        mutationFn: (inn: string) =>
            helper.choose(dealId, {
                domain,
                inn,
                version: snapshotQuery.data?.version ?? '',
                userId,
            }),
        onSuccess: applySnapshot,
        onError: onWriteError,
    });

    const hideMutation = useMutation({
        mutationFn: (params: { inn: string; restore?: boolean }) =>
            helper.hide(dealId, {
                domain,
                inn: params.inn,
                userId,
                restore: params.restore,
            }),
        onSuccess: applySnapshot,
        onError: onWriteError,
    });

    const snapshot = snapshotQuery.data ?? null;
    const split = useMemo(
        () => splitInnCandidates(snapshot?.candidates ?? []),
        [snapshot],
    );

    const status: SectionStatus = snapshotQuery.isPending
        ? 'loading'
        : snapshotQuery.isError
          ? 'error'
          : 'ready';

    return {
        isSilent: dealId <= 0,
        status,
        snapshot,
        candidates: split.visible,
        hidden: split.hidden,
        isSaving: chooseMutation.isPending || hideMutation.isPending,
        error,
        readOnly: snapshot?.readOnly ?? false,
        refetch: () => {
            setError(null);
            void snapshotQuery.refetch();
        },
        choose: (inn: string) => chooseMutation.mutate(inn),
        hide: (inn: string) => hideMutation.mutate({ inn }),
        restore: (inn: string) => hideMutation.mutate({ inn, restore: true }),
    };
};
