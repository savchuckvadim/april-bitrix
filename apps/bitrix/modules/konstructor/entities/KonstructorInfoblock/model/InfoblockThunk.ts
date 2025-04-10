// //THUNK

// export const rememberCurrentComplect = (currentComplect) => (dispatch, getState) => {


//     if (currentComplect.type === ComplectsTypesEnum.PROF) {
//         dispatch(createComplect(currentComplect, currentComplect.numer, true))
//     } else {
//         const state = getState()
//         const universalComplects = state.universals.complects
//         const currentComplectType = state.global.currentComplectsType
//         dispatch(createtUniversalDefaultComplect(currentComplect, true))
//         // dispatch(changeUniversalComplect(currentComplect.weight, currentComplectType, universalComplects))
//     }


// }

// export const createComplect = (defaultComplect, index, isRemember = false) => (dispatch, getState) => {

//     const od = getState().od
//     dispatch(setCurrentComplect(defaultComplect, index, od.names, od.currentOd))
//     const currentComplect = getState().currentComplect
//     dispatch(setCheckboxes(currentComplect))
//     // dispatch(setConsalting(currentComplect))

//     dispatch(changeCurrentProductAndPrice(false, isRemember))
// }

// export const createtUniversalDefaultComplect = (oldComplect = null, isRemember = false) => (dispatch, getState) => {


//     let state = getState()
//     let universalDefaultComplect = oldComplect || { ...state.universals.universalDefaultComplect }
//     let ods = state.od.names
//     let currentOd = state.od.currentOd
//     dispatch(setCurrentComplect(universalDefaultComplect, 8, ods, currentOd))
//     const currentComplect = getState().currentComplect
//     dispatch(setCheckboxes(currentComplect))
//     dispatch(changeCurrentProductAndPrice(false, isRemember))



// }

// export const changeUniversalComplect = (
//     weight, 
//     currentComplectsType, 
//     universalComplects,
//     regions
// ) => (dispatch, getState) => {

//         dispatch(setUniversalComplect(weight, currentComplectsType, universalComplects, regions))
//         const od = getState().od
//         const currentComplect = getState().currentComplect
//         dispatch(setCurrentComplect(currentComplect, currentComplect.number, od.names, od.currentOd))

//         dispatch(changeCurrentProductAndPrice())

//     }








// export const changeStar = (checked, value) => (dispatch, getState) => {

//     dispatch(setStarInCurrentComplect(checked, value))
//     let currentComplect = getState().currentComplect
//     let contract = getState().contract.current
//     dispatch(setStar(currentComplect, contract))

// }




// export const changeInfoblock = (checked, value) => (dispatch, getState) => {

//     dispatch(setFillingInfoblock(checked, value))
//     let currentComplect = getState().currentComplect
//     dispatch(setInfoblocks(currentComplect))
//     dispatch(setFreeblocks(currentComplect))
// }

// export const changeFree = (checked, index) => (dispatch, getState) => {
//     dispatch(setFillingFree(checked, index))  //изменяет индексы в current complect
//     let currentComplect = getState().currentComplect  //получает обновленный current complect
//     dispatch(setFreeblocks(currentComplect)) //отправляет его в freeblock-reducer, чтобы обновить параметер checked на основе нового current complect
// }


// export const changeER = (checked, index) => (dispatch, getState) => {
//     const packets = getState().encyclopedias[0].value
//     dispatch(setFillingER(packets, checked, index))
//     let currentComplect = getState().currentComplect

//     dispatch(setERs(currentComplect))
// }

// export const changePacketER = (checked, index) => (dispatch, getState) => {

//     const packets = getState().encyclopedias[0].value
//     dispatch(setFillingPacketER(packets, checked, index))
//     let currentComplect = getState().currentComplect
//     dispatch(setPacketERs(currentComplect))
// }

// export const changeLt = (checked, index) => (dispatch, getState) => {
//     dispatch(setFillingLt(checked, index))  //изменяет индексы в current complect
//     let currentComplect = getState().currentComplect  //получает обновленный current complect
//     let contract = getState().contract.current
//     dispatch(setLt(currentComplect, contract)) //отправляет его в legal-tech-reducer, чтобы обновить параметер checked на основе нового current complect
// }


// export const changeConsalting = (checked, index) => (dispatch, getState) => {
//     dispatch(setFillingConsalting(checked, index))  //изменяет индексы в current complect

//     let currentComplect = getState().currentComplect  //получает обновленный current complect
//     let contract = getState().contract.current

//     dispatch(setConsalting(currentComplect, contract)) //отправляет его в legal-tech-reducer, чтобы обновить параметер checked на основе нового current complect
//     dispatch(setFreeblocks(currentComplect)) //отправляет его в freeblock-reducer, чтобы обновить параметер checked на основе нового current complect
// }



