import { describe, expect, it } from 'vitest';
import { resolveAiEmployeeAccess } from '../ai-employee-access.util';

describe('resolveAiEmployeeAccess — кому открыт AI-раздел страницы сотрудника', () => {
    it('руководителю с правом на вкладку — любой сотрудник (чужих отсечёт сервер)', () => {
        expect(
            resolveAiEmployeeAccess({ canTab: true, canViewAll: true, requesterId: '42', managerId: '7' }),
        ).toEqual({ allowed: true, isSelf: false });
    });

    it('менеджеру — только своя страница и только при открытой вкладке', () => {
        expect(
            resolveAiEmployeeAccess({ canTab: true, canViewAll: false, requesterId: '7', managerId: '7' }),
        ).toEqual({ allowed: true, isSelf: true });
        expect(
            resolveAiEmployeeAccess({ canTab: true, canViewAll: false, requesterId: '7', managerId: '9' }),
        ).toEqual({ allowed: false, isSelf: false });
        expect(
            resolveAiEmployeeAccess({ canTab: false, canViewAll: false, requesterId: '7', managerId: '7' }),
        ).toEqual({ allowed: false, isSelf: true });
    });

    it('без пользователя (публичный снимок, приложение не готово) — закрыто', () => {
        expect(
            resolveAiEmployeeAccess({ canTab: true, canViewAll: true, requesterId: null, managerId: '7' }),
        ).toEqual({ allowed: true, isSelf: false });
        expect(
            resolveAiEmployeeAccess({ canTab: false, canViewAll: true, requesterId: null, managerId: '7' }),
        ).toEqual({ allowed: false, isSelf: false });
    });
});
