import { EventSalesFlowDto } from '../../dto/event-sale-flow/event-sales-flow.dto';
import { ActingManagerMark } from './acting-manager.mark';

const toId = (raw: unknown): number => {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : 0;
};

/**
 * Пометка «кто отчитался за сотрудника» из отчёта; null — обычный отчёт.
 *
 * Только браузерный путь. У сервера пометку проверяет структура отдела
 * продаж, а здесь её нет под рукой: список подчинённых приложение получило
 * с того же сервера и поле `actingManager` ставит, только когда сотрудник в
 * этом списке. Поэтому роль считается подтверждённой.
 */
export const actingManagerFromDto = (
    dto: EventSalesFlowDto,
): ActingManagerMark | null => {
    const managerId = toId(dto.actingManager?.ID);
    if (!managerId) return null;

    const employeeId = toId(dto.plan?.responsibility?.ID);
    // Отчёт за самого себя режимом руководителя не является.
    if (!employeeId || employeeId === managerId) return null;

    return {
        id: managerId,
        name: dto.actingManager?.NAME?.trim() ?? '',
        isConfirmedHead: true,
    };
};
