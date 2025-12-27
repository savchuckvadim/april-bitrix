
import { BXUser, Placement, PlacementCallCard } from "@workspace/bx";
import { AppDispatch } from "../../model/store";
import { IBXTask, IBXUser } from "@workspace/bitrix/src/domain/interfaces/bitrix.interface";
// import { getInitSale } from "@/entities/EventSale";
// import { initialEventTasks } from "@/entities/EventTask";
// import { getEvTasksFromBxTasks } from "@/entities/EventTask/lib/task-util";
// import { initialTasksFromCurrentTask } from "@/entities/EventTask/model/EventTaskThunk";
// import { EntitiesFromPlacement, getDisplayMode } from "./placement-util";
// import { APP_DISPLAY_MODE } from "@/app/types/app/app-type";
// import { appActions } from "@/app/model/AppSlice";
// import { getAudioRecords } from "@/entities/EventCallingRecord";

// export const getAppPlacement = async (): Promise<{
//     placement: Placement | PlacementCallCard | null;
//     companyPlacement: Placement;
// }> => {
//     const result = {
//         placement: null as Placement | PlacementCallCard | null,
//         companyPlacement: {
//             placement: "COMPANY",
//             options: {
//                 ID: 0,
//             },
//         }  as Placement,
//     };

//     result.placement = __IN_BITRIX__
//         ? ((await bitrixAPI.getPlacement()) as Placement | null)
//         : TESTING_PLACEMENT;

//     return result;
// };

export const initAppTask = (
    dispatch: AppDispatch,
    currentTask: IBXTask | null,
    domain: string,
    userId: number,
    // placement: Placement
): void => {
    // if (!currentTask) {
    //     if (placement.placement.includes("LEAD")) {
    //         dispatch(initialEventTasks(null, userId, null, placement.options?.ID, domain || TESTING_DOMAIN));
    //     } else {
    //         dispatch(initialEventTasks(null, userId, placement.options?.ID, null, domain || TESTING_DOMAIN));
    //     }
    //     // dispatch(taskAPI.endpoints.fetchTasks.initiate(data));
    // } else {
    //     const allTasksFromCurrentTask = [currentTask] as BXTask[];
    //     const resultEventTasks = getEvTasksFromBxTasks(allTasksFromCurrentTask);
    //     dispatch(initialTasksFromCurrentTask(resultEventTasks));

    //     dispatch(getInitSale(null, resultEventTasks));
    // }
};

export const initAppEntities = async (
    dispatch: AppDispatch,
    // entitiesFromPlacement: EntitiesFromPlacement,
    domain: string,
    user: IBXUser,
    // placement: Placement | PlacementCallCard
): Promise<void> => {
    // const currentCompany = entitiesFromPlacement.currentCompany;
    // const currentDeal = entitiesFromPlacement.currentDeal;
    // const companyPlacement = entitiesFromPlacement.companyPlacement;
    // const currentTask = entitiesFromPlacement.currentTask;
    // const currentLead = entitiesFromPlacement.currentLead;
    // // const isDetail = isDetailPlacement(placement)
    // // const isActivity = isActivityPlacement(placement)
    // // const isTask = isTaskPlacement(placement)
    // const displayMode = getDisplayMode(placement);

    // if (displayMode == APP_DISPLAY_MODE.ENTITY_CARD) {
    //     __IN_BITRIX__ && (await bitrixAPI.getFit());
    // }

    // dispatch(
    //     appActions.setAppData({
    //         domain,
    //         user,
    //         placement: companyPlacement.options.ID ? companyPlacement : placement as Placement,
    //         company: currentCompany,
    //         deal: currentDeal,
    //         lead: currentLead,
    //         display: displayMode,
    //         // isDetail,
    //         // isTask,
    //         task: currentTask,
    //     })
    // );
};
