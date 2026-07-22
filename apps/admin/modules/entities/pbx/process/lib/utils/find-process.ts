/**
 * Finds the installed record for a process `code` anywhere in a monitoring
 * payload of unknown shape (e.g. `{ portalRpas: { rpas: [...] }, bxRpas: [...] }`
 * or the smart equivalent). Walks the object tree and returns the first object
 * whose code/type/name field matches.
 */
export function findProcessRecord(
    data: unknown,
    code: string,
): Record<string, unknown> | null {
    const target = code.trim().toLowerCase();
    const matchKeys = [
        'code',
        'type',
        'name',
        'smartName',
        'rpaName',
        'CODE',
        'XML_ID',
    ];
    const seen = new Set<unknown>();
    const stack: unknown[] = [data];

    while (stack.length) {
        const cur = stack.pop();
        if (!cur || typeof cur !== 'object' || seen.has(cur)) continue;
        seen.add(cur);

        if (Array.isArray(cur)) {
            for (const v of cur) stack.push(v);
            continue;
        }
        const obj = cur as Record<string, unknown>;
        for (const k of matchKeys) {
            const v = obj[k];
            if (typeof v !== 'string') continue;
            const value = v.trim().toLowerCase();
            if (value === target) return obj;
            // Код в Bitrix — полный, с суффиксом группы (`${type}_${group}`:
            // service_offer_service, aicall_sales), поэтому для code-ключей
            // матчим и по префиксу `${type}_` — иначе установленный в Bitrix
            // смарт показывается как «нет в Bitrix».
            if (
                (k === 'code' || k === 'CODE') &&
                value.startsWith(`${target}_`)
            ) {
                return obj;
            }
        }
        for (const v of Object.values(obj)) {
            if (v && typeof v === 'object') stack.push(v);
        }
    }
    return null;
}
