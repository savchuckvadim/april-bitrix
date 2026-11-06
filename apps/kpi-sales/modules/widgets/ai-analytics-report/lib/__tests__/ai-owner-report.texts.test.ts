import { describe, expect, it } from 'vitest';
import {
    AI_OWNER_REPORT_MANAGER_COLUMNS,
    aiOwnerReportPeriodLabel,
} from '../ai-owner-report.texts';

describe('aiOwnerReportPeriodLabel', () => {
    it('ключ периода словами по виду', () => {
        expect(aiOwnerReportPeriodLabel('month', '2026-10')).toBe('октябрь 2026');
        expect(aiOwnerReportPeriodLabel('quarter', '2026-Q4')).toBe('4 квартал 2026');
        expect(aiOwnerReportPeriodLabel('half_year', '2026-H2')).toBe('2 полугодие 2026');
        expect(aiOwnerReportPeriodLabel('year', '2026')).toBe('2026 год');
        // Чужой ключ месяца не ломает подпись.
        expect(aiOwnerReportPeriodLabel('month', '2026-13')).toBe('2026-13');
    });

    it('колонки сотрудников — без английских кодов в подписях', () => {
        for (const [, label] of AI_OWNER_REPORT_MANAGER_COLUMNS) {
            expect(label).not.toMatch(/[a-z]{3,}/);
        }
    });
});
