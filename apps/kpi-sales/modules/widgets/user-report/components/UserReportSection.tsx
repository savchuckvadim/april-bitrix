'use client';

import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { getBlockState, setBlockState } from '@/modules/entities/report';

interface UserReportSectionProps {
    /** Стабильный id секции (персист видимости). */
    id: string;
    title: string;
    children: React.ReactNode;
}

/** Префикс blockId секций user-report в общем BlockState-хранилище. */
const SECTION_BLOCK_PREFIX = 'user-report-section-';

/**
 * Секция user-report с подписью и минималистичным «глазиком»
 * показать/скрыть. Видимость запоминается в том же BlockState-кэше,
 * что и блоки отчёта (localStorage + синк ui-settings на бэк).
 * SSR-гейт: состояние читается после маунта (next-safe).
 */
export const UserReportSection: React.FC<UserReportSectionProps> = ({
    id,
    title,
    children,
}) => {
    const blockId = `${SECTION_BLOCK_PREFIX}${id}`;
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setVisible(getBlockState(blockId).isVisible);
    }, [blockId]);

    const toggle = () => {
        const next = !visible;
        setVisible(next);
        setBlockState(blockId, {
            ...getBlockState(blockId),
            isVisible: next,
        });
    };

    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-primary">{title}</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggle}
                    title={visible ? 'Скрыть раздел' : 'Показать раздел'}
                    className="h-6 w-6 text-muted-foreground opacity-60 hover:opacity-100"
                >
                    {visible ? (
                        <Eye className="h-3.5 w-3.5" />
                    ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                    )}
                </Button>
            </div>
            {visible && children}
        </section>
    );
};
