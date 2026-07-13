import { useAppSelector } from "@/modules/app/lib/hooks/redux";
import { getIsTaskSS } from "../lib/service-task-selector";

export const useTask = () => {

    const currentTask = useAppSelector(state => state.eventTask.current)
    const isSS = useAppSelector(getIsTaskSS)

    return {
        currentTask,

        isSS,

    }
}