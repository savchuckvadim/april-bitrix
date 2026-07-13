import { FC, useEffect, useState } from "react"
import { DEPARTAMENT_STATE_PROP } from "@/modules/features/Departament/type/department-type"
import { Department } from "@/modules/features/Departament"
import { useAppDispatch, useAppSelector } from "@/modules/app/lib/hooks/redux"
import { EventItemResultType } from "@/modules/widgets/EventItem/model/EventItemSlice"
import { ErrorsCode, eventActions } from "@/modules/processes/event/model/EventSlice"
import { EventContact } from "@/modules/entities/EventContact"
import useWindowSize from "@/modules/app/lib/hooks/display"
import { EV_CONTACT_PROP, EV_CONTACT_TYPE } from "@/modules/entities/EventContact/type/event-contact-type"
import { EV_PLAN_STATE_SERVICE_ITEM, eventPlanServiceActions } from "../model/EventPlanServiceSlice"
import { EV_PLAN_SERVICE_PROP } from "../type/event-plan-service-type"
import { ADate, AInput, ASelect, EVCard, EventCardAction } from "@workspace/april-ui"
import { usePlanService } from "../lib/hooks/use-plan-service"
import Communication from "@/modules/features/Communication"
import { EV_TARGET } from "@/modules/processes/event/types/ev-process-type"
import { EV_REPORT_PROP, EventReportStateReport } from "@/modules/entities/EventReport/type/event-report-type"
import { eventReportActions } from "@/modules/entities/EventReport"


const PlanService: FC = () => {
    const { date, type, isNoResultMenu, planPropChange } = usePlanService();


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


    // const [isRequiredError, setIsRequiredError] = useState(false)
    // const [nameErrorMessge, setIsNameErrorMessge] = useState('')
    const [isDepartmentShow, setIsDepartmentShow] = useState(false)
    const [planActionName, setPlanActionName] = useState('Сотрудник')
    // const [isPlan, setIsPlan] = useState(false)
    const isPlan = useAppSelector(state => state.eventPlanService.isActive)
    const setIsPlan = () => dispatch(
        eventPlanServiceActions.setIsActive()
    )
    const currentDepartmentMode = useAppSelector(state => state.department[DEPARTAMENT_STATE_PROP.MODE].current)
    const isTmcMode = currentDepartmentMode.code === 'tmc'


    const menuType = useAppSelector(state => state.eventItemMenu.type)

    const isNoResult = menuType === EventItemResultType.NORESULT

    const isNoresultTmc = isTmcMode && isNoResult

    const dispatch = useAppDispatch()

    const handleOnNameFocus = (code: EV_PLAN_SERVICE_PROP | EV_CONTACT_PROP, error: string) => {


        if (error) {
            if (code) {
                if (code === EV_PLAN_SERVICE_PROP.NAME) {
                    const resCode = code as ErrorsCode

                    dispatch(
                        eventActions
                            .setError(
                                {
                                    code: resCode,
                                    value: ''
                                }
                            )
                    )
                } else if (code === EV_CONTACT_PROP.NAME || code === EV_CONTACT_PROP.PHONE || code === EV_CONTACT_PROP.EMAIL || code === EV_CONTACT_PROP.POST) {

                }
            }


        }


    }

    const planModeHendler = () => {
        let actionName = 'Сотрудник'
        if (!isDepartmentShow) {
            actionName = 'Вернуться'
        }
        setPlanActionName(actionName)
        setIsDepartmentShow(!isDepartmentShow)
    }

    //  <React.Fragment>

    const errors = useAppSelector(state => state.event.errors.current)


    //for no result status
    const reportState = useAppSelector(state => state.eventReport)
    const report = reportState.report as EventReportStateReport

    const handleChange = (type: EV_REPORT_PROP, value: string) => {
        dispatch(
            eventReportActions.setReportProp({
                propName: type,
                value
            })
        )

    }
    return <> <EVCard
        title={isNoResultMenu ? 'Перенос' : 'Планирование'}
        width={12}
        // size={(isSmallDisplay) ? "smallest" : (isNoresultTmc || !isTmcMode || (isTmcMode && !isPresentationPlaning)) ? 'big' : "full"}
        size={(isSmallDisplay) ? "smallest" : 'large'}
        withClose={true}
        isClose={!isPlan}
        closeAction={setIsPlan}
        actionComponent={
            !isTmcMode && <EventCardAction
                title={planActionName}
                hendler={planModeHendler}
            />
        }
    >

        {isDepartmentShow ?
            <Department
                from={DEPARTAMENT_STATE_PROP.PLAN}
            />
            : <>
                {
                    !isNoResultMenu && <Communication from={EV_TARGET.PLAN} />

                }
                {
                    !isNoResultMenu && <EventContact type={EV_CONTACT_TYPE.PLAN} />
                }
                {!isNoResultMenu && <AInput
                    label={'Название - что нужно сделать'}
                    errorMessage={errors[EV_PLAN_SERVICE_PROP.NAME]}
                    nameForHandler={EV_PLAN_SERVICE_PROP.NAME}
                    handleChange={planPropChange}
                    handleOnFocus={handleOnNameFocus}
                />}
                {!isNoResultMenu && <ASelect
                    label={'Тип звонка'}
                    nameForHandler={EV_PLAN_SERVICE_PROP.TYPE}
                    handleChange={planPropChange}

                    current={type.current}
                    //@ts-ignore
                    items={type.items}
                />}
                {/* {isNoResult &&
                    <ASelect
                        label={'Причины нерезультативности'}
                        nameForHandler={EV_REPORT_PROP.NORESULT_REASON}
                        handleChange={handleChange}
                        current={report[EV_REPORT_PROP.NORESULT_REASON].current}
                        items={report[EV_REPORT_PROP.NORESULT_REASON].items}
                    />} */}
                <ADate
                    label={'Дата и время звонка'}
                    value={date}
                    // errorMessage={null}
                    nameForHandler={EV_PLAN_SERVICE_PROP.DATE}
                    handleChange={planPropChange}
                // handleOnFocus={false}
                />
                <div className="mb-5"></div>




                {/* {!isNoResultMenu && isTmcMode && isPresentationPlaning && <>
                    <AInput
                        label={'ФИО контактного лица'}
                        errorMessage={errors[EV_PLAN_PROP.CONTACT_NAME]}
                        nameForHandler={EV_PLAN_PROP.CONTACT_NAME}
                        handleChange={planPropChange}
                        handleOnFocus={handleOnNameFocus}
                    />
                    <AInput
                        label={'Телефон контактного лица'}
                        errorMessage={errors[EV_PLAN_PROP.CONTACT_PHONE]}
                        nameForHandler={EV_PLAN_PROP.CONTACT_PHONE}
                        handleChange={planPropChange}
                        handleOnFocus={handleOnNameFocus}
                    />
                    <AInput
                        label={'E-mail контактного лица'}
                        errorMessage={errors[EV_PLAN_PROP.CONTACT_EMAIL]}
                        nameForHandler={EV_PLAN_PROP.CONTACT_EMAIL}
                        handleChange={planPropChange}
                        handleOnFocus={handleOnNameFocus}
                    />

                    <Department
                        from={DEPARTAMENT_STATE_PROP.PLAN}
                    />
                </>
                } */}
            </>
        }
        {/* </Col> */}
    </EVCard>

    </>


}

export default PlanService