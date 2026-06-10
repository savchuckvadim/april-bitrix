/**
 * Frontend-safe numeric coercion. Replaces the backend `bigintConvertToNumber`
 * helper: API DTOs deliver ids as `string`, while the install flow may still
 * pass `bigint`, so we accept both and fall back to `0` for empty values.
 */
export function toNumber(
    value: string | number | bigint | null | undefined,
): number {
    if (value === null || value === undefined) {
        return 0;
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'bigint') {
        return Number(value);
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}
