import type { RootState } from '@/modules/app/model/store';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { WORK_STATUS_ITEMS } from '@/modules/entities/EventReport/lib/report-catalog';
import {
    EV_PLAN_CODE,
    EV_PLAN_PROP,
} from '@/modules/entities/EventPlan/type/event-plan-type';
import { toPlanDeadline } from '@/modules/entities/EventPlan/lib/plan-deadline';
import {
    EV_TYPE,
    EventTask,
} from '@/modules/entities/EventTask/types/event-task-type';
import { PresentationProp } from '@/modules/entities/EventPresentation/model/PresSlice';
import { isPresentationDone } from '@/modules/entities/EventPresentation/lib/presentation-done';
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
// Прямые пути, а не барель фичи: барель тянет UI-диалог чек-листа.
import { selectChecklistDtoAnswers } from '@/modules/features/CallChecklist/lib/checklist-dto-answers';
import { selectChecklistSmartAnswers } from '@/modules/features/CallChecklist/lib/checklist-smart-answers';
import { selectChecklistTextComment } from '@/modules/features/CallChecklist/lib/checklist-text-answers';
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

/**
 * Сумма продажи из ответа чек-листа: нули и мусор — «не передавать».
 * Бэк отличает «не прислали» от «прислали ноль», и обнулять сумму сделки
 * из-за незаполненного вопроса он не должен.
 */
const toSaleAmount = (value: string | undefined): number | undefined => {
    const amount = Number(value);
    return Number.isFinite(amount) && amount > 0 ? amount : undefined;
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

    // Итоговый комментарий: СНАЧАЛА слова менеджера, потом блоки опросников.
    // Хвост первым прятал комментарий в самый низ («…СПС?: 123» и следом
    // сиротой «123»), а запись истории начинается с «Звонок совершён: …» —
    // первой строкой там должен быть живой комментарий, не заголовок блока.
    //
    // Ответы анкет канала `text` идут перед хвостом презентации: их два-три
    // и они про этот звонок, а хвост — двадцать строк, которым место внизу.
    const tailComment = selectIsCheckPresentationApplicable(state)
        ? selectCheckPresentationComment(state)
        : '';
    const userComment = reportState.report[EV_REPORT_PROP.COMMENT];
    const description = [
        userComment,
        selectChecklistTextComment(state),
        tailComment,
    ]
        .filter(part => Boolean(part))
        .join('\n\n');

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
    // Дедлайн — через общий нормализатор (`DD.MM.YYYY HH:mm:ss`, канон
    // BitrixDateTime): раньше здесь стоял format(new Date(raw)), который на
    // неразбираемом сроке кидал RangeError прямо в отправке. Теперь
    // неразбираемый срок даёт пустую строку и isPlanned=false, а до этого
    // его не пропускает валидация (EV_ERROR_CODE.PLAN_DEADLINE).
    const deadline = !isNoCall
        ? toPlanDeadline(planState[EV_PLAN_PROP.DATE])
        : '';
    const isPlanned =
        !isNoCall &&
        Boolean(responsibility && createdBy && planType.current && deadline) &&
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
        deadline,
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

    // Ответы вопросов dto-канала по адресам каталога: значения уезжают
    // только в payload, в CRM фронт их не пишет.
    const dtoAnswers = selectChecklistDtoAnswers(state);

    // Ответы канала `smart` — конвертом: коды анкеты и вопроса плюс значение
    // в каноне каталога. Их адресат — поле ЭЛЕМЕНТА смарта (презентации,
    // ЗПР), которого сейчас ещё нет: элемент создаст или закроет сам поток
    // этого отчёта, он же разложит ответы по полям. Ни имени поля, ни id
    // элемента фрейм не шлёт — это адреса чужой системы.
    const smartAnswers = selectChecklistSmartAnswers(state);

    /*
     * Открытые дела клиента — ось «следующего события» на бэке.
     *
     * Поля вроде «дата следующего события» и «дата следующей презентации»
     * раньше писались слепо от текущего отчёта: запланировали звонок на
     * 7-е — и назначенная презентация 5-го исчезала с карточки. Теперь
     * бэк выбирает БЛИЖАЙШЕЕ дело, но для этого ему нужен их список;
     * фронт его уже загрузил, повторно ходить в Битрикс незачем.
     *
     * `deadlineRaw`, а НЕ `deadline`: второе перезаписано человекочитаемой
     * строкой («5 сентября 2026 12:00») и на бэке не разбирается.
     * Текущая задача НЕ исключается — бэк уберёт её сам по currentTask.id;
     * при переносе иначе осталась бы её старая дата.
     */
    const openTasks = (state.eventTask.tasks ?? []).map(task => ({
        id: Number(task.id),
        eventType: task.eventType,
        deadline: task.deadlineRaw ?? '',
        name: task.name,
        responsibleId: Number(task.responsibleId) || undefined,
    }));
    return {
        domain: app.domain,
        operationId: options.operationId,
        socketId: options.socketId,
        plan,
        report,
        context,
        placement: app.bitrix.placement ?? undefined,
        currentTask: currentTask ?? undefined,
        openTasks,
        presentation: {
            count: presentation[PresentationProp.COUNT],
            /*
             * Бэк читает ТОЛЬКО isPresentationDone, а «незапланированную»
             * выводит сам (isPresentationDone && отчёт не по презентации).
             * Кнопка на не-презентационной задаче ставит лишь
             * IS_UNPLANNED_PRESENTATION — без этого OR факт «презентация
             * проведена» терялся целиком: ни pres-сделки, ни KPI.
             */
            isPresentationDone: isPresentationDone(presentation),
            isUnplannedPresentation:
                presentation[PresentationProp.IS_UNPLANNED_PRESENTATION],
        },
        // Чек-лист продажи (dto-канал): ответы разложены по путям каталога
        // (`sale.opportunity`, `sale.firstPayDate`) — код поля адресом
        // больше не служит. Пишет их бэк одной операцией со сменой стадии
        // (сделку может создавать сам flow).
        sale: {
            relationSalePresDeal: sale.presDeals.current,
            ...(workStatusCode === 'success'
                ? {
                      opportunity: toSaleAmount(dtoAnswers['sale.opportunity']),
                      firstPayDate:
                          dtoAnswers['sale.firstPayDate'] || undefined,
                  }
                : {}),
        },
        // Ответы портальных анкет, адресованные полям элемента смарта.
        // Пусто — поля нет вовсе: бэк отличает «не прислали» (прежнее
        // поведение) от «прислали пустой список», а старый фрейм этого поля
        // не шлёт совсем и обязан работать по-прежнему.
        questionnaireAnswers: smartAnswers.length ? smartAnswers : undefined,
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
