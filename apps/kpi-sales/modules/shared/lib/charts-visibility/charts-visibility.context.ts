'use client';

import {
    createContext,
    createElement,
    useContext,
    type ReactElement,
    type ReactNode,
} from 'react';

/**
 * По умолчанию графики видны: страница без провайдера (тесты, отдельные
 * экраны) ведёт себя как раньше. Значение считает слой приложения из
 * настройки портала и размера экрана (modules/app/providers).
 */
const ChartsVisibilityContext = createContext<boolean>(true);

interface ChartsVisibilityProviderProps {
    /** Показывать ли графики во всём поддереве. */
    visible: boolean;
    children: ReactNode;
}

export const ChartsVisibilityProvider = ({
    visible,
    children,
}: ChartsVisibilityProviderProps): ReactElement =>
    createElement(ChartsVisibilityContext.Provider, { value: visible }, children);

/** Показывать ли графики: настройка портала включена и экран не телефон. */
export const useChartsVisible = (): boolean => useContext(ChartsVisibilityContext);
