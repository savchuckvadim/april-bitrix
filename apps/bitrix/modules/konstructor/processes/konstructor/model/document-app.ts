
// // import { setPrices } from '../deal/price-reducer';
// // import { bitrixAPI } from '../../../services/bitrix-general-api';
// // import { setBitrixFields } from '../deal/bitrix-fields/bitrix-fields-reducer';
// // import { googleAPI } from '../../../services/google-api';
// // import { generateProducts } from '../deal/products-reducer';
// // import { setFetchedContracts } from '../deal/contract-reducer';
// // import { setFetchedRegions } from '../global/global-reducer';
// // import { setFetchedLt } from '../checkboxes/legal-tech-reducer';
// // import { setFetchedConsalting } from '../checkboxes/consalting-reducer';
// // import { dealAPI, fireAPI } from '../../../services/firebase-api';
// // import { localAPI } from '../../../services/local'
// // import { supplyActions } from '../od/od-reducer';

// import { getRememberDeal, newGetRememberDeal, setIsRemembedStatus } from './remember-reducer';
// import { auth, onlineAPI, onlineGeneralAPI } from '../../../services/april-online-api';
// import { setFetchedStar } from '../checkboxes/star-reducer';
// import { INITIAL_APP_TYPE, IS_PROD, IS_REMEMBER_DEV, TESTING_DEAL_ID, TESTING_DOMAIN } from '../../../appglobal/global-consts.js';

// import { setPreloader } from '../preloader/preloader-reducer';
// import { APP_TYPE, ROUTE, setInitialRoute } from '../router/router-reducer';
// import { API_METHOD } from '@/types/entity-types';
// import { bitrixAPI } from '@/app/services/bitrix-general-api';
// import { BXUser } from '@/app/types/bitrix/bitrix-type';
// import { Placement } from '@/app/types/bitrix/placement-type';


// const COMPANY_PLACEMENT = 'CRM_COMPANY_DETAIL_ACTIVITY'
// const DEAL_PLACEMENT = 'CRM_DEAL_DETAIL_TAB'
// const LEAD_PLACEMENT = 'CRM_LEAD_DETAIL_TAB'
// const LEAD_TIMELINE_PLACEMENT = 'CRM_LEAD_DETAIL_ACTIVITY'


// //actions
// const SET_APP_DEAL = 'SET_APP_DEAL'
// const SET_RESIZE_STATUS = 'SET_RESIZE_STATUS'

// const SET_APP_DATA = 'SET_APP_DATA'
// const SET_APP_LEAD_DATA = 'SET_APP_LEAD_DATA'
// const SET_APP_BITRIX_DATA = 'SET_APP_BITRIX_DATA'
// const SET_INITIALIZED_SUCCESS = 'SET_INITIALIZED_SUCCESS'


// const initialState = {


//     dealId: null,
//     // bitrix: {
//     //     company: null,
//     //     //ИНН UF_CRM_1706007840
//     //     //ФИО UF_CRM_1706007882
//     //     //Должность 
//     //     // companyNamae
//     //     deal: null,
//     //     // ИНН UF_CRM_1695372881
//     //     // ФИО UF_CRM_1695373462
//     //     // Должность UF_CRM_1695373326
//     //     lead: null,
//     //     placement: null
//     // },
//     isResized: false,
//     initialized: false,

// }

// const setAppData = (domain, companyId, userId, currentUser, token, dealId) => ({ type: SET_APP_DATA, domain, companyId, userId, currentUser, token, dealId })
// const setAppLeadData = (domain, userId, currentUser, token, lead) => ({ type: SET_APP_LEAD_DATA, domain, userId, currentUser, token, lead })
// const setAppBitrixData = (company, deal, placement) => ({ type: SET_APP_BITRIX_DATA, company, deal, placement })
// const setAppBitrixDeal = (dealId) => ({ type: SET_APP_DEAL, dealId })
// const setResizeStatus = (boolean) => ({ type: SET_RESIZE_STATUS, boolean })
// const setInitializedSuccess = () => ({ type: SET_INITIALIZED_SUCCESS })


// //THUNK
// export const setState = (state) => (dispatch, getState) => {
//     dispatch({ type: 'SAVE_STATE', state })
// }

// // const rememberDeal = (global) => (dispatch, getState) => {
// //     dispatch({ type: 'REMEMBER_DEAL', global })
// // }


// export const initial = () => async (dispatch, getState) => {

//     dispatch(setPreloader(true))
//     dispatch(setInitialRoute(INITIAL_APP_TYPE, false))
//     const state = getState()

//     const currentRoute = state.router.current
//     IS_PROD && currentRoute.route !== ROUTE.CALLING && dispatch(getResize())
//     IS_PROD && currentRoute.route === ROUTE.CALLING && dispatch(getResizeCalling())


//     const fetchedDdomain = IS_PROD ? await bitrixAPI.getDomain() : null
//     let domain = fetchedDdomain ? fetchedDdomain : TESTING_DOMAIN

//     // await auth.getSanctumTest()


//     if (currentRoute && currentRoute.route) {
//         const isProd = IS_PROD
//         let token = ''
//         let currentCompanyId = null


//         let placementCompanyId = null
//         let placementDealId = null

//         let dealId = IS_PROD ? null : TESTING_DEAL_ID


//         if (currentRoute.route !== ROUTE.REPORT && currentRoute.route !== ROUTE.CALLING && currentRoute.route !== ROUTE.TRANSKRIBATION) {


//             const currentUser = IS_PROD && await bitrixAPI.getCurrentUser()
//             let userId = ''
//             if (currentUser) {
//                 userId = Number(currentUser.ID)
//             }

//             const getConstructorInitial = async () => {


//                 //CHECK VERSION



//                 //ATTENTION NO DELETE:

//                 const appversion = await fireAPI.getVersion()
//                 let localVersion = await localAPI.getData('version')

//                 let initialData = await localAPI.getData('april')
//                 initialData = JSON.parse(initialData)
//                 localVersion = JSON.parse(localVersion)
//                 if (localVersion && localVersion.version) {
//                     localVersion = localVersion.version
//                 }
//                 if (!appversion || appversion === 0 || !initialData || (appversion !== localVersion)) {

//                     initialData = await fireAPI.getData(domain)
//                     initialData = initialData.data
//                     if (!initialData) {
//                         token = await googleAPI.getToken(domain)
//                         initialData = await googleAPI.getInitialData(token)
//                     }
//                     await localAPI.setData({ version: appversion }, 'version')
//                     await localAPI.setData(initialData, 'april')

//                 }


//                 if (initialData) {

//                     let complects = initialData.complects


//                     let prices = initialData.prices
//                     let supplies = initialData.supplies
//                     let contractsData = initialData.contracts

//                     let bitrixFields = initialData.bitrix
//                     let regions = initialData.regions


//                     let consalting = initialData.consalting
//                     let lt = initialData.legalTech
//                     let ltPackages = lt && lt.packages
//                     const star = initialData.star


//                     const contracts = contractsData && contractsData.items && contractsData.items.filter(item => contractsData.current.includes(item.number))


//                     dispatch(supplyActions.setInitialOds(supplies))
//                     dispatch(generateProducts(complects, supplies, contracts, consalting, ltPackages, star, prices))



//                     dispatch(setFetchedRegions(regions))
//                     dispatch(setPrices(prices, supplies, contracts))

//                     dispatch(setBitrixFields(bitrixFields.add, bitrixFields.product, bitrixFields.update))
//                     dispatch(setFetchedContracts(contracts))

//                     dispatch(setFetchedLt(lt))
//                     dispatch(setFetchedConsalting(consalting))
//                     dispatch(setFetchedStar(star))


//                     let state = getState()
//                     dispatch(setState(state))

//                 }

//             }

//             await getConstructorInitial()


//             let placementdata = isProd && await bitrixAPI.getPlacement()


//             if (placementdata) {

//                 if (placementdata.placement) {

//                     let ID = placementdata.options.ID
//                     if (placementdata.placement === COMPANY_PLACEMENT || placementdata.placement === 'CRM_COMPANY_DETAIL_TAB') {



//                         // const companyId = await bitrixAPI.getCompanyId()

//                         // TODO 
//                         const companyId = ID || await bitrixAPI.getCompanyId()

//                         placementCompanyId = Number(companyId)

//                         dispatch(
//                             getBitrixData(
//                                 domain,
//                                 currentUser,
//                                 userId,
//                                 placementCompanyId,
//                                 placementDealId,
//                                 token,
//                                 placementdata
//                             ))


//                     } else if (placementdata.placement === DEAL_PLACEMENT || placementdata.placement === 'CRM_DEAL_DETAIL_ACTIVITY') {

//                         dealId = Number(placementdata.options.ID)
//                         placementDealId = Number(placementdata.options.ID)

//                         dispatch(
//                             getBitrixData(
//                                 domain,
//                                 currentUser,
//                                 userId,
//                                 placementCompanyId,
//                                 placementDealId,
//                                 token,
//                                 placementdata
//                             ))






//                     } else if (placementdata.placement === LEAD_PLACEMENT || placementdata.placement === LEAD_TIMELINE_PLACEMENT) {


//                     }
//                 }
//                 // dispatch(getBitrixData(currentCompanyId, dealId, domain))
//                 console.log('placementdata')
//                 console.log(placementdata)

//             }
//             // else {
//             //     //NO BITRIX PLACEMENT

//             //     const currentCompanyId = 34630
//             //     const currentUserId = 1

//             //     dispatch(setAppData(domain, currentCompanyId, currentUserId, token, null))

//             // }
//             else {
//                 //FOR DEVELOPMENT

//                 dealId = IS_REMEMBER_DEV ? TESTING_DEAL_ID : null
//                 const currentCompanyId = 29506
//                 let currentUserId = 1
//                 domain = TESTING_DOMAIN
//                 // let dealId = null
//                 // let currentCompanyId = null
//                 // let currentUserId = 1


//                 dispatch(setAppData(domain, currentCompanyId, currentUserId, currentUser, '', dealId))
//                 IS_REMEMBER_DEV && await dispatch(getRememberDeal(dealId, domain))
//                 dispatch(setInitialRoute(APP_TYPE.KONSTRUCTOR, dealId))
//                 dispatch(setInitializedSuccess())
//             }
//             // const isHaveDeal = dealId !== null


//             // IS_DOCUMENT_TESTING
//             //     ? dispatch(navigate(ROUTE.DOCUMENT))
//             //     : dispatch(navigate(ROUTE.GLOBAL))
//             // WITH_DOCUMENT && dispatch(getTemplates(domain))

//             dispatch(setPreloader(false))
//             IS_PROD && await bitrixAPI.getResize()






//             //todo rename and refactoring to get and dispatch initialData



//         }
//         else if (currentRoute.route !== ROUTE.REPORT && currentRoute.route === ROUTE.CALLING) {

//             dispatch(setPreloader(true))
//             const currentUser = IS_PROD && await bitrixAPI.getCurrentUser()
//             dispatch(setAppData(domain, null, null, currentUser, '', null))
//             dispatch(setPreloader(false))
//         }
//         else {


//             dispatch(setAppData(domain, null, null, null, '', null))
//             dispatch(setInitializedSuccess())
//             dispatch(setPreloader(false))

//         }
//     }


// }


// export const getBitrixData = (
//     domain: string,
//     currentUser: BXUser,
//     currentUserId: number,
//     placementCompanyId: number,  //если null - значит не из компании
//     placementDealId: number | null, //если null - значит не из сделки
//     token: string | null,
//     placement: Placement
// ) => async (dispatch, getState) => {

//     //company
//     // inn = currentDeal['UF_CRM_1695372881']
//     // recipientName = currentDeal['UF_CRM_1695373462']
//     // position = currentDeal['UF_CRM_1695373326']
//     // companyName = currentCompany['TITLE']

//     //deal
//     // inn = currentDeal['UF_CRM_1695372881']
//     // recipientName = currentDeal['UF_CRM_1695373462']
//     // position = currentDeal['UF_CRM_1695373326']
//     //  UF_CRM_1711432306 -дата оплаты счета

//     //lead



//     let currentCompany = null
//     let currentDeal = null
//     let resultBitrixData = {
//         currentCompany: null,
//         currentDeal: null,
//     }
//     let resultCompanyId = null
//     let resultDealId = null
//     let isHaveDeal = false
//     console.log('app get bitrix data getBitrixData')


//     //get remember deal
//     if (placementDealId) {
//         let remembedDeal = await onlineAPI.getDeal(placementDealId, domain)
//         if (!remembedDeal) {
//             remembedDeal = await dealAPI.getDeal(placementDealId, domain)

//         }
//         if (remembedDeal) {
//             isHaveDeal = getIsHaveDeal(remembedDeal)
//             if (isHaveDeal) {
//                 dispatch(newGetRememberDeal(remembedDeal))
//             } else {
//                 dispatch(setIsRemembedStatus(true))
//             }

//         } else {
//             dispatch(setIsRemembedStatus(true))
//         }



//     } else {
//         dispatch(setIsRemembedStatus(true))
//     }
//     console.log('placementDealId')
//     console.log(placementDealId)



//     //get from bitrix
//     if (IS_PROD) {
//         resultBitrixData = await bitrixAPI.getDealAndCompany(placementDealId, placementCompanyId)
//         console.log('getDealAndCompany result')
//         console.log(resultBitrixData)

//     } else {
//         if (placementCompanyId) {
//             const getCompanyData = {
//                 domain,
//                 companyId: placementCompanyId
//             }
//             resultBitrixData.currentCompany = await onlineGeneralAPI.service('bitrixcompany', API_METHOD.POST, 'company', getCompanyData)

//         }
//         if (placementDealId) {
//             const getDealData = {
//                 domain,
//                 dealId: placementDealId
//             }

//             resultBitrixData.currentCompany = await onlineGeneralAPI.service('bitrixdeal', API_METHOD.POST, 'deal', getDealData)

//         }

//     }

//     console.log('app get bitrix data result')
//     console.log(placementCompanyId)
//     console.log(placementDealId)

//     const resultCompany = resultBitrixData.company
//     const resultDeal = resultBitrixData.deal

//     if (resultCompany && resultCompany.ID) {
//         resultCompanyId = resultCompany.ID
//     }
//     if (resultDeal && resultDeal.ID) {
//         resultDealId = resultDeal.ID
//     }




//     dispatch(setAppData(domain, resultCompanyId, currentUserId, currentUser, token, resultDealId))
//     dispatch(setAppBitrixData(resultCompany, resultDeal, placement))
//     dispatch(setInitialRoute(APP_TYPE.KONSTRUCTOR, isHaveDeal))

// }


// const getIsHaveDeal = (deal) => {
//     let resultIsHaveDeal = false;
//     if (deal && deal.rows) {
//         const rows = JSON.parse(deal.rows)
//         if (rows.sets) {
//             if (rows.sets.general && rows.sets.general.length) {

//                 if (rows.sets.general[0].total && rows.sets.general[0].total.length) {

//                     if (rows.sets.general[0].total[0].name) {

//                         resultIsHaveDeal = true
//                     }
//                 }
//             }

//         }

//     }

//     return resultIsHaveDeal

// }

// export const setAppDeal = (dealId) => async (dispatch, getState) => {

//     //TODO
//     const state = getState()
//     const domain = state.app.domain
//     const currentBitrixDeal = state.app.bitrix.deal
//     let currentDeal = null

//     if (dealId && !currentBitrixDeal) {
//         const getDealData = {
//             domain,
//             dealId
//         }

//         if (IS_PROD) {
//             currentDeal = bitrixAPI.getDeal(dealId)
//         } else {
//             currentDeal = await onlineGeneralAPI.service('bitrixdeal', API_METHOD.POST, 'deal', getDealData)


//         }

//     }


//     dispatch(setAppBitrixDeal(dealId, currentDeal))
// }


// export const getResize = () => async (dispatch, getState) => {
//     await bitrixAPI.getResize()
//     dispatch(setResizeStatus(true))
// }
// export const getResizeCalling = () => async (dispatch, getState) => {
//     await bitrixAPI.getResizeCalling()
//     dispatch(setResizeStatus(true))
// }


// export const app = (state = initialState, action) => {
//     switch (action.type) {

//         case SET_APP_DATA:
//             console.log('SET_APP_DATA')
//             console.log(action)

//             const resultState = {
//                 ...state,
//                 domain: action.domain,
//                 company: action.companyId,
//                 user: action.userId,
//                 token: action.token,
//                 dealId: action.dealId,
//                 currentUser: action.currentUser,

//             }

//             return resultState


//         case SET_APP_BITRIX_DATA:
//             console.log('SET_APP_BITRIX_DATA')
//             console.log(action)
//             console.log(action)
//             return {
//                 ...state,
//                 bitrix: {
//                     ...state.bitrix,
//                     company: action.company,
//                     deal: action.deal,
//                     placement: action.placement
//                 },
//                 initialized: true
//             }
//         case SET_APP_DEAL:
//             return {
//                 ...state,
//                 dealId: action.dealId,
//                 bitrix: {
//                     ...state.bitrix,
//                     deal: action.deal
//                 }
//             }

//         case SET_RESIZE_STATUS:
//             console.log('SET_RESIZE_STATUS')
//             console.log(action.status)

//             return {
//                 ...state,
//                 isResized: action.status
//             }
//         case SET_INITIALIZED_SUCCESS:

//             return {
//                 ...state,

//                 initialized: true
//             }

//         default:
//             return state
//     }

// }



// export default app