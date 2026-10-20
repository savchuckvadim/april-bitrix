import type {
    AiManagerRow,
    AiPlanTargetCell,
} from '@/modules/entities/ai-analytics/model';

/*
 * Колонка «План руководителя» таблицы сигналов: ячейки из row.planTargets
 * (бэк отдаёт только включённые показатели в порядке каталога, план уже
 * пересчитан на период обзора — как блок «Планы» вкладки KPI). Показываем
 * только показатели с заданным планом; нет ни у кого — колонку скрываем.
 */

/** Ячейка показателя с заданным планом. */
export interface AiPlanHeadCellView {
    code: AiPlanTargetCell['code'];
    name: string;
    unit: AiPlanTargetCell['unit'];
    plan: number;
    /** null — источник факта вкладка AI не загружает (эфирное время, звонки по длительности). */
    fact: number | null;
    percent: number | null;
}

/** Показатели строки с заданным планом (план больше нуля). */
export const aiPlanHeadCells = (
    targets: readonly AiPlanTargetCell[] | undefined,
): AiPlanHeadCellView[] =>
    (targets ?? []).flatMap(target =>
        target.plan !== null && target.plan > 0
            ? [
                  {
                      code: target.code,
                      name: target.name,
                      unit: target.unit,
                      plan: target.plan,
                      fact: target.fact,
                      percent: target.percent,
                  },
              ]
            : [],
    );

/** Колонку показываем, если хоть у одной строки есть план руководителя. */
export const aiSignalHasPlanHead = (
    rows: readonly Pick<AiManagerRow, 'planTargets'>[],
): boolean => rows.some(row => aiPlanHeadCells(row.planTargets).length > 0);

export const AI_PLAN_HEAD_TEXT = {
    /** Факт для показателя вкладка AI не грузит. */
    factMissing: 'факт — на вкладке KPI, блок «Планы»',
    /** Строка старого кэша без planTargets. */
    unknown: 'в сохранённом расчёте нет — нажмите «Пересчитать»',
    /** У этой строки планов нет, хотя у других есть. */
    none: 'план не задан',
} as const;
