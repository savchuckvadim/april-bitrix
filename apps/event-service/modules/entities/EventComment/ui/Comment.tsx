import { FC, useEffect, useState } from "react"
import { EV_REPORT_PROP } from "../../EventReport/type/event-report-type"
import { useAppDispatch, useAppSelector } from "@/modules/app/lib/hooks/redux"
import { eventReportActions } from "../../EventReport"
import { eventActions } from "@/modules/processes/event"
import { EV_PLAN_CODE, EV_PLAN_PROP } from "@/modules/entities/EventPlan/type/event-plan-type"
import { EV_PLAN_STATE_ITEM } from "@/modules/entities/EventPlan/model/EventPlanSlice"
import { DEPARTAMENT_STATE_PROP } from "@/modules/features/Departament/type/department-type"
import { EventContact } from "@/modules/entities/EventContact"
import useWindowSize from "@/modules/app/lib/hooks/display"
import { EV_CONTACT_TYPE } from "@/modules/entities/EventContact/type/event-contact-type"
import { getSavedComment, saveComment } from "@/modules/entities/EventReport/model/EventReportThunk"
import { AText, EVCard } from "@workspace/april-ui"
import Communication from "@/modules/features/Communication"
import { EV_TARGET } from "@/modules/processes/event/types/ev-process-type"


export const Comment: FC = () => {
    const [isRequiredError, setIsRequiredError] = useState(false)

    const handleOnNameFocus = () => {
        if (isRequiredError) {
            setIsRequiredError(false)
        }


    }

    const dispatch = useAppDispatch();
    const error = useAppSelector(state => state.event.errors.current.comment)

    const handleChange = (value: string) => {
        if (error) {
            dispatch(
                eventActions
                    .setError(
                        {
                            code: EV_REPORT_PROP.COMMENT,
                            value: ''
                        }
                    )
            )
        }
        dispatch(
            eventReportActions
                .setReportProp(
                    {
                        propName: EV_REPORT_PROP.COMMENT,
                        value
                    }
                )
        )
       
    }

    const planState = useAppSelector(state => state.eventPlan)

    const type = planState[EV_PLAN_PROP.TYPE] as EV_PLAN_STATE_ITEM
    const currentDepartmentMode = useAppSelector(state => state.department[DEPARTAMENT_STATE_PROP.MODE].current)
    const isTmcMode = currentDepartmentMode.code === 'tmc'
    const isPresentationPlaning = type.current.code === EV_PLAN_CODE.PRESENTATION
    const isBigComment = isTmcMode && isPresentationPlaning
    const { width } = useWindowSize();
    const [isSmallDisplay, setIsSmallDisplay] = useState(width < 577)
    useEffect(() => {
        const isSmall = width < 577
        setIsSmallDisplay(
            isSmall
        )

    }, [
        width
    ])
    const text = useAppSelector(state => state.eventReport.report[EV_REPORT_PROP.COMMENT])
    const cache = () => dispatch(
        saveComment()
    )


    const currentTask = useAppSelector(state => state.eventTask.current)
    const reportTypeString = currentTask && currentTask.type ? 'Отчетность по событию ' + currentTask.type : 'Комментарий'

    return (

        <EVCard title={reportTypeString} width={12} size={isSmallDisplay ? "small" : "big"}>
            {currentTask && <Communication from={EV_TARGET.REPORT} />}

            {
                currentTask && <EventContact type={EV_CONTACT_TYPE.REPORT} />
            }
            <AText
                label={'Опишите кратко что было'}
                height={isSmallDisplay ? 4 : currentTask ? 8 : 10}
                handleChange={handleChange}
                nameForHandler={EV_REPORT_PROP.COMMENT}
                errorMessage={error}
                handleBlur={cache}
                current={text}
            />

        </EVCard>

    )
}
