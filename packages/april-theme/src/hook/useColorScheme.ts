import { ColorContext } from '../provider/Theme';
import { useContext } from 'react';

/**
 * Хук для работы с цветовой схемой
 */
export const useColorScheme = () => {
    const ctx = useContext(ColorContext);
    if (!ctx)
        throw new Error(
            'useColorScheme must be used within AprilThemeProvider',
        );
    return ctx;
};
