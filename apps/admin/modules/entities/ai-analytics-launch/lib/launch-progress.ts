/**
 * Прогресс переразбора для прогресс-бара: та же формула, что у сводки бэка
 * (`reanalysisProgress`): в первой части кандидаты — весь объём; в
 * следующих candidates — остаток на старте части, а done копится с первой,
 * поэтому done / (done + candidates) — оценка снизу. Чистая функция.
 */

/** Поля статуса прогона, нужные прогрессу (и сводке, и reanalyze-status). */
export interface LaunchProgressSource {
    part: number;
    candidates: number;
    done: number;
    failed: number;
    price: number;
    finished: boolean;
}

export interface LaunchProgressView {
    /** Доля 0..1. */
    share: number;
    /** «120 из 400» или «120 из ≈ 400». */
    countText: string;
    text: string;
}

export function reanalyzeProgress(
    run: LaunchProgressSource,
): LaunchProgressView {
    const estimated = run.part > 1;
    const total = estimated ? run.done + run.candidates : run.candidates;
    const share = run.finished
        ? 1
        : total > 0
          ? Math.min(1, run.done / total)
          : 0;
    const countText = `${run.done} из ${estimated && !run.finished ? '≈ ' : ''}${Math.max(total, run.done)}`;
    const failed = run.failed > 0 ? `, сбоев ${run.failed}` : '';
    return {
        share,
        countText,
        text: `${run.finished ? 'Готово' : `Часть ${run.part}`}: переразобрано ${countText}${failed}, потрачено ${Math.round(run.price)} ₽.`,
    };
}
