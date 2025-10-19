import { RootState } from "../../model/store"



export const getIsLeadContext = (state: RootState): boolean => {
    return state.app.bitrix.placement?.placement?.includes("LEAD") || state.app.bitrix.lead ? true : false
}
