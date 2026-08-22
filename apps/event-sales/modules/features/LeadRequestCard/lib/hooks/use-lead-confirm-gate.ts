'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { fetchLeadRequestCard } from '../../model/LeadRequestThunk';
import { useLeadRequestAcceptState } from './use-lead-request-accept-state';
import { useRequestLeadIds } from './use-request-lead-ids';

export interface LeadConfirmGateView {
    /** Показывать экран: заявка ждёт решения и его ещё не отложили. */
    isVisible: boolean;
    /** Лид, чья судьба решается сейчас, — для SLA-таймера. */
    currentLeadId: number | null;
    /** Кого показать на экране: клиент, а не номер лида. */
    clientTitle: string;
    /** Сколько заявок ещё ждёт после этой — «и это не последняя». */
    pendingAfter: number;
    skip: () => void;
}

/**
 * Экран подтверждения — с ОЧЕРЕДЬЮ.
 *
 * Заявок у дела бывает несколько. Показываем по одной: решил судьбу текущей —
 * загружается следующая. Карточку гейт тянет сам: панель живёт в окне и до
 * открытия не смонтирована.
 *
 * Слот карточки в сторе ОДИН, поэтому каждый шаг сверяется с идентичностью:
 * очередь двигается только когда загруженная карточка принадлежит ТЕКУЩЕМУ
 * лиду очереди. Без этой сверки эффект продвижения читал устаревшие
 * status/acceptState из замыкания и перепрыгивал лидов через одного, а
 * опоздавший ответ показывал одну заявку под именем другой.
 *
 * Ошибка загрузки (лид удалён, битая привязка) двигает очередь дальше: раньше
 * она замораживала её насовсем, и следующая непринятая заявка не показывалась
 * до конца SLA.
 *
 * Пока окно заявки открыто (isHeldByDialog), гейт не фетчит, не двигает
 * очередь и не показывается: слотом владеет окно.
 *
 * Пропуск локальный и на всю очередь до перезагрузки: «посмотрю сначала» —
 * решение про сессию, а не про конкретную заявку.
 */
export const useLeadConfirmGate = (): LeadConfirmGateView => {
    const dispatch = useAppDispatch();
    const [isSkipped, setIsSkipped] = useState(false);
    const [queueIndex, setQueueIndex] = useState(0);
    const leadIds = useRequestLeadIds();
    const acceptState = useLeadRequestAcceptState();
    const loadedLeadId = useAppSelector(state => state.leadRequest.leadId);
    const status = useAppSelector(state => state.leadRequest.status);
    const isHeld = useAppSelector(state => state.leadRequest.isHeldByDialog);
    const company = useAppSelector(state => state.app.bitrix.company);
    const lead = useAppSelector(state => state.app.bitrix.lead);

    const currentLeadId = leadIds[queueIndex] ?? null;
    // Слот действительно держит лида очереди — только тогда его состоянию
    // можно верить.
    const isCurrentLoaded = loadedLeadId === currentLeadId;

    // Карточка текущей заявки очереди.
    useEffect(() => {
        if (isHeld || !currentLeadId) return;
        dispatch(fetchLeadRequestCard(currentLeadId));
    }, [dispatch, currentLeadId, isHeld]);

    // Текущая решена (принята/чужая) либо не загрузилась — к следующей.
    // Гейт по идентичности не даёт шагнуть дважды по одному состоянию.
    useEffect(() => {
        if (isHeld || !isCurrentLoaded) return;
        const isSettled =
            (status === 'ready' && acceptState !== 'mine') ||
            status === 'error';
        if (!isSettled) return;
        setQueueIndex(index =>
            index < leadIds.length - 1 ? index + 1 : index,
        );
    }, [isHeld, isCurrentLoaded, status, acceptState, leadIds.length]);

    const clientTitle =
        company?.TITLE ||
        lead?.TITLE ||
        (currentLeadId ? `Заявка №${currentLeadId}` : 'Новая заявка');

    return {
        isVisible:
            !isHeld && isCurrentLoaded && acceptState === 'mine' && !isSkipped,
        currentLeadId,
        clientTitle,
        pendingAfter: Math.max(0, leadIds.length - queueIndex - 1),
        skip: () => setIsSkipped(true),
    };
};
