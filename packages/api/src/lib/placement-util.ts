import { CustomPlacement, DISPLAY_MODE, EntitiesFromPlacement } from "@workspace/bx/src/type/placement-type";
import { BXCompany, BXDeal, BXTask } from "@workspace/bx/src/type/bitrix-type";
import { Placement, PlacementCallCard } from "@workspace/bx/src/type/placement-type";
// import { bx } from "@workspace/api";


export const getDisplayMode = (placement: Placement | PlacementCallCard): DISPLAY_MODE => {

    let result = DISPLAY_MODE.PUBLIC
    if (placement.placement) {

        const currentEntityPlacementType = placement.placement


        if (currentEntityPlacementType.includes("DETAIL")) {
            result = DISPLAY_MODE.ENTITY_CARD

        }
        if (currentEntityPlacementType.includes("TASK")) {
            result = DISPLAY_MODE.TASK

        }

        if (currentEntityPlacementType.includes("ACTIVITY")) {
            result = DISPLAY_MODE.TIMELINE

        }

        if (currentEntityPlacementType.includes("CALL_CARD")) {
            result = DISPLAY_MODE.CALL_CARD

        }

    }
    console.log('DISPLAY_MODE')
    console.log(result)
    return result
}


// export const isDetailPlacement = (placement: Placement): boolean => {

//     let result = false
//     if (placement.placement) {
//         const currentEntityPlacementType = placement.placement
//         if (currentEntityPlacementType.includes("DETAIL")) {
//             result = true

//         }
//     }
//     console.log('isDetailPlacement')
//     console.log(result)
//     return result
// }

// export const isActivityPlacement = (placement: Placement): boolean => {

//     let result = false
//     if (placement.placement) {
//         const currentEntityPlacementType = placement.placement
//         if (currentEntityPlacementType.includes("ACTIVITY")) {
//             result = true

//         }
//     }
//     console.log('is ACTIVITY Placement')
//     console.log(result)
//     return result
// }




// export const isTaskPlacement = (placement: Placement): boolean => {

//     let result = false
//     if (placement.placement) {
//         const currentEntityPlacementType = placement.placement
//         if (currentEntityPlacementType.includes("TASK")) {
//             result = true

//         }
//     }

//     console.log('isTaskPlacement')
//     console.log(result)

//     return result
// }




export const getEntitiesFromPlacement = async (placement: Placement | PlacementCallCard | CustomPlacement, domain: string): Promise<EntitiesFromPlacement> => {

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
        currentTask: null as null | BXTask
    } as EntitiesFromPlacement
    try {


        placement = placement as Placement
        // if (placement.placement && placement.options) {
        //     const currentEntityPlacementType = placement.placement
        //     if (currentEntityPlacementType.includes("DEAL")) {
        //         // console.log('in deal')
        //         const currentEntities = await bx
        //             .getDealAndCompany(placement.options.ID, null, domain)

        //         result.currentCompany = currentEntities.company
        //         result.currentDeal = currentEntities.deal
        //         result.companyPlacement.options.ID = result.currentCompany.ID

        //     } else if (currentEntityPlacementType.includes("COMPANY")) {

        //         if (placement && placement.placement) {
        //             companyPlacement.placement = placement.placement
        //         }
        //         // console.log('in company')
        //         const currentEntities = await bx
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


        //         let currentTaskData = await bx.getMethod(
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

        //                 const currentEntities = __IN_BITRIX__ && await bx
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

        //             const currentEntities = await bx.getDealAndCompany(null, currentCompanyId, domain)



        //             // console.log('currentEntities')
        //             // console.log(currentEntities)

        //             result.currentCompany = currentEntities.company
        //             result.currentDeal = currentEntities.deal
        //             result.companyPlacement.options.ID = currentCompanyId
        //         }
        //     } else if (currentEntityPlacementType.includes("DEFAULT")) {
        //         placement = placement as CustomPlacement
        //         // if (placement && placement.placement) {
        //         //     companyPlacement.placement = placement.placement
        //         // }
        //         console.log('in DEFAULT')
        //         console.log(placement)
        //         console.log(result)
        //         const currentEntities = await bx
        //             .getDealAndCompany(null, placement.options.companyId, domain)


        //         result.currentCompany = currentEntities.company
        //         result.currentDeal = currentEntities.deal
        //         result.companyPlacement.options.ID = placement.options.companyId

        //     }
        // }


        console.log('result')
        console.log(result)
        return result
    } catch (error) {
        console.log('error')
        console.log(error)
        return result
    }

}


// const getCompanyIdFromtask = (task: BXTask): number | undefined => {

//     let resultCompanyId
//     if (task) {
//         if (task.ufCrmTask) {
//             task.ufCrmTask.forEach((uf: string) => {
//                 if (uf.includes("CO")) {

//                     let parts = uf.split('_'); // Разделяем строку по символу '_'
//                     let type = parts[0]; // Тип - это все, что перед '_'
//                     let id = parts[1]; // ID - это все, что после '_'
//                     resultCompanyId = Number(id);

//                 }

//             })
//         }
//     }

//     return resultCompanyId;

// }





































