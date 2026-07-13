import { DEV_CURRENT_USER_ID, TESTING_DOMAIN } from "@/modules/app/consts/app-global";
import { AppDispatch, AppGetState } from "@/modules/app/model/store";

import { PresentationStateCount } from "./PresSlice";
import { eventTaskActions } from "@/modules/entities/EventTask";

import { API_METHOD, hook } from "@workspace/api";
import type { BXDeal, BXTask, Placement, PlacementCallCard } from "@workspace/bx";

export const getInitPresentation =
  () =>
    // bxCompany: BXCompany,

    async (dispatch: AppDispatch, getState: AppGetState) => {
      // dispatch(setPreloader(true))
      const state = getState();
      const app = state.app;
      const tasks = state.eventTask.tasks as Array<BXTask>;
      let companyId = null;
      let company = null;
      if (app.bitrix.placement && app.bitrix.placement.options) {
        //   const callPlacement = app.bitrix.placement as PlacementCallCard;
        //   companyId = callPlacement.options.CRM_BINDINGS[0].ENTITY_ID;
        const callPlacement = app.bitrix.placement as Placement;
        companyId = callPlacement.options.ID;
      }

      if (app.bitrix.company && app.bitrix.company.ID) {
        companyId = app.bitrix.company.ID;
        company = app.bitrix.company;
      }

      // console.log('getInitPresentation')
      // console.log('company')
      // console.log(company)

      const domain = app.domain || TESTING_DOMAIN; //state.app.domain
      const currentUser = app.bitrix.user?.ID || DEV_CURRENT_USER_ID;
      const getPortaldata = {
        domain: domain || TESTING_DOMAIN,
        userId: currentUser,
        company,
      };
      if (tasks) {
        if (tasks.length) {
          for (let index = 0; index < tasks.length; index++) {
            const currentTask = tasks[index];
            const data = {
              currentTask,
              domain,
            };

            const presTaskData = (await hook.service(
              "pres/count",
              API_METHOD.POST,
              "presentation",
              data
            )) as {
              counts: PresentationStateCount;
              deal: BXDeal | null;
            } | null;

            if (presTaskData) {
              dispatch(
                eventTaskActions.setPresData({
                  taskId: Number(currentTask.id),
                  presData: presTaskData.counts,
                  dealBase: presTaskData.deal,
                })
              );
            }

            const taskSessionInitData = {
              domain,
              currentTask,
            };

            // const taskSessionInit = await hookAPI
            //     .service(
            //         'full/init',
            //         API_METHOD.POST,
            //         'message',
            //         taskSessionInitData
            //     ) as
            //     'success' | null

            //

            // const taskSessionGetData = {
            //     domain,
            //     currentTaskId: currentTask.id
            // }

            // const taskSession = await hookAPI
            //     .service(
            //         'full/session',
            //         API_METHOD.POST,
            //         'result',
            //         taskSessionGetData
            //     ) as
            //     'success' | null

            //
          }
        }
      }

      // const portal = await onlineGeneralAPI
      //     .service(
      //         'front/portal',
      //         API_METHOD.POST,
      //         'portal',
      //         getPortaldata
      //     ) as Portal | null

      // console.log('portal')
      // console.log(portal)
      let currentPresentCategoryBtxId = null;
      // if (portal.bitrixDeal) {
      //     if (portal.bitrixDeal.categories) {
      //         portal.bitrixDeal.categories.forEach(cat => {
      //             if (cat.code === 'sales_presentation') {
      //                 currentPresentCategoryBtxId = cat.bitrixId

      //             }

      //         })
      //     }
      // }

      // if (currentPresentCategoryBtxId && companyId) {
      //     const data = {
      //         filter: {
      //             'COMPANY_ID': companyId,
      //             'CATEGORY_ID': currentPresentCategoryBtxId,
      //             'RESPONSIBLE_ID': 1,
      //             '!=STAGE_ID': [`C${currentPresentCategoryBtxId}:LOSE`, `C${currentPresentCategoryBtxId}:APOLOGY`]
      //         }
      //     }

      //     const method = 'crm.deal.list'
      //     let presDeals = await bitrixAPI.getMethod(method, data, domain)

      //
      //     console.log('presDeals')
      //     console.log(presDeals)
      // }
    };
