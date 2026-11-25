import { describe, expect, it } from 'vitest';
import {
    resolveReportGate,
    type ReportGateSource,
    type ReportGateSourceState,
} from '../report-gate.util';

/*
 * Каркас страницы блокирует только главный источник вкладки; вкладка без
 * такого источника не показывает ни заставку, ни «нет данных».
 */

const state = (
    overrides: Partial<ReportGateSourceState> = {},
): ReportGateSourceState => ({
    isLoading: false,
    isFetched: true,
    hasData: true,
    ...overrides,
});

const sources = (
    report: ReportGateSourceState,
    calling: ReportGateSourceState,
): Record<ReportGateSource, ReportGateSourceState> => ({ report, calling });

/** Оба источника ещё не пришли — для проверки, что вкладка на них не смотрит. */
const NOTHING_YET = state({ isLoading: true, isFetched: false, hasData: false });

describe('resolveReportGate — вкладка без блокирующего источника', () => {
    it('заставки и «нет данных» нет, даже если события и звонки не приходили', () => {
        expect(
            resolveReportGate(null, sources(NOTHING_YET, NOTHING_YET)),
        ).toEqual({ isPending: false, hasData: true });
    });
});

describe('resolveReportGate — блокируют события', () => {
    it('события считаются — страница ждёт', () => {
        const gate = resolveReportGate(
            'report',
            sources(state({ isLoading: true, hasData: false }), state()),
        );
        expect(gate.isPending).toBe(true);
    });

    it('события ещё не запрашивались — страница ждёт', () => {
        const gate = resolveReportGate(
            'report',
            sources(state({ isFetched: false, hasData: false }), state()),
        );
        expect(gate.isPending).toBe(true);
    });

    it('события пришли — страница не ждёт, данные есть', () => {
        expect(
            resolveReportGate('report', sources(state(), NOTHING_YET)),
        ).toEqual({ isPending: false, hasData: true });
    });

    it('события пришли пустыми — «нет данных»', () => {
        expect(
            resolveReportGate(
                'report',
                sources(state({ hasData: false }), state()),
            ),
        ).toEqual({ isPending: false, hasData: false });
    });

    it('звонки не приходили — страницу не держат', () => {
        expect(
            resolveReportGate('report', sources(state(), NOTHING_YET))
                .isPending,
        ).toBe(false);
    });
});

describe('resolveReportGate — блокируют звонки', () => {
    it('статистика звонков считается — страница ждёт, события на это не влияют', () => {
        expect(
            resolveReportGate(
                'calling',
                sources(state(), state({ isLoading: true, hasData: false })),
            ).isPending,
        ).toBe(true);
    });

    it('статистика пришла — страница не ждёт, даже если события ещё идут', () => {
        expect(
            resolveReportGate('calling', sources(NOTHING_YET, state())),
        ).toEqual({ isPending: false, hasData: true });
    });

    it('статистика пришла пустой или с ошибкой — «нет данных»', () => {
        expect(
            resolveReportGate(
                'calling',
                sources(state(), state({ hasData: false })),
            ),
        ).toEqual({ isPending: false, hasData: false });
    });
});
