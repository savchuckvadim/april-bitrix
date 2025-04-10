
// import { AppDispatch, AppGetState } from "@/app/model/store"
// import { onlineGeneralAPI } from "@/app/services/april-online-api"
// import { bitrixAPI } from "@/app/services/bitrix-general-api"
// import { fireAPI } from "@/app/services/firebase-api"
// import { localAPI } from "@/app/services/local"
// import { API_METHOD } from "@/app/types/api/api-type"

// export const setAppDeal = (dealId: number | null) => async (
//     dispatch: AppDispatch, getState: AppGetState
// ) => {

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

//         if (__IN_BITRIX__) {
//             currentDeal = bitrixAPI.getDeal(dealId)
//         } else {
//             currentDeal = await onlineGeneralAPI.service('bitrixdeal', API_METHOD.POST, 'deal', getDealData)


//         }

//     }


//     dispatch(setAppBitrixDeal(dealId, currentDeal))
// }

// export const initial = () => async (
//     dispatch: AppDispatch, getState: AppGetState
// ) => {

//     // dispatch(setPreloader(true))
//     // dispatch(setInitialRoute(INITIAL_APP_TYPE, false))
//     const state = getState()

//     const currentRoute = state.router.current
//     // __IN_BITRIX__ && currentRoute.route !== ROUTE.CALLING && dispatch(getResize())
//     // __IN_BITRIX__ && currentRoute.route === ROUTE.CALLING && dispatch(getResizeCalling())

//     //CHECK VERSION



//     // //ATTENTION NO DELETE:

//     const appversion = await fireAPI.getVersion()
//     // let localVersion = await localAPI.getData('version')

//     // let initialData = await localAPI.getData('april')
//     // initialData = JSON.parse(initialData)
//     // localVersion = JSON.parse(localVersion)
//     // if (localVersion && localVersion.version) {
//     //     localVersion = localVersion.version
//     // }
//     // if (!appversion || appversion === 0 || !initialData || (appversion !== localVersion)) {

//     //     initialData = await fireAPI.getData(domain)
//     //     initialData = initialData.data
//     //     if (!initialData) {
//     //         token = await googleAPI.getToken(domain)
//     //         initialData = await googleAPI.getInitialData(token)
//     //     }
//     await localAPI.setData({ version: appversion }, 'version')
//     //     await localAPI.setData(initialData, 'april')

//     // }


//     // if (initialData) {

//     //     let complects = initialData.complects


//     //     let prices = initialData.prices
//     //     let supplies = initialData.supplies
//     //     let contractsData = initialData.contracts

//     //     let bitrixFields = initialData.bitrix
//     //     let regions = initialData.regions


//     //     let consalting = initialData.consalting
//     //     let lt = initialData.legalTech
//     //     let ltPackages = lt && lt.packages
//     //     const star = initialData.star


//     //     const contracts = contractsData && contractsData.items && contractsData.items.filter(item => contractsData.current.includes(item.number))


//     //     dispatch(supplyActions.setInitialOds(supplies))
//     //     dispatch(generateProducts(complects, supplies, contracts, consalting, ltPackages, star, prices))



//     //     dispatch(setFetchedRegions(regions))
//     //     dispatch(setPrices(prices, supplies, contracts))

//     //     dispatch(setBitrixFields(bitrixFields.add, bitrixFields.product, bitrixFields.update))
//     //     dispatch(setFetchedContracts(contracts))

//     //     dispatch(setFetchedLt(lt))
//     //     dispatch(setFetchedConsalting(consalting))
//     //     dispatch(setFetchedStar(star))


//     //     let state = getState()
//     //     dispatch(setState(state))

//     // }


// }
