/**
 * Человеческий текст ошибки запроса.
 *
 * Nest отдаёт причину в `response.data.message`; всё остальное — сетевые сбои,
 * у которых внятного текста нет, поэтому подставляем свой.
 */
export function toErrorText(error: unknown): string {
    const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
    if (message) return String(message);
    return error instanceof Error ? error.message : 'Не удалось найти дубли';
}
