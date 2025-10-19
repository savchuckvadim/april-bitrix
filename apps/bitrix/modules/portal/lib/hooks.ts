// import { useSelector, useDispatch } from 'react-redux';
// import { RootState } from '../../../app/model/store';
// import { portalActions } from '../model';
// import { addPortalThunk, createAppThunk, loadPortalsThunk } from '../model/thunk/PortalThunk';
// import { PortalForm } from '../model/types';

// export const usePortal = () => {
//     const dispatch = useDispatch();
//     const portal = useSelector((state: RootState) => state.portal);

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
