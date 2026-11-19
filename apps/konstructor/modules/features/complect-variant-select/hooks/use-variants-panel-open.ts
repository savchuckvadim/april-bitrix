'use client';

import { useEffect, useState } from 'react';
import {
    readVariantsPanelOpen,
    storeVariantsPanelOpen,
} from '../lib/variants-panel-storage.util';

/**
 * Свёрнутость панели вариантов. Первый кадр (сервер и гидрация) всегда
 * свёрнут, сохранённое состояние подхватывается после монтирования.
 */
export const useVariantsPanelOpen = () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(readVariantsPanelOpen());
    }, []);

    const changeOpen = (next: boolean) => {
        setOpen(next);
        storeVariantsPanelOpen(next);
    };

    return { open, setOpen: changeOpen };
};
