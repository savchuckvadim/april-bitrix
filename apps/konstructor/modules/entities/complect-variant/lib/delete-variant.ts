/**
 * Удаление варианта комплекта: правила и тексты. Чистая логика без Redux и
 * Битрикса, чтобы её можно было проверить отдельно.
 */

/** Подсказка у недоступной кнопки «Удалить». */
export const VARIANT_DELETE_BLOCKED_HINT = 'Сначала закройте вариант';

/**
 * Чем закончилось удаление.
 *  - deleted: варианта нет ни в базе конструктора, ни в Битриксе;
 *  - bitrix-failed: из базы вариант убран, элемент смарта в Битриксе остался;
 *  - failed: сервер отказал, ничего не удалено;
 *  - blocked: вариант открыт в редакторе, до сервера дело не дошло.
 */
export type ComplectVariantDeleteResult =
    | { status: 'deleted' }
    | { status: 'bitrix-failed'; message: string }
    | { status: 'failed'; message: string }
    | { status: 'blocked' };

/**
 * Можно ли удалять вариант. Открытый в редакторе вариант получает правки и
 * сохраняется вместе со сделкой: удалённая запись воскресла бы при следующем
 * автосохранении, а элемента в Битриксе под ней уже не было бы.
 */
export const isVariantDeletable = (
    variantSmartId: number | null,
    openVariantSmartId: number | null,
): boolean =>
    variantSmartId !== null &&
    Number.isInteger(variantSmartId) &&
    variantSmartId > 0 &&
    variantSmartId !== openVariantSmartId;

/**
 * Ответ `crm.item.delete` на успех приходит пустым массивом, на сбой —
 * без `result`. Поэтому «удалено» читается как «результат вообще есть».
 */
export const isBitrixDeleteConfirmed = (result: unknown): boolean =>
    result !== undefined && result !== null && result !== false;

/**
 * Текст ошибки для человека. Бэк отвечает по-русски в `response.data.message`
 * (строка или список строк валидатора); без него остаётся message самой
 * ошибки, без неё — запасной текст.
 */
export const readDeleteErrorMessage = (
    error: unknown,
    fallback: string,
): string => {
    if (typeof error === 'object' && error !== null) {
        const data = (error as { response?: { data?: { message?: unknown } } })
            .response?.data;
        const message = data?.message;
        if (typeof message === 'string' && message.trim()) return message;
        if (Array.isArray(message)) {
            const joined = message
                .filter((part): part is string => typeof part === 'string')
                .join('; ');
            if (joined) return joined;
        }
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};

export interface VariantDeleteToast {
    kind: 'success' | 'error';
    text: string;
    /** Дольше обычного держим то, что требует ручного действия. */
    durationMs?: number;
}

/** Сообщение про оставшийся элемент в Битриксе читается дольше обычного. */
export const VARIANT_DELETE_MANUAL_TOAST_MS = 12000;

/** Уведомление по итогу удаления. */
export const describeVariantDeleteResult = (
    result: ComplectVariantDeleteResult,
    title: string,
): VariantDeleteToast => {
    switch (result.status) {
        case 'deleted':
            return { kind: 'success', text: `Вариант «${title}» удалён` };
        case 'bitrix-failed':
            return {
                kind: 'error',
                text: `Вариант «${title}» удалён из конструктора, но элемент в Битриксе остался (${result.message}). Удалите его в смарт-процессе «Варианты комплекта» вручную.`,
                durationMs: VARIANT_DELETE_MANUAL_TOAST_MS,
            };
        case 'failed':
            return {
                kind: 'error',
                text: `Вариант «${title}» не удалён: ${result.message}`,
            };
        case 'blocked':
            return { kind: 'error', text: VARIANT_DELETE_BLOCKED_HINT };
    }
};
