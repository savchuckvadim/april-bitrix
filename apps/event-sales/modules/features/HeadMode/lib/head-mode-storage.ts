const STORAGE_KEY = 'event-sales:headModeEnabled';

/**
 * Выбор руководителя «режим включён / выключен» — между сессиями.
 * Хранилище недоступно (фрейм с ограничениями) — молча работаем без него.
 */
export const saveHeadModeEnabled = (enabled: boolean): void => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch {
        // localStorage может быть недоступен в iframe с ограничениями
    }
};

/** null — руководитель ещё не выбирал: действует значение по умолчанию. */
export const getSavedHeadModeEnabled = (): boolean | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw === '1') return true;
        if (raw === '0') return false;
        return null;
    } catch {
        return null;
    }
};
