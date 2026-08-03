import {
    CircleDollarSign,
    Flame,
    Phone,
    PhoneOutgoing,
    Presentation,
    Truck,
    type LucideIcon,
} from 'lucide-react';
import { EV_PLAN_CODE } from '@/modules/entities/EventPlan';
import type { Tone } from '@workspace/april-ui';

/**
 * Инфографика типов планируемого события: эмодзи, тон и подсказка.
 *
 * Данные отдельно от UI. Ключ — код типа (EV_PLAN_CODE), а не название:
 * названия приходят с бэкенда и могут меняться, коды — нет.
 *
 * Тексты подсказок и эмодзи взяты из симулятора процесса
 * (apps/bitrix/app/(product)/process/_core/constants/sim-events.ts), чтобы
 * менеджер видел одну и ту же картину в обучении и в рабочем инструменте.
 */
export interface PlanTypeMeta {
    /** Иконка типа; красится тоном — цвет и смысл читаются вместе. */
    icon: LucideIcon;
    tone: Tone;
    /** Короткое пояснение — что это за событие. */
    hint: string;
}

export const PLAN_TYPE_META: Record<EV_PLAN_CODE, PlanTypeMeta> = {
    [EV_PLAN_CODE.COLD]: {
        icon: PhoneOutgoing,
        tone: 'event-cold',
        hint: 'первый контакт: пройти секретаря, выйти на ЛПР',
    },
    [EV_PLAN_CODE.WARM]: {
        icon: Phone,
        tone: 'event-warm',
        hint: 'предварительные договорённости и текущая работа',
    },
    [EV_PLAN_CODE.PRESENTATION]: {
        icon: Presentation,
        tone: 'event-pres',
        hint: 'особое событие: заводится отдельная сделка-спутник',
    },
    [EV_PLAN_CODE.HOT]: {
        icon: Flame,
        tone: 'event-hot',
        hint: 'клиент думает — самый решающий момент',
    },
    [EV_PLAN_CODE.PAY]: {
        icon: CircleDollarSign,
        tone: 'event-money',
        hint: 'напомнить об оплате, снять вопросы по счёту',
    },
    [EV_PLAN_CODE.SUPPLY]: {
        icon: Truck,
        tone: 'event-supply',
        hint: 'постпродажный тип: не двигает лестницу и не пишет KPI',
    },
};

const FALLBACK: PlanTypeMeta = {
    icon: Phone,
    tone: 'event-warm',
    hint: '',
};

export const getPlanTypeMeta = (code: string | null | undefined): PlanTypeMeta =>
    PLAN_TYPE_META[code as EV_PLAN_CODE] ?? FALLBACK;
