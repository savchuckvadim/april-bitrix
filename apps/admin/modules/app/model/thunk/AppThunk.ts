import { appActions } from "../slice/AppSlice";
import { AppDispatch, AppGetState } from "../store";


export const initializeApp = (isInstall: boolean | undefined = false) => async (dispatch: AppDispatch, getState: AppGetState) => {
    dispatch(appActions.setInitializedSuccess({}));
    dispatch(appActions.isLoading({ status: false }));
};

export const reloadApp = () => async (dispatch: AppDispatch, getState: AppGetState) => {

    dispatch(appActions.setInitializedSuccess({}));
    dispatch(appActions.isLoading({ status: false }));

}
