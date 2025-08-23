import type {
  BXTask,
  BXUser,
  Placement,
  EntitiesFromPlacement,
} from "@workspace/bx";
import {
  getAppPlacement,
  initAppEntities,
  getEntitiesFromPlacement,
} from "@workspace/api";
import { bxAPI as bx } from "@workspace/api";
// import { getBxService } from "@workspace/api";
import { portalAPI } from "@workspace/pbx";

import {
  DEV_CURRENT_USER_ID,
  TESTING_DOMAIN,
  TESTING_PLACEMENT,
  TESTING_USER,
} from "../consts/app-global";
import { APP_DEP, appActions } from "./AppSlice";
import { AppDispatch, AppGetState } from "./store";
// import { getDepartment } from "@/modules/konstructor/features/Departament";

// import { eventActions } from "@/modules/konstructor/processes/event";
import { ROUTE_EVENT } from "@/modules/konstructor/processes/routes/types/router-type";

import { CustomPlacement, DISPLAY_MODE } from "@workspace/bx";
import { getDisplayMode } from "@workspace/api/";
// import { setDepartmentMode } from "@/modules/konstructor/features/Departament/model/DepartmentThunk";
// import { preloaderActions } from "@workspace/april";

export const initial =
  (inBitrix: boolean) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    // if (typeof window !== 'undefined') {

    const state = getState();
    const app = state.app;
    const isLoading = app.isLoading;
    const __IN_BITRIX__ = inBitrix;

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
      dispatch(appActions.loading({ status: true }));

      //**
      // CONFIGURABLE TEST
      //  */
      const testPlacementData =
        __IN_BITRIX__ &&
        ((await bx.getPlacement()) as Placement | CustomPlacement);
      console.log("testPlacementData");
      console.log(testPlacementData);

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

      const fetchedDdomain = __IN_BITRIX__
        ? await bx.getDomain()
        : "april-dev.bitrix24.ru";
      let domain = fetchedDdomain ? fetchedDdomain : TESTING_DOMAIN;
      dispatch(portalAPI.endpoints.fetchPortal.initiate({ domain }));

      // console.log('domain')
      //@ts-ignore
      // console.log(domain)

      // let companyPlacement = {
      //     placement: 'COMPANY',
      //     options: {
      //         ID: 0
      //     }
      // } as Placement
      let currentCompany = null;
      let currentDeal = null;

      const placementData = await getAppPlacement(inBitrix);
      console.log("getAppPlacement");
      console.log(placementData);

      let placement =
        placementData.placement || (!__IN_BITRIX__ && TESTING_PLACEMENT);
      let companyPlacement = placementData.companyPlacement as Placement;

      const user = __IN_BITRIX__
        ? ((await bx.getCurrentUser()) as BXUser)
        : TESTING_USER;
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
      console.log("entitiesFromPlacement");
      console.log(placement);
      //@ts-ignore
      const entitiesFromPlacement = (await getEntitiesFromPlacement(
        placement,
        domain,
      )) as EntitiesFromPlacement;
      console.log(entitiesFromPlacement);
      // dispatch(getCompanyContacts(entitiesFromPlacement.currentCompany.ID));
      if (entitiesFromPlacement) {
        if (entitiesFromPlacement.currentCompany) {
          const currentTask = entitiesFromPlacement.currentTask;
          const userId = user["ID"] || DEV_CURRENT_USER_ID;

          currentCompany = entitiesFromPlacement.currentCompany;
          currentDeal = entitiesFromPlacement.currentDeal;
          companyPlacement = entitiesFromPlacement.companyPlacement;
          // // const isDetail = isDetailPlacement(placement)
          // // const isActivity = isActivityPlacement(placement)
          // // const isTask = isTaskPlacement(placement)
          const displayMode = placement
            ? getDisplayMode(placement)
            : DISPLAY_MODE.ENTITY_CARD;

          // if (displayMode == APP_DISPLAY_MODE.ENTITY_CARD) {
          //     __IN_BITRIX__ && await bitrixAPI.getFit()
          // }

          dispatch(
            appActions.setAppData({
              domain,
              user,
              placement: companyPlacement,
              company: currentCompany,
              deal: currentDeal,
              display: displayMode,
              // isDetail,
              // isTask,
              task: currentTask,
            }),
          );
          const appEntities = await initAppEntities(
            entitiesFromPlacement,
            domain,
            user,
            companyPlacement,
          );
          dispatch(appActions.setAppData(appEntities));

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

          // dispatch(getDepartment(domain, user));
          dispatch(appActions.setInitializedSuccess({}));
          dispatch(appActions.loading({ status: false }));
        }
      } else {
        dispatch(
          appActions.setInitializedError({
            errorMessage: "Компания не найдена",
          }),
        );
      }

      dispatch(appActions.setInitializedSuccess({}));
      dispatch(appActions.loading({ status: false }));
    }
    // }
  };

export const reloadApp =
  () => async (dispatch: AppDispatch, getState: AppGetState) => {
    // dispatch(
    //   preloaderActions
    //     .setPreloader({ status: true })
    // )

    setTimeout(() => {
      dispatch(
        // initialEventApp()
        appActions.reload(),
      );
      // dispatch(
      //   preloaderActions
      //     .setPreloader({ status: false })
      // )
    }, 1000);
  };
