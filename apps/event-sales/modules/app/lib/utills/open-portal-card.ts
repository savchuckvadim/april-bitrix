import { Bitrix } from '@workspace/bitrix';

/**
 * Открыть карточку портала (сделку, компанию, задачу) из встройки.
 *
 * Во фрейме Битрикса правильный способ — СЛАЙДЕР поверх портала: менеджер
 * остаётся в той же карточке и возвращается закрытием слайдера. Новая
 * вкладка — только запасной путь (dev вне фрейма или отказ слайдера), иначе
 * человек уезжает из приложения и теряет контекст работы.
 *
 * @param path путь внутри портала (для слайдера), null — слайдер не пробуем
 * @param url  полная ссылка (для новой вкладки), null — запасного пути нет
 * @returns `true`, если карточку удалось открыть
 */
export const openPortalCard = async (
    path: string | null,
    url: string | null,
): Promise<boolean> => {
    if (path) {
        try {
            // Вне фрейма сервиса Bitrix нет — в dev это норма.
            if (await Bitrix.getService().api.openSlider(path)) return true;
        } catch (error) {
            console.debug('openSlider skipped', error);
        }
    }
    if (!url) return false;
    window.open(url, '_blank', 'noreferrer');
    return true;
};
