import type { RootState } from '@/modules/app/model/store';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { EV_PLAN_CODE, EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
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
        workStatus === 'fail' || workStatus === 'setAside' || workStatus === 'success';
    const isFail = workStatus === 'fail';
    const isPlanActive = plan[EV_PLAN_PROP.IS_ACTIVE];

    if (!report[EV_REPORT_PROP.COMMENT]) {
        result.errors[EV_ERROR_CODE.COMMENT] = 'Напишите комментарий';
    }

    const isPlanning = isNew || !isNoWork;
    if (!isNoResult && isPlanning && isPlanActive) {
        if (!plan[EV_PLAN_PROP.NAME]) {
            result.errors[EV_ERROR_CODE.PLAN_NAME] = REQUIRED_TEXT;
        }
        if (!plan[EV_PLAN_PROP.TYPE].current) {
            result.errors[EV_ERROR_CODE.PLAN_TYPE] = 'Не выбран тип звонка';
        }
    }

    if (isFail && state.app.config.withPostFail) {
        if (!state.eventPostFail.postFailDate) {
            result.errors[EV_ERROR_CODE.POST_FAIL_DATE] =
                'Заполните дату следующего звонка';
        }
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
    [EV_PLAN_CODE.HOT]: 'Решение запланировано',
};

export const getPlannedFinishText = (state: RootState): string => {
    const code = state.eventPlan[EV_PLAN_PROP.TYPE].current?.code;
    return (code && PLANNED_FINISH_TEXT[code]) || 'Звонок запланирован';
};
