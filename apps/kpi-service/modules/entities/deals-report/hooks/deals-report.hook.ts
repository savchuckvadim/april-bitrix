import { useAppDispatch, useAppSelector } from "@/modules/app";

export const useDealsReport = () => {
    const dispatch = useAppDispatch();
    const dealsReport = useAppSelector((state) => state.dealsReport);
    return { ...dealsReport }
}
