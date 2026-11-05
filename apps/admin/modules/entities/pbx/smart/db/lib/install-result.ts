import type { InstallAicallResult } from '../model';

/** Пояснение к несозданным полям: строка на поле и общий совет. */
export interface InstallFailureNotes {
    /** «Название» — причина, по строке на поле. */
    lines: string[];
    /** Что сделать; null — причин нет. */
    advice: string | null;
}

const LIMIT_ADVICE =
    'Смарт упёрся в лимит пользовательских полей Битрикс24. Лимит считается на одну сущность: ' +
    'удаление полей в сделках и других смартах не поможет. Удалите неиспользуемые поля в самом смарте ' +
    'или попросите разработчика сократить набор полей, затем повторите установку.';

const NETWORK_ADVICE =
    'Битрикс оборвал соединение. Повторите установку через минуту: она безопасна и дольёт недостающие поля.';

const OTHER_ADVICE =
    'Повторите установку: она безопасна и дольёт недостающие поля. Если отказ повторяется, передайте текст разработчику.';

/**
 * Почему поля не создались — словами, по каждому полю, и что сделать.
 * Бэк отдаёт причины с 02.11.2026, окно установки их не показывало: на gsirk
 * 05.11.2026 было видно только «не удалось создать: 6» без единого слова.
 */
export function installFailureNotes(
    result: InstallAicallResult,
): InstallFailureNotes {
    const details = result.fieldsFailedDetails ?? [];
    if (details.length === 0) {
        return {
            lines: [],
            advice: result.fieldsFailed.length > 0 ? OTHER_ADVICE : null,
        };
    }
    const lines = details.map(
        (failure) => `«${failure.title}» — ${failure.message}`,
    );
    if (result.fieldLimitReached) return { lines, advice: LIMIT_ADVICE };
    const allNetwork = details.every((failure) => failure.reason === 'network');
    return { lines, advice: allNetwork ? NETWORK_ADVICE : OTHER_ADVICE };
}
