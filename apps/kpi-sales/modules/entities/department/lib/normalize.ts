import type { BXDepartment, BXUser } from '@workspace/bx';
import type {
    DepartmentStructureDto,
    DepartmentUnitDto,
    DepartmentUserDto,
    SalesDepartment,
} from '../model';

const isFilled = (value: string | undefined | null): boolean =>
    Boolean(value && String(value).trim().length > 0);

/** Пользователи без имени/фамилии получают читаемый фолбэк для таблиц. */
export const normalizeUserName = (user: BXUser): BXUser => {
    if (isFilled(user.NAME) && isFilled(user.LAST_NAME)) {
        return user;
    }

    const fallback = isFilled(user.EMAIL)
        ? { NAME: `Сотрудник ${user.ID}`, LAST_NAME: user.EMAIL }
        : { NAME: 'Сотрудник', LAST_NAME: String(user.ID) };

    return {
        ...user,
        NAME: isFilled(user.NAME) ? user.NAME : fallback.NAME,
        LAST_NAME: isFilled(user.LAST_NAME)
            ? user.LAST_NAME
            : (fallback.LAST_NAME as string),
    };
};

/** DTO → BXUser: ID приводится к числу (бэк отдаёт строки). */
export const toBXUser = (dto: DepartmentUserDto): BXUser =>
    normalizeUserName({
        ...dto,
        ID: Number(dto.ID),
    } as unknown as BXUser);

const toBXDepartment = (dto: DepartmentUnitDto): BXDepartment =>
    ({
        ...dto,
        ID: Number(dto.ID),
        // Каст до регенерации: в Swagger USERS был описан как string[]
        // (пофикшено на бэке — после generate каст можно убрать).
        USERS: ((dto.USERS ?? []) as unknown as DepartmentUserDto[]).map(
            toBXUser,
        ),
    }) as unknown as BXDepartment;

/**
 * Ответ structure → единый вид: всегда массив отделов продаж.
 * Монопортал — частный случай с одним элементом (бэк это гарантирует).
 */
export const normalizeSalesDepartments = (
    structure: DepartmentStructureDto,
): SalesDepartment[] =>
    (structure.salesDepartments ?? []).map(item => ({
        department: toBXDepartment(item.department),
        groups: (item.groups ?? []).map(toBXDepartment),
        allUsers: (item.allUsers ?? []).map(toBXUser),
    }));
