import { describe, expect, it } from 'vitest';
import type { PlanIndicatorConfig, PlanIndicatorMeta } from '../../model';
import { loadedEnabledPlanCodes } from '../plan-achievement.util';
import { INDICATORS } from './plan-columns.fixtures';

/*
 * Страница настроек отчёта приглушает плановый показатель, выключенный в
 * настройках планов, — но только когда данные планов действительно есть.
 */

const CATALOG: PlanIndicatorMeta[] = INDICATORS.map(
    ({ code, unit, factSource, factKey, defaultName }) => ({
        code,
        unit,
        factSource,
        factKey,
        defaultName,
    }),
);

const config = (
    code: PlanIndicatorConfig['code'],
    enabled: boolean,
): PlanIndicatorConfig => ({ code, enabled, customName: null, periodType: 'month' });

const CONFIGS: PlanIndicatorConfig[] = [
    config('calls_done', true),
    config('presentations_done', false),
    config('calls_over_30s', true),
];

describe('loadedEnabledPlanCodes', () => {
    it('данные загружены — коды включённых показателей', () => {
        expect(loadedEnabledPlanCodes('ready', CATALOG, CONFIGS)).toEqual(
            new Set(['calls_done', 'calls_over_30s']),
        );
    });

    it('загружено, но ничего не включено — пустой набор, а не «неизвестно»', () => {
        expect(loadedEnabledPlanCodes('ready', CATALOG, [])).toEqual(new Set());
    });

    it.each(['idle', 'loading', 'error'] as const)(
        'данные не загружены (%s) — null',
        status => {
            expect(loadedEnabledPlanCodes(status, CATALOG, CONFIGS)).toBeNull();
        },
    );

    it('показатель без описания в каталоге не считается включённым', () => {
        expect(loadedEnabledPlanCodes('ready', [], CONFIGS)).toEqual(new Set());
    });
});
