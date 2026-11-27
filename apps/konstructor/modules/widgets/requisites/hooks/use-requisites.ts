'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    bxrqActions,
    getClinetTypeNameByCode,
    getRqFillPercent,
    getRqShowName,
} from '@/modules/entities/bx-rq';
import { useClientType } from '@/modules/entities/deal';
import {
    isRequisitesTab,
    resolveRequisitesTab,
    type RequisitesTab,
} from '../lib/requisites-tab.util';

/**
 * Экран реквизитов: реквизиты компании под тип клиента из шапки, выбор
 * текущего, новый реквизит из шаблона. Адреса и банк доступны только у
 * сохранённого реквизита: Bitrix привязывает их к его id. Вкладка живёт здесь:
 * «Новый реквизит» возвращает на основную, а у шаблона адреса и банк недоступны.
 */
export const useRequisites = () => {
    const dispatch = useAppDispatch();
    const { clientType, resolved, source } = useClientType();
    const hasCompany = useAppSelector(state => Boolean(state.app.bitrix.company?.ID));
    const bxrq = useAppSelector(state => state.bxrq);
    const current = bxrq.current.item;
    const isSaved = Boolean(current && current.bx_id > 0);
    const [requestedTab, setRequestedTab] = useState<RequisitesTab>('base');

    return {
        hasCompany,
        isLoading: bxrq.isLoading,
        isReady: bxrq.isFetched && Boolean(bxrq.rqs),
        clientTypeName: getClinetTypeNameByCode(clientType),
        clientTypeSource: source,
        hasCurrent: Boolean(current),
        isSaved,
        fill: getRqFillPercent(current, resolved),
        items: bxrq.current.items
            .filter(item => item.bx_id > 0)
            .map(item => ({
                id: String(item.bx_id),
                title: getRqShowName(item.fields, resolved, 45),
            })),
        currentId: isSaved && current ? String(current.bx_id) : null,
        isBusy: bxrq.isCreatingLoading,
        tab: resolveRequisitesTab(requestedTab, isSaved),
        setTab: (tab: string) => {
            if (isRequisitesTab(tab)) setRequestedTab(tab);
        },
        select: (id: string) => {
            const found = bxrq.current.items.find(item => String(item.bx_id) === id);
            if (found) dispatch(bxrqActions.setCurrentItem({ item: found }));
        },
        startNew: () => {
            setRequestedTab('base');
            dispatch(bxrqActions.startNewRecord({ clientType: resolved }));
        },
    };
};
