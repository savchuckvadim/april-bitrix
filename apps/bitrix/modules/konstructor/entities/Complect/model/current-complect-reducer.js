// import { fillingConsalting, fillingEr, fillingFreeblocksWithUncheck, fillingInfoblocks, fillingLt, fillingPketsEr, fillingStar, newFreeblocksWithUncheck } from "../../../utils/reducers-utils/complect/complect-utils"

// import { UNIVERSAL } from "../global/global-reducer"
// import { RESET } from "../reset/reset-reducer"
// import { setStar } from "../checkboxes/star-reducer"

// const complectEnum = {
//     universal: 'universal',

// }

// let initialState = null

// //CONST
// export const COMPLECT_ERROR = 'Неправильный вес комплекта'

// //A
// const CREATE_COMPLECT = 'CREATE_COMPLECT'
// const SET_WEIGHT_AND_NAME_OF_UNIVERSAL_COMPLECT = 'CHANGE_WEIGHT_AND_NAME_OF_UNIVERSAL_COMPLECT'
// const CHANGE_PACKET_ER = 'CHANGE_PACKET_ER'
// const CHANGE_ER = 'CHANGE_ER'
// const CHANGE_FREE = 'CHANGE_FREE'
// const CHANGE_INFOBLOCK = 'CHANGE_INFOBLOCK'
// const SET_FILLING_LT = 'SET_FILLING_LT'
// const SET_FILLING_CONSALTING = 'SET_FILLING_CONSALTING'
// const SET_STAR_IN_COMPLECT = 'SET_STAR_IN_COMPLECT'

// /////////////////////////ACTION CREATORS

// export const resetActionCreator = () => ({ type: RESET })

// export const setUniversalComplect = (weight, currentComplectsType, universalComplects, regions) =>
//     ({ type: SET_WEIGHT_AND_NAME_OF_UNIVERSAL_COMPLECT, weight, currentComplectsType, universalComplects, regions })

// export const setCurrentComplect = (defaultComplect, index, ods, currentOd) => ({ // ==maximum
//     type: CREATE_COMPLECT, defaultComplect, index, ods, currentOd
// })

// const setFillingER = (packets, checked, index) => ({ type: CHANGE_ER, packets, checked, index })
// const setFillingPacketER = (packets, checked, index) => ({ type: CHANGE_PACKET_ER, packets, checked, index })
// const setFillingInfoblock = (checked, value) => ({ type: CHANGE_INFOBLOCK, checked, value })
// const setFillingFree = (checked, index) => ({ type: CHANGE_FREE, checked, index })
// const setFillingLt = (checked, index) => ({ type: SET_FILLING_LT, checked, index })
// const setFillingConsalting = (checked, index) => ({ type: SET_FILLING_CONSALTING, checked, index })

// const setStarInCurrentComplect = (checked, index) => ({ type: SET_STAR_IN_COMPLECT, checked, index })

// // export const setError = (error, complectsType) => ({ type: SET_ERROR, error, complectsType })  //for invalid weight

// ///////////////////REDUCER
// export const currentComplect = (state = initialState, action) => {
//     let currentComplect = state
//     switch (action.type) {
//         case CREATE_COMPLECT || MAXIMUM:
//             // return createComplect(state, action)

//             if (action.defaultComplect) {
//                 state = { ...action.defaultComplect }

//             }
//             return state

//         case SET_WEIGHT_AND_NAME_OF_UNIVERSAL_COMPLECT:
//             if (state) {

//                 currentComplect = { ...state }
//                 if (action.currentComplectsType.title === UNIVERSAL) {
//                     let indexOfRightComplect = 0
//                     let isSearched = false
//                     action.universalComplects.forEach((complect, complectIndex) => {

//                         if (action.weight === complect.weight) {
//                             indexOfRightComplect++
//                             currentComplect.number = complect.number
//                             currentComplect.name = complect.name
//                             currentComplect.title = complect.title
//                             currentComplect.fullTitle = complect.fullTitle
//                             currentComplect.shortTitle = complect.shortTitle
//                             currentComplect.weight = complect.weight
//                             isSearched = true
//                         } else if ((action.weight < complect.weight) && !isSearched && complectIndex) {

//                             const searchedComplect = action.universalComplects[complectIndex - 1]

//                             currentComplect.number = searchedComplect.number
//                             currentComplect.name = searchedComplect.name
//                             currentComplect.title = searchedComplect.title
//                             currentComplect.fullTitle = searchedComplect.fullTitle
//                             currentComplect.shortTitle = searchedComplect.shortTitle
//                             currentComplect.weight = searchedComplect.weight
//                             isSearched = true

//                         }
//                     })
//                     if (!indexOfRightComplect && action.weight) {
//                         currentComplect.name = COMPLECT_ERROR
//                     }
//                     currentComplect.regions = action.regions

//                     return currentComplect
//                 }
//                 return state
//             }
//             return state

//         case CHANGE_INFOBLOCK:
//             return fillingInfoblocks(state, action.checked, action.value)

//         case CHANGE_FREE:
//             //action: checked, index, value

//             if (state) { //current complect

//                 currentComplect = { ...state }
//                 if (currentComplect.isChanging) {
//                     if (action.checked) {  // если надо убрать блок из current
//                         if (currentComplect.freeBlocks.includes(action.index)) {// если он содержится в current

//                             currentComplect.freeBlocks = fillingFreeblocksWithUncheck(currentComplect, action.index)
//                         }
//                     } else { //если надо вставить блок
//                         if (!currentComplect.freeBlocks.includes(action.index)) {// если он не содержится в current
//                             if (action.index === 10 || action.index === 11 || action.index === 12) {

//                             } else {
//                                 currentComplect.freeBlocks.push(action.index)
//                             }

//                         }
//                     }
//                 }
//                 return currentComplect
//             }

//             return state

//         case CHANGE_ER:
//             // action:  checked, index
//             if (currentComplect) {
//                 let resultCurrentComplect = { ...currentComplect }
//                 if (currentComplect.isChanging) {
//                     resultCurrentComplect = fillingEr(currentComplect, action.packets, action.checked, action.index)
//                 }
//                 return resultCurrentComplect

//             } else {
//                 alert('Сначала выберете комплект!')
//                 return state
//             }

//         case CHANGE_PACKET_ER:
//             return fillingPketsEr(state, action.packets, action.checked, action.index)

//         case SET_FILLING_LT:
//             return fillingLt(state, action.checked, action.index)

//         case SET_FILLING_CONSALTING:
//             return fillingConsalting(state, action.checked, action.index)

//         case SET_STAR_IN_COMPLECT:

//             return fillingStar(state, action.checked, action.index)

//         case RESET:
//             return null

//         default:
//             return state
//     }

// }
