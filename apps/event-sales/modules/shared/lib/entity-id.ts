/**
 * Id сущности Битрикса из стора фрейма (`app.bitrix.deal`, `.company`, …):
 * id там строкой. Нет сущности или id битый — undefined, удобно для
 * необязательных полей запроса.
 */
export const entityIdOf = (row: object | null | undefined): number | undefined =>
    Number((row as { ID?: unknown } | null | undefined)?.ID) || undefined;
