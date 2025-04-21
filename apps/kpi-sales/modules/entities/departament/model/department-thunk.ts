// import { AppDispatch, AppGetState } from "@/modules/app/model/store";
// import { BXUser } from "@workspace/bx";
// import { departmentActions } from "./departament-slice";

// export const setCurentDepartamentUser = (userId: number) => async (dispatch: AppDispatch, getState: AppGetState) => {

//     const department = getState().department
//     const items = department.items
//     const current = department.current
//     const searchingUserinCurrent = current.find(user => user.ID === userId)
//     let updtCurrent = [...department.current] as BXUser[]

//     if (searchingUserinCurrent) {
//         updtCurrent = updtCurrent.filter(user => user.ID !== userId)
//     } else {
//         const addingUser = items.find(user => user.ID === userId)
//         if (addingUser) {
//             updtCurrent.push(addingUser)
//         }
//     }

//     dispatch(departmentActions.setDepartmentCurrent(updtCurrent))
//     // const departament = await onlineGeneralAPI.service('departament', 'post', 'departament', {domain}) as Array<BitrixUser> | null


// }