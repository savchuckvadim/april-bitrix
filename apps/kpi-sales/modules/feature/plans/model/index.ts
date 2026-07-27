/**
 * Доменные алиасы generated DTO планов — бэк-переименования локализуются
 * здесь (паттерн CLAUDE.md model/index.ts).
 *
 * НЕ путать с kpi-«планами» (call_plan — CRM-задачи менеджера): здесь
 * целевые значения (targets), которые руководитель ставит сотрудникам.
 */
import type {
    PlanIndicatorConfigDto,
    PlanIndicatorConfigDtoPeriodType,
    PlanIndicatorMetaDto,
    PlanIndicatorMetaDtoCode,
    PlanIndicatorMetaDtoFactSource,
    PlanIndicatorMetaDtoUnit,
    PlansConfigDto,
} from '@workspace/nest-kpi-report-sales-api';

/** Период, на который руководитель задаёт значение плана. */
export type PlanPeriodType = PlanIndicatorConfigDtoPeriodType;

/** Единица измерения показателя. */
export type PlanUnit = PlanIndicatorMetaDtoUnit;

/** Источник ФАКТА показателя (какой слайс стора содержит значение). */
export type PlanFactSource = PlanIndicatorMetaDtoFactSource;

/** Код показателя (generated whitelist каталога бэка). */
export type PlanIndicatorCode = PlanIndicatorMetaDtoCode;

/** Описание показателя из каталога бэка (read-only справочник). */
export type PlanIndicatorMeta = PlanIndicatorMetaDto;

/** Настройка показателя на портале. */
export type PlanIndicatorConfig = PlanIndicatorConfigDto;

export type PlansConfig = PlansConfigDto;

/** Планы одного сотрудника: code показателя → значение (null — не задан). */
export type PlanTargetsByCode = Record<string, number | null>;

/** Изменение плана для сохранения. */
export interface PlanTargetSaveItem {
    userId: number;
    code: PlanIndicatorCode;
    value: number | null;
}
