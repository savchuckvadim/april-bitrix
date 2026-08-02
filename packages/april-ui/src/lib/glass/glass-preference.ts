/**
 * Хранение выбора пользователя по стеклу. Данные — отдельно от UI:
 * компоненты только вызывают эти функции, localStorage за их пределы не течёт.
 */

export type GlassPreference = 'on' | 'off' | 'system';

const STORAGE_KEY = 'ui-glass';

/**
 * `system` — атрибута на <html> нет, решает CSS
 * (дефолт «включено» + prefers-reduced-transparency). Дублируется в
 * ThemeInitScript, чтобы не было вспышки до гидратации.
 */
export const getGlassPreference = (): GlassPreference => {
    if (typeof window === 'undefined') return 'system';
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored === 'on' || stored === 'off' ? stored : 'system';
    } catch {
        // Приватный режим / отключённое хранилище — не повод падать.
        return 'system';
    }
};

export const setGlassPreference = (preference: GlassPreference): void => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    if (preference === 'system') {
        delete root.dataset.glass;
    } else {
        root.dataset.glass = preference;
    }

    try {
        if (preference === 'system') {
            window.localStorage.removeItem(STORAGE_KEY);
        } else {
            window.localStorage.setItem(STORAGE_KEY, preference);
        }
    } catch {
        // Атрибут уже проставлен — выбор действует до перезагрузки.
    }
};
