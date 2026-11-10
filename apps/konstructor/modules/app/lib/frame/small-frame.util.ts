/**
 * Запас на интерфейс браузера над страницей Битрикса: вкладки, адресная
 * строка, закладки. Лучше недобрать: тогда под приложением видна полоска
 * карточки, а не обрезан его низ.
 */
export const BROWSER_UI_PX = 130;

/** Ниже не ужимаем: на совсем низком окне приложение листается целиком. */
export const SMALL_FRAME_MIN_HEIGHT = 560;

/**
 * Высота фрейма во вкладке карточки — ровно окно страницы, чтобы шапка
 * приложения и его скролл помещались на экран целиком.
 *
 * `outerHeight` во фрейме — это окно браузера (не монитор): так высота
 * верна и у окна на половину экрана. Нет его — берём экран за вычетом
 * панели задач.
 */
export const smallFrameHeight = (outerHeight: number, availHeight: number): number => {
    const windowHeight = outerHeight > 0 ? outerHeight : availHeight;
    return Math.max(SMALL_FRAME_MIN_HEIGHT, Math.round(windowHeight - BROWSER_UI_PX));
};

/**
 * На сколько опустить страницу Битрикса, чтобы верх приложения встал к
 * верху окна. Видно только начало фрейма (низ ушёл за окно) — значит, верх
 * фрейма стоит на `высота окна − видимая часть`. Иначе считать не из чего.
 */
export const frameTopOffset = (
    viewportHeight: number,
    visible: { top: number; height: number },
    frameHeight: number,
): number | null => {
    const topIsVisible = visible.top <= 1;
    const bottomIsHidden = visible.height > 0 && visible.height < frameHeight - 1;
    if (!topIsVisible || !bottomIsHidden) return null;
    return Math.max(0, Math.round(viewportHeight - visible.height));
};
