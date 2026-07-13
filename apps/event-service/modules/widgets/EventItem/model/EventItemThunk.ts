import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { eventTaskActions } from "@/modules/entities/EventTask";
import { EventItemResultType, eventItemActions } from "./EventItemSlice";
import { EventTask } from "@/modules/entities/EventTask/types/event-task-type";
import { eventActions } from "@/modules/processes/event";
import { eventPresentationActions } from "@/modules/entities/EventPresentation";
import { PresentationProp } from "@/modules/entities/EventPresentation/model/PresSlice";
import { eventSaleActions } from "@/modules/entities/EventSale";
import { preloaderActions } from "@/modules/shared/Preloader";
import { ROUTE_EVENT } from "@/modules/processes/routes/types/router-type";
import { setCurrentReportContact } from "@/modules/entities/EventContact/model/EventContactThunk";

import { API_METHOD, hook as hookAPI } from "@workspace/api";
import { APP_DEP } from "@/modules/app/model/AppSlice";
import { EV_SERVICE_PLAN_CODE } from "@/modules/entities/EventPlan/type/event-plan-service-type";
import { serviceResultsActions, ServiceResultsState } from "@/modules/entities/ServiceResults/model/ServiceResultsSlice";
import { communicationInit } from "@/modules/features/Communication/model/EventCommunicationThunk";
import { eventCommunicationActions } from "@/modules/features/Communication";
import { fetchSSCheckbox, isServiceSignalTask, serviceSignalActions } from "@/modules/features/ServiceSiganal";

export const getResultMenu =
  (type: EventItemResultType, task: EventTask | null) => async (dispatch: AppDispatch, getState: AppGetState) => {
    dispatch(preloaderActions.setPreloader({ status: true }));
    const state = getState();
    const app = state.app;
    const domain = app.domain;
    const depSettings = app.department;
    //@ts-ignore
    // const companyId = app.bitrix.placement.options.ID;
    // const userId = app.bitrix.user.ID;

    // if (task && task.id) {
    //   const rqformData = {
    //     domain,
    //     companyId,
    //     isFromTask: true,
    //     taskId: task.id,
    //     userId,
    //   };

    //   /**
    //    * ATTENTION
    //    */
    //   hookAPI.service("full/supply", API_METHOD.POST, "deals", rqformData) as any;
    // }
    dispatch(
      eventTaskActions.setCurrentTask({
        task,
      })
    );
    dispatch(
      communicationInit(task)
    )
    dispatch(setCurrentReportContact(task));
    dispatch(
      eventItemActions.setEventItemMenuStatus({
        status: true,
        menuType: type,
      })
    );

    dispatch(
      eventActions.setCurrentPage({
        page: ROUTE_EVENT.ITEM,
      })
    );

    //если текущее событие презентация и оно результативное
    if (task) {
      if (isServiceSignalTask(domain, task.groupId)) { // если текущая задача - сервисный сигнал
   
        dispatch(
          fetchSSCheckbox(task)
        )

      }




      if (depSettings == APP_DEP.SALES) {
        const isCrrentReportEventPres = task.eventType === EV_SERVICE_PLAN_CODE.PRESENTATION;

        if (isCrrentReportEventPres && type === EventItemResultType.RESULT) {
          dispatch(
            eventPresentationActions.setPresentationProp({
              name: PresentationProp.IS_PRESENTATION_DONE,
              value: true,
            })
          );
        }
      } else {
        const serviceResults = state.serviceResults
        const initialStateKeys = Object.keys(serviceResults) as Array<EV_SERVICE_PLAN_CODE>;

        const isServiceResultKey = (
          eventType: EV_SERVICE_PLAN_CODE
        ): eventType is keyof ServiceResultsState => {
          return initialStateKeys.includes(eventType);
        };

        if (type === EventItemResultType.RESULT) {

          const isServisResult = isServiceResultKey(task.eventType)

          if (isServisResult) {
            const serviceType = task.eventType as keyof ServiceResultsState

            dispatch(
              serviceResultsActions.setInit(
                {
                  prop: serviceType
                }
              )
            )
          }
        } else {
          dispatch(
            serviceResultsActions.clean()

          )

          dispatch(
            eventCommunicationActions.clean()

          )

          dispatch(
            serviceSignalActions.clean()
        
          )
        }

      }
    }

    dispatch(preloaderActions.setPreloader({ status: false }));
  };

export const cancelResultMenu = () => async (dispatch: AppDispatch, getState: AppGetState) => {
  dispatch(
    serviceResultsActions.clean()
  )
  dispatch(
    eventSaleActions.setCurrentPresList({
      taskId: null,
    })
  );

  dispatch(eventTaskActions.setCurrentTask({ task: null }));
  dispatch(
    eventItemActions.setEventItemMenuStatus({
      status: false,
      menuType: null,
    })
  );
  dispatch(
    eventActions.setCurrentPage({
      page: ROUTE_EVENT.LIST,
    })
  );
  dispatch(
    eventCommunicationActions.clean()

  )

  dispatch(
    serviceSignalActions.clean()

  )
};

export const finishResultMenu = () => async (dispatch: AppDispatch, getState: AppGetState) => {
  dispatch(
    eventActions.setCurrentPage({
      page: ROUTE_EVENT.FINISH,
    })
  );
  dispatch(
    eventSaleActions.setCurrentPresList({
      taskId: null,
    })
  );

  dispatch(eventTaskActions.setCurrentTask({ task: null }));
  dispatch(
    eventItemActions.setEventItemMenuStatus({
      status: false,
      menuType: null,
    })
  );
  dispatch(preloaderActions.setPreloader({ status: false }));

  dispatch(
    eventCommunicationActions.clean()

  )
  dispatch(
    serviceSignalActions.clean()

  )

};
