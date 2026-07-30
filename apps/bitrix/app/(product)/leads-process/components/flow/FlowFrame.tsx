'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@workspace/ui/components/button';
import { Maximize2, Minimize2 } from 'lucide-react';

export interface FlowFrameProps {
    /** Высота канваса в обычном режиме, px */
    height: number;
    /** Заголовок в шапке fullscreen-режима */
    title: string;
    caption?: string;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    /** Доп. кнопки рядом с кнопкой fullscreen */
    actions?: React.ReactNode;
    /** Панель под канвасом (например, подпись варианта) */
    footer?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Рамка канвас-схемы: обычный режим — карточка в потоке страницы,
 * fullscreen — портал-оверлей во весь экран с шапкой и Esc для выхода.
 */
export const FlowFrame: React.FC<FlowFrameProps> = ({
    height,
    title,
    caption,
    isFullscreen,
    onToggleFullscreen,
    actions,
    footer,
    children,
}) => {
    if (isFullscreen) {
        return createPortal(
            <div className="fixed inset-0 z-50 flex flex-col bg-card">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {title}
                    </p>
                    <div className="flex items-center gap-1">
                        {actions}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleFullscreen}
                            aria-label="Свернуть схему"
                            title="Свернуть (Esc)"
                        >
                            <Minimize2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="relative min-h-0 flex-1">{children}</div>
                {footer}
            </div>,
            document.body,
        );
    }

    return (
        <figure className="rounded-xl border bg-card">
            <div className="relative" style={{ height }}>
                <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                    {actions}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleFullscreen}
                        aria-label="Развернуть схему на весь экран"
                        title="На весь экран"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>
                {children}
            </div>
            {footer}
            {caption && (
                <figcaption className="border-t px-4 py-2.5 text-sm text-muted-foreground">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
};
