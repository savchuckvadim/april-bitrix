import { RootState } from '@/modules/app/model/store';
import { EV_REPORT_PROP } from '@/modules/entities/EventReport/type/event-report-type';
import { EV_PLAN_CODE, EV_PLAN_PROP } from '@/modules/entities/EventPlan/type/event-plan-type';
import { EventItemResultType } from '@/modules/widgets/EventItem/model/EventItemSlice';
import { DEPARTAMENT_STATE_PROP } from '@/modules/features/Departament/type/department-type';
import { emptyErrors } from '../model/EventSlice';
import { EV_ERROR_CODE, SetErrorsPayload } from '../types/event-types';

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
    if (state.app.config.withColorRequired && !isNoResult) {
        isColorRequiredError = !state.company.color.isChanged;
    }

    return { result, isColorRequiredError };
};

/** Планируется ли презентация (для текста финиша). */
export const isPresentationPlanned = (state: RootState): boolean =>
    state.eventPlan[EV_PLAN_PROP.TYPE].current?.code === EV_PLAN_CODE.PRESENTATION;

/** Режим отдела — ТМЦ? */
export const getIsTmcMode = (state: RootState): boolean =>
    state.department[DEPARTAMENT_STATE_PROP.MODE].current?.code === 'tmc';
