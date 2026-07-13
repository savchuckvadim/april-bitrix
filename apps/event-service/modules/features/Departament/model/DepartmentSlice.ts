import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
    DUserStateItem,
    DepartmentModeStateItem,
    DepartmentModeStateItemCode,
    DepartmentState,
    DepartmentStateItem,
    SetCurrentUserPayload, SetFetchedDepartamentPayload
} from "../type/department-type";
import {
    getInitialDepartmentStateItems,
    getInitialStateDUserItems
} from "../utils/department-util";
import {local as localAPI } from "@workspace/api";
import { BXUser } from "@workspace/bx";

const initialState = {
    [DEPARTAMENT_STATE_PROP.DEPARTAMENT]: getInitialDepartmentStateItems() as DepartmentStateItem,
    [DEPARTAMENT_STATE_PROP.PLAN]: getInitialStateDUserItems() as DUserStateItem,
    [DEPARTAMENT_STATE_PROP.REPORT]: getInitialStateDUserItems() as DUserStateItem,
    [DEPARTAMENT_STATE_PROP.MODE]: {
        items: [
            {
                id: 0,
                code: 'sales' as DepartmentModeStateItemCode,
                name: 'Менеджер ОП',
            } as DepartmentModeStateItem,
            {
                id: 1,
                code: 'tmc' as DepartmentModeStateItemCode,
                name: 'Менеджер ТМЦ',
            } as DepartmentModeStateItem,

        ] as Array<DepartmentModeStateItem>,
        current: {
            id: 0,
            code: 'sales',
            name: 'Менеджер ОП',
        } as DepartmentModeStateItem | null
    }
} as DepartmentState



const departmentSlice = createSlice({
    name: 'event',
    initialState,
    reducers: {

        setFetchedDepartament: (
            state: DepartmentState,
            action: PayloadAction<SetFetchedDepartamentPayload>
        ) => {


            const payload = action.payload
            let responsibilityCurrent = payload.currentUser
            let bosssId = 1
            if (payload.domain === 'alfacentr.bitrix24.ru') {
                // bosssId = 28
                bosssId = 158 //дарья
            }
            if (payload.domain === 'april-garant.bitrix24.ru') {
                bosssId = 107  // fatima
            }
            if (payload.domain === 'gsirk.bitrix24.ru') {
                bosssId = 5  // marina
            }
            
            for (const key in state) {

                const specificKey: DEPARTAMENT_STATE_PROP = key as DEPARTAMENT_STATE_PROP;


                if (specificKey !== DEPARTAMENT_STATE_PROP.MODE) {
                    let target = state[specificKey] as DUserStateItem | DepartmentStateItem
                    
                    if (specificKey === DEPARTAMENT_STATE_PROP.DEPARTAMENT) {
                        target = state[specificKey] as DepartmentStateItem
                    } else {
                        target = state[specificKey] as DUserStateItem
                    }
                    
                    for (const targetkey in target) {
                        const targetspecificKey: DUSER_ROLE = targetkey as DUSER_ROLE;

                        if (specificKey === DEPARTAMENT_STATE_PROP.DEPARTAMENT) {
                            if ('items' in target[targetspecificKey]) {
                                
                                //@ts-ignore
                                target[targetspecificKey].items = payload.department
                            }
                        } else {
                            if (
                                'current' in target[targetspecificKey]
                            ) {
                                //@ts-ignore
                                target[targetspecificKey].current = responsibilityCurrent as BXUser
                                if (targetspecificKey === DUSER_ROLE.CREATED_BY) {
                                    //@ts-ignore
                                    target[targetspecificKey].current = { ID: bosssId } as BXUser
                                }
                                if (targetspecificKey === DUSER_ROLE.RESPONSIBLE) {
                                    let currentUserId = null
                                    if (payload.currentUser && payload.currentUser.ID) {
                                        //@ts-ignore
                                        target[targetspecificKey].current = payload.currentUser.ID as BXUser

                                    }
                                    //@ts-ignore
                                    target[targetspecificKey].current = payload.currentUser as BXUser
                                    // if (payload.currentUser && payload.currentUser.ID) {
                                    //     //@ts-ignore
                                    //     target[targetspecificKey].current = payload.currentUser.ID as BXUser

                                    // }
                                    // console.log('payload.currentUser')
                                    // console.log(payload.currentUser)
                                }
                            }
                        }




                    }

                    if (specificKey === DEPARTAMENT_STATE_PROP.DEPARTAMENT) {
                        state[specificKey] = target as DepartmentStateItem
                    } else {
                        state[specificKey] = target as DUserStateItem
                    }
                    // console.log('departament state');
                    // console.log(state[specificKey])
                    // console.log(target);
                }
            }


        },
        setCurrentUser: (
            state: DepartmentState,
            action: PayloadAction<SetCurrentUserPayload>
        ) => {
            const payload = action.payload
            state[payload.from][payload.role].current = payload.value
            // console.log('setCurrentUser');
            // console.log(payload.value)
        },

        setMode: (
            state: DepartmentState,
            action: PayloadAction<{ code: DepartmentModeStateItemCode }>
        ) => {
            const payload = action.payload
      
            state[DEPARTAMENT_STATE_PROP.MODE]
                .items.forEach((mode: DepartmentModeStateItem) => {
                    if (mode.code === payload.code) {
                        localAPI.setData(mode, 'currentDepartmentMode')
                        state[DEPARTAMENT_STATE_PROP.MODE].current = mode
                    }
                })



        },

    },


});




export const departmentReducer = departmentSlice.reducer;

// Экспорт actions
export const departmentActions = departmentSlice.actions;