'use client';

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { SectionStatus } from '@/modules/shared/SectionState';
import { fetchRelatedDetails } from '../../model/RelatedCrmThunk';
import type { RelatedCrmDetails } from '../../model';
import { getEntityDescriptor, EntityDescriptor } from '../entity-descriptor';

export interface CurrentRelations {
    descriptor: EntityDescriptor | null;
    details: RelatedCrmDetails | null;
    status: SectionStatus;
    /** Показывать закрытые сделки и отработанные лиды. */
    includeClosed: boolean;
    setIncludeClosed: (value: boolean) => void;
    reload: () => void;
}

/**
 * Связи клиента, который сейчас в фокусе встройки.
 *
 * Данные живут в сторе (relatedCrm), а не в компоненте: их читает шапка-layout
 * на всех экранах, и они обязаны переживать переключения список ↔ дело без
 * повторного запроса. Загружает их листенер на setAppData — хук только читает
 * и умеет перезапросить (тумблер «с закрытыми», кнопка «повторить»).
 */
export const useCurrentRelations = (): CurrentRelations => {
    const dispatch = useAppDispatch();
    const from = useAppSelector(s => s.app.bitrix.from);
    const company = useAppSelector(s => s.app.bitrix.company);
    const deal = useAppSelector(s => s.app.bitrix.deal);
    const lead = useAppSelector(s => s.app.bitrix.lead);
    const details = useAppSelector(s => s.relatedCrm.details);
    const status = useAppSelector(s => s.relatedCrm.status);
    const includeClosed = useAppSelector(s => s.relatedCrm.includeClosed);

    const descriptor = useMemo(
        () => getEntityDescriptor({ from, company, deal, lead }),
        [from, company, deal, lead],
    );

    const setIncludeClosed = useCallback(
        (value: boolean) => {
            dispatch(fetchRelatedDetails({ includeClosed: value }));
        },
        [dispatch],
    );

    const reload = useCallback(() => {
        dispatch(fetchRelatedDetails({ force: true }));
    }, [dispatch]);

    return { descriptor, details, status, includeClosed, setIncludeClosed, reload };
};
