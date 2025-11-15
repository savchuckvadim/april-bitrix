'use client';

import { addPortalThunk, createAppThunk, loadPortalsThunk, Portal, portalActions, PortalForm } from '../model';

import { useAppDispatch, useAppSelector } from '@/modules/app';


// export const useTanstackPortals = (clientId: number) => {

//     const portalApi = getBitrixAppClientClient()
//     const dispatch = useAppDispatch();
//     const { selectedPortal } = useAppSelector(state => state.portal);
//     const { data: portals, isLoading, error } = useQuery<Portal[], Error>({
//         queryKey: ['portals', clientId],
//         enabled: !!clientId,
//         queryFn: async (): Promise<Portal[]> => {
//             const response = await portalApi.bitrixClientGetClientPortals({
//                 clientId: clientId,
//             })
//             debugger
//             if (response) {
//                 return response as unknown as Portal[];
//             }
//             return [];
//         }
//     });

//     const rootPortal = portals?.[0] ?? null;

//     return {
//         portals: portals ?? [],
//         rootPortal,
//         isLoading,
//         error,
//     };
// };
export const usePortal = () => {
    const dispatch = useAppDispatch();
    const portal = useAppSelector((state) => state.portal);

    const addPortal = (form: PortalForm) => dispatch(addPortalThunk(form));
    const createApp = (portalId: bigint, group: string, clientId: string, clientSecret: string) =>
        dispatch(createAppThunk(portalId, group, clientId, clientSecret));
    const loadPortals = () => dispatch(loadPortalsThunk());
    const setSelectedPortal = (portal: any) => dispatch(portalActions.setSelectedPortal(portal));
    const clearError = () => dispatch(portalActions.clearError());

    return {
        ...portal,
        addPortal,
        createApp,
        loadPortals,
        setSelectedPortal,
        clearError,
    };
};
