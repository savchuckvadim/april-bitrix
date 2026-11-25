import { useAppDispatch, useAppSelector } from "@/modules/app";
import { mergedReportActions } from "../model/MergedReportSlice";

/**
 * Выбор объединённого отчёта. selectedUsers — только чтение: сотрудников
 * выбирает главный фильтр отчёта, непустой он бывает лишь на публичной
 * странице (из снимка ссылки). selectedActions — показатели таблицы,
 * пусто = все.
 */
export const useMergedReport = () => {
    const dispatch = useAppDispatch();
    const selectedUsers = useAppSelector((state) => state.mergedReport.selectedUsers);
    const selectedActions = useAppSelector((state) => state.mergedReport.selectedActions);

    const setSelectedActions = (actions: string[]) => {
        dispatch(mergedReportActions.setSelectedActions(actions));
    }

    return { selectedUsers, selectedActions, setSelectedActions };
}
