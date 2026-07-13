import { AppState } from "@/modules/app/model/AppSlice";
import { AppDispatch, listenerMiddleware, RootState } from "@/modules/app/model/store";
import { setInitEventCompany } from "@/modules/entities/EventCompany/model/EventCompanyThunk";
import { getCompanyContacts } from "@/modules/entities/EventContact/model/EventContactThunk";
import { portalActions } from "@workspace/pbx";


export const portalListener = () => (
    listenerMiddleware.startListening({
        actionCreator: portalActions.setPortal,
        effect: async (action, listenerApi) => {
            const portal = action.payload.portal
            const { getState, condition } = listenerApi;
            const dispatch = listenerApi.dispatch as AppDispatch;
            await listenerApi.condition((action, currentState) => {
                const state = currentState as RootState;
                return !!(
                    state.app && // Проверяем, что `app` существует
                    state.app.bitrix && // Проверяем, что `bitrix` существует
                    state.app.bitrix.company // Проверяем, что `company` заполнено
                );
            }, 5000);
            dispatch(
                setInitEventCompany(
                    portal
                )
            )
            dispatch(
                getCompanyContacts(
                    portal
                    
                )
            )

        },
    })
    
)