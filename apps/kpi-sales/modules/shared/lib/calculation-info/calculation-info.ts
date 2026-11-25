/**
 * Сведения о расчёте отчёта: сервер присылает их рядом с данными (ответ
 * запроса и WS-событие готовности) со статусом ready. Оба поля необязательны:
 * старый сервер их не присылает, а у открытого периода (идёт текущий месяц)
 * результат не хранится долго и «закрытым» не помечается.
 */
export interface CalculationInfo {
    /** Когда рассчитано: строка ISO 8601. */
    generatedAt?: string;
    /** Период целиком в прошлом: результат взят из долгого хранения сервера. */
    closedPeriod?: boolean;
}

/** Ответ сервера (или WS-полезная нагрузка) вместе со сведениями о расчёте. */
export type WithCalculationInfo<T> = T & CalculationInfo;

/**
 * Сведения о расчёте из ответа сервера в том виде, как их хранит стор:
 * только корректные поля. Ни одного поля нет (открытый период, старый
 * сервер) — null: сведения очищаются вместе с приходом новых данных.
 */
export const pickCalculationInfo = (
    source: CalculationInfo | null | undefined,
): CalculationInfo | null => {
    if (!source) return null;
    const { generatedAt, closedPeriod } = source;
    const hasGeneratedAt = typeof generatedAt === 'string' && generatedAt !== '';
    const hasClosedPeriod = typeof closedPeriod === 'boolean';
    if (!hasGeneratedAt && !hasClosedPeriod) return null;
    return {
        ...(hasGeneratedAt && { generatedAt }),
        ...(hasClosedPeriod && { closedPeriod }),
    };
};
