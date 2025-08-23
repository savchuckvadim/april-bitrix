// import { initialEventTasks } from "@/entities/EventTask"
// import { TESTING_DOMAIN, TESTING_PLACEMENT } from "../consts/app-global"
// import { bitrixAPI } from "../services/bitrix-general-api"
// import { BXUser } from "../types/bitrix/bitrix-type"
// import { Placement } from "../types/bitrix/placement-type"
// import { appActions } from "./ComplectSettingsSlice"

// import { AppDispatch, AppGetState } from "./store"
// import { getDepartment } from "@/features/Departament"

// export const initial = () => async (
//     dispatch: AppDispatch, getState: AppGetState
// ) => {
//     // const testSeminars = await alfaSeminarsGoogleAPI.get(ALFA_SEMINARS_TOKEN)
//     // const testSeminarsPartisipants = await alfaSeminarsGoogleAPI.incrementParticipants(ALFA_SEMINARS_TOKEN)

//     // dispatch(setPreloader(true))
//     // dispatch(setInitialRoute(INITIAL_APP_TYPE, false))
//     const state = getState()

//     const currentRoute = state.router.current

//     const fetchedDdomain = __IN_BITRIX__ ? await bitrixAPI.getDomain() : null
//     let domain = fetchedDdomain ? fetchedDdomain : TESTING_DOMAIN

//     const placement = __IN_BITRIX__
//         ? await bitrixAPI.getPlacement() as Placement | null
//         : TESTING_PLACEMENT
//     const user = __IN_BITRIX__ ? await bitrixAPI.getCurrentUser() as BXUser | null : null
//     // await auth.getSanctumTest()

//     dispatch(
//         appActions.
//             setAppData(
//                 {
//                     domain,
//                     user,
//                     placement

//                 }
//             ))
//     dispatch(initialEventTasks())
//     dispatch(getDepartment())
//     dispatch(
//         appActions
//             .setInitializedSuccess({})
//     )

//     // dispatch(setInitialRoute(APP_TYPE.CALLING, false))
//     // dispatch(setPreloader(false))

// }

// // export const getBitrixData = (
// //     appType,
// //     domain,
// //     currentUser,
// //     currentUserId,
// //     placementCompanyId,  //если null - значит не из компании
// //     placementDealId, //если null - значит не из сделки
// //     token
// // ) => async (dispatch, GetState) => {

// //     //company
// //     // inn = currentDeal['UF_CRM_1695372881']
// //     // recipientName = currentDeal['UF_CRM_1695373462']
// //     // position = currentDeal['UF_CRM_1695373326']
// //     // companyName = currentCompany['TITLE']

// //     //deal
// //     // inn = currentDeal['UF_CRM_1695372881']
// //     // recipientName = currentDeal['UF_CRM_1695373462']
// //     // position = currentDeal['UF_CRM_1695373326']
// //     //  UF_CRM_1711432306 -дата оплаты счета

// //     //lead

// //     let currentCompany = null
// //     let currentDeal = null
// //     let resultBitrixData = {
// //         currentCompany: null,
// //         currentDeal: null,
// //     }
// //     let resultCompanyId = null
// //     let resultDealId = null
// //     let isHaveDeal = false

// //     //get from bitrix
// //     if (IS_PROD) {
// //         resultBitrixData = await bitrixAPI.getDealAndCompany(placementDealId, placementCompanyId)

// //     } else {
// //         if (placementCompanyId) {
// //             const getCompanyData = {
// //                 domain,
// //                 companyId: placementCompanyId
// //             }
// //             resultBitrixData.currentCompany = await onlineGeneralAPI.service('bitrixcompany', API_METHOD.POST, 'company', getCompanyData)

// //         }
// //         if (placementDealId) {
// //             const getDealData = {
// //                 domain,
// //                 dealId: placementDealId
// //             }

// //             resultBitrixData.currentCompany = await onlineGeneralAPI.service('bitrixdeal', API_METHOD.POST, 'deal', getDealData)

// //         }

// //     }

// //     const resultCompany = resultBitrixData.company
// //     const resultDeal = resultBitrixData.deal

// //     if (resultCompany && resultCompany.ID) {
// //         resultCompanyId = resultCompany.ID
// //     }
// //     if (resultDeal && resultDeal.ID) {
// //         resultDealId = resultDeal.ID
// //     }

// //     dispatch(setAppData(domain, resultCompanyId, currentUserId, currentUser, token, resultDealId))
// //     dispatch(setAppBitrixData(resultCompany, resultDeal))
// //     dispatch(setInitialRoute(appType, isHaveDeal))

// // }
