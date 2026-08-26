'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { ensureWSClient } from '@/modules/app/lib/ws/ws-client.util';
import {
    ZPR_FLOW_DONE_EVENT,
    type ZprFlowDonePayload,
} from '../zpr-flow-event';
import { ZPR_QUERY_ROOT } from './zpr-query-keys';

/**
 * Дозагрузка по готовности сайд-очереди ЗПР.
 *
 * Тот же WS-механизм, что у основного flow (WSClient приложения; событие
 * приходит точечно в наш socketId — бэк узнаёт его из поля `socketId`
 * flow-запроса). По `zpr-flow:done` инвалидируются ссылки и элементы слайса:
 * сайд-очередь работает ПОСЛЕ основного отчёта, и только она знает, когда
 * элемент смарта действительно появился/закрылся.
 *
 * Подписка живёт, пока смонтирован потребитель ЗПР; сокет создаётся лениво
 * первым же потребителем (компактные встройки без ЗПР живут без WS).
 */
export const useZprFlowRefresh = (): void => {
    const queryClient = useQueryClient();
    const domain = useAppSelector(s => s.app.domain);
    const userId = Number(useAppSelector(s => s.app.bitrix.user?.ID)) || 0;

    useEffect(() => {
        if (!domain || !userId) return;
        const socket = ensureWSClient(userId, domain);
        if (!socket) return;

        const handler = (payload: ZprFlowDonePayload) => {
            // Доставка и так точечная, но чужой домен честнее отбросить.
            if (payload?.domain && payload.domain !== domain) return;
            if (payload?.action === 'skipped') return;
            void queryClient.invalidateQueries({
                queryKey: [ZPR_QUERY_ROOT],
            });
        };

        socket.on(ZPR_FLOW_DONE_EVENT, handler);
        return () => socket.off(ZPR_FLOW_DONE_EVENT, handler);
    }, [queryClient, domain, userId]);
};
