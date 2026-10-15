'use client';

import { useEffect, useState } from 'react';
import { getBlockState, setBlockState } from '@/modules/entities/report';
import { useDigestLayout } from '../../lib/digest-layout.context';
import { digestBlockId, type DigestWidgetKey } from '../../lib/digest-tabs';

/**
 * Карточка виджета: в режиме «Всё» — свёрнута/раскрыта по сохранённому
 * выбору (localStorage + синк ui-settings на бэк), в отдельной подвкладке —
 * раскрыта всегда.
 */
export const useDigestSection = (widget: DigestWidgetKey) => {
    const { mode, openTab } = useDigestLayout();
    const blockId = digestBlockId(widget);
    const [open, setOpen] = useState(true);

    // Чтение localStorage — только на клиенте после монтирования.
    useEffect(() => {
        setOpen(getBlockState(blockId).isVisible);
    }, [blockId]);

    const changeOpen = (next: boolean) => {
        setOpen(next);
        setBlockState(blockId, { ...getBlockState(blockId), isVisible: next });
    };

    return {
        collapsible: mode === 'all',
        open: mode === 'all' ? open : undefined,
        changeOpen,
        showOpenTab: mode === 'all',
        openOwnTab: () => openTab(widget),
    };
};
