import { format } from 'date-fns';
import type { RootState } from '@/modules/app/model/store';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { WORK_STATUS_ITEMS } from '@/modules/entities/EventReport/lib/report-catalog';
import {
    EV_PLAN_CODE,
    EV_PLAN_PROP,
} from '@/modules/entities/EventPlan/type/event-plan-type';
import {
    EV_TYPE,
    EventTask,
} from '@/modules/entities/EventTask/types/event-task-type';
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
import { inheritsLeadLink } from '@/modules/features/TaskLeadLinks/lib/task-lead-links';
import { EvFlowDto } from '../model';

/**
 * Блок leadSync: тип «не ЦА» из формы отказа + выбор модалки «презентация
 * связана с заявкой» (лид + обязательные статусы). Ничего не выбрано —
 * блока нет вовсе.
 */
const buildLeadSync = (state: RootState): EvFlowDto['leadSync'] => {
    const link = state.presentationLeadLink;
    const presentationPart =
        link.resolved && !link.noLink && link.selectedLeadId
            ? {
                  leadId: link.selectedLeadId,
                  presentationLink: true,
                  siteStatusCode: link.siteStatusCode ?? undefined,
              }
            : null;
    const notCaPart = state.leadRequest.finalSync.notCaTypeCode
        ? {
              notCaTypeCode: state.leadRequest.finalSync.notCaTypeCode,
              note: state.leadRequest.finalSync.note || undefined,
          }
        : null;
    if (!presentationPart && !notCaPart) return undefined;
    return { ...presentationPart, ...notCaPart };
};

interface BuildFlowOptions {
    /** отправка недозвона: план не активен, отметка isNoCall */
    isNoCall?: boolean;
    /** id операции: по нему бэкенд отличает повтор от новой отправки */
    operationId?: string;
    /**
     * socketId WS-подключения фрейма: по нему бэк шлёт `*-flow:done`
     * (в т.ч. `zpr-flow:done` сайд-очереди ЗПР) точечно в наш сокет.
     * Нет сокета — поле не уходит, бэк просто не шлёт push.
     */
    socketId?: string;
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

    // Итоговый комментарий: СНАЧАЛА слова менеджера, потом блоки опросника.
    // Хвост первым прятал комментарий в самый низ («…СПС?: 123» и следом
    // сиротой «123»), а запись истории начинается с «Звонок совершён: …» —
    // первой строкой там должен быть живой комментарий, не заголовок блока.
    const tailComment = selectIsCheckPresentationApplicable(state)
        ? selectCheckPresentationComment(state)
        : '';
    const userComment = reportState.report[EV_REPORT_PROP.COMMENT];
    const description = tailComment
        ? userComment
            ? `${userComment}\n\n${tailComment}`
            : tailComment
        : userComment;

    // «Не ЦА» — фронтовый статус: контракт очереди знает только четыре кода,
    // поэтому по проводам уходит «Отказ», а признак «не ЦА» несёт
    // leadSync.notCaTypeCode (buildLeadSync) — бэк по нему сам уводит сделку
    // в sales_not_ca и подписывает историю «Не ЦА».
    const workStatusSelect = reportState.report[EV_REPORT_PROP.WORK_STATUS];
    const workStatusForDto =
        workStatusSelect.current.code === 'notCa'
            ? {
                  ...workStatusSelect,
                  current:
                      WORK_STATUS_ITEMS.find(item => item.code === 'fail') ??
                      workStatusSelect.current,
              }
            : workStatusSelect;

    const report = {
        resultStatus,
        description,
        workStatus: workStatusForDto,
        noresultReason: reportState.report[EV_REPORT_PROP.NORESULT_REASON],
        failType: reportState.report[EV_REPORT_PROP.FAIL_TYPE],
        failReason: reportState.report[EV_REPORT_PROP.FAIL_REASON],
        contact: contactState.current.report || undefined,
        isNoCall,
    };

    const responsibility =
        departament[DEPARTAMENT_STATE_PROP.PLAN][DUSER_ROLE.RESPONSIBLE]
            .current;
    const createdBy =
        departament[DEPARTAMENT_STATE_PROP.PLAN][DUSER_ROLE.CREATED_BY].current;
    const workStatusCode =
        reportState.report[EV_REPORT_PROP.WORK_STATUS].current.code;

    const planType = planState[EV_PLAN_PROP.TYPE];
    const deadlineRaw = planState[EV_PLAN_PROP.DATE];
    const isPlanned =
        !isNoCall &&
        Boolean(
            responsibility && createdBy && planType.current && deadlineRaw,
        ) &&
        (workStatusCode === 'inJob' || workStatusCode === 'setAside');

    // Отмеченные менеджером заявки → L_* новой задачи. Шлём ровно тогда,
    // когда наследовать нечего (см. inheritsLeadLink): текущей задачи нет
    // ИЛИ у неё самой лид не указан — иначе цепочка теряла бы заявку.
    const relatedLeadIds =
        !inheritsLeadLink(state.eventTask.current) &&
        state.taskLeadLinks.selectedIds.length
            ? state.taskLeadLinks.selectedIds
            : undefined;

    const plan = {
        responsibility,
        createdBy,
        type: { current: planType.current },
        relatedLeadIds,
        name: planState[EV_PLAN_PROP.NAME],
        deadline:
            !isNoCall && deadlineRaw
                ? format(new Date(deadlineRaw), 'dd.MM.yyyy HH:mm:ss')
                : '',
        isPlanned,
        contact: contactState.current.plan || undefined,
        isActive: !isNoCall && planState[EV_PLAN_PROP.IS_ACTIVE],
        // Бэк (PlanDto.isImportant, 2508): флаг даёт задаче PRIORITY=HIGH
        // независимо от типа события.
        isImportant: planState[EV_PLAN_PROP.IS_IMPORTANT],
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
            returnToTmc.tmcDeals.find(
                item => item.taskId === Number(currentTask.id),
            )) ||
        undefined;

    // Честный контекст владельца: бэк резолвит company > deal > lead из него.
    // Реальный placement уходит рядом только на переходный период (BC).
    const toId = (value: unknown): number | undefined => {
        const id = Number(value);
        return Number.isFinite(id) && id > 0 ? id : undefined;
    };
    const context = app.bitrix.from
        ? {
              from: app.bitrix.from,
              companyId: toId(app.bitrix.company?.ID),
              dealId: toId(app.bitrix.deal?.ID),
              leadId: toId(app.bitrix.lead?.ID ?? state.eventLead.lead?.ID),
              taskId: toId(app.bitrix.task?.id ?? currentTask?.id),
          }
        : undefined;

    return {
        domain: app.domain,
        operationId: options.operationId,
        socketId: options.socketId,
        plan,
        report,
        context,
        placement: app.bitrix.placement ?? undefined,
        currentTask: currentTask ?? undefined,
        presentation: {
            count: presentation[PresentationProp.COUNT],
            /*
             * Бэк читает ТОЛЬКО isPresentationDone, а «незапланированную»
             * выводит сам (isPresentationDone && отчёт не по презентации).
             * Кнопка на не-презентационной задаче ставит лишь
             * IS_UNPLANNED_PRESENTATION — без этого OR факт «презентация
             * проведена» терялся целиком: ни pres-сделки, ни KPI.
             */
            isPresentationDone:
                presentation[PresentationProp.IS_PRESENTATION_DONE] ||
                presentation[PresentationProp.IS_UNPLANNED_PRESENTATION],
            isUnplannedPresentation:
                presentation[PresentationProp.IS_UNPLANNED_PRESENTATION],
        },
        // Чек-лист продажи (dto-канал): сумма → штатный OPPORTUNITY,
        // дата первой оплаты → first_pay_date; пишет бэк одной операцией
        // со сменой стадии (сделку может создавать сам flow).
        sale: {
            relationSalePresDeal: sale.presDeals.current,
            ...(workStatusCode === 'success'
                ? {
                      opportunity:
                          Number(
                              state.callChecklist.valueByCode['OPPORTUNITY'],
                          ) > 0
                              ? Number(
                                    state.callChecklist.valueByCode[
                                        'OPPORTUNITY'
                                    ],
                                )
                              : undefined,
                      firstPayDate:
                          state.callChecklist.valueByCode['first_pay_date'] ||
                          undefined,
                  }
                : {}),
        },
        contact: { current: contactState.current },
        departament: {
            mode: departament[DEPARTAMENT_STATE_PROP.MODE].current ?? undefined,
            currentUser: app.bitrix.user ?? undefined,
        },
        lead: state.eventLead.lead ?? undefined,
        // Синк заявки: тип «не ЦА» (форма отказа) + связь презентации
        // (модалка перед отправкой). Бэк двинет статусы связанных лидов,
        // залинкует презентацию и допишет историю.
        leadSync: buildLeadSync(state),
        fail: { postFailDate: state.eventPostFail.postFailDate },
        isPostSale,
        returnToTmc: {
            data: searchedTmcItem,
            isActive: returnToTmc.menu.isActive,
        },
    } as unknown as EvFlowDto;
};
