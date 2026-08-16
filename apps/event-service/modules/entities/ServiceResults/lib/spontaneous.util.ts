import {
    EV_SERVICE_PLAN_CODE,
    EV_SERVICE_PLAN_NAME,
} from '@/modules/entities/EventPlan/type/event-plan-service-type';
import { ServiceResultsState } from '../model/ServiceResultsSlice';

export type SpontaneousResultItem = {
    code: EV_SERVICE_PLAN_CODE;
    name: string;
};

const CODE_KEYS = Object.keys(EV_SERVICE_PLAN_CODE) as Array<
    keyof typeof EV_SERVICE_PLAN_CODE
>;

// код -> имя через общий ключ двух enum'ов (не по индексу — безопасно при реордере)
export const getServiceResultName = (code: EV_SERVICE_PLAN_CODE): string => {
    const key = CODE_KEYS.find((k) => EV_SERVICE_PLAN_CODE[k] === code);
    return key ? EV_SERVICE_PLAN_NAME[key] : code;
};

// все включённые тумблеры -> payload report.spontaneous: [{code, name}]
export const getSpontaneousItems = (
    results: ServiceResultsState
): SpontaneousResultItem[] =>
    (Object.entries(results) as Array<[EV_SERVICE_PLAN_CODE, boolean]>)
        .filter(([, isDone]) => isDone)
        .map(([code]) => ({ code, name: getServiceResultName(code) }));
