import { AppDispatch, AppGetState } from "@/modules/app/model/store";
import { EventState, SetErrorsPayload, errors, ErrorsCode, eventActions } from "./EventSlice";
import { eventReportActions, EventReportState } from "@/modules/entities/EventReport/model/EventReportSlice";
import { EV_REPORT_PROP } from "@/modules/entities/EventReport/type/event-report-type";
import { EventPlanState } from "@/modules/entities/EventPlan/model/EventPlanSlice";
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
    DepartmentState,
} from "@/modules/features/Departament/type/department-type";
import { EV_PLAN_CODE, EV_PLAN_PROP } from "@/modules/entities/EventPlan/type/event-plan-type";
import { format } from "date-fns";
import { EventTask } from "@/modules/entities/EventTask/types/event-task-type";
import { EventTaskState, eventTaskActions } from "@/modules/entities/EventTask/model/EventTaskSlice";
import { PresentationState } from "@/modules/entities/EventPresentation/model/PresSlice";
import { eventItemActions, EventItemResultType } from "@/modules/widgets/EventItem/model/EventItemSlice";
import { preloaderActions } from "@/modules/shared/Preloader";
import { finishResultMenu } from "@/modules/widgets/EventItem/model/EventItemThunk";
import { setCurrentReportContact } from "@/modules/entities/EventContact/model/EventContactThunk";
import { clearComment, getSavedComment } from "@/modules/entities/EventReport/model/EventReportThunk";

import { API_METHOD, hook as hookAPI } from "@workspace/api";
import { Bitrix } from '@workspace/bitrix';
import { Placement } from "@workspace/bx";
import { APP_DEP } from "@/modules/app/model/AppSlice";
import { eventPlanServiceActions, EventPlanServiceState } from "@/modules/entities/EventPlan/model/EventPlanServiceSlice";
import { serviceResultsActions } from "@/modules/entities/ServiceResults";
import { eventServiceAPI, EVS_ENDPOINT } from "@workspace/api/src/services/april-service-event-api";
import { EV_TARGET } from "../types/ev-process-type";
import { getSalesTaskGroupId, getServiceTaskGroupId } from "@workspace/pbx";
import { Portal } from "@workspace/pbx";

//thunks

//TODO SEND REPORT AND PLAN

export const initialEventApp =
    (foreignplacement: Placement | null = null) =>
        async (dispatch: AppDispatch, getState: AppGetState) => {
            // dispatch(setPreloader(true))
            const state = getState();
            let placementdata = foreignplacement as Placement | null;
            if (!placementdata) {
                placementdata = state.app.bitrix.placement as Placement | null;
            }

            if (!placementdata && (process.env.IN_BITRIX === 'true')) {
                placementdata = (await Bitrix.getService().api.getPlacement()) as Placement | null;
            }
            dispatch(getSavedComment());
            dispatch(eventActions.setFinishStatus({ status: false, result: "" }));
            let placement = null;
            if (placementdata) {
                //@ts-ignore
                if (placementdata.placement) {
                    placement = placementdata;
                }
            }

            // dispatch(getCallingPlan())
            //@ts-ignore
            if (placementdata && placementdata.options) {
                //@ts-ignore
                // dispatch(
                //     getBitrixItems(
                //         placementdata
                //     ))
            } else {
                dispatch(eventActions.setFullCompleteStatus({ status: true }));
            }
        };

export const sendSaleEvent = () => async (dispatch: AppDispatch, getState: AppGetState) => {
    // https://april-hook.ru/api/task?company_id={{companyId}}&deadline={{Дата холодного обзвона}}
    // &responsible={{Ответственный}}&created=user_107&name={{Название Холодного обзвона}}&crm={{ID}}
    const state = getState();

    dispatch(preloaderActions.setPreloader({ status: true }));

    const app = state.app


    const domain = app.domain;
    const placement = app.bitrix.placement as Placement;
    const currentUser = app.bitrix.user;

    // const event = state.event as EventState;
    const reportState = state.eventReport as EventReportState;
    const planState = state.eventPlan as EventPlanState;
    const departament = state.department as DepartmentState;
    const tasks = state.eventTask as EventTaskState;
    const presentation = state.eventPresentation as PresentationState | null;

    const description = reportState.report[EV_REPORT_PROP.COMMENT];
    const workStatus = reportState.report[EV_REPORT_PROP.WORK_STATUS];
    const noresultReason = reportState.report[EV_REPORT_PROP.NORESULT_REASON];
    const failType = reportState.report[EV_REPORT_PROP.FAIL_TYPE];
    const failReason = reportState.report[EV_REPORT_PROP.FAIL_REASON];
    const resultStatus = state.eventItemMenu.type;
    // const contactName = planState[EV_PLAN_PROP.CONTACT_NAME]
    // const contactPhone = planState[EV_PLAN_PROP.CONTACT_PHONE]
    // const contactEmail = planState[EV_PLAN_PROP.CONTACT_EMAIL]

    const contactState = state.contact;

    const departamentMode = state.department[DEPARTAMENT_STATE_PROP.MODE].current;

    const sale = state.eventSale;

    const contact = {
        // name: contactName,
        // email: contactEmail,
        // phone: contactPhone,
        current: contactState.current,
    };

    const reportContact = contactState.current.report;
    const planContact = contactState.current.plan;

    const report = {
        resultStatus,
        description,
        workStatus,
        noresultReason,
        failType,
        failReason,
        contact: reportContact,
    };

    const responsibility = departament[DEPARTAMENT_STATE_PROP.PLAN][DUSER_ROLE.RESPONSIBLE].current;
    const createdBy = departament[DEPARTAMENT_STATE_PROP.PLAN][DUSER_ROLE.CREATED_BY].current;

    const type = planState[EV_PLAN_PROP.TYPE];
    const name = planState[EV_PLAN_PROP.NAME];
    const deadline = planState[EV_PLAN_PROP.DATE];
    const formattedDeadline = format(new Date(deadline), "dd.MM.yyyy HH:mm:ss");
    const isPlanned =
        responsibility &&
        createdBy &&
        type &&
        deadline &&
        (workStatus.current.code === "inJob" || workStatus.current.code === "setAside");

    const plan = {
        responsibility,
        createdBy,
        type,
        name,
        deadline: formattedDeadline,
        isPlanned,
        contact: planContact,
    };

    const currentTask = tasks.current as EventTask | null;

    const saleData = {
        relationSalePresDeal: sale.presDeals.current,
    };

    const data = {
        domain,
        plan,
        report,
        placement,
        currentTask,
        presentation,
        sale: saleData,
        contact,
        departament: {
            mode: departamentMode,
            currentUser,
        },
    };

    // const companyId = placement.options.ID;

    // await bitrixActivityAPI.setActivity(
    //     companyId,
    //     report,
    //     plan,
    //     currentTask,
    //     currentCompany
    // )

    const hookRresponse = (await hookAPI.service("full", API_METHOD.POST, "data", data)) as {
        result: any;
        presInitLink: string | null;
    } | null;

    // if (hookRresponse) {
    //     if (hookRresponse.presInitLink) {
    //         const timelineresult = (process.env.IN_BITRIX === 'true') && await bitrixActivityAPI.setInformationPresentationInit(
    //             hookRresponse.presInitLink,
    //             companyId,
    //             responsibility.ID,
    //             plan.name
    //         )
    //         console.log('timelineresult')

    //         console.log(timelineresult)
    //     }
    // }

    dispatch(eventTaskActions.setCurrentTask({ task: null }));
    dispatch(setCurrentReportContact(null));
    dispatch(
        eventItemActions.setEventItemMenuStatus({
            status: false,
            menuType: null,
        })
    );
    // setTimeout(() => {

    //     (process.env.IN_BITRIX === 'true') && window.top.location.replace(`https://${domain}/crm/company/details/${companyId}/`)
    //     !(process.env.IN_BITRIX === 'true') && dispatch(
    //         preloaderActions.setPreloader({ status: false })
    //     )
    //     !(process.env.IN_BITRIX === 'true') && window.open(`https://${domain}/crm/company/details/${companyId}/`)
    // }, 1900)

    dispatch(eventTaskActions.setCleanTasks());

    dispatch(clearComment());
    // setTimeout(() => {
    //     dispatch(
    //         initialEventApp()

    //     )

    //     // dispatch(
    //     //     initial()
    //     // )

    //     // (process.env.IN_BITRIX === 'true') && window.top.location.replace(`https://${domain}/crm/company/details/${companyId}/`)
    //     // !(process.env.IN_BITRIX === 'true') && dispatch(
    //     //     preloaderActions.setPreloader({ status: false })
    //     // )
    //     // !(process.env.IN_BITRIX === 'true') && window.open(`https://${domain}/crm/company/details/${companyId}/`)
    // }, 1000)
    setTimeout(() => {
        // dispatch(
        //     getResultMenu(EventItemResultType.NEW, null)

        // )
        // dispatch(
        //     navigate(APP_TYPE.EVENT, ROUTE_EVENT.FINISH)
        // )

        dispatch(finishResultMenu());
        // (process.env.IN_BITRIX === 'true') && window.top.location.replace(`https://${domain}/crm/company/details/${companyId}/`)
        // !(process.env.IN_BITRIX === 'true') && dispatch(
        //     preloaderActions.setPreloader({ status: false })
        // )
        // !(process.env.IN_BITRIX === 'true') && window.open(`https://${domain}/crm/company/details/${companyId}/`)
    }, 1000);

    dispatch(preloaderActions.setPreloader({ status: false }));
};

export const sendServiceEvent = () => async (dispatch: AppDispatch, getState: AppGetState) => {

    const state = getState();

    dispatch(preloaderActions.setPreloader({ status: true }));
    const app = state.app
    const company = app.bitrix.company;
    const deal = app.bitrix.deal;
    const portal = state.portal.portal as Portal

    const isService = app.department === APP_DEP.SERVICE

    const domain = app.domain;
    const placement = app.bitrix.placement as Placement;
    const currentUser = app.bitrix.user;
    const taskGroupId = getServiceTaskGroupId(domain)


    const reportState = state.eventReport as EventReportState;
    const planState = state.eventPlanService as EventPlanServiceState;
    const serviceResults = state.serviceResults

    const departament = state.department as DepartmentState;
    // const tasks = state.eventServiceTask as EventTaskState;

    // const presentation = state.eventPresentation as PresentationState | null;

    const description = reportState.report[EV_REPORT_PROP.COMMENT];
    // const workStatus = reportState.report[EV_REPORT_PROP.WORK_STATUS];
    const noresultReason = reportState.report[EV_REPORT_PROP.NORESULT_REASON];
    // const failType = reportState.report[EV_REPORT_PROP.FAIL_TYPE];
    // const failReason = reportState.report[EV_REPORT_PROP.FAIL_REASON];
    const resultStatus = state.eventItemMenu.type;
    // const contactName = planState[EV_PLAN_PROP.CONTACT_NAME]
    // const contactPhone = planState[EV_PLAN_PROP.CONTACT_PHONE]
    // const contactEmail = planState[EV_PLAN_PROP.CONTACT_EMAIL]

    const contactState = state.contact;

    // const departamentMode = state.department[DEPARTAMENT_STATE_PROP.MODE].current;

    // const sale = state.eventSale;

    // const contact = {
    //   // name: contactName,
    //   // email: contactEmail,
    //   // phone: contactPhone,
    //   current: contactState.current,
    // };

    const reportContact = contactState.current.report;
    const planContact = contactState.current.plan;
    const communication = state.eventCommunication
    const communicationType = communication.type.current
    const communicationInitiative = communication.initiative.current
    const report = {
        resultStatus,
        description,
        // workStatus,
        noresultReason,
        // failType,
        // failReason,
        contact: reportContact,
        results: serviceResults,
        communication: {
            type: communicationType[EV_TARGET.REPORT],
            initiative: communicationInitiative[EV_TARGET.REPORT]
        },

    };

    const responsibility = departament[DEPARTAMENT_STATE_PROP.PLAN][DUSER_ROLE.RESPONSIBLE].current;
    const createdBy = departament[DEPARTAMENT_STATE_PROP.PLAN][DUSER_ROLE.CREATED_BY].current;

    const type = planState[EV_PLAN_PROP.TYPE];
    const name = planState[EV_PLAN_PROP.NAME];
    const deadline = planState[EV_PLAN_PROP.DATE];
    const formattedDeadline = format(new Date(deadline), "dd.MM.yyyy HH:mm:ss");
    // const isPlanned = planState
    // &&
    // (workStatus.current.code === "inJob" || workStatus.current.code === "setAside");

    const plan = {
        responsibility,
        createdBy,
        type,
        name,
        deadline: formattedDeadline,
        // isPlanned,
        contact: planContact,
        isActive: planState.isActive,
        isExpired: planState.isExpired,
        communication: {
            type: communicationType[EV_TARGET.PLAN],
            initiative: communicationInitiative[EV_TARGET.PLAN]
        },

    };

    const currentTask = state.eventTask.current as EventTask | null;


    // const saleData = {
    //   relationSalePresDeal: sale.presDeals.current,
    // };

    const data = {

        // dealId: deal && deal.ID as undefined | number,
        bx: {
            taskGroupId,
            companyId: company && company?.ID,
            dealId: deal && deal?.ID
        },
        domain,
        plan,
        report,
        placement,
        currentTask,
        // sale: saleData,
        // contact,
        departament: {
            // mode: departamentMode,
            currentUser,
        },
    };


    // await bitrixActivityAPI.setActivity(
    //     companyId,
    //     report,
    //     plan,
    //     currentTask,
    //     currentCompany
    // )

    // const hookRresponse = (await hookAPI.service("full", API_METHOD.POST, "data", data)) as {
    //   result: any;
    //   presInitLink: string | null;
    // } | null;
    void await eventServiceAPI.service(EVS_ENDPOINT.SEND_EVENT, API_METHOD.POST, data)

    // if (plan && plan.type && plan.type.current) {

    //   const timelineresult = (process.env.IN_BITRIX === 'true') && await bxActivityAPI
    //     .setActivity(
    //       // hookRresponse.presInitLink,
    //       company.ID,
    //       report,
    //       report.description,
    //       responsibility.ID,
    //       plan.type.current,
    //       plan.deadline
    //     )
    //   console.log('timelineresult')
    //   console.log(timelineresult)
    // }




    dispatch(eventTaskActions.setCurrentTask({ task: null }));
    dispatch(setCurrentReportContact(null));
    dispatch(
        eventItemActions.setEventItemMenuStatus({
            status: false,
            menuType: null,
        })
    );
    // setTimeout(() => {

    //     (process.env.IN_BITRIX === 'true') && window.top.location.replace(`https://${domain}/crm/company/details/${companyId}/`)
    //     !(process.env.IN_BITRIX === 'true') && dispatch(
    //         preloaderActions.setPreloader({ status: false })
    //     )
    //     !(process.env.IN_BITRIX === 'true') && window.open(`https://${domain}/crm/company/details/${companyId}/`)
    // }, 1900)

    dispatch(eventTaskActions.setCleanTasks());

    dispatch(clearComment());
    dispatch(serviceResultsActions.clean())
    dispatch(eventReportActions.clean())
    dispatch(eventPlanServiceActions.clean())
    // setTimeout(() => {
    //     dispatch(
    //         initialEventApp()

    //     )

    //     // dispatch(
    //     //     initial()
    //     // )

    //     // (process.env.IN_BITRIX === 'true') && window.top.location.replace(`https://${domain}/crm/company/details/${companyId}/`)
    //     // !(process.env.IN_BITRIX === 'true') && dispatch(
    //     //     preloaderActions.setPreloader({ status: false })
    //     // )
    //     // !(process.env.IN_BITRIX === 'true') && window.open(`https://${domain}/crm/company/details/${companyId}/`)
    // }, 1000)
    setTimeout(() => {
        // dispatch(
        //     getResultMenu(EventItemResultType.NEW, null)

        // )
        // dispatch(
        //     navigate(APP_TYPE.EVENT, ROUTE_EVENT.FINISH)
        // )

        dispatch(finishResultMenu());
        // (process.env.IN_BITRIX === 'true') && window.top.location.replace(`https://${domain}/crm/company/details/${companyId}/`)
        // !(process.env.IN_BITRIX === 'true') && dispatch(
        //     preloaderActions.setPreloader({ status: false })
        // )
        // !(process.env.IN_BITRIX === 'true') && window.open(`https://${domain}/crm/company/details/${companyId}/`)
    }, 400);

};

export const send = () => async (dispatch: AppDispatch, getState: AppGetState) => {
    const resultErrors = {
        isError: false as boolean,
        errors: { ...errors },
    } as SetErrorsPayload;

    const errorText = "Не заполнено обязательное поле";
    const state = getState()
    const depSettings = state.app.department as APP_DEP
    const isServiceDepartment = depSettings === APP_DEP.SERVICE



    const planState = isServiceDepartment ? state.eventPlanService : state.eventPlan;
    const isPlanActive = planState.isActive


    const reportState = state.eventReport;

    const departmentState = state.department[DEPARTAMENT_STATE_PROP.MODE].current;
    const workStatus = reportState.report[EV_REPORT_PROP.WORK_STATUS].current.code;

    const resultStatus = state.eventItemMenu.type as EventItemResultType;
    const isNew = resultStatus === EventItemResultType.NEW;

    const isNoResult = resultStatus === EventItemResultType.NORESULT; //ничего не планируется обязательный только коммент

    const isNoWork = workStatus === "fail" || workStatus === "setAside" || workStatus === "success";

    let isTmc = false;
    if (departmentState) {
        if (departmentState.code === "tmc") {
            isTmc = true;
        }
    }

    let isPlanning = isNew || !isNoWork;

    let isPresentationPlan = false;
    if (isPlanning) {
        if (planState.type.current.code === EV_PLAN_CODE.PRESENTATION) {
            isPresentationPlan = true;
        }
    }
    const currentPlanName = planState.name;
    // const currentPlancontactName = planState.contactName
    // const currentPlancontactPhone = planState.contactPhone
    // const currentPlancontactEmail = planState.contactEmail
    const currentComment = reportState.report[EV_REPORT_PROP.COMMENT];

    if (!currentComment) {
        resultErrors.errors.comment = "Напишите комментарий";
    }

    if (!isNoResult && !isNoWork) {
        if (isPlanActive && !currentPlanName) {
            resultErrors.errors.name = errorText;
        }
    }

    // if (isTmc && isPresentationPlan) {
    //     if (!currentPlancontactName) {
    //         resultErrors.errors.contactName = errorText
    //     }
    //     if (!currentPlancontactEmail) {
    //         resultErrors.errors.contactEmail = errorText
    //     }
    //     if (!currentPlancontactPhone) {
    //         resultErrors.errors.contactPhone = errorText
    //     }
    // }

    for (const key in resultErrors.errors) {
        const errorKey = key as ErrorsCode;

        if (resultErrors.errors[errorKey]) {
            resultErrors.isError = true;
        }
    }

    if (resultErrors.isError) {
        dispatch(eventActions.setErrors(resultErrors));
    } else {
        if (isServiceDepartment) {
            dispatch(sendServiceEvent());

        } else {
            dispatch(sendSaleEvent());

        }
    }
};

export const bxRedirect =
    (to: "deal" | "company" | "tasks") =>
        async (dispatch: AppDispatch, getState: AppGetState) => {
            dispatch(preloaderActions.setPreloader({ status: true }));
            const state = getState();
            const app = state.app
            const portal = state.portal.portal as Portal
            const domain = app.domain;
            const isService = app.department === APP_DEP.SERVICE

            let url = `https://${domain}/crm/${to}/list/`;





            if (to == 'deal') {
                const baseDealCode = isService ? 'service_base' : 'sales_base'
                const pDeal = portal.bitrixDeal

                const categories = pDeal.categories
                const baseCategory = categories.find(c => c.code == baseDealCode)

                url = `https://${domain}/crm/deal/kanban/category/${baseCategory.bitrixId}/`

            }

            if (to == "tasks") {
                const taskGroupId = !isService ? getSalesTaskGroupId(portal) : getServiceTaskGroupId(domain)

                url = `https://${domain}/workgroups/group/${taskGroupId}/tasks/`;
            }

            (process.env.IN_BITRIX === 'true') && window.top.location.replace(url);
            // !(process.env.IN_BITRIX === 'true') && dispatch(
            //     preloaderActions.setPreloader({ status: false })
            // )
            !(process.env.IN_BITRIX === 'true') && window.open(url);
        };
