'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SectionStatus } from '@/modules/shared/SectionState';
import { RelatedCrmHelper } from '../api/related-crm-helper';
import type { RelatedCrmDetails, RelatedEntityType } from '../../model';

const helper = new RelatedCrmHelper();

export interface UseRelatedCrmParams {
    domain: string;
    entityType: RelatedEntityType | null;
    entityId: number | null;
}

export interface RelatedCrmData {
    details: RelatedCrmDetails | null;
    status: SectionStatus;
    /** Показывать закрытые сделки и отработанные лиды. */
    includeClosed: boolean;
    setIncludeClosed: (value: boolean) => void;
    reload: () => void;
}

/**
 * Связи клиента: сделки со стадиями, лиды, ответственный.
 *
 * `includeClosed` живёт здесь, а не в компоненте: переключение меняет запрос,
 * а не фильтрацию на клиенте — закрытых сделок у давнего клиента столько, что
 * тянуть их всегда только ради тумблера незачем.
 */
export const useRelatedCrm = ({
    domain,
    entityType,
    entityId,
}: UseRelatedCrmParams): RelatedCrmData => {
    const [details, setDetails] = useState<RelatedCrmDetails | null>(null);
    const [status, setStatus] = useState<SectionStatus>('idle');
    const [includeClosed, setIncludeClosed] = useState(false);
    const [reloadToken, setReloadToken] = useState(0);

    const reload = useCallback(() => setReloadToken(token => token + 1), []);

    useEffect(() => {
        if (!domain || !entityType || !entityId) return;

        let cancelled = false;
        setStatus('loading');

        helper
            .getDetails({ domain, entityType, entityId, includeClosed })
            .then(result => {
                if (cancelled) return;
                setDetails(result);
                setStatus('ready');
            })
            .catch(error => {
                if (cancelled) return;
                console.error('related crm details error', error);
                setStatus('error');
            });

        // Ответ предыдущего запроса игнорируем: тумблер «с закрытыми» щёлкают
        // быстрее, чем отвечает портал, и старый ответ мог бы перезаписать
        // более свежий.
        return () => {
            cancelled = true;
        };
    }, [domain, entityType, entityId, includeClosed, reloadToken]);

    return { details, status, includeClosed, setIncludeClosed, reload };
};
