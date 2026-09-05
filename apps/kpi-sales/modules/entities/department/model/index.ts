import type {
    BXUserDto,
    BxCurrentUserDto,
    BxCurrentUserDtoHeadOf,
    BxCurrentUserDtoHeadOfSource,
    BxCurrentUserDtoVisibility,
    BxDepartmentDto,
    BxDepartmentStructureRequestDto,
    BxDepartmentStructureResponseDto,
    BxSalesDepartmentDto,
} from '@workspace/nest-kpi-report-sales-api';
import type { BXDepartment, BXUser } from '@workspace/bx';

// Доменные алиасы generated DTO: UI и thunks работают только с ними,
// бэкенд-переименование затронет один файл.
export type DepartmentStructureDto = BxDepartmentStructureResponseDto;
export type DepartmentStructureRequest = BxDepartmentStructureRequestDto;
export type SalesDepartmentDto = BxSalesDepartmentDto;
/** Отдел; HEADS — руководитель и заместители (первый — руководитель). */
export type DepartmentUnitDto = BxDepartmentDto;
export type DepartmentUserDto = BXUserDto;
export type DepartmentHeadType = BxCurrentUserDtoHeadOf;
/** Уровень видимости: own — только себя; group — своя группа; department — свой ОП; all — вся структура. */
export type VisibilityLevel = BxCurrentUserDtoVisibility;
/** Источник роли: структура Битрикса или настройка портала «Отдел продаж». */
export type HeadOfSource = BxCurrentUserDtoHeadOfSource;
/**
 * Текущий пользователь структуры. В снимках публичных ссылок (v: 1) полей
 * visibility/headOfSource нет — потребители читают уровень через
 * resolveVisibility, который падает на headOf.
 */
export type CurrentUserInfo = BxCurrentUserDto;

/** Отдел продаж после нормализации: типы @workspace/bx, ID приведены к числам. */
export interface SalesDepartment {
    department: BXDepartment;
    groups: BXDepartment[];
    allUsers: BXUser[];
}

/** Видимый пользователю периметр структуры (по его роли). */
export interface DepartmentScope {
    users: BXUser[];
    groups: BXDepartment[];
    isHeadManager: boolean;
    defaultSelected: BXUser[];
}
