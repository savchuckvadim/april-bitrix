// import { useSelector, useDispatch } from 'react-redux';
// import { RootState } from '../../app/model/store';
// import { widgetActions } from '../model';
// import {
//     loadPlacementsThunk,
//     installPlacementThunk,
//     uninstallPlacementThunk,
//     reinstallPlacementThunk,
//     savePlacementSettingsThunk
// } from '../model/thunk/WidgetThunk';
// import { BitrixSetting } from '../model/types';

// export const useWidget = () => {
//     const dispatch = useDispatch();
//     const widget = useSelector((state: RootState) => state.widget);

//     const loadPlacements = (appId: bigint) => dispatch(loadPlacementsThunk(appId));
//     const installPlacement = (placementId: bigint) => dispatch(installPlacementThunk(placementId));
//     const uninstallPlacement = (placementId: bigint) => dispatch(uninstallPlacementThunk(placementId));
//     const reinstallPlacement = (placementId: bigint) => dispatch(reinstallPlacementThunk(placementId));
//     const savePlacementSettings = (placementId: bigint, settings: BitrixSetting[]) =>
//         dispatch(savePlacementSettingsThunk(placementId, settings));
//     const clearError = () => dispatch(widgetActions.clearError());

//     return {
//         ...widget,
//         loadPlacements,
//         installPlacement,
//         uninstallPlacement,
//         reinstallPlacement,
//         savePlacementSettings,
//         clearError,
//     };
// };
