// import { regionsAC } from "../checkboxes/region/region-actions"
// import { createtUniversalDefaultComplect } from "../complect/current-complect-reducer"
// import { reset } from "../reset/reset-reducer"
// import { ROUTE, navigate } from "../router/router-reducer"
// //consts
// //SUPPLY
// export const INTERNET = 'Интернет'
// export const PROXIMA = 'Проксима'

// //COMPLECTS_TYPE
// export const UNIVERSAL = 'Универсальная линейка'
// export const PROF = 'ПРОФ'

// //REGION
// export const KMV = 'КМВ'
// export const STV = 'Ставрополь'





// const initialState = {

//     supplies: {
//         name: 'Тип Доступа',
//         values: [{ id: 0, title: INTERNET }, { id: 1, title: PROXIMA }]
//     },

//     complects: {
//         name: 'Тип Комплекта',
//         values: [{ id: 0, title: UNIVERSAL }, { id: 1, title: PROF }]
//     },

//     regions: {
//         name: 'Регион',
//         values: [{ id: 0, title: KMV }, { id: 1, title: STV }]
//     },

//     currentSupply: null,
//     currentComplectsType: null,
//     currentRegion: null,
//     status: false,
//     message: '',
//     error: {
//         region: null,
//         complect: null,
//         supply: null
//     }

// }

// // A
// const SET_FETCHED_REGIONS = 'SET_FETCHED_REGIONS'
// const SET_SUPPLY = 'SET_SUPPLY'
// const SET_COMPLECTS_TYPE = 'SET_COMPLECTS_TYPE'
// const SET_REGION = 'SET_REGION'
// const SET_STATUS = 'SET_STATUS'
// const CLEAN_MESSAGE = 'CLEAN_MESSAGE'

// export const SET_GLOBAL = 'global/SET_GLOBAL'
// const RESET_GLOBAL = ' RESET_GLOBAL'
// const REMEMBER_GLOBAL = 'REMEMBER_GLOBAL'



// // AC
// // export const setFetchedRegions = (regions) => ({ type: SET_FETCHED_REGIONS, regions })
// // export const setSupply = (supplyId) => ({ type: SET_SUPPLY, supplyId }) //if index == 0 -> INTERNET, else -> PROKSIMA
// // export const setComplectsType = (complectTypeId) => ({ type: SET_COMPLECTS_TYPE, complectTypeId }) //if index == 0 -> INTERNET, else -> PROKSIMA
// // export const setRegion = (regionId) => ({ type: SET_REGION, regionId })
// const setStatus = (status) => ({ type: SET_STATUS, status })
// export const cleanError = (name) => ({ type: CLEAN_MESSAGE, name })

// const setGlobal = (currentSupply, currentComplectsType, currentRegion) => ({ type: SET_GLOBAL, currentSupply, currentComplectsType, currentRegion })
// const resetGlobal = () => ({ type: RESET_GLOBAL })
// const setRememberGlobal = (global) => ({ type: REMEMBER_GLOBAL, global })



// //THUNK

// export const changeAndSetGlobalStatus = (bool) => (dispatch, getState) => {
//     const first = getState().global
//     const contract = getState().contract
 
//     dispatch(setStatus(bool))
//     const state = getState()
//     const global = state.global

    
//     const seccontract = getState().contract
//     if (global.status && !global.error.region && !global.error.complect && !global.error.supply) {
//         if (global.currentSupply && global.currentComplectsType && global.currentRegion) {

//             dispatch(setGlobal(global.currentSupply, global.currentComplectsType, global.currentRegion))
//             dispatch(regionsAC.setCurrentRegion(global.currentRegion))
//             dispatch(navigate(ROUTE.KONSTRUCTOR))

//             if (global.currentComplectsType.title === UNIVERSAL) {
//                 // если выбрана универсальная линейка создает current complect - пустой универсальный  комплект
//                 // с помощью thunk из current complect reducer
//                 dispatch(createtUniversalDefaultComplect())
//             }

//         }else{
            
//         }
//     } else {



//     }

// }

// export const back = () => (dispatch, getState) => {

//     // dispatch(resetGlobal())
//     dispatch(setStatus(false))
//     dispatch(reset())


// }


// export const rememberGlobal = (global, regions) => (dispatch, getState) => {

//     dispatch(setRememberGlobal(global))
//     dispatch(setGlobal(global.currentSupply, global.currentComplectsType, global.currentRegion))
   
//     if(regions){
//         dispatch(regionsAC.setRememberRegions(regions))
//     }else{
//         dispatch(regionsAC.setCurrentRegion(global.currentRegion))
//     }
    
// }



// const global = (state = initialState, action) => {

//     switch (action.type) {

//         case SET_FETCHED_REGIONS:
//             // regions: {
//             //     name: 'Регион',
//             //     values: [KMV, STV]
//             // },

//             let resultRegions = action.regions.map(region => ({ ...region, id: region.number }))

//             const result = {
//                 ...state, regions:
//                     { ...state.regions, name: 'Регион', values: resultRegions }
//             }

//             return result

//         case SET_SUPPLY:

//             // if (!state.currentSupply || action.supplyId !== state.currentSupply.id) {
//             let currentSupply = state.supplies.values.find(supply => supply.id === action.supplyId)
//             return {
//                 ...state,
//                 currentSupply: currentSupply,
//                 message: '',
//                 error: {
//                     ...state.error,
//                     supply: null
//                 }
//             };
//         // } else {
//         //     return state
//         // }

//         case SET_COMPLECTS_TYPE:

//             // if (!state.currentComplectsType || action.complectTypeId !== state.currentComplectsType.id) {
//             return {
//                 ...state,
//                 currentComplectsType: state.complects.values.find(complectType => complectType.id === action.complectTypeId),
//                 message: '',
//                 error: {
//                     ...state.error,
//                     complect: null
//                 }
//             };
//         // } else {
//         //     return state
//         // }

//         case SET_REGION:

//             // if (!state.currentRegion || action.regionId !== state.currentRegion.id) {

//             let currentRegion = state.regions.values.find(region => region.number === action.regionId)
//             if (currentRegion) {
//                 return {
//                     ...state, currentRegion,
//                     message: '',
//                     error: {
//                         ...state.error,
//                         region: null
//                     }
//                 }
//             }

//             // }
//             return state

//         case SET_STATUS:


//             let message = state.message
//             if (action.status) {

//                 if (state.status !== action.status) {
//                     let error = { ...state.error }


//                     if (!state.currentRegion) {

//                         error.region = `Выберите ${state.regions.name}`
//                     }
//                     if (!state.currentComplectsType) {
//                         // message = `Выберете сначала ${state.complects.name}`
//                         error.complect = `Выберите ${state.complects.name}`
//                     }
//                     if (!state.currentSupply) {
//                         // message = `Выберете сначала ${state.supplies.name}`
//                         error.supply = `Выберите ${state.supplies.name}`
//                     }


//                     if (!error.region && !error.complect && !error.supply) {


//                         return { ...state, status: action.status, message: '' }
//                     } else {

//                         return { ...state, error }
//                     }

//                 } else {

//                     return state
//                 }
//             } else {

//                 return {
//                     ...state,
//                     currentSupply: null,
//                     currentComplectsType: null,
//                     currentRegion: null,
//                     status: action.status,
//                     message: ''
//                 }
//             }


//         case CLEAN_MESSAGE: return { ...state, error: { ...state.error, [action.name]: null } }

//         case REMEMBER_GLOBAL:

//             return action.global

//         case RESET_GLOBAL:
//             return {
//                 ...state, currentSupply: null,
//                 currentComplectsType: null,
//                 currentRegion: null,
//                 status: action.bool,
//                 message: ''
//             }
//         default:
//             return state;
//     }
// }

// export default global