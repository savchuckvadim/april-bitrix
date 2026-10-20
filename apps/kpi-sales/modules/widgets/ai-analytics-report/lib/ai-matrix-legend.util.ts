import {
    AI_METRIC_THRESHOLDS,
    type AiHint,
} from '@/modules/entities/ai-analytics/lib/ai-metric.util';
import { AI_MATRIX_BLOCK_TEXT } from './ai-matrix-texts';

/*
 * Легенда под заголовком блока: одна строка «крупно — оценка · мелко —
 * звонков · цвет — выше/ниже среднего · «ещё N» · считаются звонки с даты
 * длиннее порога» и подсказка с правилами чтения (пороги объёма — из
 * AI_METRIC_THRESHOLDS, дата и порог длительности — из ответов бэка).
 */

export interface AiMatrixLegendInput {
    comparableFrom: string | null;
    minDurationSec: number | null;
}

export interface AiMatrixLegendView {
    text: string;
    hint: AiHint;
}

export const aiMatrixLegend = ({
    comparableFrom,
    minDurationSec,
}: AiMatrixLegendInput): AiMatrixLegendView => ({
    text: AI_MATRIX_BLOCK_TEXT.legend.text(comparableFrom, minDurationSec),
    hint: AI_MATRIX_BLOCK_TEXT.legend.hint(
        AI_METRIC_THRESHOLDS.none,
        AI_METRIC_THRESHOLDS.lowScore,
        comparableFrom,
        minDurationSec,
    ),
});
