'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { InvoiceTemplate } from '../../model';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';
import {
    mergeInvoiceTemplates,
    requestErrorText,
} from '../invoice-template-list.util';

const helper = new InvoiceTemplateHelper();

/** Первая загрузка идёт, готова или не удалась; обновление статус не меняет. */
export type InvoiceTemplatesStatus = 'loading' | 'ready' | 'error';

/**
 * Шаблоны счетов для портала: общие и свои (портал и поставщики), архив
 * включён. Повторная загрузка оставляет прежний список на экране, неудача
 * тоже оставляет его.
 */
export const useInvoiceTemplates = () => {
    const portalId = useAppSelector(state => state.portal.current?.id ?? null);
    const [items, setItems] = useState<InvoiceTemplate[]>([]);
    const [status, setStatus] = useState<InvoiceTemplatesStatus>('loading');
    const [error, setError] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    // растёт на каждую удачную загрузку: от неё зависит подбор шаблона
    const [version, setVersion] = useState(0);
    // растёт на каждый запрос и при уходе с экрана: поздний ответ отбрасывается
    const requestRef = useRef(0);

    const reload = useCallback(async (): Promise<void> => {
        const request = ++requestRef.current;
        setIsRefreshing(true);
        try {
            const [publicList, portalList] = await Promise.all([
                helper.listPublic(),
                portalId == null
                    ? Promise.resolve<InvoiceTemplate[]>([])
                    : helper.listByPortal(String(portalId)),
            ]);
            if (request !== requestRef.current) return;
            setItems(mergeInvoiceTemplates(publicList, portalList));
            setStatus('ready');
            setError(null);
            setVersion(current => current + 1);
        } catch (failure) {
            if (request !== requestRef.current) return;
            setError(
                requestErrorText(failure, 'Не удалось загрузить шаблоны счетов'),
            );
            setStatus(current => (current === 'ready' ? current : 'error'));
        } finally {
            if (request === requestRef.current) setIsRefreshing(false);
        }
    }, [portalId]);

    useEffect(() => {
        void reload();
        return () => {
            requestRef.current += 1;
        };
    }, [reload]);

    return { portalId, items, status, error, isRefreshing, version, reload };
};
