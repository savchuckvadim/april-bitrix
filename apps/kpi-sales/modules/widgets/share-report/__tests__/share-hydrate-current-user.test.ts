import { describe, expect, it } from 'vitest';
import type { ShareLinkPublicResponseDto } from '@workspace/nest-kpi-report-sales-api';
import type { AppDispatch } from '@/modules/app/model/store';
import { departmentActions } from '@/modules/entities/department/model/department-slice';
import type { CurrentUserInfo } from '@/modules/entities/department/model';
import { hydrateFromShareSnapshot } from '../model/share-report-thunks';

/*
 * /share: роль суперпользователя вендора сбрасывается и при гидратации —
 * для снимков, собранных до нормализации (бэк уже отдаёт ему cup/all).
 * Иначе публика увидела бы вкладку «Финансы».
 */

const currentUser = (overrides: Partial<CurrentUserInfo>): CurrentUserInfo => ({
    userId: 99,
    isHead: false,
    headOf: null,
    headOfDepartmentIds: [],
    visibility: 'own',
    headOfSource: 'structure',
    isSuperUser: false,
    colleagues: { group: [], department: [] },
    ...overrides,
});

const payloadWith = (cu: CurrentUserInfo): ShareLinkPublicResponseDto =>
    ({
        ui: {
            v: 1,
            department: {
                isMulti: true,
                multipleTag: 'ОП',
                departments: [],
                currentUser: cu,
                visibleUsers: [],
                visibleGroups: [],
                isHeadManager: true,
                defaultSelected: [],
            },
        },
        report: [],
        callings: [],
        finance: null,
        airtime: null,
    }) as unknown as ShareLinkPublicResponseDto;

/** currentUser, с которым публичная страница кладёт структуру в стор. */
const hydratedCurrentUser = (cu: CurrentUserInfo): CurrentUserInfo | null => {
    const actions: unknown[] = [];
    const dispatch = ((action: unknown) => {
        actions.push(action);
        return action;
    }) as unknown as AppDispatch;
    hydrateFromShareSnapshot(payloadWith(cu))(dispatch);
    const structure = actions.find(departmentActions.setStructure.match);
    return structure ? structure.payload.currentUser : null;
};

describe('hydrateFromShareSnapshot — роль в снимке', () => {
    it('старый снимок суперпользователя с ролью cup — роль сброшена', () => {
        const hydrated = hydratedCurrentUser(
            currentUser({
                headOf: 'cup',
                headOfDepartmentIds: [10, 20],
                visibility: 'all',
                headOfSource: 'superuser',
                isSuperUser: true,
            }),
        );
        expect(hydrated).toMatchObject({
            isSuperUser: false,
            headOf: null,
            headOfDepartmentIds: [],
            visibility: 'own',
            headOfSource: 'structure',
        });
    });

    it('снимок руководителя портала — роль как есть', () => {
        const head = currentUser({
            headOf: 'op',
            visibility: 'department',
            headOfDepartmentIds: [10],
        });
        expect(hydratedCurrentUser(head)).toEqual(head);
    });
});
