import type {
    AiHypothesis,
    AiHypothesisPair,
} from '@/modules/entities/ai-analytics/model';

/*
 * Вкладка «Гипотеза качества»: пары «при оценке качества S нужно N
 * презентаций» строками формы, разбор в пары DTO, проверки (зеркало
 * сохранения на бэке: не меньше двух пар, оценка 3–10, презентаций больше
 * нуля) и предупреждение о несогласованности. Без React — vitest.
 */

/** Оценка качества в гипотезе (шкала разбора 1–10, в гипотезе — от 3). */
export const AI_HYPOTHESIS_SCORE = [3, 10] as const;

/** Минимум пар для сохранения гипотезы. */
export const AI_HYPOTHESIS_PAIRS_MIN = 2;

/** Строка пары: значения строками, как в полях; id — ключ строки и адрес ошибки. */
export interface AiHypothesisFormRow {
    id: number;
    /** Оценка качества 3–10. */
    s: string;
    /** Сколько презентаций нужно при такой оценке. */
    n: string;
}

/** Ошибки вкладки: по строкам и общая (мало пар). */
export interface AiHypothesisErrors {
    rows: Map<number, string>;
    total: string | null;
}

const blankRow = (id: number): AiHypothesisFormRow => ({ id, s: '', n: '' });

/**
 * Строки из текущей гипотезы портала (по возрастанию оценки, id 1..n);
 * гипотезы нет — две пустые строки: минимум для сохранения.
 */
export const prefillAiHypothesisRows = (
    hypothesis: AiHypothesis | null | undefined,
): AiHypothesisFormRow[] => {
    const pairs = [...(hypothesis?.pairs ?? [])].sort(
        (left, right) => left.s - right.s,
    );
    if (!pairs.length) {
        return Array.from({ length: AI_HYPOTHESIS_PAIRS_MIN }, (_, index) =>
            blankRow(index + 1),
        );
    }
    return pairs.map((pair, index) => ({
        id: index + 1,
        s: String(pair.s),
        n: String(pair.n),
    }));
};

export const appendAiHypothesisRow = (
    rows: readonly AiHypothesisFormRow[],
    id: number,
): AiHypothesisFormRow[] => [...rows, blankRow(id)];

const parseNumber = (value: string): number | null => {
    const trimmed = value.trim().replace(',', '.');
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
};

/** Полностью заполненные строки → пары DTO по возрастанию оценки. */
export const aiHypothesisPairs = (
    rows: readonly AiHypothesisFormRow[],
): AiHypothesisPair[] =>
    rows
        .flatMap(row => {
            const s = parseNumber(row.s);
            const n = parseNumber(row.n);
            return s === null || n === null ? [] : [{ s, n }];
        })
        .sort((left, right) => left.s - right.s);

const isBlank = (row: AiHypothesisFormRow): boolean =>
    row.s.trim() === '' && row.n.trim() === '';

const validateRow = (
    row: AiHypothesisFormRow,
    rows: readonly AiHypothesisFormRow[],
): string | null => {
    const [min, max] = AI_HYPOTHESIS_SCORE;
    const s = parseNumber(row.s);
    const n = parseNumber(row.n);
    if (s === null) return 'Укажите оценку качества';
    if (s < min || s > max) return `Оценка от ${min} до ${max}`;
    if (n === null) return 'Укажите число презентаций';
    if (n <= 0) return 'Презентаций больше нуля';
    const duplicate = rows.some(
        other => other.id !== row.id && parseNumber(other.s) === s,
    );
    return duplicate ? 'Такая оценка уже есть' : null;
};

/**
 * Ошибки вкладки: пустые строки не мешают (не уходят в сохранение), а
 * заполненные наполовину и вне диапазона — ошибка строки; меньше двух
 * заполненных пар — общая ошибка.
 */
export const validateAiHypothesisRows = (
    rows: readonly AiHypothesisFormRow[],
): AiHypothesisErrors => {
    const errors = new Map<number, string>();
    for (const row of rows) {
        if (isBlank(row)) continue;
        const error = validateRow(row, rows);
        if (error) errors.set(row.id, error);
    }
    const filled = rows.filter(row => !isBlank(row)).length;
    return {
        rows: errors,
        total:
            filled < AI_HYPOTHESIS_PAIRS_MIN
                ? `Нужно не меньше ${AI_HYPOTHESIS_PAIRS_MIN} пар`
                : null,
    };
};

/**
 * Пары несогласованны: с ростом качества нужное число презентаций растёт
 * (обычно лучше разговор — меньше презентаций нужно). Не блокирует
 * сохранение — бэк тоже только предупреждает.
 */
export const isAiHypothesisInconsistent = (
    pairs: readonly AiHypothesisPair[],
): boolean => {
    const sorted = [...pairs].sort((left, right) => left.s - right.s);
    return sorted.some(
        (pair, index) => index > 0 && pair.n > (sorted[index - 1]?.n ?? pair.n),
    );
};

export const AI_HYPOTHESIS_INCONSISTENT_TEXT =
    'С ростом качества здесь растёт и число презентаций — проверьте пары: обычно чем лучше разговор, тем меньше презентаций нужно.';
