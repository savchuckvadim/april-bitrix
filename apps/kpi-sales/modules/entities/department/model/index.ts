import type {
    BXUserDto,
    BxCurrentUserDto,
    BxCurrentUserDtoHeadOf,
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
export type DepartmentUnitDto = BxDepartmentDto;
export type DepartmentUserDto = BXUserDto;
export type CurrentUserInfo = BxCurrentUserDto;
export type DepartmentHeadType = BxCurrentUserDtoHeadOf;

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
