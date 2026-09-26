import type {
    BXUserDto,
    BxDepartmentDto,
} from '@workspace/nest-kpi-report-sales-api';
import type {
    CurrentUserInfo,
    DepartmentStructureDto,
    SalesDepartment,
} from '../model';
import { normalizeSalesDepartments } from '../lib/utils/normalize';

/*
 * Структура для тестов периметра: ОП 10 (группы 11: 1,2; 12: 3; сотрудник
 * 4 прямо в отделе) и ОП 20 без групп (5, 6).
 */

const user = (id: number): BXUserDto => ({
    ID: String(id),
    NAME: `Имя${id}`,
    LAST_NAME: `Фамилия${id}`,
});

const unit = (id: number, userIds: number[]): BxDepartmentDto => ({
    ID: id,
    NAME: `Отдел ${id}`,
    PARENT: '1',
    SORT: 500,
    USERS: userIds.map(user),
    UF_HEAD: null,
    HEADS: [],
});

/** Текущий пользователь структуры: по умолчанию рядовой менеджер 1. */
export const makeCurrentUser = (
    overrides: Partial<CurrentUserInfo> = {},
): CurrentUserInfo => ({
    userId: 1,
    isHead: false,
    headOf: null,
    headOfDepartmentIds: [],
    visibility: 'own',
    headOfSource: 'structure',
    isSuperUser: false,
    colleagues: { group: [], department: [] },
    ...overrides,
});

/** Суперпользователь вендора — как его отдаёт бэк (env BX_SUPER_USER_IDS). */
export const makeSuperUser = (
    overrides: Partial<CurrentUserInfo> = {},
): CurrentUserInfo =>
    makeCurrentUser({
        userId: 99,
        headOf: 'cup',
        headOfDepartmentIds: [10, 20],
        visibility: 'all',
        headOfSource: 'superuser',
        isSuperUser: true,
        ...overrides,
    });

/** Ответ POST /api/bx/department/structure. */
export const makeStructure = (
    currentUser: CurrentUserInfo = makeCurrentUser(),
): DepartmentStructureDto => ({
    isMultiple: true,
    multipleTag: 'ОП',
    department: {
        department: 0,
        generalDepartment: [],
        childrenDepartments: [],
        allUsers: [],
    },
    salesDepartments: [
        {
            department: unit(10, [4]),
            groups: [unit(11, [1, 2]), unit(12, [3])],
            allUsers: [1, 2, 3, 4].map(user),
        },
        {
            department: unit(20, [5, 6]),
            groups: [],
            allUsers: [5, 6].map(user),
        },
    ],
    currentUser,
});

export const makeDepartments = (): SalesDepartment[] =>
    normalizeSalesDepartments(makeStructure());

/** ID пользователей периметра по возрастанию — для сравнения. */
export const ids = (users: { ID: number | string }[]): number[] =>
    users.map(u => Number(u.ID)).sort((a, b) => a - b);
