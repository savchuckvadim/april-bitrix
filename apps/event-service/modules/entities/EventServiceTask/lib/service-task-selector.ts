import { RootState } from "@/modules/app/model/store";
import { getIsTaskServiceSignal } from "./service-task-util";

export const getIsTaskSS = (state: RootState): boolean => {
    const currentTask = state.eventTask.current
    if (!currentTask) return false
    const isSS = getIsTaskServiceSignal(currentTask, state.app.domain)
    return isSS
}