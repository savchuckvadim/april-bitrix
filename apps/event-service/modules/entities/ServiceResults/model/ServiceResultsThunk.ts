import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { serviceResultsActions, ServiceResultsState } from "./ServiceResultsSlice";
import { EventItemResultType } from "@/modules/widgets/EventItem/model/EventItemSlice";

export const setCurrentServiceResult =
    (name: keyof ServiceResultsState) =>
        async (dispatch: AppDispatch, getState: AppGetState) => {
            const state = getState()

            const currentTaskEventType = state.eventTask.current?.eventType
            const isResult = state.eventItemMenu.type === EventItemResultType.RESULT

            if (currentTaskEventType !== name) {
                dispatch(
                    serviceResultsActions.setProp({
                        prop: name,
                    })
                )
            }


        }