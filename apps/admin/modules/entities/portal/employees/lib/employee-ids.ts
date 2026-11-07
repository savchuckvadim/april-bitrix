import type { PortalEmployee } from '../model';

/**
 * Bitrix-id из значения настройки: CSV «447, 12», число или пусто.
 * Мусор и нули отбрасываются, дубли схлопываются, порядок сохраняется —
 * тот же разбор, что у бэка (parseUserIds).
 */
export function parseEmployeeIds(value: unknown): number[] {
    const raw =
        typeof value === 'number'
            ? [value]
            : typeof value === 'string'
              ? value.split(/[,\s;]+/)
              : [];
    const ids: number[] = [];
    for (const part of raw) {
        const id = Number(part);
        if (Number.isInteger(id) && id > 0 && !ids.includes(id)) ids.push(id);
    }
    return ids;
}

/** Обратно в строку настройки: «447, 12». */
export function formatEmployeeIds(ids: readonly number[]): string {
    return ids.join(', ');
}

/** Подпись в списке справа: должность и первый отдел. */
export function employeeHint(employee: PortalEmployee): string | undefined {
    const parts = [employee.position, employee.departments[0]].filter(
        (part): part is string => !!part,
    );
    return parts.length ? parts.join(' · ') : undefined;
}

/** Имя по id; id нет среди активных — «id 123 (не найден)». */
export function employeeName(
    id: number,
    byId: ReadonlyMap<number, PortalEmployee>,
): string {
    return byId.get(id)?.name ?? `id ${id} (не найден)`;
}
