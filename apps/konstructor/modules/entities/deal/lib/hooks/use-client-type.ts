import { useAppSelector } from '@/modules/app';
import { usePortal } from '@/modules/entities/portal';
import { getDealClientType } from '../utils/get-deal-client-type.util';

export const useClientType = () => {
    const { portalDeal } = usePortal();
    const deal = useAppSelector(state => state.app.bitrix.deal);

    const clientType = getDealClientType(portalDeal ?? undefined, deal ?? undefined);

    return {
        clientType,
    };
};
