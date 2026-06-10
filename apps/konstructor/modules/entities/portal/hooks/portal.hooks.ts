import { useAppSelector } from '@/modules/app';

export const usePortal = () => {
    const { current, isFetched, error, status } = useAppSelector(
        state => state.portal,
    );
    const portalDeal = current?.bitrixDeal

    return {
        portal: current,
        portalDeal,
        isFetched,
        status,
        error,
    };
};
