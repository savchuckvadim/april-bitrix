'use client';

import { useEffect } from 'react';
import { useUIScale, type UIScale } from '@workspace/theme';
import { shouldFitWindow } from '../utills/placement-util';
import { APP_DISPLAY_MODE } from '../../types/app/app-type';
import { useAppSelector } from './redux';

/**
 * Плотность интерфейса — одна точка входа на приложение.
 *
 * Осей всё-таки две, и сводить их в одно число нельзя — они отвечают на разные
 * вопросы:
 *
 *  · `scale` — НАСКОЛЬКО КРУПНО. Пользовательская настройка (`--app-scale`,
 *    проценты в шапке), общая для всей монорепы, живёт в localStorage.
 *  · `isTight` — СКОЛЬКО МЕСТА ДАЛ БИТРИКС. Свойство встройки: во вкладке
 *    карточки приложению отведён блок около 630×600, и там всё должно быть в
 *    одну строку и без подписей. Уменьшением шрифта это не решается — подпись
 *    «Прогноз по компании» не нужна не потому, что крупная, а потому, что
 *    строка одна.
 *
 * Раньше эти оси жили порознь (`useCompactUi` в приложении, `useUIScale` в
 * теме) и начинали расходиться. Теперь спрашивают отсюда — и здесь же задан
 * стартовый масштаб под тесную встройку.
 */

/** Стартовый масштаб для встройки-вкладки: там дорога каждая строка. */
const TIGHT_DEFAULT_SCALE: UIScale = 'dense';

/** Ключ, которым тема персистит выбор пользователя. */
const SCALE_STORAGE_KEY = 'ui-scale';

export interface UiDensity {
    scale: UIScale;
    setScale: (scale: UIScale) => void;
    /** Мало места по горизонтали: одна строка, без подписей. */
    isTight: boolean;
    /**
     * Высоту блока задаём мы сами, подгонкой под контент (`shouldFitWindow`).
     * Значит экран должен ТЕЧЬ по содержимому, а не занимать `h-svh` со своими
     * скроллами: иначе подгонка меряет ту же высоту, что сама и задала, и
     * контент оказывается заперт в неизменной рамке.
     */
    isSelfSized: boolean;
    /**
     * «Большой дисплей» — свойство ПЛЕЙСМЕНТА, не ширины окна (todo2508 №6):
     * полноэкранные встройки (таймлайн `*_DETAIL_ACTIVITY`, вкладка задачи)
     * получают высокий хедер и широкую раскладку; компактные (вкладка
     * карточки CRM ~630×600, карточка звонка) — узкий хедер и вкладки.
     * Та же развилка, что у страниц (EventHomePage: борд ↔ список).
     */
    isWideDisplay: boolean;
}

export const useUiDensity = (): UiDensity => {
    const { scale, setScale } = useUIScale();
    const placement = useAppSelector(s => s.app.bitrix.placement);
    const displayMode = useAppSelector(s => s.app.display.mode);
    const isTight = Boolean(placement?.placement?.includes('DETAIL_TAB'));
    const isSelfSized = shouldFitWindow(placement);
    const isWideDisplay = isWideDisplayMode(displayMode);

    useEffect(() => {
        if (!isTight) return;
        // Выбор пользователя важнее подсказки встройки: если он уже крутил
        // проценты, молча перебивать их нельзя.
        if (localStorage.getItem(SCALE_STORAGE_KEY)) return;
        setScale(TIGHT_DEFAULT_SCALE);
    }, [isTight, setScale]);

    return { scale, setScale, isTight, isSelfSized, isWideDisplay };
};

/**
 * «Большой дисплей» по режиму встройки — ЕДИНСТВЕННЫЙ источник развилки
 * широкая/компактная раскладка (страницы и хедер обязаны совпадать).
 */
export const isWideDisplayMode = (mode: APP_DISPLAY_MODE): boolean =>
    mode === APP_DISPLAY_MODE.TIMELINE || mode === APP_DISPLAY_MODE.TASK;

/**
 * Короткая форма для вёрстки: нужен только признак тесноты.
 * @deprecated используйте `useUiDensity().isTight` — имя честнее говорит, что
 * речь про место во встройке, а не про размер шрифта.
 */
export const useCompactUi = (): boolean => useUiDensity().isTight;
