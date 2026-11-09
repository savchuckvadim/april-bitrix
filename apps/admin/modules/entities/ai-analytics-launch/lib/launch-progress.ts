/**
 * Прогресс переразбора для прогресс-бара: та же формула, что у сводки бэка
 * (`reanalysisProgress`). С 09.11.2026 статус несёт `total` (сделано плюс
 * остаток на старте части) и `etaMinutes` — тогда счёт точный и есть
 * «осталось ≈ X мин». У записей без total: в первой части кандидаты —
 * весь объём; в следующих candidates — остаток на старте части, а done
 * копится с первой, поэтому done / (done + candidates) — оценка снизу.
 * Чистая функция.
 */

/** Поля статуса прогона, нужные прогрессу (и сводке, и reanalyze-status). */
export interface LaunchProgressSource {
    part: number;
    candidates: number;
    done: number;
    failed: number;
    price: number;
    finished: boolean;
    /** Всего звонков прогона; null или нет — оценка по кандидатам. */
    total?: number | null;
    /** Оценка оставшегося времени, минут; null или нет — не показываем. */
    etaMinutes?: number | null;
    /** Прогон остановился (давно не обновлялся или серия сбоев): «осталось» не пишем. */
    stale?: boolean;
}

export interface LaunchProgressView {
    /** Доля 0..1. */
    share: number;
    /** «120 из 400» или «120 из ≈ 400». */
    countText: string;
    text: string;
}

/** Знаменатель: total статуса, иначе оценка по кандидатам части. */
const totalOf = (run: LaunchProgressSource): { total: number; exact: boolean } => {
    if (typeof run.total === 'number') {
        return { total: Math.max(run.total, run.done), exact: true };
    }
    return {
        total: run.part > 1 ? run.done + run.candidates : run.candidates,
        exact: run.part <= 1,
    };
};

export function reanalyzeProgress(
    run: LaunchProgressSource,
): LaunchProgressView {
    const { total, exact } = totalOf(run);
    const share = run.finished
        ? 1
        : total > 0
          ? Math.min(1, run.done / total)
          : 0;
    const countText = `${run.done} из ${!exact && !run.finished ? '≈ ' : ''}${Math.max(total, run.done)}`;
    const eta =
        !run.finished && run.stale !== true && typeof run.etaMinutes === 'number'
            ? `, осталось ≈ ${run.etaMinutes} мин`
            : '';
    const failed = run.failed > 0 ? `, сбоев ${run.failed}` : '';
    return {
        share,
        countText,
        text: `${run.finished ? 'Готово' : `Часть ${run.part}`}: переразобрано ${countText}${eta}${failed}, потрачено ${Math.round(run.price)} ₽.`,
    };
}
