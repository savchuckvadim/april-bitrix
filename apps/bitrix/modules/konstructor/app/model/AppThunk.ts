import type { BXTask, BXUser, Placement, EntitiesFromPlacement } from "@workspace/bx";
import { getAppPlacement, initAppEntities, getEntitiesFromPlacement } from "@workspace/api";
import { bxAPI as bx } from "@workspace/api";
// import { getBxService } from "@workspace/api";
import { portalAPI } from "@workspace/pbx";

import { DEV_CURRENT_USER_ID, TESTING_DOMAIN, TESTING_PLACEMENT, TESTING_USER } from "../consts/app-global";
import { APP_DEP, appActions } from "./AppSlice";
import { AppDispatch, AppGetState } from "./store";
// import { getDepartment } from "@/modules/konstructor/features/Departament";


// import { eventActions } from "@/modules/konstructor/processes/event";
import { ROUTE_EVENT } from "@/modules/konstructor/processes/routes/types/router-type";

import { CustomPlacement } from "@workspace/bx";
// import { setDepartmentMode } from "@/modules/konstructor/features/Departament/model/DepartmentThunk";
// import { preloaderActions } from "@workspace/april";

export const initAppTask = (
  dispatch: AppDispatch,
  currentTask: BXTask | null,
  domain: string,
  userId: number,
  placement: Placement
): void => {
  // if (!currentTask) {
  //   dispatch(initialEventTasks(null, userId, placement.options?.ID, domain || TESTING_DOMAIN));
  //   // dispatch(taskAPI.endpoints.fetchTasks.initiate(data));
  // } else {
  //   const allTasksFromCurrentTask = [currentTask] as BXTask[];
  //   const resultEventTasks = getEvTasksFromBxTasks(allTasksFromCurrentTask);
  //   dispatch(initialTasksFromCurrentTask(resultEventTasks));

  //   // dispatch(getInitSale(null, resultEventTasks));
  // }
};

export const initAppServiceTask = (
  dispatch: AppDispatch,
  currentTask: BXTask | null,
  domain: string,
  userId: number,
  placement: Placement
): void => {


  // if (!currentTask) {

  //   dispatch(initialEventServiceTasks(null, userId, placement.options?.ID, domain || TESTING_DOMAIN));
  //   // dispatch(taskAPI.endpoints.fetchTasks.initiate(data));
  // } else {

  //   const allTasksFromCurrentTask = [currentTask] as BXTask[];
  //   // const resultEventTasks = getEvServiceTasksFromBxTasks(allTasksFromCurrentTask);
  //   dispatch(initialServiceTasksFromCurrentTask(allTasksFromCurrentTask));

  //   // dispatch(getInitSale(null, resultEventTasks));
  // }
};

export const initial = (inBitrix: boolean) => async (dispatch: AppDispatch, getState: AppGetState) => {
  const state = getState();
  const app = state.app;
  const isLoading = app.isLoading
  const __IN_BITRIX__ = inBitrix
  debugger
  // const BX24 = await getBxService()
  /**
   * 
   * TEST
   */
  // const bxResult = __IS_PROD__ && await bxAPI.saleInit(null, null)


  /**
   * 
   */
  if (!isLoading) {
    dispatch(
      appActions.loading({ status: true })
    )

    //**
    // CONFIGURABLE TEST
    //  */
    const testPlacementData = __IN_BITRIX__ && await bx.getPlacement() as Placement | CustomPlacement
    console.log('testPlacementData')
    console.log(testPlacementData)


    if (testPlacementData) {
      if (testPlacementData.placement !== "DEFAULT") {
        __IN_BITRIX__ && (await bx.getFit());

      }
    }

    // console.log('app initial')
    //@ts-ignore
    // console.log(window.BX24)



    const appType = state.app.department;

    const currentRoute = state.router.current;

    const fetchedDdomain = __IN_BITRIX__ ? await bx.getDomain() : 'april-dev.bitrix24.ru';
    let domain = fetchedDdomain ? fetchedDdomain : TESTING_DOMAIN;

    // console.log('domain')
    //@ts-ignore
    // console.log(domain)

    // let companyPlacement = {
    //     placement: 'COMPANY',
    //     options: {
    //         ID: 0
    //     }
    // } as Placement
    // let currentCompany = null
    // let currentDeal = null

    const placementData = await getAppPlacement(inBitrix);
    console.log('getAppPlacement')
    console.log(placementData)

    let placement = placementData.placement || (!__IN_BITRIX__ && TESTING_PLACEMENT);
    let companyPlacement = placementData.companyPlacement as Placement;


    const user = __IN_BITRIX__ ? ((await bx.getCurrentUser()) as BXUser) : TESTING_USER;
    console.log("user");

    console.log(user);
    // dispatch(setDepartmentMode(user));

    console.log("app placement");

    console.log(placement);
    /**
     *
     * FOR CONFIGURABLE ACTIVITY
     */

    //@ts-ignore
    if (placement) {
      //@ts-ignore
      if (placement.options) {
        //@ts-ignore
        if (placement.options.placement) {
          //@ts-ignore
          placement = placement.options;
        }
      }
    }
    console.log('entitiesFromPlacement')
    console.log(placement)
    //@ts-ignore
    const entitiesFromPlacement = (await getEntitiesFromPlacement(placement, domain)) as EntitiesFromPlacement;
    console.log(entitiesFromPlacement)
    // dispatch(getCompanyContacts(entitiesFromPlacement.currentCompany.ID));
    if (entitiesFromPlacement) {
      if (entitiesFromPlacement.currentCompany) {
        const currentTask = entitiesFromPlacement.currentTask;
        const userId = user["ID"] || DEV_CURRENT_USER_ID;

        // currentCompany = entitiesFromPlacement.currentCompany
        // currentDeal = entitiesFromPlacement.currentDeal
        companyPlacement = entitiesFromPlacement.companyPlacement;
        // // const isDetail = isDetailPlacement(placement)
        // // const isActivity = isActivityPlacement(placement)
        // // const isTask = isTaskPlacement(placement)
        // const displayMode = getDisplayMode(placement)

        // if (displayMode == APP_DISPLAY_MODE.ENTITY_CARD) {
        //     __IN_BITRIX__ && await bitrixAPI.getFit()
        // }

        // dispatch(
        //     appActions.
        //         setAppData(
        //             {
        //                 domain,
        //                 user,
        //                 placement: companyPlacement,
        //                 company: currentCompany,
        //                 deal: currentDeal,
        //                 display: displayMode,
        //                 // isDetail,
        //                 // isTask,
        //                 task: currentTask

        //             }
        //         ))
        const appEntities = await initAppEntities(entitiesFromPlacement, domain, user, companyPlacement);
        dispatch(appActions.setAppData(appEntities));

        if (appType === APP_DEP.SALES) {
          initAppTask(dispatch, currentTask, domain, userId, companyPlacement);
        } else if (appType === APP_DEP.SERVICE) {
          initAppServiceTask(dispatch, currentTask, domain, userId, companyPlacement);
        }
        // if (!currentTask) {
        //     const userId = user['ID'] || DEV_CURRENT_USER_ID
        //     const data = {
        //         domain: domain || TESTING_DOMAIN,
        //         userId: userId,
        //         placement: companyPlacement,
        //         // currentTaskId: currentTask?.id

        //     }

        //     // console.log('get tasks data')
        //     // console.log(data)

        //     dispatch(initialEventTasks(
        //         null,
        //         userId,
        //         companyPlacement.options?.ID,
        //         domain || TESTING_DOMAIN

        //     ))
        //     // dispatch(taskAPI.endpoints.fetchTasks.initiate(data));

        // } else {
        //     const allTasksFromCurrentTask = [currentTask] as BXTask[]
        //     const resultEventTasks = getEvTasksFromBxTasks(allTasksFromCurrentTask)
        //     dispatch(
        //         initialTasksFromCurrentTask(
        //             resultEventTasks
        //         ))

        //     // console.log('resultEventTasks')
        //     // console.log(resultEventTasks)
        //     dispatch(
        //         getInitSale(
        //             null, resultEventTasks
        //         ));

        // }
debugger
        // dispatch(getDepartment(domain, user));
        dispatch(appActions.setInitializedSuccess({}));
        dispatch(portalAPI.endpoints.fetchPortal.initiate({ domain }));
        dispatch(
          appActions.loading({ status: false })
        )

      }
    } else {
      dispatch(appActions.setInitializedError({ errorMessage: "Компания не найдена" }));
    }
    debugger
    dispatch(appActions.setInitializedSuccess({}));
    dispatch(
      appActions.loading({ status: false })
    )
  }
};

export const reloadApp = () => async (dispatch: AppDispatch, getState: AppGetState) => {

  // dispatch(
  //   preloaderActions
  //     .setPreloader({ status: true })
  // )

  setTimeout(() => {


    dispatch(
      // initialEventApp()
      appActions.reload()
    )
    // dispatch(
    //   preloaderActions
    //     .setPreloader({ status: false })
    // )

  }, 1000)

}