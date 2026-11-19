/**
 * Раскрыта ли панель вариантов — запоминается в браузере. Хранилище бывает
 * недоступно (приватный режим, запрет данных во фрейме) — тогда панель просто
 * остаётся свёрнутой.
 */
const STORAGE_KEY = 'konstructor:complect-variants-panel-open';

export const readVariantsPanelOpen = (): boolean => {
    try {
        return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return false;
    }
};

export const storeVariantsPanelOpen = (open: boolean): void => {
    try {
        localStorage.setItem(STORAGE_KEY, open ? '1' : '0');
    } catch {
        // запоминание необязательно: панель откроется свёрнутой
    }
};
