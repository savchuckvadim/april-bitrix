import { BXUser } from "@/modules/app/types/bitrix/bitrix-type"
import {
    DUSER_ROLE,
    DUserRoleStateItem,
    DUserStateItem, DepartmentModeStateItem, DepartmentModeStateItemCode, DepartmentRoleStateItem,
    DepartmentStateItem
} from "../type/department-type"


//current
const getInitialStateDUserItem = (): DUserRoleStateItem => {
    return {
        current: null as BXUser | null
    } as DUserRoleStateItem

}
export const getInitialStateDUserItems = (): DUserStateItem => {
    return {
        [DUSER_ROLE.RESPONSIBLE]: getInitialStateDUserItem(),
        [DUSER_ROLE.CREATED_BY]: getInitialStateDUserItem()
    } as DUserStateItem
}


//items
const getInitialDepartmentStateItem = (): DepartmentRoleStateItem => {
    return {
        items: [] as Array<BXUser>,
    } as DepartmentRoleStateItem

}
export const getInitialDepartmentStateItems = (): DepartmentStateItem => {
    return {
        [DUSER_ROLE.RESPONSIBLE]: getInitialDepartmentStateItem(),
        [DUSER_ROLE.CREATED_BY]: getInitialDepartmentStateItem()
    } as DepartmentStateItem
}



//mode
export const getModeByUser = (user: BXUser):DepartmentModeStateItemCode => {

    let current = {
        id: 0,
        code: 'sales',
        name: 'Менеджер ОП',
    } as DepartmentModeStateItem

    if (user) {
        if (user.WORK_POSITION) {
            if (user.WORK_POSITION.includes("ТМЦ")
            ) {
                current = {
                    id: 1,
                    code: 'tmc' as DepartmentModeStateItemCode,
                    name: 'Менеджер ТМЦ',
                } as DepartmentModeStateItem

            }
        }
    }

    return current.code

}

