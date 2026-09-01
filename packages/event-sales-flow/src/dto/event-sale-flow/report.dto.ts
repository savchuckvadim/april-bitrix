import {
    EnumEventItemResultType,
    EnumWorkStatusCode,
    EnumWorkStatusName,
    WorkStatus,
    NoresultReason,
    FailType,
    FailReason,
} from '../../types/report-types';
import { ContactDto } from './contact.dto';

/** Runtime-списки кодов справочников отчёта (для @IsIn и Swagger enum). */
export const NORESULT_REASON_CODE_VALUES = [
    'secretar',
    'nopickup',
    'nonumber',
    'busy',
    'noresult_notime',
    'nocontact',
    'giveup',
    'bay',
    'wrong',
    'auto',
] as const satisfies readonly NoresultReason['code'][];

export const FAIL_TYPE_CODE_VALUES = [
    'garant',
    'go',
    'territory',
    'accountant',
    'autsorc',
    'depend',
    'op_prospects_nophone',
    'op_prospects_company',
    'failure',
] as const satisfies readonly FailType['code'][];

export const FAIL_REASON_CODE_VALUES = [
    'fail_notime',
    'c_habit',
    'c_prepay',
    'c_price',
    'to_expensive',
    'to_cheap',
    'nomoney',
    'noneed',
    'lpr',
    'employee',
    'fail_off',
] as const satisfies readonly FailReason['code'][];

/** Текущий статус работы по сущности. */
export interface WorkStatusValueDto extends WorkStatus {
    /** Идентификатор статуса. */
    id: number;

    /** Код статуса работы, определяющий ветку flow. */
    code: EnumWorkStatusCode;

    /** Отображаемое название статуса. */
    name: EnumWorkStatusName;

    /** Признак активности статуса. */
    isActive: boolean;
}

/** Причина «без результата» (недозвон и т.п.). */
export interface NoresultReasonValueDto extends NoresultReason {
    /** Идентификатор причины. */
    id: number;

    /** Код причины отсутствия результата. */
    code: NoresultReason['code'];

    /** Отображаемое название причины. */
    name: NoresultReason['name'];

    /** Признак активности причины. */
    isActive: boolean;
}

/** Тип отказа. */
export interface FailTypeValueDto extends FailType {
    /** Идентификатор типа отказа. */
    id: number;

    /** Код типа отказа. */
    code: FailType['code'];

    /** Отображаемое название типа отказа. */
    name: FailType['name'];

    /** Признак активности типа отказа. */
    isActive: boolean;
}

/** Причина отказа. */
export interface FailReasonValueDto extends FailReason {
    /** Идентификатор причины отказа. */
    id: number;

    /** Код причины отказа. */
    code: FailReason['code'];

    /** Отображаемое название причины отказа. */
    name: FailReason['name'];

    /** Признак активности причины отказа. */
    isActive: boolean;
}

export interface WorkStatusDto {
    /** Текущий статус работы. */
    current: WorkStatus;
}

export interface NoresultReasonDto {
    /** Текущая причина отсутствия результата. */
    current: NoresultReason;
}

export interface FailTypeDto {
    /** Текущий тип отказа. */
    current: FailType;
}

export interface FailReasonDto {
    /** Текущая причина отказа. */
    current: FailReason;
}

export interface ReportDto {
    /**
     * Итоговый статус результата события (`result` / `noresult` / `expired` / `new` / `cancel`).
     * `null`, когда отчёт отправлен из списка мимо меню результата —
     * недозвон и возврат в ТМЦ (legacy-контракт: фронт шлёт то, что лежит
     * в eventItemMenu, а там ничего не выбирали).
     */
    resultStatus: EnumEventItemResultType | null;

    /** Текстовое описание/комментарий отчёта по событию. */
    description: string;

    /** Текущий статус работы по сущности. */
    workStatus: WorkStatusDto;

    /** Причина отсутствия результата (для статуса noresult). */
    noresultReason: NoresultReasonDto;

    /** Тип отказа (для проигранной сделки). */
    failType: FailTypeDto;

    /** Причина отказа (для проигранной сделки). */
    failReason: FailReasonDto;

    /** Контакт, по которому составлен отчёт. `null`, если не задан. */
    contact: ContactDto | null;

    /** Признак того, что звонок не совершался (отчёт без звонка). */
    isNoCall: boolean;
}
