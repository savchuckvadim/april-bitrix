import { getComplects } from "@/modules/entities/complect"
import { AppDispatch } from "../../model/store"
import { fetchInfoblocks } from "@/modules/entities/infoblock/model/InfoblockThunk"

export const getInitializeData = async (dispatch: AppDispatch): Promise<boolean> => {
    // complects
    // infoblocks
    // prices
    // supplies
    // regions
    // consalting
    // legalTech
    // star

        const complects = await getComplects()
    // const infoblocks = await getInfoBlocks()
    dispatch(fetchInfoblocks())
    
   
    return complects ? true : false
}