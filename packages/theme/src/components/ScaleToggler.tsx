'use client';

import { Minus, Plus } from 'lucide-react';
import { UIScales, UI_SCALE_FACTOR } from '../model/color-schemes';
import { useUIScale } from '../hook/useUIScale';

/**
 * Масштаб UI в духе Bitrix24: − / текущий процент / +.
 * Клик по проценту сбрасывает к 100% (comfortable).
 *
 * Множители берём из общего источника (`UI_SCALE_FACTOR`), а не дублируем
 * зеркалом CSS: копия неизбежно разъезжается, и подпись начинает врать.
 */
export const ScaleToggler = () => {
    const { scale, setScale } = useUIScale();
    const index = UIScales.indexOf(scale);

    const step = (delta: number) => {
        const next = UIScales[index + delta];
        if (next) setScale(next);
    };

    return (
        <div className="flex items-center text-foreground">
            <button
                onClick={() => step(-1)}
                disabled={index <= 0}
                className="cursor-pointer p-1 rounded-md hover:bg-muted transition disabled:opacity-30 disabled:cursor-default"
                title="Мельче"
            >
                <Minus size={14} />
            </button>
            <button
                onClick={() => setScale('comfortable')}
                className="cursor-pointer min-w-9 px-0.5 py-1 rounded-md text-xs tabular-nums text-center hover:bg-muted transition"
                title="Сбросить масштаб к 100%"
            >
                {Math.round(UI_SCALE_FACTOR[scale] * 100)}%
            </button>
            <button
                onClick={() => step(1)}
                disabled={index >= UIScales.length - 1}
                className="cursor-pointer p-1 rounded-md hover:bg-muted transition disabled:opacity-30 disabled:cursor-default"
                title="Крупнее"
            >
                <Plus size={14} />
            </button>
        </div>
    );
};
