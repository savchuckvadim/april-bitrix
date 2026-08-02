'use client';

import type { FC } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

interface ZoomControlsProps {
    zoom: number;
    canZoomIn: boolean;
    canZoomOut: boolean;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}

/**
 * Масштаб содержимого — рядом с темой, потому что это того же рода настройка:
 * как смотреть, а не что смотреть.
 *
 * Значение посередине кликабельно и возвращает 100 % — это быстрее, чем
 * отщёлкивать шаги обратно.
 */
export const ZoomControls: FC<ZoomControlsProps> = ({
    zoom,
    canZoomIn,
    canZoomOut,
    onZoomIn,
    onZoomOut,
    onReset,
}) => (
    <span className="flex items-center gap-0.5">
        <Button
            variant="ghost"
            size="icon"
            onClick={onZoomOut}
            disabled={!canZoomOut}
            aria-label="Уменьшить"
            title="Уменьшить"
            className="size-7"
        >
            <Minus className="size-4" />
        </Button>

        <button
            type="button"
            onClick={onReset}
            title="Вернуть обычный размер"
            className="hover:text-foreground w-10 cursor-pointer text-center text-xs tabular-nums"
        >
            {zoom}%
        </button>

        <Button
            variant="ghost"
            size="icon"
            onClick={onZoomIn}
            disabled={!canZoomIn}
            aria-label="Увеличить"
            title="Увеличить"
            className="size-7"
        >
            <Plus className="size-4" />
        </Button>
    </span>
);
