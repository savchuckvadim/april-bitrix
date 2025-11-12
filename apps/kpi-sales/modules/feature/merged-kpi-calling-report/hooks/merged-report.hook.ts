import { useAppDispatch, useAppSelector } from "@/modules/app";
import { mergedReportActions } from "../model/MergedReportSlice";

export const useMergedReport = () => {
    const dispatch = useAppDispatch();
    const selectedUsers = useAppSelector((state) => state.mergedReport.selectedUsers);
    const selectedActions = useAppSelector((state) => state.mergedReport.selectedActions);

    const setSelectedUsers = (users: number[]) => {
        dispatch(mergedReportActions.setSelectedUsers(users));
    }
    const setSelectedActions = (actions: string[]) => {
        dispatch(mergedReportActions.setSelectedActions(actions));
    }

    return { selectedUsers, selectedActions, setSelectedUsers, setSelectedActions };
}
