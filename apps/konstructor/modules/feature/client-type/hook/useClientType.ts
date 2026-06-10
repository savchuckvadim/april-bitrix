import { useAppSelector } from '@/modules/app';
import { usePortal } from '@/modules/entities/portal/hooks/portal.hooks';
import { getDealClientType } from '@/modules/entities/deal/lib/utils/get-deal-client-type.util';

export const useClientType = () => {
    const { portalDeal } = usePortal();
    const deal = useAppSelector(state => state.app.bitrix.deal);

    const clientType = getDealClientType(portalDeal, deal ?? undefined);

    return {
        clientType,
    };
};
