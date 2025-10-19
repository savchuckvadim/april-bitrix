import { RootState } from "@/modules/app/"


export const getIsLeadContext = (state: RootState): boolean => {
    return state.app.bitrix.placement?.placement?.includes("LEAD") || state.app.bitrix.lead ? true : false
}
