'use client';

import { useMemo } from 'react';
import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { SectionStatus } from '@/modules/shared/SectionState';
import type { ZprCallView, ZprStageDict } from '../../model';
import { zprRefsKey } from '../zpr-ref';
import { buildZprCallView, splitZprCalls } from '../zpr-stage-view';
import { ZprCallsHelper } from '../api/zpr-calls-helper';
import { useZprRefs } from './use-zpr-refs';
import { useZprFlowRefresh } from './use-zpr-flow-refresh';
import { ZPR_QUERY_ROOT, ZPR_STAGES_QUERY_ROOT } from './zpr-query-keys';

const helper = new ZprCallsHelper();

/** Элементы освежает WS; staleTime — страховка от лишних refetch на фокус. */
const ITEMS_STALE_TIME_MS = 60 * 1000;
/** Воронка за время открытого фрейма не меняется — словарь живёт сессию. */
const STAGES_STALE_TIME_MS = Infinity;

export interface ZprCallsState {
    /** Слайс молчит: op_zprs пуст или поле не установлено — не рендериться. */
    isSilent: boolean;
    status: SectionStatus;
    open: ZprCallView[];
    closed: ZprCallView[];
    closedTotal: number;
    /** Словарь стадий воронки элемента — для градиент-полоски. */
    dictOf: (view: ZprCallView) => ZprStageDict | undefined;
    refetch: () => void;
}

/**
 * Лента ЗПР клиента: ссылки op_zprs → элементы смарта → словари стадий.
 *
 * Кэш react-query: элементы — обычный staleTime (свежесть приносит WS
 * `zpr-flow:done`), словари стадий — на всю сессию. Запросы не уходят вовсе,
 * пока ссылок нет (self-gate).
 */
export const useZprCalls = (): ZprCallsState => {
    const domain = useAppSelector(s => s.app.domain);
    const { refs, hasField } = useZprRefs();
    useZprFlowRefresh();

    const refsKey = zprRefsKey(refs);
    const itemsQuery = useQuery({
        queryKey: [ZPR_QUERY_ROOT, 'items', domain, refsKey],
        queryFn: () => helper.fetchItems(refs),
        enabled: hasField && refs.length > 0,
        staleTime: ITEMS_STALE_TIME_MS,
        // Новая ссылка меняет ключ — старый список держим, пока едет новый:
        // без этого дозагрузка по WS мигала бы скелетоном поверх готовой ленты.
        placeholderData: keepPreviousData,
    });

    const calls = useMemo(() => itemsQuery.data ?? [], [itemsQuery.data]);

    // Пары воронок (entityTypeId + categoryId) известны только из элементов.
    const funnels = useMemo(() => {
        const seen = new Map<string, { entityTypeId: number; categoryId: number }>();
        for (const call of calls) {
            seen.set(`${call.entityTypeId}:${call.categoryId}`, {
                entityTypeId: call.entityTypeId,
                categoryId: call.categoryId,
            });
        }
        return [...seen.values()];
    }, [calls]);

    const stageQueries = useQueries({
        queries: funnels.map(funnel => ({
            queryKey: [
                ZPR_STAGES_QUERY_ROOT,
                domain,
                funnel.entityTypeId,
                funnel.categoryId,
            ],
            queryFn: () =>
                helper.fetchStageDict(funnel.entityTypeId, funnel.categoryId),
            staleTime: STAGES_STALE_TIME_MS,
        })),
    });

    // Скалярный ключ вместо самого массива запросов: useQueries отдаёт новый
    // массив на каждый рендер, и как зависимость он ломал бы мемоизацию.
    const stagesKey = stageQueries
        .map(query => query.dataUpdatedAt)
        .join(',');
    const dictByFunnel = useMemo(() => {
        const map = new Map<string, ZprStageDict>();
        funnels.forEach((funnel, index) => {
            const dict = stageQueries[index]?.data;
            if (dict) {
                map.set(`${funnel.entityTypeId}:${funnel.categoryId}`, dict);
            }
        });
        return map;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [funnels, stagesKey]);

    const views = useMemo(
        () =>
            calls.map(call =>
                buildZprCallView(
                    call,
                    dictByFunnel.get(`${call.entityTypeId}:${call.categoryId}`),
                ),
            ),
        [calls, dictByFunnel],
    );

    const { open, closed, closedTotal } = useMemo(
        () => splitZprCalls(views),
        [views],
    );

    // data есть (пусть и placeholder прежнего ключа) — секция «готова».
    const status: SectionStatus = itemsQuery.isError
        ? 'error'
        : itemsQuery.data === undefined
          ? 'loading'
          : 'ready';

    return {
        isSilent: !hasField || refs.length === 0,
        status,
        open,
        closed,
        closedTotal,
        dictOf: view =>
            dictByFunnel.get(
                `${view.call.entityTypeId}:${view.call.categoryId}`,
            ),
        refetch: () => void itemsQuery.refetch(),
    };
};
