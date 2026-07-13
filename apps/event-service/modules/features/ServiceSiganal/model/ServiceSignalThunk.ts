import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { EventTask } from "@/modules/entities/EventTask/types/event-task-type";
import { Bitrix } from '@workspace/bitrix';
import { extractSSInstructionText, extractSSReportUrl, getCheckListsFromBX, getCompletedCheckList, isServiceSignalTask, SS_SECTION_TITLE } from "../lib/event-ss-util";
import { EV_SS_BXCHECKBOX, EV_SS_CheckList } from "../type/event-ss-type";
import { serviceSignalActions } from "./ServiceSignalSlice";
import { hookAPI } from "@workspace/api/src/services/april-hook-api";
import { API_METHOD } from "@workspace/api";


export const fetchSSCheckbox =
  (task: EventTask | null) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
      const state = getState();
      const domain = state.app.domain

      if (task) {
        const description = task.description


        const isSS = isServiceSignalTask(domain, task.groupId)
        if (isSS) {
          const signalStateisLoading = state.serviceSignal.isLoading
          if (!signalStateisLoading) {

            dispatch(
              serviceSignalActions.setLoadingStatus({ status: true })
            )

            const reportURL = ''
            const instructionText = extractSSInstructionText(description, SS_SECTION_TITLE.INSTRUCTION)
            const motivationText = extractSSInstructionText(description, SS_SECTION_TITLE.CLIENT_INFO_MOTIVATION)


            const checkboxes = await Bitrix.getService().api.call(
              'task.checklistitem.getlist',
              [task.id],
            ) as EV_SS_BXCHECKBOX[] | null
            let checkLists = null
            if (checkboxes) {
              checkLists = getCheckListsFromBX(checkboxes)
            }
            dispatch(
              serviceSignalActions.setFetchedCheckBoxes({
                reportURL,
                instructionText,
                motivationText,
                checkLists
              })
            )

            dispatch(
              serviceSignalActions.setLoadingStatus({ status: false })
            )
          }
        }

      }
    }



export const updateSSCheckbox =
  (taskId: number, checkboxId: number, newValue: boolean) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
      const state = getState();
      const domain = state.app.domain
      const bxVAlue = newValue ? 'Y' : 'N'

      dispatch(
        serviceSignalActions.check({
          checkboxId,
          newValue
        })
      )

      // const result = await bitrixAPI.getMethod(
      //   'task.checklistitem.update',
      //   [taskId, checkboxId, { IS_COMPLETE: bxVAlue }],
      //   domain

      // )
      const method = 'task.checklistitem.update'
      const data = [taskId, checkboxId, { IS_COMPLETE: bxVAlue }]
      const bxReqHookData = {
        domain,
        method,
        bxData: data,
      };
      void (await hookAPI.service("bitrix/method", API_METHOD.POST, "result", bxReqHookData));





    }


export const getDoneAllcheckBoxes =
  (checkList: EV_SS_CheckList) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {

      const completed = getCompletedCheckList(checkList)
      const total = checkList.checkboxes.length

      const isNeedTodone = total - completed !== 0

      if (isNeedTodone) {
        const currentTask = getState().eventTask.current
        if (currentTask) {
          for (let i = 0; i <= checkList.checkboxes.length; i++) {
            if (checkList.checkboxes[i] && checkList.checkboxes[i].ID && checkList.checkboxes[i].IS_COMPLETE !== 'Y') {
              dispatch(
                updateSSCheckbox(currentTask.id, checkList.checkboxes[i].ID, true)
              )
              await delay(500); // Ожидание 

            }

          }
        }


      }

    }

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}