import { DEV_CURRENT_USER_ID, TESTING_DOMAIN } from "@/modules/app/consts/app-global";
import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { eventSaleActions } from "./EventSaleSlice";
import { Portal } from "@/modules/app/types/portal/portal-type";
import { EventTask } from "@/modules/entities/EventTask/types/event-task-type";
import { API_METHOD, hook } from "@workspace/api";
import { BXTask } from "@workspace/bx";

export const getInitSale =
  (actionPortal: Portal | null, actionTasks: Array<EventTask> | null) =>
  async (dispatch: AppDispatch, getState: AppGetState) => {
    //собирает сделки для связи с продажей
    //если задачи нет - то и сделок не будет - пусть сначала создадут задачу
    // dispatch(setPreloader(true))
    const state = getState();
    const app = state.app;
    let tasks = actionTasks || (state.eventTask.tasks as Array<BXTask>);
    const statePortal = state.portal.portal;
    let portal = statePortal;
    // if(actionPortal){
    //     portal = actionPortal
    // }
    // console.log('getInitSale tasks actionTasks')
    // console.log(tasks)
    // if(actionTasks && actionTasks.length){
    //     tasks = actionTasks
    // }

    if (tasks) {
      if (tasks.length) {
        const isTasksFetched = state.eventTask.isFetched as boolean;
        const isPortalFetched = state.eventTask.isFetched as boolean;

        if (isTasksFetched && isPortalFetched) {
        }
        let currentBtxCompany = null;
        let companyId = null;

        if (app.bitrix.placement && app.bitrix.placement.options) {
          //@ts-ignore
          companyId = app.bitrix.placement.options.ID;
        }

        if (app.bitrix.company && app.bitrix.company.ID) {
          currentBtxCompany = app.bitrix.company;
          companyId = app.bitrix.company.ID;
        }

        const domain = app.domain || TESTING_DOMAIN; //state.app.domain
        const currentUser = app.bitrix.user?.ID || DEV_CURRENT_USER_ID;

        const getPortaldata = {
          domain: domain || TESTING_DOMAIN,
          userId: currentUser,
        };
        const saleTaskDeals = {} as { [key: number]: any };
        let isNeedNewTaskInit = true;

        if (tasks) {
          //инициализация сессии из существующего списка задач
          if (tasks.length) {
            isNeedNewTaskInit = false;
            for (let index = 0; index < tasks.length; index++) {
              if (index < 10) {
                const currentTask = tasks[index];
                const data = {
                  currentTask,
                  domain,
                };

                // const allTaskDeals = (await hook.service(
                //   "full/deals",
                //   API_METHOD.POST,
                //   "deals",
                //   data
                // )) as any;

                // if (allTaskDeals) {
                //   saleTaskDeals[currentTask.id] = allTaskDeals;
                // }
              }
            }
          }
        }

        if (isNeedNewTaskInit) {
          const newTaskIata = {
            userId: currentUser,
            domain,
            company: currentBtxCompany,
            from: "company",
            baseDealId: null as null | number | string,
          };

          const allTaskDeals = (await hook.service(
            "full/newTask/init",
            API_METHOD.POST,
            "deals",
            newTaskIata
          )) as any;

          if (allTaskDeals) {
            saleTaskDeals[0] = allTaskDeals;
          }
        }

        let currentPresentCategoryBtxId = null;
        let currentPresentListBtxId = null;
        // let currentPortalList = null as PBXList | null
        // let currentPortalDeal = null

        // if (portal.bitrixDeal) {
        //     if (portal.bitrixDeal.categories) {
        //         portal.bitrixDeal.categories.forEach(cat => {
        //             if (cat.code === 'sales_presentation') {
        //                 currentPortalDeal = portal.bitrixDeal
        //                 currentPresentCategoryBtxId = cat.bitrixId

        //             }

        //         })
        //     }
        // }

        // if (portal.bitrixDeal) {
        //     if (portal.bitrixLists) {
        //         portal.bitrixLists.forEach(list => {
        //             if (list.type === 'presentation') {
        //                 currentPortalList = list as PBXList

        //             }

        //         })
        //     }
        // }

        // if (currentPortalList) {
        //     currentPresentListBtxId = currentPortalList.bitrixId

        //     if (currentPortalList.bitrixfields && currentPortalList.bitrixfields.length) {

        //         const getPresentationListItemsData = {

        //         } as {
        //             [key: string]: any
        //         }
        //         const fields = currentPortalList.bitrixfields
        //         fields.forEach(field => {
        //             if (field.code == 'sales_presentation_pres_responsible') {
        //                 getPresentationListItemsData[field.bitrixId] = currentUser

        //             }
        //             // else if (field.code == 'ales_presentation_pres_crm_base_deal') {
        //             //     getPresentationListItemsData[field.bitrixId] = currentUser

        //             // }
        //         })

        //     }
        // }

        dispatch(
          eventSaleActions.setPortalSale({
            // portalDeal: currentPortalDeal,
            // portalList: currentPortalList,
            saleTaskDeals,
          })
        );
      }
    }


  };

export const getSalePresentationsList =
  () =>
  // bxCompany: BXCompany,

  async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    const currentTask = state.eventTask.current as BXTask;

    dispatch(
      eventSaleActions.setCurrentPresList({
        taskId: Number(currentTask.id),
      })
    );

    // dispatch(
    //     eventSaleActions.setProp({
    //         prop: 'isCurrentFetched',
    //         value: true
    //     })
    // )

    // let presDeals = await bitrixAPI.getMethod(method, data, domain)
  };
