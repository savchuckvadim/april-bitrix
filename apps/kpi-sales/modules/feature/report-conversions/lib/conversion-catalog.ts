import { EReportType } from '@/modules/feature/report-widget-type/consts/report-type.consts';
import type {
    ConversionMethod,
    ConversionScope,
} from '../model/conversion.types';

/**
 * Дефолтная воронка: звонки → презентации → продажи
 * (innerCode из taxonomy kpi-отчёта; пользователь меняет в редакторе цепочки).
 */
export const DEFAULT_CONVERSION_CHAIN: string[] = [
    'call_done',
    'presentation_done',
    'ev_success_done',
];

export const CONVERSION_METHOD_LABELS: Record<ConversionMethod, string> = {
    chain: 'Цепочка — к предыдущему',
    fromBase: 'От базы — к первому',
};

export const CONVERSION_METHOD_HINTS: Record<ConversionMethod, string> = {
    chain: 'Каждый показатель делится на предыдущий шаг воронки',
    fromBase: 'Каждый показатель делится на первый (базовый) показатель',
};

/**
 * Чемпионство считаем только при достаточной базе шага —
 * отсекаем «1 из 1 = 100%» из рейтингов.
 */
export const MIN_DENOMINATOR_FOR_CHAMPION = 5;

/** Scope конверсий для типа отчёта (вкладка «Все» живёт по блокам). */
export const scopeForReportType = (type: EReportType): ConversionScope => {
    switch (type) {
        case EReportType.EVENTS:
            return 'kpi';
        case EReportType.CALLINGS:
            return 'callings';
        default:
            return 'merged';
    }
};
