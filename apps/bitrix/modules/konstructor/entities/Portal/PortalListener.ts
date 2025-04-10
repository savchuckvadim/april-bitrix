import { AppState } from "@/modules/konstructor/app/model/AppSlice";
import { listenerMiddleware, RootState } from "@/modules/konstructor/app/model/store";
import { portalActions } from "@workspace/pbx";


export const portalListener = () => (
    listenerMiddleware.startListening({
        actionCreator: portalActions.setPortal,
        effect: async (action, listenerApi) => {
            const portal = action.payload.portal
            const { dispatch, getState, condition } = listenerApi;
            await listenerApi.condition(
                //@ts-ignore
                (action, state: RootState) => {

                    return (state.app as AppState) && // Проверяем, что `app` существует
                        (state.app as AppState).bitrix && // Проверяем, что `bitrix` существует
                        !!(state.app as AppState).bitrix.company
                }, // Проверяем, что `company` заполнено
                5000
            );
            // dispatch(
            //     setInitEventCompany(
            //         portal
            //     )
            // )

        },
    })
    
)