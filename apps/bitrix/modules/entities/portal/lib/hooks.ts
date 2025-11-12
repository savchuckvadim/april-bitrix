'use client';

import { useQuery } from '@tanstack/react-query';
import {  getBitrixAppClientClient, SuccessResponseDtoResultCode } from '@workspace/nest-api';


export const useTanstackPortals = (clientId: number) => {

    const portalApi = getBitrixAppClientClient()

    const { data: portals, isLoading, error } = useQuery({
        queryKey: ['portals', clientId],
        enabled: !!clientId,
        queryFn: async () => {
            const response = await portalApi.bitrixClientGetClientPortals({
                clientId: clientId,
            })
            if (response.resultCode === SuccessResponseDtoResultCode.NUMBER_1) {
                return response.data;
            }
            return null;
        },
    });

    return {
        portals,
        isLoading,
        error,
    };
};
// export const usePortal = () => {
//     const dispatch = useAppDispatch();
//     const portal = useAppSelector((state) => state.portal);

//     const addPortal = (form: PortalForm) => dispatch(addPortalThunk(form));
//     const createApp = (portalId: bigint, group: string, clientId: string, clientSecret: string) =>
//         dispatch(createAppThunk(portalId, group, clientId, clientSecret));
//     const loadPortals = () => dispatch(loadPortalsThunk());
//     const setSelectedPortal = (portal: any) => dispatch(portalActions.setSelectedPortal(portal));
//     const clearError = () => dispatch(portalActions.clearError());

//     return {
//         ...portal,
//         addPortal,
//         createApp,
//         loadPortals,
//         setSelectedPortal,
//         clearError,
//     };
// };
