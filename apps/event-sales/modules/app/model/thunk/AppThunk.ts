import {
    DEV_CURRENT_USER_ID,
    TESTING_COMPANY_ID,
    TESTING_DOMAIN,
    TESTING_PLACEMENT,
    TESTING_USER,
} from "../../consts/app-global";


import { appActions } from "../slice/AppSlice";

// import { getDepartment } from "@/features/Departament";

import {
    EntitiesFromPlacement,
    getEntitiesFromPlacement,
} from "../../lib/utills/placement-util";

// import { getCompanyContacts } from "@/entities/EventContact/model/EventContactThunk";

// import { setDepartmentMode } from "@/features/Departament/model/DepartmentThunk";
import { initAppEntities, initAppTask } from "../../lib/utills/app-setup-util";
// import { preloaderActions } from "@/shared/Preloader";
// import { eventActions } from "@/processes/event";
// import { ROUTE_EVENT } from "@/processes/routes/types/router-type";
import { portalAPI } from "@workspace/pbx";
import { AppDispatch, AppGetState } from "../store";
// import { startListeners } from "./listeners";
// import { getLeadAudioRecords } from "@/entities/EventCallingRecord/model/EventCallingRecordThunk";

import { Bitrix } from '@workspace/bitrix';

import { Placement } from "@workspace/bx";
import { IBXTask } from "@workspace/bitrix/src/domain/interfaces/bitrix.interface";
import { addEntityActivity } from "@/modules/features/activity";

export const initial = () => async (dispatch: AppDispatch, getState: AppGetState) => {
    // startListeners()
    // __IN_BITRIX__ && (await bitrixAPI.getFit());



    const state = getState();
    const isLoading = state.app.isLoading;
    console.log('app init thunk')

    if (!isLoading) {
        console.log('app initial')
        const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER);
        await bitrix.api.getFit();
        const bitrixAuthData = bitrix.api.getInitializedData()
        const inBitrix = bitrixAuthData.inFrame
        const domain = bitrixAuthData.domain
        const user = bitrixAuthData.user
        const placementData = bitrix.api.getPlacement() || TESTING_PLACEMENT as Placement

        // const test = await bitrix.deal.getFieldsList({})
        //
        const activity = await addEntityActivity(TESTING_COMPANY_ID.toString());

        dispatch(appActions.isLoading({ status: true }))


        // const fetchedDdomain = __IN_BITRIX__ ? await bitrixAPI.getDomain() : null;
        // let domain = fetchedDdomain ? fetchedDdomain : TESTING_DOMAIN;


        // const placementData = await getAppPlacement();
        let placement = placementData.placement;

        // let companyPlacement = placementData.companyPlacement as Placement;

        // const user = __IN_BITRIX__ ? ((await bitrixAPI.getCurrentUser()) as BXUser) : TESTING_USER;

        // dispatch(setDepartmentMode(user, domain));
        //TODO: setDepartmentMode


        // if (placement?.options?.placement) {

        //     placement = placement.options as Placement;
        // }

        // const entitiesFromPlacement = (await getEntitiesFromPlacement(
        //     placement,
        //     domain
        // )) as EntitiesFromPlacement;




        // if (entitiesFromPlacement) {
        // if (entitiesFromPlacement.currentCompany) {
        //     // dispatch(getCompanyContacts(entitiesFromPlacement.currentCompany.ID));
        //     //TODO: getCompanyContacts app listener
        //     const currentTask = entitiesFromPlacement.currentTask as IBXTask;
        //     const userId = user["ID"] || DEV_CURRENT_USER_ID;

        //     // companyPlacement = entitiesFromPlacement.companyPlacement;

        //     initAppEntities(
        //         dispatch,
        //         //TODO: entitiesFromPlacement
        //         //  entitiesFromPlacement,
        //         domain, user,
        //         // companyPlacement
        //     );
        //     initAppTask(dispatch, currentTask, domain, Number(userId),
        //         // companyPlacement
        //     );



        //     // dispatch(getDepartment(domain, user));
        //     dispatch(appActions.setInitializedSuccess({}));
        //     dispatch(portalAPI.endpoints.fetchPortal.initiate({ domain }));
        // } else if (entitiesFromPlacement.currentLead) { //lead context
        //     const userId = user["ID"] || DEV_CURRENT_USER_ID;

        //     // dispatch(getLeadAudioRecords(entitiesFromPlacement.currentLead.ID, domain))
        //     //TODO: getLeadAudioRecords app listener

        //     initAppEntities(
        //         dispatch,
        //         //TODO: entitiesFromPlacement
        //         //  entitiesFromPlacement,
        //         domain, user,
        //         // placement as Placement
        //     );
        //     initAppTask(dispatch, null, domain, Number(userId),
        //         // placement as Placement
        //     );
        //     // dispatch(getDepartment(domain, user));
        //     dispatch(appActions.setInitializedSuccess({}));
        //     dispatch(portalAPI.endpoints.fetchPortal.initiate({ domain }));
        // }
        dispatch(appActions.setInitializedSuccess({}));
        // } else {
        //     dispatch(appActions.setInitializedError({ errorMessage: "Компания не найдена" }));
        // }
        dispatch(appActions.isLoading({ status: false }))
    }
};


export const reloadApp = () => async (dispatch: AppDispatch, getState: AppGetState) => {

    // dispatch(
    //     preloaderActions
    //         .setPreloader({ status: true })
    // )

    // setTimeout(() => {

    //     dispatch(eventActions.setCurrentPage(
    //         { page: ROUTE_EVENT.LIST }
    //     ))
    //     dispatch(
    //         // initialEventApp()
    //         appActions.reload()
    //     )
    //     dispatch(
    //         preloaderActions
    //             .setPreloader({ status: false })
    //     )

    // }, 3200)

}
