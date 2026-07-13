import { listenerMiddleware } from "@/modules/app/model/store";
import { getInitSale } from "@/modules/entities/EventSale";
import { eventTaskActions } from "./EventTaskSlice";

// listenerMiddleware.startListening({
//     actionCreator: eventTaskActions.setFetchedTasks,
//     effect: async (action, listenerApi) => {
        
//         const { dispatch } = listenerApi;
//         // dispatch(initialEventTasks(action.payload.tasks));
//         dispatch(getInitSale());
//         // dispatch(updateLoggingForPortal(action.payload));
//     },
// });
