/**
 * Мост «localStorage-настройка изменилась → синк ui-settings».
 * Не-Redux хранилища (BlockState, usePersistedSelection) шлют это событие,
 * feature/ui-settings подхватывает его и запускает автосохранение на бэк.
 * Shared про Redux не знает — только window-событие.
 */
export const UI_SETTINGS_TOUCH_EVENT = 'kpi-ui-settings-touch';

export const emitUiSettingsTouch = (): void => {
    if (typeof window === 'undefined') return;
    try {
        window.dispatchEvent(new Event(UI_SETTINGS_TOUCH_EVENT));
    } catch {
        // среда без Event API — некритично
    }
};
