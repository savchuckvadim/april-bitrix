import { BXDepartment, BXUser } from '@workspace/bx';
import { DepartmentStructureState } from '../type/department-type';

/**
 * Роль пользователя в структуре отдела продаж (as const — литеральные типы):
 *  - EMPLOYEE — обычный сотрудник;
 *  - GROUP_HEAD — руководитель или заместитель группы (HEADS дочернего отдела);
 *  - DEPARTMENT_HEAD — руководитель или заместитель отдела (HEADS базового);
 *  - SUPER — вышестоящий: bossId, руководитель родительского отдела или
 *    человек вне поддерева продаж (директор смотрит чужую карточку) —
 *    «можно всё».
 * Руководители отдела — список HEADS с бэка (структура v3 + UF_HEAD);
 * для ответов без списка — UF_HEAD.
 */
export const EDepartmentRole = {
    EMPLOYEE: 'employee',
    GROUP_HEAD: 'groupHead',
    DEPARTMENT_HEAD: 'departmentHead',
    SUPER: 'super',
} as const;

export type DepartmentRole =
    (typeof EDepartmentRole)[keyof typeof EDepartmentRole];

export interface DepartmentRoleInfo {
    role: DepartmentRole;
    /** Руководитель пользователя (user id); null — не вычислился и bossId нет. */
    headId: number | null;
    /** Коллеги: сотрудники тех же отделов, без самого пользователя. */
    colleagueIds: number[];
}

export interface ResolveDepartmentRoleInput {
    userId: number;
    /** Фолбэк-руководитель из domain-config (0 — не задан). */
    bossId: number;
    structure: DepartmentStructureState;
    allUsers: BXUser[];
}

/** Предохранитель подъёма по PARENT (порт headIdFor из responsible.service). */
const HEAD_CLIMB_LIMIT = 5;

const toId = (value: unknown): number | null => {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
};

/**
 * Руководители отдела: HEADS (руководитель первым, потом заместители);
 * без списка — UF_HEAD числом/строкой/массивом/null. Наружу — валидные id.
 */
const headsOf = (dep: BXDepartment | undefined): number[] => {
    if (!dep) return [];
    const raw: unknown[] =
        Array.isArray(dep.HEADS) && dep.HEADS.length > 0
            ? dep.HEADS
            : Array.isArray(dep.UF_HEAD)
              ? dep.UF_HEAD
              : [dep.UF_HEAD];
    return [
        ...new Set(raw.map(toId).filter((id): id is number => id !== null)),
    ];
};

const isHeadOf = (dep: BXDepartment, userId: number): boolean =>
    headsOf(dep).includes(userId);

/** Отделы пользователя: пересечение его UF_DEPARTMENT с известными отделами. */
const userDepartments = (
    user: BXUser | undefined,
    byId: Map<number, BXDepartment>,
): BXDepartment[] => {
    const rawIds = (user as { UF_DEPARTMENT?: unknown } | undefined)
        ?.UF_DEPARTMENT;
    const ids = Array.isArray(rawIds) ? rawIds : rawIds != null ? [rawIds] : [];
    return ids
        .map(toId)
        .filter((id): id is number => id !== null)
        .map(id => byId.get(id))
        .filter((dep): dep is BXDepartment => Boolean(dep));
};

/**
 * Руководитель пользователя: по его отделам вверх по цепочке `HEADS →
 * PARENT`; первый отдел, где пользователь сам не в HEADS, даёт его
 * руководителя. Свой отдел возглавляешь (или замещаешь) сам → руководитель
 * сидит в родительском отделе.
 */
const resolveHeadId = (
    userId: number,
    ownDepartments: BXDepartment[],
    byId: Map<number, BXDepartment>,
    bossId: number,
): number | null => {
    for (const start of ownDepartments) {
        let current: BXDepartment | undefined = start;
        for (let step = 0; step < HEAD_CLIMB_LIMIT && current; step++) {
            const [firstHead] = headsOf(current);
            if (firstHead !== undefined && !headsOf(current).includes(userId)) {
                return firstHead;
            }
            const parentId = toId(current.PARENT);
            current = parentId ? byId.get(parentId) : undefined;
        }
    }
    return bossId > 0 ? bossId : null;
};

export const resolveDepartmentRole = ({
    userId,
    bossId,
    structure,
    allUsers,
}: ResolveDepartmentRoleInput): DepartmentRoleInfo => {
    const { general, children, parents } = structure;
    const byId = new Map<number, BXDepartment>(
        [...general, ...children, ...parents]
            .map(dep => [toId(dep.ID), dep] as const)
            .filter((pair): pair is [number, BXDepartment] => pair[0] !== null),
    );

    const user = allUsers.find(item => toId(item.ID) === userId);
    const ownDepartments = userDepartments(user, byId);
    const headId = resolveHeadId(userId, ownDepartments, byId, bossId);
    const colleagueIds = [
        ...new Set(
            allUsers
                .filter(item => {
                    const id = toId(item.ID);
                    if (!id || id === userId) return false;
                    return userDepartments(item, byId).some(dep =>
                        ownDepartments.some(own => own.ID === dep.ID),
                    );
                })
                .map(item => Number(item.ID)),
        ),
    ];

    const role = ((): DepartmentRole => {
        if (bossId > 0 && userId === bossId) return EDepartmentRole.SUPER;
        if (parents.some(dep => isHeadOf(dep, userId))) {
            return EDepartmentRole.SUPER;
        }
        if (general.some(dep => isHeadOf(dep, userId))) {
            return EDepartmentRole.DEPARTMENT_HEAD;
        }
        if (children.some(dep => isHeadOf(dep, userId))) {
            return EDepartmentRole.GROUP_HEAD;
        }
        // Не входит ни в один отдел поддерева продаж — вышестоящий смотрит
        // чужую карточку (директор/аудит), даём «можно всё».
        if (byId.size > 0 && ownDepartments.length === 0) {
            return EDepartmentRole.SUPER;
        }
        return EDepartmentRole.EMPLOYEE;
    })();

    return { role, headId, colleagueIds };
};
