/**
 * Клиентский токен публичной ссылки: генерится в момент клика «Создать»,
 * чтобы URL лёг в буфер СИНХРОННО в жесте пользователя (во фрейме Bitrix
 * clipboard работает только так), и передаётся бэку в create.
 * Формат зеркалит серверный: 24 случайных байта → base64url.
 */
export const generateShareToken = (): string => {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};
