/**
 * «Маленький экран» — вкладка карточки CRM (`*_DETAIL_TAB`): фрейм на всю
 * ширину блока и высотой с окно браузера, скролл у приложения свой.
 *
 * Страницу Битрикса к шапке приложения НЕ подкручиваем: родитель на
 * `setScroll` делает `window.scrollTo` в документе карточки по абсолютной
 * позиции, а верх фрейма в этом документе изнутри фрейма не узнать — догадка
 * уводила карточку в самый низ. Менеджер докручивает сам, и когда карточка
 * дошла до низа, приложение как раз встаёт на весь экран.
 */

/**
 * Запас на интерфейс браузера над страницей: вкладки, адресная строка,
 * закладки (у типичного Chrome с панелью закладок ~121px). Лучше недобрать:
 * тогда под приложением видна полоска карточки, а не обрезан его низ.
 */
export const BROWSER_UI_PX = 130;

/** Ниже не ужимаем: на совсем низком окне приложение листается целиком. */
export const SMALL_FRAME_MIN_HEIGHT = 560;

/** Как часто сверять окно браузера: фрейм не получает resize, когда меняют окно. */
export const SMALL_FRAME_CHECK_MS = 1000;

export const isDetailTabPlacement = (code: string | null | undefined): boolean =>
    Boolean(code?.endsWith('_DETAIL_TAB'));

/**
 * Высота фрейма: окно браузера за вычетом его интерфейса. `outerHeight` во
 * фрейме — окно браузера, не монитор: высота верна и у окна на полэкрана.
 * Нет его — экран за вычетом панели задач.
 */
export const smallFrameHeight = (outerHeight: number, availHeight: number): number => {
    const windowHeight = outerHeight > 0 ? outerHeight : availHeight;
    return Math.max(SMALL_FRAME_MIN_HEIGHT, Math.round(windowHeight - BROWSER_UI_PX));
};

/** Кто умеет выставить фрейму высоту (BitrixBaseApi.fitToHeight). */
export interface FrameHeightFitter {
    fitToHeight(height: number): Promise<boolean>;
}

/**
 * Держит высоту фрейма равной окну браузера: сразу, при resize/focus и раз в
 * секунду (смена окна браузера фрейму событий не шлёт). Повторно не дёргает
 * Битрикс, пока высота совпадает. Возвращает отписку.
 */
export const watchSmallFrameHeight = (
    fitter: FrameHeightFitter,
    checkMs: number = SMALL_FRAME_CHECK_MS,
): (() => void) => {
    let applied = 0;
    let busy = false;

    const sync = async () => {
        if (busy) return;
        const target = smallFrameHeight(window.outerHeight, window.screen.availHeight);
        if (target === applied && Math.abs(window.innerHeight - target) <= 1) return;
        busy = true;
        const ok = await fitter.fitToHeight(target);
        busy = false;
        if (ok) applied = target;
    };

    const onChange = (): void => {
        void sync();
    };
    onChange();
    const timer = setInterval(onChange, checkMs);
    window.addEventListener('resize', onChange);
    window.addEventListener('focus', onChange);
    return () => {
        clearInterval(timer);
        window.removeEventListener('resize', onChange);
        window.removeEventListener('focus', onChange);
    };
};
