import type { RootState } from '@/modules/app/model/store';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import {
    EV_PLAN_CODE,
    EV_PLAN_PROP,
} from '@/modules/entities/EventPlan/type/event-plan-type';
import { isPlanDeadlineValid } from '@/modules/entities/EventPlan/lib/plan-deadline';
import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { getChecklistGateError } from './questionnaire-gate';
import { COMMENT_MAX_LENGTH, PLAN_NAME_MAX_LENGTH } from './text-limits';
import { emptyErrors } from '../model/EventSlice';
import { EV_ERROR_CODE, SetErrorsPayload } from '../types/event-types';

export { getIsTmcMode } from '@/modules/app/lib/utills/app-state-util';

export interface SendValidationResult {
    result: SetErrorsPayload;
    /** прогноз компании обязателен, но не менялся (withColorRequired) */
    isColorRequiredError: boolean;
}

const REQUIRED_TEXT = 'Не заполнено обязательное поле';

/**
 * Валидация отправки отчёта (порт legacy send(), чистая функция):
 * комментарий обязателен; при планировании — имя и тип события;
 * при «Отказе» на withPostFail-доменах — дата следующего звонка;
 * на withColorRequired-доменах — обновлённый прогноз компании.
 */
export const validateSend = (state: RootState): SendValidationResult => {
    const result: SetErrorsPayload = {
        isError: false,
        errors: { ...emptyErrors },
    };

    const report = state.eventReport.report;
    const plan = state.eventPlan;
    const workStatus = report[EV_REPORT_PROP.WORK_STATUS].current.code;
    const resultStatus = state.eventItemMenu.type;

    const isNew = resultStatus === EventItemResultType.NEW;
    const isNoResult = resultStatus === EventItemResultType.NORESULT;
    const isNoWork =
        workStatus === 'fail' ||
        workStatus === 'setAside' ||
        workStatus === 'success' ||
        workStatus === 'notCa';
    const isFail = workStatus === 'fail';
    const isPlanActive = plan[EV_PLAN_PROP.IS_ACTIVE];

    if (!report[EV_REPORT_PROP.COMMENT]) {
        result.errors[EV_ERROR_CODE.COMMENT] = 'Напишите комментарий';
    } else if (report[EV_REPORT_PROP.COMMENT].length > COMMENT_MAX_LENGTH) {
        // Страховка на случай значения мимо maxLength (вставка из буфера,
        // черновик из localStorage): раздутый комментарий не записывается.
        result.errors[EV_ERROR_CODE.COMMENT] =
            `Комментарий длиннее ${COMMENT_MAX_LENGTH} символов — сократите`;
    }

    const isPlanning = isNew || !isNoWork;
    if (!isNoResult && isPlanning && isPlanActive) {
        if (!plan[EV_PLAN_PROP.NAME]) {
            result.errors[EV_ERROR_CODE.PLAN_NAME] = REQUIRED_TEXT;
        } else if (plan[EV_PLAN_PROP.NAME].length > PLAN_NAME_MAX_LENGTH) {
            result.errors[EV_ERROR_CODE.PLAN_NAME] =
                `Название длиннее ${PLAN_NAME_MAX_LENGTH} символов — сократите`;
        }
        if (!plan[EV_PLAN_PROP.TYPE].current) {
            result.errors[EV_ERROR_CODE.PLAN_TYPE] = 'Не выбран тип звонка';
        }
        // Срок — не «ещё одно поле формы», а условие существования задачи:
        // без разбираемого дедлайна plan.isPlanned молча становится false,
        // задача не создаётся, клиент остаётся без следующего шага, а экран
        // финиша всё равно рапортует об успехе (SendThunk: finishResult).
        if (!isPlanDeadlineValid(plan[EV_PLAN_PROP.DATE])) {
            result.errors[EV_ERROR_CODE.PLAN_DEADLINE] =
                'Укажите дату и время следующего события';
        }
    }

    // Продажа требует компанию: без неё сделка продажи и её привязки на
    // бэке не создаются — отчёт уходил бы в никуда. Отказ разрешён.
    if (workStatus === 'success' && !state.app.bitrix.company) {
        result.errors[EV_ERROR_CODE.WORK_STATUS] =
            'Продажу нельзя оформить без компании — привяжите компанию к сделке';
    }

    if (isFail && state.app.config.withPostFail) {
        if (!state.eventPostFail.postFailDate) {
            result.errors[EV_ERROR_CODE.POST_FAIL_DATE] =
                'Заполните дату следующего звонка';
        }
    }

    // «Не ЦА» без типа не отправляем: без него бэк не уведёт сделку в
    // стадию «не ЦА» и не разметит заявки. Дата следующего звонка при
    // «Не ЦА» НЕ требуется — возвращаться к нецелевому клиенту не планируем.
    if (
        workStatus === 'notCa' &&
        !state.leadRequest.finalSync.notCaTypeCode
    ) {
        result.errors[EV_ERROR_CODE.NOT_CA_TYPE] = 'Выберите тип «не ЦА»';
    }

    // Анкеты выбранного типа звонка и типа отчёта: обязательные вопросы
    // должны быть заполнены до отправки (неустановленные на портале поля
    // не блокируют — вопрос без адреса просто не показывается).
    //
    // Состав берётся из стора: портальный каталог, если доехал, встроенный
    // набор иначе. Ждать каталог отсюда нечем — валидация синхронна, её
    // зовёт и рендер; ожидание с дедлайном стоит первым шагом send(). Из-за
    // этого политика деградации записана ОДИН раз, в questionnaire-gate.
    const checklistError = getChecklistGateError(state);
    if (checklistError) {
        result.errors[EV_ERROR_CODE.PLAN_CHECKLIST] = checklistError;
    }

    result.isError = Object.values(result.errors).some(Boolean);

    let isColorRequiredError = false;
    // Прогноз проверяем только при живой компании: по сделке без компании
    // контрола прогноза на экране нет, и требование было невыполнимым —
    // отправка результативного отчёта блокировалась молча.
    if (
        state.app.config.withColorRequired &&
        !isNoResult &&
        !!state.app.bitrix.company
    ) {
        isColorRequiredError = !state.company.color.isChanged;
    }

    return { result, isColorRequiredError };
};

/** Текст финиша по типу запланированного события. */
const PLANNED_FINISH_TEXT: Partial<Record<EV_PLAN_CODE, string>> = {
    [EV_PLAN_CODE.PRESENTATION]: 'Презентация запланирована',
    [EV_PLAN_CODE.REFINE]: 'Доработка запланирована',
    [EV_PLAN_CODE.HOT]: 'Решение запланировано',
};

export const getPlannedFinishText = (state: RootState): string => {
    // Перенос — не «запланировано заново»: то же дело уехало на другой срок,
    // и финиш обязан сказать именно это (см. usePlanReschedule).
    const isReschedule =
        state.eventItemMenu.type === EventItemResultType.NORESULT &&
        Boolean(state.eventTask.current);
    if (isReschedule) return 'Событие перенесено';

    const code = state.eventPlan[EV_PLAN_PROP.TYPE].current?.code;
    return (code && PLANNED_FINISH_TEXT[code]) || 'Звонок запланирован';
};
