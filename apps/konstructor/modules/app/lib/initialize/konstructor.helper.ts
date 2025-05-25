import { getComplects } from "@/modules/entities/complect"
import { getInfoBlocks } from "@/modules/entities/infoblock"
export const getInitializeData = async (): Promise<boolean> => {
    // complects
    // infoblocks
    // prices
    // supplies
    // regions
    // consalting
    // legalTech
    // star

    const complects = await getComplects()
    const infoblocks = await getInfoBlocks()
    debugger
   
    return complects ? true : false
}