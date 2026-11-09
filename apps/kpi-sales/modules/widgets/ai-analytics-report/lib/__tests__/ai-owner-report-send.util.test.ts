import { describe, expect, it } from 'vitest';
import type { AiOwnerReportDelivery } from '@/modules/entities/ai-analytics';
import {
    AI_OWNER_REPORT_TEXT,
    aiOwnerReportSendMessage,
} from '../ai-owner-report.texts';

const delivery = (
    overrides: Partial<AiOwnerReportDelivery>,
): AiOwnerReportDelivery => ({
    kind: 'month',
    periodKey: '2026-10',
    status: 'sent',
    reason: null,
    delivered: [7],
    fileUrl: null,
    ...overrides,
});

describe('aiOwnerReportSendMessage — итог «Отправить себе» словами', () => {
    it('доставлено и «только считать»', () => {
        expect(aiOwnerReportSendMessage(delivery({}))).toBe(
            AI_OWNER_REPORT_TEXT.send.sent,
        );
        expect(
            aiOwnerReportSendMessage(delivery({ status: 'dry_run', delivered: [] })),
        ).toBe(AI_OWNER_REPORT_TEXT.send.dryRun);
    });

    it('пропуск — по причине, без причины — общий текст; сбой — «не доставлено»', () => {
        expect(
            aiOwnerReportSendMessage(
                delivery({ status: 'skipped', reason: 'disabled', delivered: [] }),
            ),
        ).toBe(AI_OWNER_REPORT_TEXT.send.skipped.disabled);
        expect(
            aiOwnerReportSendMessage(delivery({ status: 'skipped', delivered: [] })),
        ).toBe(AI_OWNER_REPORT_TEXT.send.skippedDefault);
        expect(
            aiOwnerReportSendMessage(
                delivery({ status: 'failed', reason: 'not-delivered', delivered: [] }),
            ),
        ).toBe(AI_OWNER_REPORT_TEXT.send.failed);
    });
});
