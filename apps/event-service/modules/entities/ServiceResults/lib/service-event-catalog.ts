import type { Tone } from '@workspace/april-ui/tones';
import {
    EV_SERVICE_PLAN_CODE,
    EV_SERVICE_PLAN_NAME,
} from '@/modules/entities/EventPlan/type/event-plan-service-type';

/**
 * Каталог сервисных типов событий: таблица данных, а не switch (по образцу
 * apps/bitrix sim-events). Порядок = порядок бейджей в «Результатах»:
 * привычная легаси-четвёрка первой, затем остальные. Тона — из общего
 * реестра april-ui (цвета типов — токены тем, не сырые палитры).
 */
export interface ServiceEventCatalogItem {
    code: EV_SERVICE_PLAN_CODE;
    name: EV_SERVICE_PLAN_NAME;
    tone: Tone;
}

export const SERVICE_EVENT_CATALOG: ReadonlyArray<ServiceEventCatalogItem> = [
    {
        code: EV_SERVICE_PLAN_CODE.PRESENTATION,
        name: EV_SERVICE_PLAN_NAME.PRESENTATION,
        tone: 'event-pres',
    },
    {
        code: EV_SERVICE_PLAN_CODE.LEARNING,
        name: EV_SERVICE_PLAN_NAME.LEARNING,
        tone: 'event-warm',
    },
    {
        code: EV_SERVICE_PLAN_CODE.LEARNING_FIRST,
        name: EV_SERVICE_PLAN_NAME.LEARNING_FIRST,
        tone: 'event-lead',
    },
    {
        code: EV_SERVICE_PLAN_CODE.SS,
        name: EV_SERVICE_PLAN_NAME.SS,
        tone: 'event-ss',
    },
    {
        code: EV_SERVICE_PLAN_CODE.INFO,
        name: EV_SERVICE_PLAN_NAME.INFO,
        tone: 'event-cold',
    },
    {
        code: EV_SERVICE_PLAN_CODE.INFO_GARANT,
        name: EV_SERVICE_PLAN_NAME.INFO_GARANT,
        tone: 'event-supply',
    },
    {
        code: EV_SERVICE_PLAN_CODE.COMMER,
        name: EV_SERVICE_PLAN_NAME.COMMER,
        tone: 'event-gold',
    },
    {
        code: EV_SERVICE_PLAN_CODE.DOCUMENTS,
        name: EV_SERVICE_PLAN_NAME.DOCUMENTS,
        tone: 'event-doc',
    },
    {
        code: EV_SERVICE_PLAN_CODE.PERE_LONG,
        name: EV_SERVICE_PLAN_NAME.PERE_LONG,
        tone: 'event-renew',
    },
    {
        code: EV_SERVICE_PLAN_CODE.DEBIT,
        name: EV_SERVICE_PLAN_NAME.DEBIT,
        tone: 'event-money',
    },
    {
        code: EV_SERVICE_PLAN_CODE.FAIL,
        name: EV_SERVICE_PLAN_NAME.FAIL,
        tone: 'event-hot',
    },
];

export const getServiceEventTone = (code: EV_SERVICE_PLAN_CODE): Tone =>
    SERVICE_EVENT_CATALOG.find((item) => item.code === code)?.tone ?? 'neutral';
