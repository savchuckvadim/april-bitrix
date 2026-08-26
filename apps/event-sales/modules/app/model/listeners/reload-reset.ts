import type { UnknownAction } from '@reduxjs/toolkit';
import { taskDealsActions } from '@/modules/entities/RelatedCrm/model/TaskDealsSlice';
import { relatedCrmActions } from '@/modules/entities/RelatedCrm/model/RelatedCrmSlice';
import { bitrixUserActions } from '@/modules/entities/BitrixUser/model/BitrixUserSlice';
import { eventContactActions } from '@/modules/entities/EventContact/model/EventContactSlice';
import { eventHistoryActions } from '@/modules/entities/EVHistory/model/EVHistorySlice';
import { eventCallingRecordActions } from '@/modules/entities/EventCallingRecord/model/EventCallingRecordSlice';
import { eventLeadActions } from '@/modules/entities/EVLid/model/EVLeadSlice';
import { planScheduleActions } from '@/modules/entities/EventPlan/model/PlanScheduleSlice';
import { purchaseSignalsActions } from '@/modules/features/PurchaseSignals/model/PurchaseSignalsSlice';
import { callChecklistActions } from '@/modules/features/CallChecklist/model/CallChecklistSlice';
import { stagePredictActions } from '@/modules/features/StagePredict/model/StagePredictSlice';
import { leadMarksActions } from '@/modules/features/LeadMarks/model/LeadMarksSlice';
import { innActions } from '@/modules/features/Inn/model/InnSlice';
import { clientSignalsActions } from '@/modules/features/ClientSignals/model/ClientSignalsSlice';
import { leadRequestActions } from '@/modules/features/LeadRequestCard/model/LeadRequestSlice';
import { presentationLeadLinkActions } from '@/modules/features/PresentationLeadLink/model/PresentationLeadLinkSlice';
import { taskLeadLinksActions } from '@/modules/features/TaskLeadLinks/model/TaskLeadLinksSlice';
import { duplicatesActions } from '@/modules/features/Duplicates/model/DuplicatesSlice';
import { afterPresentationActions } from '@/modules/features/AfterPresentation/model/AfterPresentationSlice';
import { xvostFieldsActions } from '@/modules/features/XvostFields/model/XvostFieldsSlice';

/**
 * Каталог сбросов на перезагрузку приложения (кнопка ⟳ / reload после
 * отправки отчёта).
 *
 * appActions.reload гасит только app.initialized; всё, что КЭШИРУЕТ данные
 * («уже запрошено», status: 'ready', initialized, карты по id, оверрайды),
 * обязано сброситься здесь — иначе повторный init не перезапросит модуль, и
 * после reload на экране остаются данные прошлой сессии.
 *
 * Перезапрос данных триггерят сами листенеры init-цепочки: setAppData
 * (relatedCrm, дубли, предикт, план), setPortal (контакты, поля компании,
 * опросник) и setFetchedTasks (сделки задач, продажи, счётчики). Ленивые
 * секции (история, записи звонков) перезапрашивают при следующем показе —
 * сброс возвращает их в 'idle', и mount-эффект снова уходит за данными.
 *
 * Слайсы формы текущего отчёта (eventReport, eventPlan, eventPresentation,
 * eventPostFail, черновик комментария) сюда НЕ входят намеренно: ручное
 * обновление не должно терять заполняемый отчёт; их чистит cleanEvent после
 * успешной отправки.
 */
export const getReloadResetActions = (): UnknownAction[] => [
    taskDealsActions.reset(),
    relatedCrmActions.reset(),
    bitrixUserActions.reset(),
    purchaseSignalsActions.reset(),
    callChecklistActions.reset(),
    stagePredictActions.reset(),
    leadMarksActions.reset(),
    innActions.reset(),
    clientSignalsActions.reset(),
    leadRequestActions.reset(),
    presentationLeadLinkActions.resetForNewEvent(),
    taskLeadLinksActions.reset(),
    duplicatesActions.reset(),
    afterPresentationActions.reset(),
    xvostFieldsActions.reset(),
    eventContactActions.reset(),
    eventHistoryActions.reset(),
    eventCallingRecordActions.clean(),
    eventLeadActions.clean(),
    planScheduleActions.reset(),
];
