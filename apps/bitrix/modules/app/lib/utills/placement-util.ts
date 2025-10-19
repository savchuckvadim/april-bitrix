import { BXCompany, BXDeal, BXLead, BXTask, Placement, PlacementCallCard } from "@workspace/bx"
import { APP_DISPLAY_MODE } from "../../types/app/app-type"
import { IBXTask } from "@workspace/bitrix/src/domain/interfaces/bitrix.interface";



export const getDisplayMode = (placement: Placement | PlacementCallCard): APP_DISPLAY_MODE => {

    let result = APP_DISPLAY_MODE.PUBLIC
    if (placement.placement) {

        const currentEntityPlacementType = placement.placement


        if (currentEntityPlacementType.includes("DETAIL")) {
            result = APP_DISPLAY_MODE.ENTITY_CARD

        }
        if (currentEntityPlacementType.includes("TASK")) {
            result = APP_DISPLAY_MODE.TASK

        }

        if (currentEntityPlacementType.includes("ACTIVITY")) {
            result = APP_DISPLAY_MODE.TIMELINE

        }

        if (currentEntityPlacementType.includes("CALL_CARD")) {
            result = APP_DISPLAY_MODE.CALL_CARD

        }

    }
    // console.log('APP_DISPLAY_MODE')
    // console.log(result)
    return result
}




export type EntitiesFromPlacement = {
    companyPlacement: Placement
    currentCompany: BXCompany | null
    currentDeal: BXDeal | null
    currentTask: IBXTask | null
    currentLead: BXLead | null

}
export const getEntitiesFromPlacement = async (placement: Placement | PlacementCallCard, domain: string): Promise<EntitiesFromPlacement> => {

    let companyPlacement = {
        placement: 'CRM_COMPANY_DETAIL_TAB',
        options: {
            ID: 0
        }
    } as Placement


    const result = {
        companyPlacement,
        currentCompany: null as null | BXCompany,
        currentDeal: null as null | BXDeal,
        currentTask: null as null | BXTask,
        currentLead: null as null | BXLead
    } as EntitiesFromPlacement
    try {


        // placement = placement as Placement
        // if (placement.placement && placement.options) {
        //     const currentEntityPlacementType = placement.placement
        //     if (currentEntityPlacementType.includes("DEAL")) {
        //         // console.log('in deal')
        //         const currentEntities = await bitrixAPI
        //             .getDealAndCompany(placement.options.ID, null, domain)

        //         result.currentCompany = currentEntities.company
        //         result.currentDeal = currentEntities.deal
        //         result.companyPlacement.options.ID = result.currentCompany.ID

        //     } else if (currentEntityPlacementType.includes("COMPANY")) {

        //         if (placement && placement.placement) {
        //             companyPlacement.placement = placement.placement
        //         }
        //         // console.log('in company')
        //         const currentEntities = await bitrixAPI
        //             .getDealAndCompany(null, placement.options.ID, domain)


        //         result.currentCompany = currentEntities.company
        //         result.currentDeal = currentEntities.deal
        //         result.companyPlacement.options.ID = placement.options.ID

        //     } else if (currentEntityPlacementType.includes("TASK")) {

        //         let taskId = null
        //         if (placement.options.taskId) {
        //             taskId = placement.options.taskId
        //         } else if (placement.options.TASK_ID) {
        //             taskId = placement.options.TASK_ID
        //         }


        //         let currentTaskData = await bitrixAPI.getMethod(
        //             'tasks.task.get',
        //             {
        //                 'taskId': taskId, select: [
        //                     'ID',
        //                     'UF_CRM_TASK',
        //                     'TITLE',
        //                     'DATE_START',
        //                     'CREATED_DATE',
        //                     'CHANGED_DATE',
        //                     'CLOSED_DATE',

        //                     'DEADLINE',
        //                     'PRIORITY',
        //                     'MARK',
        //                     'GROUP_ID',

        //                     'CREATED_BY',
        //                     'STATUS_CHANGED_BY',
        //                     'REAL_STATUS',
        //                     'STATUS',
        //                     'STAGE_ID',
        //                     'RESPONSIBLE_ID',
        //                     'CREATED_BY',
        //                     'TITLE',
        //                 ]
        //             },
        //             domain
        //         ) as { task: BXTask } | BXTask | null
        //         // console.log('currentTask')
        //         // console.log(currentTaskData)

        //         if (currentTaskData) {
        //             let currentTask = currentTaskData as BXTask | { task: BXTask }

        //             // @ts-ignore
        //             if (currentTaskData.task) {
        //                 // @ts-ignore
        //                 currentTask = currentTaskData.task as BXTask
        //             }
        //             currentTask = currentTask as BXTask
        //             if (currentTask.ufCrmTask) {

        //                 const companyIdFromTask = getCompanyIdFromtask(currentTask)

        //                 const currentEntities = __IN_BITRIX__ && await bitrixAPI
        //                     .getDealAndCompany(
        //                         null, //dealId
        //                         companyIdFromTask,
        //                         domain
        //                     )


        //                 result.currentCompany = currentEntities.company
        //                 result.currentDeal = currentEntities.deal
        //                 result.companyPlacement.options.ID = companyIdFromTask
        //                 result.currentTask = currentTask
        //             }
        //         }
        //         // console.log('in company')


        //     } else if (currentEntityPlacementType.includes("CALL_CARD")) {
        //         placement = placement as PlacementCallCard
        //         {
        //             // "placement": "CALL_CARD",
        //             // "options": {
        //             //     "CALL_ID": "82CE7A690FF23F7C.1726130763.11403391",
        //             //     "PHONE_NUMBER": "+79620027991",
        //             //     "LINE_NUMBER": "",
        //             //     "LINE_NAME": "",
        //             //     "CRM_ENTITY_TYPE": "COMPANY",
        //             //     "CRM_ENTITY_ID": "158417",
        //             //     "CRM_ACTIVITY_ID": "",
        //             //     "CRM_BINDINGS": [
        //             //         {
        //             //             "ENTITY_TYPE": "DEAL",
        //             //             "ENTITY_ID": "7909"
        //             //         },
        //             //         {
        //             //             "ENTITY_TYPE": "COMPANY",
        //             //             "ENTITY_ID": "158417"
        //             //         }
        //             //     ],
        //             //     "CALL_DIRECTION": "outgoing",
        //             //     "CALL_STATE": "connected",
        //             //     "CALL_LIST_MODE": "false"
        //             // }
        //             let currentCompanyId
        //             if (placement.options.CRM_ENTITY_TYPE == 'COMPANY') {
        //                 if (placement.options.CRM_ENTITY_ID) {
        //                     currentCompanyId = placement.options.CRM_ENTITY_ID
        //                 }
        //             }

        //             if (!currentCompanyId) {
        //                 if (placement.options.CRM_BINDINGS && placement.options.CRM_BINDINGS.length) {
        //                     placement.options.CRM_BINDINGS.forEach(bindEntity => {
        //                         if (bindEntity.ENTITY_TYPE == 'COMPANY') {
        //                             if (bindEntity.ENTITY_ID) {
        //                                 currentCompanyId = bindEntity.ENTITY_ID
        //                             }
        //                         }
        //                     });
        //                 }
        //             }

        //             const currentEntities = await bitrixAPI.getDealAndCompany(null, currentCompanyId, domain)



        //             // console.log('currentEntities')
        //             // console.log(currentEntities)

        //             result.currentCompany = currentEntities.company
        //             result.currentDeal = currentEntities.deal
        //             result.companyPlacement.options.ID = currentCompanyId
        //         }
        //     } else if (currentEntityPlacementType.includes("LEAD")) {

        //         const lead = await bitrixAPI.getMethod('crm.lead.get', { id: placement.options.ID }, domain)

        //         // result.currentCompany = currentEntities.company
        //         // result.currentDeal = currentEntities.deal
        //         // result.companyPlacement.options.ID = placement.options.ID
        //         result.currentLead = lead as BXLead

        //     }
        // }


        // // console.log('result')
        // // console.log(result)
        return result
    } catch (error) {

        return result
    }

}


const getCompanyIdFromtask = (task: BXTask): number | undefined => {

    let resultCompanyId
    if (task) {
        if (task.ufCrmTask) {
            task.ufCrmTask.forEach((uf: string) => {
                if (uf.includes("CO")) {

                    let parts = uf.split('_'); // Разделяем строку по символу '_'
                    let type = parts[0]; // Тип - это все, что перед '_'
                    let id = parts[1]; // ID - это все, что после '_'
                    resultCompanyId = Number(id);

                }

            })
        }
    }

    return resultCompanyId;

}





































