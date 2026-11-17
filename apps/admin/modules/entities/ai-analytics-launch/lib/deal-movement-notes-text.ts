import {
    DEAL_MOVEMENT_MIN_DAYS_BETWEEN_NOTES,
    DEAL_MOVEMENT_TEXT,
} from '../consts/deal-movement.const';
import type { DealMovementNotesSummary, DealMovementRunMode } from '../model';

/**
 * Записи в ленту сделок — строками для карточки «Движение сделок» (как
 * итог в Telegram на бэке). Коды вида записи и режима на экран не попадают.
 * Чистые функции под vitest.
 */

/** «не чаще раза в 3 дня — 5». */
const quietText = (notes: DealMovementNotesSummary): string =>
    `не чаще раза в ${DEAL_MOVEMENT_MIN_DAYS_BETWEEN_NOTES} дня — ${notes.deferredQuiet}`;

const deferredText = (notes: DealMovementNotesSummary): string =>
    `лимит ночи — ${notes.deferredLimit}, ${quietText(notes)}`;

/**
 * Выключено; у подсчёта — сколько записали бы; у ручного счёта — сколько
 * ждёт ночи; у ночного — записано, отложено, не удалось и подсказки.
 */
export function dealMovementNotesLines(
    notes: DealMovementNotesSummary,
    mode: DealMovementRunMode,
): string[] {
    if (!notes.enabled) return [DEAL_MOVEMENT_TEXT.notesOff];
    if (mode === 'dry-run') {
        return [
            `Записали бы в ленту: ${notes.planned}; отложили бы: ${deferredText(notes)}`,
        ];
    }
    if (notes.heldForNight) {
        return [
            `Ручной счёт в ленту не пишет: до ночи отложено записей — ` +
                `${notes.deferredLimit}; ${quietText(notes)}`,
        ];
    }
    return [
        `Записано в ленту: ${notes.written} из ${notes.planned}; ` +
            `отложено: ${deferredText(notes)}; не удалось: ${notes.failed}`,
        `Подсказок «что сделать»: ${notes.texts}, без подсказки: ${notes.textsFailed}`,
    ];
}
