import { DEAL_MOVEMENT_PROBE_TEXT } from '../consts/deal-movement.const';
import type {
    DealMovementProbeResult,
    DealMovementProbeRunResult,
    LaunchOutcome,
} from '../model';
import { dealMovementMomentLabel } from './deal-movement-results';

/**
 * Проверка записи в ленту на одной сделке: разбор номера сделки из поля,
 * строки итога и итог постановки. Чистые функции.
 */

/** Номер сделки из поля ввода; не целое число больше нуля — null. */
export function parseProbeDealId(input: string): number | null {
    const text = input.trim();
    if (!/^\d+$/.test(text)) return null;
    const value = Number(text);
    return Number.isSafeInteger(value) && value > 0 ? value : null;
}

/** Строка итога «подпись: значение». */
export interface ProbeLine {
    label: string;
    value: string;
}

const momentText = (iso: string | null): string =>
    iso === null ? DEAL_MOVEMENT_PROBE_TEXT.empty : dealMovementMomentLabel(iso);

const shiftText = (shifts: boolean | null): string =>
    shifts === null
        ? DEAL_MOVEMENT_PROBE_TEXT.unknown
        : shifts
          ? DEAL_MOVEMENT_PROBE_TEXT.yes
          : DEAL_MOVEMENT_PROBE_TEXT.no;

/** Строки итога: три момента активности и два ответа «сдвигает ли». */
export function probeResultLines(result: DealMovementProbeResult): ProbeLine[] {
    const text = DEAL_MOVEMENT_PROBE_TEXT;
    return [
        { label: text.moments.before, value: momentText(result.moments.before) },
        {
            label: text.moments.afterLogMessage,
            value: momentText(result.moments.afterLogMessage),
        },
        {
            label: text.moments.afterComment,
            value: momentText(result.moments.afterComment),
        },
        {
            label: text.shifts.logMessage,
            value: shiftText(result.logMessageShifts),
        },
        { label: text.shifts.comment, value: shiftText(result.commentShifts) },
    ];
}

/** Заголовок итога: «Последняя проверка — сделка 9041, закончена». */
export function probeResultHeadline(result: DealMovementProbeResult): string {
    const text = DEAL_MOVEMENT_PROBE_TEXT;
    return (
        `${text.lastResult} — ${text.deal.toLowerCase()} ${result.dealId}, ` +
        `${text.phase[result.phase]}`
    );
}

/** Итог постановки для общей плашки результата кнопок карточки. */
export function probeRunOutcome(run: DealMovementProbeRunResult): LaunchOutcome {
    return run.dispatched
        ? { ok: true, text: DEAL_MOVEMENT_PROBE_TEXT.pending, raw: run }
        : {
              ok: false,
              text: `${DEAL_MOVEMENT_PROBE_TEXT.notStarted}: ${run.reason ?? 'причина не указана'}`,
              raw: run,
          };
}
