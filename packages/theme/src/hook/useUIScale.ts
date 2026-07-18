'use client';

import { useContext } from 'react';
import { ColorContext } from '../provider/Theme';

export const useUIScale = () => {
    const ctx = useContext(ColorContext);
    if (!ctx)
        throw new Error('useUIScale must be used within AprilThemeProvider');
    const { scale, setScale } = ctx;
    return { scale, setScale };
};
