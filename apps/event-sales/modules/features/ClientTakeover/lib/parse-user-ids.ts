/**
 * Настройка-список Bitrix ID («643, 39;107» → [643, 39, 107]) — те же
 * правила, что у бэка (`parseUserIds`): разделители запятая, точка с
 * запятой, пробелы; мусор, нули, отрицательные и дубли отбрасываются.
 */
export const parseUserIdsCsv = (raw: string | null | undefined): number[] => {
    const result: number[] = [];
    const seen = new Set<number>();
    for (const part of String(raw ?? '').split(/[,;\s]+/)) {
        if (!part) continue;
        const id = Number(part);
        if (!Number.isInteger(id) || id <= 0 || seen.has(id)) continue;
        seen.add(id);
        result.push(id);
    }
    return result;
};
