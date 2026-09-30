import { describe, expect, it } from 'vitest';
import {
    AI_TREND_METRIC_LABELS,
    aiTrendMetricLabel,
} from '../lib/ai-trend.util';

describe('ai-trend.util — подписи показателей как в заголовках бэка', () => {
    it('число разборов и доли рёбер воронки словами', () => {
        expect(aiTrendMetricLabel('volume')).toBe('число разборов');
        expect(aiTrendMetricLabel('edge_call_to_presentation')).toBe(
            'доля презентаций после звонков',
        );
        expect(aiTrendMetricLabel('edge_presentation_to_offer')).toBe(
            'доля КП после презентаций',
        );
        expect(aiTrendMetricLabel('edge_offer_to_invoice')).toBe(
            'доля счетов после КП',
        );
        expect(aiTrendMetricLabel('edge_invoice_to_sale')).toBe(
            'доля продаж после счетов',
        );
    });

    it('в подписях нет стрелок и знаков формул', () => {
        for (const label of Object.values(AI_TREND_METRIC_LABELS)) {
            expect(label).not.toMatch(/[→×≥]/);
        }
    });
});
