/**
 * Черновик названия организации по домену портала: `alfacentr.bitrix24.ru`
 * → `alfacentr`. Админ правит его в форме — это лишь подсказка.
 */
export function suggestOrganizationName(domain: string | null): string {
    const host = (domain ?? '').trim().toLowerCase();
    const head = host.split('.')[0] ?? '';
    return head.replace(/[-_]+/g, ' ').trim();
}
