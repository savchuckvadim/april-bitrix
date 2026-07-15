import { format } from 'date-fns';
import { RootState } from '@/modules/app/model/store';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { EV_PLAN_CODE, EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
import { EV_TYPE, EventTask } from '@/modules/entities/EventTask/types/event-task-type';
import { PresentationProp } from '@/modules/entities/EventPresentation/model/PresSlice';
import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
} from '@/modules/features/Departament/type/department-type';
import {
    selectCheckPresentationComment,
    selectIsCheckPresentationApplicable,
} from '@/modules/features/AfterPresentation';
import { EvFlowDto } from '../model';

interface BuildFlowOptions {
    /** отправка недозвона: план не активен, отметка isNoCall */
    isNoCall?: boolean;
}

/**
 * Сборка EventSalesFlowDto из состояния (порт legacy sendEvent-пейлоада 1:1).
 * Generated тип сверяет структуру с бэком на компиляции — главный выигрыш Фазы 0.
 */
export const buildFlowPayload = (
    state: RootState,
    options: BuildFlowOptions = {},
): EvFlowDto => {
    const isNoCall = options.isNoCall ?? false;

    const app = state.app;
    const reportState = state.eventReport;
    const planState = state.eventPlan;
    const departament = state.department;
    const presentation = state.eventPresentation;
    const contactState = state.contact;
    const sale = state.eventSale;
    const resultStatus = state.eventItemMenu.type;

    // итоговый комментарий: хвост опросника (если применим) + комментарий пользователя
    const tailComment = selectIsCheckPresentationApplicable(state)
        ? selectCheckPresentationComment(state)
        : '';
    const userComment = reportState.report[EV_REPORT_PROP.COMMENT];
    const description = tailComment
        ? `${tailComment}\n${userComment}`
        : userComment;

    const report = {
        resultStatus,
        description,
        workStatus: reportState.report[EV_REPORT_PROP.WORK_STATUS],
        noresultReason: reportState.report[EV_REPORT_PROP.NORESULT_REASON],
        failType: reportState.report[EV_REPORT_PROP.FAIL_TYPE],
        failReason: reportState.report[EV_REPORT_PROP.FAIL_REASON],
        contact: contactState.current.report || undefined,
        isNoCall,
    };

    const responsibility =
        departament[DEPARTAMENT_STATE_PROP.PLAN][DUSER_ROLE.RESPONSIBLE].current;
    const createdBy =
        departament[DEPARTAMENT_STATE_PROP.PLAN][DUSER_ROLE.CREATED_BY].current;
    const workStatusCode = reportState.report[EV_REPORT_PROP.WORK_STATUS].current.code;

    const planType = planState[EV_PLAN_PROP.TYPE];
    const deadlineRaw = planState[EV_PLAN_PROP.DATE];
    const isPlanned =
        !isNoCall &&
        Boolean(responsibility && createdBy && planType.current && deadlineRaw) &&
        (workStatusCode === 'inJob' || workStatusCode === 'setAside');

    const plan = {
        responsibility,
        createdBy,
        type: { current: planType.current },
        name: planState[EV_PLAN_PROP.NAME],
        deadline:
            !isNoCall && deadlineRaw
                ? format(new Date(deadlineRaw), 'dd.MM.yyyy HH:mm:ss')
                : '',
        isPlanned,
        contact: contactState.current.plan || undefined,
        isActive: !isNoCall && planState[EV_PLAN_PROP.IS_ACTIVE],
    };

    // презентация без отметки «проведена» при результативном событии
    // отчитывается как обычный звонок (перенос презентации)
    let currentTask = state.eventTask.current as EventTask | null;
    if (currentTask) {
        currentTask = { ...currentTask };
        if (
            currentTask.eventType === 'presentation' &&
            !presentation[PresentationProp.IS_PRESENTATION_DONE] &&
            resultStatus === EventItemResultType.RESULT
        ) {
            currentTask.eventType = 'warm';
            currentTask.type = EV_TYPE.WARM;
            currentTask.isPresentationCanceled = true;
            currentTask.originalEventType = 'presentation';
        }
    }

    const isPostSale =
        planType.current?.code === EV_PLAN_CODE.SUPPLY ||
        currentTask?.eventType === 'supply';

    const returnToTmc = state.returnToTmc;
    const searchedTmcItem =
        (returnToTmc.menu.isActive &&
            currentTask?.id &&
            returnToTmc.tmcDeals.find(item => item.taskId === Number(currentTask.id))) ||
        undefined;

    return {
        domain: app.domain,
        plan,
        report,
        placement: app.bitrix.placement ?? undefined,
        currentTask: currentTask ?? undefined,
        presentation: {
            count: presentation[PresentationProp.COUNT],
            isPresentationDone: presentation[PresentationProp.IS_PRESENTATION_DONE],
            isUnplannedPresentation:
                presentation[PresentationProp.IS_UNPLANNED_PRESENTATION],
        },
        sale: { relationSalePresDeal: sale.presDeals.current },
        contact: { current: contactState.current },
        departament: {
            mode: departament[DEPARTAMENT_STATE_PROP.MODE].current ?? undefined,
            currentUser: app.bitrix.user ?? undefined,
        },
        lead: state.eventLead.lead ?? undefined,
        fail: { postFailDate: state.eventPostFail.postFailDate },
        isPostSale,
        returnToTmc: {
            data: searchedTmcItem,
            isActive: returnToTmc.menu.isActive,
        },
    } as unknown as EvFlowDto;
};
