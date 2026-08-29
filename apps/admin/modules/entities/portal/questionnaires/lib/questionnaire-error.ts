import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';

/**
 * Человеческий текст ошибки сохранения анкеты.
 *
 * Бизнес-правила бэка приезжают как HTTP 400 с телом
 * `{resultCode: 1, message: 'Validation failed', errors: ['<правило>']}` —
 * общий `getApiErrorMessage` читает `message` и показал бы бесполезное
 * «Validation failed». Поэтому сначала достаём `errors[]` (там русский
 * текст правила, ради которого владелец и открыл редактор), и только потом
 * падаем в общий разборщик.
 */
export function getQuestionnaireErrorMessage(
    error: unknown,
    fallback = 'Не удалось выполнить операцию',
): string {
    if (error && typeof error === 'object') {
        const data = (error as { response?: { data?: unknown } }).response
            ?.data;

        if (data && typeof data === 'object') {
            const errors = (data as { errors?: unknown }).errors;
            if (Array.isArray(errors) && errors.length) {
                return errors.map(String).join('\n');
            }
            if (typeof errors === 'string' && errors.trim()) return errors;
        }
    }

    return getApiErrorMessage(error, fallback);
}
