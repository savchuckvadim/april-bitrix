import { FC } from "react"
import { ASelect } from "@workspace/april-ui"
import { DEPARTAMENT_STATE_PROP, DUSER_ROLE, DUserStateItem } from "@/modules/features/Departament/type/department-type"
import { useAppDispatch, useAppSelector } from "@/modules/app/lib/hooks/redux"
import { setCurrentUser } from "../model/DepartmentThunk"


interface DepartmentProp {
    from: DEPARTAMENT_STATE_PROP

}

export const Department: FC<DepartmentProp> = ({
    from,
}) => {

    const departmentState = useAppSelector(state => state.department)
    const dUserTarget = departmentState[from] as DUserStateItem
    const createdItems = departmentState[DEPARTAMENT_STATE_PROP.DEPARTAMENT][DUSER_ROLE.CREATED_BY].items
    const responsibleItems = departmentState[DEPARTAMENT_STATE_PROP.DEPARTAMENT][DUSER_ROLE.RESPONSIBLE].items
    const currentDepartmentMode = useAppSelector(state => state.department[DEPARTAMENT_STATE_PROP.MODE].current)

    const isTmcMode = currentDepartmentMode.code === 'tmc'

    const dispatch = useAppDispatch()
    const setCurrentParticipant = (role: DUSER_ROLE, value: number) => {

        dispatch(
            setCurrentUser(
                DEPARTAMENT_STATE_PROP.PLAN,
                role,
                value
            )
        )
    }
    // const currentResponsible = dUserTarget[DUSER_ROLE.RESPONSIBLE].current
    // let currentResponsibleId = currentResponsible ? currentResponsible.ID : null
    
   return <>

        {<ASelect
            label={'Руководитель'}
            nameForHandler={DUSER_ROLE.CREATED_BY}
            handleChange={setCurrentParticipant}
            current={dUserTarget[DUSER_ROLE.CREATED_BY].current}
            items={createdItems}
        />}
        {!isTmcMode && <ASelect
            label={'Ответсвенный'}
            nameForHandler={DUSER_ROLE.RESPONSIBLE}
            handleChange={setCurrentParticipant}
            current={dUserTarget[DUSER_ROLE.RESPONSIBLE].current}
            items={responsibleItems}
        />}
    </>




}
