/**
 * Нормализация списка порталов из мультиселекта.
 *
 * Правила — те же, что у критериев (`word-template-criteria-payload`):
 *  - create: пустой список НЕ отправляется (нет привязок — нечего синхронизировать);
 *  - update: `undefined` — не трогать; явный пустой список — снять все привязки;
 *  - id — только непустые числовые строки, без дублей, в исходном порядке.
 *
 * ID всегда СТРОКИ: на бэке это BIGINT, в JSON он едет строкой, а `Number`
 * теряет точность выше 2^53.
 */
export function normalizePortalIds(
    ids: readonly string[] | null | undefined,
    mode: 'create' | 'update',
): string[] | undefined {
    if (ids === undefined || ids === null) {
        return undefined;
    }
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of ids) {
        const value = String(raw).trim();
        if (value === '' || !/^\d+$/.test(value) || seen.has(value)) {
            continue;
        }
        seen.add(value);
        result.push(value);
    }
    if (result.length === 0) {
        return mode === 'create' ? undefined : [];
    }
    return result;
}

/**
 * `portal_id` для multipart при создании.
 *
 * Бэкенд при создании сам привязывает шаблон к `portal_id`, если он
 * задан. При мультиселекте берём первый выбранный портал: так привязка
 * появляется уже на create, а `syncPortals` после него добавляет остальные
 * (он идемпотентен и существующую привязку не трогает). Нет ни того, ни
 * другого — `0`, как и раньше: сгенерированный клиент всегда шлёт число.
 */
export function resolveCreatePortalId(
    portalId: number | undefined,
    portalIds: readonly string[] | undefined,
): number {
    if (portalId !== undefined && portalId !== null && portalId !== 0) {
        return portalId;
    }
    const first = portalIds?.[0];
    return first !== undefined ? Number(first) : 0;
}
