import type { AiByTypeCoverage, AiCallReportStatus } from '../model';
import { aiPilotIds } from './ai-pilot.util';

/*
 * Почему матрицы пустые или в них мало данных — одна цепочка причин для
 * пустого состояния обоих блоков: разбор выключен → период раньше старта
 * разбора → пилотные сотрудники не выбраны в фильтре → все разборы по
 * старым правилам (до даты сравнимости) → только короткие → без типа →
 * звонков нет. Тексты — в виджете (lib/ai-matrix-texts), здесь факты.
 */

export interface AiMatrixCoverageInput {
    /** Покрытие из ответа by-type; старый кэш — без поля. */
    coverage?: AiByTypeCoverage | null;
    /** Конвейер разбора портала (settings.callReport); нет — статус не прочитан. */
    callReport?: AiCallReportStatus | null;
    /** Bitrix-id сотрудников, выбранных в фильтре отчёта (пусто — все). */
    filterManagerIds: readonly number[];
    /** День, с которого на портале идёт разбор; null — не известен. */
    analysisSince: string | null;
    /** Порог длительности звонка для разбора, сек; null — не известен. */
    minDurationSec: number | null;
    /** Период отчёта (YYYY-MM-DD). */
    period: { from: string; to: string };
}

export type AiMatrixCoverageReason =
    | { kind: 'disabled' }
    | { kind: 'before-analysis'; since: string }
    | { kind: 'pilot-outside-filter'; pilotIds: string[] }
    | {
          kind: 'before-comparable';
          count: number;
          comparableFrom: string;
          /** Дата сравнимости внутри периода — можно предложить «Показать с …». */
          canShowFrom: boolean;
      }
    | { kind: 'short'; count: number; minDurationSec: number | null }
    | { kind: 'no-type'; count: number }
    | { kind: 'none'; minDurationSec: number | null };

const day = (value: string): string => value.slice(0, 10);

/** Пилотные сотрудники, которых нет среди выбранных в фильтре (фильтр непустой). */
export const aiPilotOutsideFilter = (
    pilotIds: readonly string[],
    filterManagerIds: readonly number[],
): string[] => {
    if (!pilotIds.length || !filterManagerIds.length) return [];
    const selected = new Set(filterManagerIds.map(String));
    return pilotIds.filter(id => !selected.has(id));
};

/**
 * Причина пустой матрицы (ни одного разбора в оценке). Проверки идут от
 * настроек портала к данным периода; ничего не подошло — «звонков нет».
 */
export const aiMatrixCoverageReason = ({
    coverage,
    callReport,
    filterManagerIds,
    analysisSince,
    minDurationSec,
    period,
}: AiMatrixCoverageInput): AiMatrixCoverageReason => {
    if (callReport && !callReport.enabled) return { kind: 'disabled' };

    if (analysisSince && day(period.to) < day(analysisSince)) {
        return { kind: 'before-analysis', since: analysisSince };
    }

    const pilotIds = aiPilotIds(callReport ?? undefined);
    const outside = aiPilotOutsideFilter(pilotIds, filterManagerIds);
    if (pilotIds.length && outside.length === pilotIds.length) {
        return { kind: 'pilot-outside-filter', pilotIds: outside };
    }

    if (coverage && coverage.analyzedCalls === 0) {
        if (coverage.excludedBeforeComparable > 0 && coverage.comparableFrom) {
            const comparableFrom = day(coverage.comparableFrom);
            return {
                kind: 'before-comparable',
                count: coverage.excludedBeforeComparable,
                comparableFrom,
                canShowFrom:
                    comparableFrom > day(period.from) &&
                    comparableFrom <= day(period.to),
            };
        }
        if (coverage.excludedShort > 0) {
            return {
                kind: 'short',
                count: coverage.excludedShort,
                minDurationSec,
            };
        }
        if (coverage.excludedNoType > 0) {
            return { kind: 'no-type', count: coverage.excludedNoType };
        }
    }

    return { kind: 'none', minDurationSec };
};
