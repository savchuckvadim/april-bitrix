'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { APP_DEP } from '@/modules/app/model/AppSlice';
import { getServiceOfferPbxSmartEntityId } from '@/modules/entities/portal';
import {
    SERVICE_PERIOD_TITLE,
    selectServiceOffer,
    setServicePeriod,
    type ServicePeriodMode,
} from '@/modules/entities/service-offer';

/** Переключатель периода сервисного отдела: виден только там, где есть смарт service_offer. */
export const useServicePeriod = () => {
    const dispatch = useAppDispatch();
    const isService = useAppSelector(state => state.app.department === APP_DEP.SERVICE);
    const hasSmart = useAppSelector(state => Boolean(getServiceOfferPbxSmartEntityId(state.portal.current)));
    const hasDeal = useAppSelector(state => Boolean(state.app.dealId));
    const offer = useAppSelector(selectServiceOffer);

    return {
        visible: isService && hasSmart && hasDeal,
        mode: offer.mode,
        options: (Object.keys(SERVICE_PERIOD_TITLE) as ServicePeriodMode[]).map(mode => ({
            value: mode,
            label: SERVICE_PERIOD_TITLE[mode],
        })),
        isSwitching: offer.switching || offer.status === 'loading',
        error: offer.status === 'error' ? offer.error : null,
        // у «следующего периода» ещё нет слепка — он начнётся с текущей сборки
        isSmartNew: offer.mode === 'smart' && !offer.hasSmartSnapshot,
        setMode: (mode: ServicePeriodMode) => void dispatch(setServicePeriod(mode)),
    };
};
