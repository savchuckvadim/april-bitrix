import { useAppDispatch, useAppSelector } from "@/modules/app/lib/hooks/redux"
import { BX_TASK_MARK } from "@workspace/bx/src/type/bitrix-type"
import { updateTaskMark } from "../model/EventServiceTaskThunk"
import { useTask } from "./event-service-task-hook"

export const useTaskMark = () => {
    const dispatch = useAppDispatch()
    const { currentTask } = useTask()

    const currentMark = currentTask?.mark || null as BX_TASK_MARK
    const isMarkLoading = useAppSelector(state => state.eventServiceTask.isMarkLoading)
    return {
        currentTask,
        currentMark,
        isMarkLoading,
        updateTaskMark: () => dispatch(updateTaskMark())
    }
}
