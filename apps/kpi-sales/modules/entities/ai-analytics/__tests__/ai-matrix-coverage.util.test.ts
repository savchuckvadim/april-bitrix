import { describe, expect, it } from 'vitest';
import type { AiByTypeCoverage, AiCallReportStatus } from '../model';
import {
    aiMatrixCoverageReason,
    aiPilotOutsideFilter,
    type AiMatrixCoverageInput,
} from '../lib/ai-matrix-coverage.util';

const report = (
    overrides: Partial<AiCallReportStatus> = {},
): AiCallReportStatus => ({
    enabled: true,
    pilotUserIds: null,
    salesOnly: null,
    minDurationSec: 300,
    ...overrides,
});

const coverage = (
    overrides: Partial<AiByTypeCoverage> = {},
): AiByTypeCoverage => ({
    comparableFrom: '2026-09-25',
    analyzedCalls: 0,
    excludedBeforeComparable: 0,
    excludedShort: 0,
    excludedNoType: 0,
    ...overrides,
});

const input = (
    overrides: Partial<AiMatrixCoverageInput> = {},
): AiMatrixCoverageInput => ({
    coverage: coverage(),
    callReport: report(),
    filterManagerIds: [],
    analysisSince: '2026-07-21',
    minDurationSec: 300,
    period: { from: '2026-09-01', to: '2026-09-30' },
    ...overrides,
});

describe('aiPilotOutsideFilter', () => {
    it('пилотные сотрудники, которых нет в непустом фильтре', () => {
        expect(aiPilotOutsideFilter(['7', '3'], [3, 9])).toEqual(['7']);
        expect(aiPilotOutsideFilter(['7'], [])).toEqual([]);
        expect(aiPilotOutsideFilter([], [3])).toEqual([]);
    });
});

describe('aiMatrixCoverageReason — почему матрица пустая', () => {
    it('разбор выключен на портале — первая причина', () => {
        expect(
            aiMatrixCoverageReason(
                input({ callReport: report({ enabled: false }) }),
            ),
        ).toEqual({ kind: 'disabled' });
    });

    it('период целиком раньше старта разбора', () => {
        expect(
            aiMatrixCoverageReason(
                input({
                    analysisSince: '2026-10-01',
                    period: { from: '2026-09-01', to: '2026-09-30' },
                }),
            ),
        ).toEqual({ kind: 'before-analysis', since: '2026-10-01' });
    });

    it('пилот есть, но никого из пилота нет в фильтре; часть пилота в фильтре — не причина', () => {
        const pilot = report({ pilotUserIds: ['7', '3'] });
        expect(
            aiMatrixCoverageReason(
                input({ callReport: pilot, filterManagerIds: [9, 11] }),
            ),
        ).toEqual({ kind: 'pilot-outside-filter', pilotIds: ['7', '3'] });
        expect(
            aiMatrixCoverageReason(
                input({ callReport: pilot, filterManagerIds: [3, 9] }),
            ).kind,
        ).toBe('none');
    });

    it('все разборы по старым правилам: дата сравнимости и можно ли «показать с …»', () => {
        const before = coverage({ excludedBeforeComparable: 14 });
        expect(aiMatrixCoverageReason(input({ coverage: before }))).toEqual({
            kind: 'before-comparable',
            count: 14,
            comparableFrom: '2026-09-25',
            canShowFrom: true,
        });
        // Дата сравнимости позже конца периода — кнопка не поможет.
        expect(
            aiMatrixCoverageReason(
                input({
                    coverage: before,
                    period: { from: '2026-09-01', to: '2026-09-20' },
                }),
            ),
        ).toMatchObject({ kind: 'before-comparable', canShowFrom: false });
    });

    it('только короткие или без типа; разборы в оценке есть — причина не из покрытия', () => {
        expect(
            aiMatrixCoverageReason(
                input({ coverage: coverage({ excludedShort: 5 }) }),
            ),
        ).toEqual({ kind: 'short', count: 5, minDurationSec: 300 });
        expect(
            aiMatrixCoverageReason(
                input({ coverage: coverage({ excludedNoType: 2 }) }),
            ),
        ).toEqual({ kind: 'no-type', count: 2 });
        expect(
            aiMatrixCoverageReason(
                input({
                    coverage: coverage({ analyzedCalls: 3, excludedShort: 5 }),
                }),
            ),
        ).toEqual({ kind: 'none', minDurationSec: 300 });
    });

    it('старый кэш без coverage и без статуса конвейера — «звонков нет» без порога', () => {
        expect(
            aiMatrixCoverageReason(
                input({ coverage: null, callReport: null, minDurationSec: null }),
            ),
        ).toEqual({ kind: 'none', minDurationSec: null });
    });
});
